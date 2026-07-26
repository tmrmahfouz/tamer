import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PRIVATE_KEY_PEM = process.env.ACTIVATION_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLGgo2U1KOpdjrWH8
LPxaeyr6+FIjlSlePvuNR+Dx3IWhRANCAARodShaj0pwORzzRnky4hoqCXBVcq1t
zT2FPHjj4BFkmSIz8TLBDOzQyqCyRT5DgsxzSfx8Wfi/McnrOLTnyjee
-----END PRIVATE KEY-----`

const RAW_CODES_LIST: string[] = [
  "KHDT8QQZ", "8AW2UQZS", "MLJJBLAD", "Q8WSY4ZL", "9PG89325",
  "K5KBXMGV", "JSFHCEYJ", "MFNAH4BD", "7353PBWL", "BH35VAG9",
  "2Q8UGR77", "MC5CUKS2", "URHGF4K3", "32WPMXEE", "6A4FP5Y8",
  "AP68KWUB", "LGSXQGG5", "BTNNEH2J", "3JAMFZA7", "VP4JZU9L",
  "P444RKZT", "TVSW7Z28", "HN5JLL7M", "A2EK2NF2", "WG6WEP4U",
  "2WBH3AAJ", "MJGH8MES", "LJ95NB2B", "442AY4JR", "E4AAKBFG",
  "ZFESZFBY", "XLX2XXJ3", "WEVEENUW", "QMQKG2MR", "53KPHYWZ",
  "LATGRKHW", "5NCUC84D", "ES2ZMWTB", "96AAPDCV", "3CRRPYRX",
  "QT45THE2", "8W7DZCLJ", "FJSPDJNE", "S25BUPAN", "H77SV2HM",
  "FKMAXYD5", "D4C7YZY3", "FDESJC5D", "EHCRLGC7", "GZ6JSS6F",
  "PE8L4PJS", "FSRWCTLB", "S4PWMKQT", "NQQYHQ2R", "SVUX36AZ",
  "JMUCS29B", "ZMBTKWKU", "QGLU5SU4", "8T8VKCAG", "BAPUKF85",
  "MA35JRQB", "6RCQ4VKU", "BXZJCBXT", "YLKJD5RF", "QZQN9QPS",
  "6UGDTAFC", "VX7TLEQ9", "WZAVY923", "VCUYJ9W6", "P4WUJ6N3",
  "9KX9V4E4", "THY3YGGU", "UT8JYTA9", "V54RN6QY", "UJ4YR9B4",
  "SGV33TQJ", "PCWUC5JB", "ZTZXYUBV", "WAMD9WLW", "Q49Q9CFR",
  "F3SEL9EY", "TF5GDVNP", "H84PB75L", "53DF6BXR", "KJV87UHK",
  "7K44AGXV", "8UMQ9PJ5", "E4H66KBM", "KP87N4SK", "FCSJGKMX",
  "JLVNG4VJ", "KWTNKSHN", "QBDQN3AH", "WY8H837V", "KUMKPHNR",
  "BPANYJDY", "C8E2CFPX", "DHU3XKB3", "ZJ2D3VF2", "PVL6DQUP"
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
        await setBoundDeviceId(code, deviceId)
        ok = true
        message = 'تم التفعيل بنجاح'
      } else if (boundDeviceId === deviceId) {
        ok = true
        message = 'تم التفعيل بنجاح'
      } else {
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
