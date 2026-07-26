import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PRIVATE_KEY_PEM = process.env.ACTIVATION_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUUCTeYvPAPkFFU+r
uxA4sgagWegOMJi+9EpKi7YvKcChRANCAAQo11vRo4qIKR8hM9NhmWEyRbgSWs/C
UG28gYCDIt+qdOg3c2amqpEwQ4YEKAMoLw36DUZMZdM1gw223oVv5jAb
-----END PRIVATE KEY-----`

// قائمة الأكواد الـ 100 مدمجة مباشرة لمنع أي خطأ في التحميل من Vercel
const RAW_CODES_LIST: string[] = [
  "RZVM4GFR", "WCWHKBF5", "5D3Z57NH", "YUTJ3LB3", "WQJKGEFS",
  "3JH7PWJ3", "XYAP8N75", "Y28K9YTM", "F6A27HX6", "A2TCBNCY",
  "YJVVHHHV", "M42CCC4D", "7QP29LVW", "T3DN2C9H", "F7H6ZG9L",
  "VZKW5GLD", "GG4T4JXR", "85PLM6CW", "EGMUKLFN", "C3ENRF8V",
  "HCF2EAE8", "MWAVBTY9", "K3X73NM3", "23B8SVBA", "ERHLE56H",
  "HC4XSR82", "N5LWJCAT", "64YKNF6K", "FQ9TWL59", "YJPV9GZT",
  "DQZYCUBR", "BAHBFQZD", "32N9ZR9B", "8TJ37KZR", "DKR7C59R",
  "9A2JXWRF", "JRCVKTWP", "PY7MU7WN", "UA3ZQZR8", "2ZMZMM4D",
  "2PPX3NS5", "8KYSDJZ8", "CCE4W2NA", "V3TR6LA7", "JTH75HDR",
  "K4FWX7KK", "U6XKTFU5", "K4HPQJ24", "2PYLDY6V", "X6A3XZFZ",
  "37QD3325", "PQ7FRYXY", "3PADYBNT", "J2ZU6KUT", "YXWAAX4H",
  "SFBH3YW2", "ZSWFXFMV", "MT54DY3P", "2AFJ93SS", "ACNFGEZS",
  "PFUKSSAS", "G2LB2UEX", "9AW4L2GG", "VK5CQVCS", "8D2D9E9F",
  "JCSRADJY", "DKPLSQ97", "VXETLLC5", "WJ9CUCCS", "TBPJL42Q",
  "86FZ99XC", "6YG8444L", "N7UAEKUY", "DX4KNMY6", "SND3XZKN",
  "YQKLNCNR", "RZXDA23X", "99LW5V4S", "4BQT4NMA", "ZJTVWXD6",
  "TNEFWZ2Q", "YYBTBAJ5", "WSNW4XLR", "KHNNHC5W", "UKLF7LUP",
  "5APRUBMH", "ZMXQNGKC", "E9FVTRBM", "Y7XZGU8X", "GH3GVZDP",
  "B9F25RN3", "5YLJU4D7", "AFJAWXXP", "XJKSEWZX", "V49EACKF",
  "KTNKJQ9Z", "DD77NLW4", "SZKDURMJ", "CUMQBQ3N", "YSAAQXT3"
]

const ALLOWED_CODES = new Set<string>(
  RAW_CODES_LIST.map(c => c.trim().toUpperCase())
)

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
    const code = String(body.code || '').replace(/[^A-Z0-9]/gi, '').toUpperCase()
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

    return NextResponse.json({
      ok: ok,
      message: message,
      expiresAt: 0,
      remainingUses: -1,
      nonce: nonce,
      sig: signatureBase64
    }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      message: error?.message || 'حدث خطأ أثناء التفعيل' 
    }, { status: 200 })
  }
}
