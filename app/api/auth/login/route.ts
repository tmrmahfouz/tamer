import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import SiteSettings from '@/models/SiteSettings'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'
import crypto from 'crypto'

// Generate device fingerprint from request headers
function generateDeviceId(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || ''
  const acceptLanguage = request.headers.get('accept-language') || ''
  const fingerprint = `${userAgent}-${acceptLanguage}`
  return crypto.createHash('md5').update(fingerprint).digest('hex')
}

// Parse user agent to get device info
function parseUserAgent(userAgent: string) {
  let browser = 'متصفح غير معروف'
  let os = 'نظام غير معروف'
  let deviceName = 'جهاز غير معروف'

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari'
  else if (userAgent.includes('Edg')) browser = 'Edge'
  else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera'

  // Detect OS
  if (userAgent.includes('Windows')) { os = 'Windows'; deviceName = 'كمبيوتر Windows' }
  else if (userAgent.includes('Mac OS')) { os = 'macOS'; deviceName = 'Mac' }
  else if (userAgent.includes('Linux') && !userAgent.includes('Android')) { os = 'Linux'; deviceName = 'كمبيوتر Linux' }
  else if (userAgent.includes('Android')) { os = 'Android'; deviceName = 'هاتف Android' }
  else if (userAgent.includes('iPhone')) { os = 'iOS'; deviceName = 'iPhone' }
  else if (userAgent.includes('iPad')) { os = 'iPadOS'; deviceName = 'iPad' }

  return { browser, os, deviceName: `${deviceName} - ${browser}` }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password, deviceId: clientDeviceId } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Device limit check (only for students)
    if (user.role === 'student') {
      const settings = await SiteSettings.findOne()
      const deviceLimitEnabled = settings?.deviceLimitEnabled ?? true
      const maxDevices = user.maxDevices || settings?.maxDevicesPerUser || 2
      const deviceLimitMessage = settings?.deviceLimitMessage || 'لقد وصلت للحد الأقصى من الأجهزة المسموح بها.'

      if (deviceLimitEnabled) {
        const userAgent = request.headers.get('user-agent') || ''
        const deviceId = clientDeviceId || generateDeviceId(request)
        const { browser, os, deviceName } = parseUserAgent(userAgent)
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || ''

        // Check if device already exists
        const existingDeviceIndex = user.devices?.findIndex((d: any) => d.deviceId === deviceId) ?? -1

        if (existingDeviceIndex >= 0) {
          // Update existing device
          user.devices[existingDeviceIndex].lastUsed = new Date()
          user.devices[existingDeviceIndex].ip = ip
        } else {
          // Check device limit
          if ((user.devices?.length || 0) >= maxDevices) {
            return NextResponse.json(
              { 
                success: false, 
                message: deviceLimitMessage,
                code: 'DEVICE_LIMIT_REACHED',
                currentDevices: user.devices?.length || 0,
                maxDevices
              },
              { status: 403 }
            )
          }

          // Add new device
          if (!user.devices) user.devices = []
          user.devices.push({
            deviceId,
            deviceName,
            browser,
            os,
            ip,
            lastUsed: new Date(),
            createdAt: new Date()
          })
        }
      }
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
      { status: 200 }
    )

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}
