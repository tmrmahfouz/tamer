import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { kv } from '@vercel/kv'
import validCodes from './codes.json'

const PRIVATE_KEY_PEM = process.env.ACTIVATION_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUUCTeYvPAPkFFU+r
uxA4sgagWegOMJi+9EpKi7YvKcChRANCAAQo11vRo4qIKR8hM9NhmWEyRbgSWs/C
UG28gYCDIt+qdOg3c2amqpEwQ4YEKAMoLw36DUZMZdM1gw223oVv5jAb
-----END PRIVATE KEY-----`

const ALLOWED_CODES = new Set<string>(validCodes)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code = String(body.code || '').trim().toUpperCase()
    const nonce = String(body.nonce || '')
    const deviceId = String(body.deviceId || '')

    let ok = false
    let message = 'كود التفعيل غير صحيح أو غير متاح'

    if (ALLOWED_CODES.has(code)) {
      // قراءة الجهاز المربوط بالكود من قاعدة البيانات الدائمة (Vercel KV)
      const boundDeviceId = await kv.get<string>(`bound:${code}`)

      if (!boundDeviceId) {
        // حفظ هاتف الطالب الأول بشكل دائم في قاعدة البيانات
        await kv.set(`bound:${code}`, deviceId)
        ok = true
        message = 'تم التفعيل بنجاح'
      } else if (boundDeviceId === deviceId) {
        // نفس هاتف الطالب
        ok = true
        message = 'تم التفعيل بنجاح'
      } else {
        // هاتف آخر يرفض التفعيل فوراً
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
