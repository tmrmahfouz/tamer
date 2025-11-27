import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // حماية صفحات لوحة التحكم
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // حماية صفحات الطالب
  if (pathname.startsWith('/student') || pathname.startsWith('/learn')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // إضافة Security Headers
  const response = NextResponse.next()

  // منع Clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // منع MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // تفعيل XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://player.vimeo.com https://docs.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' https:; frame-src 'self' https://www.youtube.com https://player.vimeo.com https://docs.google.com https://view.officeapps.live.com https://onedrive.live.com https://drive.google.com; connect-src 'self' https://docs.google.com https://view.officeapps.live.com;"
  )

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/student/:path*',
    '/learn/:path*',
    '/profile/:path*',
    '/certificates/:path*',
  ],
}
