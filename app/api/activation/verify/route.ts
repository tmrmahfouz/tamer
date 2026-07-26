import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// المفتاح الخاص المُولد لسيرفرك
const PRIVATE_KEY_PEM = process.env.ACTIVATION_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUUCTeYvPAPkFFU+r
uxA4sgagWegOMJi+9EpKi7YvKcChRANCAAQo11vRo4qIKR8hM9NhmWEyRbgSWs/C
UG28gYCDIt+qdOg3c2amqpEwQ4YEKAMoLw36DUZMZdM1gw223oVv5jAb
-----END PRIVATE KEY-----`

// قائمة أكواد التفعيل المعتمدة (يمكنك ربطها بـ Supabase أو Prisma Database)
const VALID_CODES: Record<string, { expiresAt: number | null; remainingUses: number | null }> = {
  'TAMER-2026-VIP': { expiresAt: null, remainingUses: null },
  'STUDENT-100': { expiresAt: 1780995251386, remainingUses: 10 },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code = String(body.code || '').trim().toUpperCase()
    const nonce = String(body.nonce || '')
    const packageName = String(body.packageName || '')

    const record = VALID_CODES[code] || null
    let ok = record !== null && nonce !== ''

    const expiresAt = record?.expiresAt ?? null
    const remainingUses = record?.remainingUses ?? null

    // التحقق من انتهاء الصلاحية الزمني
    if (expiresAt !== null && expiresAt <= Date.now()) {
      ok = false
    }

    // صياغة البيانات الموقعة المعيارية (Canonical Signed Payload)
    const canonicalPayload = JSON.stringify({
      ok: ok,
      expiresAt: expiresAt ?? 0,
      remainingUses: remainingUses ?? -1,
      nonce: nonce
    })

    // التوقيع التشفيري باستخدام SHA256withECDSA
    const signer = crypto.createSign('SHA256')
    signer.update(canonicalPayload, 'utf8')
    const signatureBase64 = signer.sign(PRIVATE_KEY_PEM, 'base64')

    return NextResponse.json({
      ok: ok,
      message: ok ? 'تم التفعيل بنجاح' : 'كود التفعيل غير صحيح أو منتهي الصلاحية',
      expiresAt: expiresAt,
      remainingUses: remainingUses,
      nonce: nonce,
      sig: signatureBase64
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: 'خطأ في سيرفر التفعيل: ' + error.message },
      { status: 400 }
    )
  }
}

