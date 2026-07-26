import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import validCodes from './codes.json'

const PRIVATE_KEY_PEM = process.env.ACTIVATION_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUUCTeYvPAPkFFU+r
uxA4sgagWegOMJi+9EpKi7YvKcChRANCAAQo11vRo4qIKR8hM9NhmWEyRbgSWs/C
UG28gYCDIt+qdOg3c2amqpEwQ4YEKAMoLw36DUZMZdM1gw223oVv5jAb
-----END PRIVATE KEY-----`

const ALLOWED_CODES = new Set<string>(validCodes)
const FALLBACK_MEMORY_MAP = new Map<string, string>()

async function getBoundDeviceId(code: string): Promise<string | null> {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return FALLBACK_MEMORY_MAP.get(code) || null
  }

  try {
    const res = await fetch(`${url}/get/bound_${code}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
    if (res.ok) {
      const data = await res.json()
      return data.result || null
    }
  } catch (e) {
    console.error('KV Get error:', e)
  }

  return FALLBACK_MEMORY_MAP.get(code) || null
}

async function setBoundDeviceId(code: string, deviceId: string): Promise<boolean> {
  FALLBACK_MEMORY_MAP.set(code, deviceId)

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return false
  }

  try {
    const res = await fetch(`${url}/set/bound_${code}/${encodeURIComponent(deviceId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
    return res.ok
  } catch (e) {
    console.error('KV Set error:', e)
  }

  return false
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const code = String(body.code || '').trim().toUpperCase()
    const nonce = String(body.nonce || '')
    const deviceId = String(body.deviceId || '')

    let ok = false
    let message = 'كود التفعيل غير صحيح أو غير متاح'

    if (code && ALLOWED_CODES.has(code)) {
      const boundDeviceId = await getBoundDeviceId(code)

      if (!boundDeviceId) {
        // تفعيل الكود لأول مرة وربطه بجهاز الطالب
        await setBoundDeviceId(code, deviceId)
        ok = true
        message = 'تم التفعيل بنجاح'
      } else if (boundDeviceId === deviceId) {
        // نفس جهاز الطالب يعيد التفعيل
        ok = true
        message = 'تم التفعيل بنجاح'
      } else {
        // هاتف آخر يرفض التفعيل فوراً
        ok = false
        message = 'هذا الكود مستخدم بالفعل على جهاز آخر'
      }
    }

    // بناء الكائن والتوقيع
    const payloadObject = {
      ok: ok,
      expiresAt: 0,
      remainingUses: -1,
      nonce: nonce
    }

    const canonicalPayload = JSON.stringify(payloadObject)

    const signer = crypto.createSign('SHA256')
    signer.update(canonicalPayload, 'utf8')
    const signatureBase64 = signer.sign(PRIVATE_KEY_PEM, 'base64')

    // إرجاع استجابة بـ Status 200 دائماً ليقرأ التطبيق نص الخطأ الصحيح
    return NextResponse.json({
      ok: ok,
      message: message,
      expiresAt: 0,
      remainingUses: -1,
      nonce: nonce,
      sig: signatureBase64
    }, { status: 200 })

  } catch (error: any) {
    // حتى عند حدوث استثناء مفاجئ، نرجع status 200 مع ok: false
    return NextResponse.json({ 
      ok: false, 
      message: error?.message || 'حدث خطأ في خادم التفعيل' 
    }, { status: 200 })
  }
}
