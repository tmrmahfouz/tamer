import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import validCodes from './codes.json'

const PRIVATE_KEY_PEM = process.env.ACTIVATION_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUUCTeYvPAPkFFU+r
uxA4sgagWegOMJi+9EpKi7YvKcChRANCAAQo11vRo4qIKR8hM9NhmWEyRbgSWs/C
UG28gYCDIt+qdOg3c2amqpEwQ4YEKAMoLw36DUZMZdM1gw223oVv5jAb
-----END PRIVATE KEY-----`

const ALLOWED_CODES = new Set<string>(validCodes)

// دالة قراءة الجهاز المربوط من Vercel KV أصلية بدون مكتبات
async function kvGet(key: string): Promise<string | null> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null

  try {
    const res = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
    const data = await res.json()
    return data.result || null
  } catch (e) {
    return null
  }
}

// دالة حفظ جهاز الطالب في Vercel KV أصلية بدون مكتبات
async function kvSet(key: string, val: string): Promise<void> {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return

  try {
    await fetch(`${url}/set/${key}/${val}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
  } catch (e) {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code = String(body.code || '').trim().toUpperCase()
    const nonce = String(body.nonce || '')
    const deviceId = String(body.deviceId || '')

    let ok = false
    let message = 'كود التفعيل غير صحيح أو غير متاح'

    if (ALLOWED_CODES.has(code)) {
      // قراءة الهوية المربوطة للكود من Vercel Storage
      const boundDeviceId = await kvGet(`bound_${code}`)

      if (!boundDeviceId) {
        // حفظ هاتف الطالب الأول دائمياً
        await kvSet(`bound_${code}`, deviceId)
        ok = true
        message = 'تم التفعيل بنجاح'
      } else if (boundDeviceId === deviceId) {
        // نفس هاتف الطالب
        ok = true
        message = 'تم التفعيل بنجاح'
      } else {
        // هاتف مختلف يرفض التفعيل
        ok = false
        message = 'هذا الكود مستخدم بالفعل على جهاز آخر'
      }
    }

    const canonicalPayload = JSON.stringify({
      ok: ok,
      expiresAt: 0,
      remainingUses: -1,
      nonce: nonce
    })

    const signer = crypto.createSign('SHA256')
    signer.update(canonicalPayload, 'utf8')
    const signatureBase64 = signer.sign(PRIVATE_KEY_PEM, 'base64')

    return NextResponse.json({
      ok: ok,
      message: message,
      expiresAt: null,
      remainingUses: null,
      nonce: nonce,
      sig: signatureBase64
    })
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 })
  }
}
