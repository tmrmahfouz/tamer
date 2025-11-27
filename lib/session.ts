import { NextRequest } from 'next/server'
import Session from '@/models/Session'
import connectDB from './mongodb'

// استخراج معلومات الجهاز من User Agent
export function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()
  
  // Browser
  let browser = 'Unknown'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'
  
  // OS
  let os = 'Unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'
  
  // Device Type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop'
  if (ua.includes('mobile')) deviceType = 'mobile'
  else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'tablet'
  
  // Device
  let device = 'Unknown'
  if (ua.includes('iphone')) device = 'iPhone'
  else if (ua.includes('ipad')) device = 'iPad'
  else if (ua.includes('android')) device = 'Android Device'
  else device = `${os} ${deviceType}`
  
  return { browser, os, device, deviceType }
}

// الحصول على IP Address
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'Unknown'
}

// الحصول على الموقع من IP (محاكاة - يمكن استخدام API حقيقي)
export async function getLocationFromIP(ip: string) {
  // في الإنتاج، استخدم API مثل ipapi.co أو ip-api.com
  // const response = await fetch(`https://ipapi.co/${ip}/json/`)
  // const data = await response.json()
  
  // محاكاة
  return {
    country: 'Egypt',
    city: 'Cairo',
    region: 'Cairo Governorate',
  }
}

// إنشاء جلسة جديدة
export async function createSession(
  userId: string,
  token: string,
  request: NextRequest
) {
  try {
    await connectDB()
    
    const userAgent = request.headers.get('user-agent') || ''
    const deviceInfo = parseUserAgent(userAgent)
    const ipAddress = getClientIP(request)
    const location = await getLocationFromIP(ipAddress)
    
    // حذف الجلسات القديمة المنتهية
    await Session.deleteMany({
      user: userId,
      expiresAt: { $lt: new Date() },
    })
    
    // التحقق من عدد الجلسات النشطة
    const activeSessions = await Session.countDocuments({
      user: userId,
      isActive: true,
    })
    
    const MAX_SESSIONS = 5
    if (activeSessions >= MAX_SESSIONS) {
      // حذف أقدم جلسة
      const oldestSession = await Session.findOne({
        user: userId,
        isActive: true,
      }).sort({ lastActivity: 1 })
      
      if (oldestSession) {
        await oldestSession.deleteOne()
      }
    }
    
    // إنشاء جلسة جديدة (صالحة لمدة 30 يوم)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    
    const session = await Session.create({
      user: userId,
      token,
      deviceInfo,
      ipAddress,
      location,
      expiresAt,
    })
    
    return { success: true, session }
  } catch (error) {
    console.error('Create session error:', error)
    return { success: false, error }
  }
}

// تحديث نشاط الجلسة
export async function updateSessionActivity(token: string) {
  try {
    await connectDB()
    
    await Session.findOneAndUpdate(
      { token, isActive: true },
      { lastActivity: new Date() }
    )
    
    return { success: true }
  } catch (error) {
    console.error('Update session error:', error)
    return { success: false, error }
  }
}

// إنهاء جلسة
export async function terminateSession(sessionId: string, userId: string) {
  try {
    await connectDB()
    
    await Session.findOneAndUpdate(
      { _id: sessionId, user: userId },
      { isActive: false }
    )
    
    return { success: true }
  } catch (error) {
    console.error('Terminate session error:', error)
    return { success: false, error }
  }
}

// إنهاء جميع الجلسات
export async function terminateAllSessions(userId: string, exceptToken?: string) {
  try {
    await connectDB()
    
    const query: any = { user: userId, isActive: true }
    if (exceptToken) {
      query.token = { $ne: exceptToken }
    }
    
    await Session.updateMany(query, { isActive: false })
    
    return { success: true }
  } catch (error) {
    console.error('Terminate all sessions error:', error)
    return { success: false, error }
  }
}

// تنظيف الجلسات المنتهية (يجب تشغيله دورياً)
export async function cleanupExpiredSessions() {
  try {
    await connectDB()
    
    await Session.deleteMany({
      expiresAt: { $lt: new Date() },
    })
    
    return { success: true }
  } catch (error) {
    console.error('Cleanup sessions error:', error)
    return { success: false, error }
  }
}
