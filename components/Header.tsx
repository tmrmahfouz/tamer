'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, BookOpen, User, LogIn, LogOut, LayoutDashboard, ChevronDown, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/SettingsContext'

export default function Header() {
  const router = useRouter()
  const settings = useSettings()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      }
    } catch (error) {
      // User not logged in
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('user')
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // بناء قائمة الروابط
  const baseLinks = [
    { name: 'الرئيسية', href: '/', external: false },
    { name: 'الدورات', href: '/courses', external: false },
    { name: 'حزم الدورات', href: '/bundles', external: false },
    { name: 'الأسئلة الشائعة', href: '/faq', external: false },
    { name: 'من نحن', href: '/about', external: false },
    { name: 'تواصل معنا', href: '/contact', external: false },
  ]
  
  // إضافة رابط منصة الاختبارات الخارجية إذا كان مفعّلاً
  const navLinks = settings.externalQuizPlatformEnabled && settings.externalQuizPlatformUrl 
    ? [
        ...baseLinks,
        {
          name: settings.externalQuizPlatformName || 'منصة الاختبارات',
          href: settings.externalQuizPlatformUrl,
          external: true
        }
      ]
    : baseLinks

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-md z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <span className="text-2xl">{settings.siteLogo || '🎓'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient">{settings.siteName || 'مستر تامر محفوظ'}</span>
              <span className="text-xs text-gray-600">{settings.siteSlogan || 'البرمجة والذكاء الاصطناعي'}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link: any) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-primary-600 font-semibold transition-colors flex items-center gap-1"
                >
                  {link.name}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-primary-600 font-semibold transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <Link
                href="/chat"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageCircle className="w-6 h-6 text-gray-700" />
                {/* Badge for unread messages - will be implemented later */}
                {/* <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span> */}
              </Link>
            )}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-900">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.role === 'admin' ? 'مدير' : user.role === 'instructor' ? 'مدرس' : 'طالب'}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">لوحة التحكم</span>
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">الملف الشخصي</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600 border-t border-gray-200 mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors">
                  <LogIn className="w-5 h-5" />
                  <span>تسجيل الدخول</span>
                </Link>
                <Link href="/register" className="btn-primary flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>إنشاء حساب</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t">
            <div className="flex flex-col gap-4">
              {navLinks.map((link: any) => (
                link.external ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-primary-600 font-semibold transition-colors flex items-center gap-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-gray-700 hover:text-primary-600 font-semibold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {user ? (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">
                            {user.role === 'admin' ? 'مدير' : user.role === 'instructor' ? 'مدرس' : 'طالب'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href="/dashboard" 
                      className="btn-secondary text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      لوحة التحكم
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleLogout()
                      }}
                      className="btn-primary text-center bg-red-600 hover:bg-red-700"
                    >
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="btn-secondary text-center">
                      تسجيل الدخول
                    </Link>
                    <Link href="/register" className="btn-primary text-center">
                      إنشاء حساب
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
