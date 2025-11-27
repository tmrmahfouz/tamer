import crypto from 'crypto'

// توليد OTP (6 أرقام)
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// توليد Backup Codes (10 أكواد)
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    codes.push(code)
  }
  return codes
}

// التحقق من OTP
export function verifyOTP(userOTP: string, correctOTP: string): boolean {
  return userOTP === correctOTP
}

// تشفير Secret
export function encryptSecret(secret: string): string {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'secret-key', 'salt', 32)
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(secret, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

// فك تشفير Secret
export function decryptSecret(encryptedSecret: string): string {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'secret-key', 'salt', 32)
  
  const parts = encryptedSecret.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// إرسال OTP عبر البريد (محاكاة)
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // هنا يمكن التكامل مع خدمة بريد حقيقية
    console.log(`Sending OTP ${otp} to ${email}`)
    
    // في الإنتاج، استخدم خدمة مثل SendGrid أو AWS SES
    // await sendEmail({
    //   to: email,
    //   subject: 'رمز التحقق الخاص بك',
    //   text: `رمز التحقق الخاص بك هو: ${otp}\nصالح لمدة 5 دقائق.`
    // })
    
    return true
  } catch (error) {
    console.error('Send OTP error:', error)
    return false
  }
}

// تخزين OTP مؤقتاً (في الذاكرة - يمكن استخدام Redis في الإنتاج)
const otpStore = new Map<string, { otp: string; expires: number }>()

export function storeOTP(userId: string, otp: string, expiresInMinutes: number = 5) {
  const expires = Date.now() + expiresInMinutes * 60 * 1000
  otpStore.set(userId, { otp, expires })
  
  // تنظيف تلقائي بعد انتهاء الصلاحية
  setTimeout(() => {
    otpStore.delete(userId)
  }, expiresInMinutes * 60 * 1000)
}

export function getStoredOTP(userId: string): string | null {
  const stored = otpStore.get(userId)
  if (!stored) return null
  
  if (Date.now() > stored.expires) {
    otpStore.delete(userId)
    return null
  }
  
  return stored.otp
}

export function deleteStoredOTP(userId: string) {
  otpStore.delete(userId)
}
