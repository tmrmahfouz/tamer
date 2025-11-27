'use client'

import { useEffect, useRef, useState } from 'react'
import jwt from 'jsonwebtoken'

interface SmartSecurePlayerProps {
  lessonId: string
  title: string
  studentName?: string
}

export default function SmartSecurePlayer({ lessonId, title, studentName }: SmartSecurePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [videoId, setVideoId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch secure video token
  useEffect(() => {
    const fetchSecureVideo = async () => {
      try {
        const response = await fetch(`/api/secure-video?lesson=${lessonId}`)
        const data = await response.json()

        if (data.success) {
          // Decode token to get video ID (only in memory, never in DOM)
          const decoded: any = jwt.decode(data.token)
          setVideoId(decoded.videoId)
        } else {
          setError(data.message)
        }
      } catch (err) {
        setError('فشل تحميل الفيديو')
      } finally {
        setLoading(false)
      }
    }

    fetchSecureVideo()
  }, [lessonId])

  // Security: Aggressive protection
  useEffect(() => {
    // Disable right-click
    const preventContextMenu = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Disable keyboard shortcuts
    const preventShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // Clear console aggressively
    const clearConsole = setInterval(() => {
      console.clear()
      console.log('%c⚠️ STOP!', 'color: red; font-size: 50px; font-weight: bold;')
      console.log('%cهذا المحتوى محمي بحقوق الملكية', 'color: red; font-size: 20px;')
      console.log('%cأي محاولة للوصول للكود تعرضك للمساءلة القانونية', 'color: red; font-size: 16px;')
    }, 100)

    // Detect DevTools
    const detectDevTools = () => {
      const threshold = 160
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        document.body.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; font-family: Arial; text-align: center; flex-direction: column;">
            <h1 style="font-size: 60px; margin-bottom: 20px;">⚠️</h1>
            <h2 style="font-size: 28px; margin-bottom: 10px;">تم اكتشاف أدوات المطور</h2>
            <p style="font-size: 18px; color: #ccc; max-width: 600px;">يرجى إغلاق أدوات المطور (F12) للمتابعة.<br/>هذا الإجراء لحماية حقوق الملكية الفكرية.</p>
            <button onclick="window.location.reload()" style="margin-top: 30px; padding: 15px 30px; font-size: 16px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">إعادة تحميل الصفحة</button>
          </div>
        `
      }
    }

    const devToolsInterval = setInterval(detectDevTools, 500)

    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventShortcuts)

    return () => {
      clearInterval(clearConsole)
      clearInterval(devToolsInterval)
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventShortcuts)
    }
  }, [])

  if (loading) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p>جاري تحميل المشغل المحمي...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-white">رابط الفيديو غير صحيح</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        return false
      }}
    >
      {/* Video Container */}
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
        {/* YouTube iframe */}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&fs=1&disablekb=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          style={{
            border: 'none',
          }}
        />

        {/* Watermarks - Multiple layers */}
        {/* Top Right - Student Name */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold pointer-events-none select-none z-50 shadow-2xl border-2 border-red-400">
          🔒 {studentName || 'منصة تامر محفوظ'}
        </div>

        {/* Top Left - Date */}
        <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-1.5 rounded text-xs font-semibold pointer-events-none select-none z-50 border border-white/20">
          {new Date().toLocaleDateString('ar-EG')}
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1.5 rounded text-xs font-semibold pointer-events-none select-none z-50 border border-white/20">
          محتوى محمي - للاستخدام الشخصي فقط
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded text-xs font-semibold pointer-events-none select-none z-50 border border-white/20">
          © منصة تامر محفوظ
        </div>

        {/* Center Watermark (Large, Semi-transparent) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-40">
          <div className="text-white/5 text-8xl font-bold transform -rotate-12">
            {studentName || 'تامر محفوظ'}
          </div>
        </div>

        {/* Random position watermarks */}
        <div className="absolute top-1/4 left-1/3 text-white/10 text-3xl font-bold pointer-events-none select-none z-40 transform -rotate-12">
          🔒
        </div>
        <div className="absolute top-2/3 right-1/3 text-white/10 text-3xl font-bold pointer-events-none select-none z-40 transform rotate-12">
          🔒
        </div>
      </div>

      {/* Security Warnings */}
      <div className="mt-4 space-y-3">
        {/* Legal Warning */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-3xl flex-shrink-0">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2 text-lg">تحذير قانوني صارم</h3>
              <ul className="text-sm text-red-800 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 flex-shrink-0">•</span>
                  <span>هذا المحتوى محمي بموجب قوانين حقوق الملكية الفكرية المصرية والدولية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 flex-shrink-0">•</span>
                  <span>أي محاولة للتسجيل أو التحميل أو المشاركة تعتبر جريمة يعاقب عليها القانون</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 flex-shrink-0">•</span>
                  <span>تتم مراقبة جميع المشاهدات وتسجيل بيانات الوصول بشكل دائم</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 flex-shrink-0">•</span>
                  <span className="font-bold">المخالف يتعرض لغرامة مالية تصل إلى 100,000 جنيه والحبس</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="text-lg">🔒</span>
                <span className="font-semibold">محتوى مشفر ومحمي</span>
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1.5">
                <span className="text-lg">👤</span>
                <span>مخصص لـ: <strong>{studentName || 'الطالب'}</strong></span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-semibold text-green-700">مراقب ومسجل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS Protection */}
      <style jsx global>{`
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }

        img,
        video,
        iframe {
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }

        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
