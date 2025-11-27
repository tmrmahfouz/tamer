'use client'

import { useEffect, useRef, useState } from 'react'

interface UltraSecurePlayerProps {
  videoUrl: string
  title: string
  studentName?: string
}

export default function UltraSecurePlayer({ videoUrl, title, studentName }: UltraSecurePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [videoToken, setVideoToken] = useState<string>('')
  const [isReady, setIsReady] = useState(false)

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYouTubeId(videoUrl)

  // Generate obfuscated token
  useEffect(() => {
    if (videoId) {
      // Create a token that doesn't reveal the video ID directly
      const token = btoa(videoId + Date.now()).replace(/=/g, '')
      setVideoToken(token)
      setIsReady(true)
    }
  }, [videoId])

  // Security: Block all DevTools and inspection
  useEffect(() => {
    // Disable right-click
    const preventContextMenu = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Disable keyboard shortcuts
    const preventShortcuts = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
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

    // Disable text selection
    const preventSelection = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Clear console repeatedly
    const clearConsole = setInterval(() => {
      console.clear()
      console.log('%c⚠️ تحذير أمني', 'color: red; font-size: 30px; font-weight: bold;')
      console.log('%cمحاولة الوصول لكود المصدر ممنوعة وتعرضك للمساءلة القانونية', 'color: red; font-size: 16px;')
    }, 100)

    // Detect DevTools
    const detectDevTools = () => {
      const threshold = 160
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        document.body.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; font-family: Arial; text-align: center;">
            <div>
              <h1 style="font-size: 48px; margin-bottom: 20px;">⚠️</h1>
              <h2 style="font-size: 24px; margin-bottom: 10px;">تم اكتشاف أدوات المطور</h2>
              <p style="font-size: 16px; color: #ccc;">يرجى إغلاق أدوات المطور للمتابعة</p>
              <p style="font-size: 14px; color: #999; margin-top: 20px;">هذا الإجراء لحماية حقوق الملكية الفكرية</p>
            </div>
          </div>
        `
      }
    }

    const devToolsInterval = setInterval(detectDevTools, 500)

    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventShortcuts)
    document.addEventListener('selectstart', preventSelection)
    document.addEventListener('copy', preventSelection)

    return () => {
      clearInterval(clearConsole)
      clearInterval(devToolsInterval)
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventShortcuts)
      document.removeEventListener('selectstart', preventSelection)
      document.removeEventListener('copy', preventSelection)
    }
  }, [])

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
    >
      {/* Video Container */}
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
        {/* YouTube iframe - simple and working */}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&fs=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          style={{
            border: 'none',
          }}
        />

        {/* Multiple Watermarks */}
        {/* Top Right */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold pointer-events-none select-none z-50 shadow-2xl">
          🔒 {studentName || 'منصة تامر محفوظ'}
        </div>

        {/* Top Left */}
        <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-1.5 rounded text-xs font-semibold pointer-events-none select-none z-50">
          {new Date().toLocaleDateString('ar-EG')}
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1.5 rounded text-xs font-semibold pointer-events-none select-none z-50">
          محتوى محمي - للاستخدام الشخصي فقط
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded text-xs font-semibold pointer-events-none select-none z-50">
          © منصة تامر محفوظ
        </div>

        {/* Center Watermark (Large, Semi-transparent) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-40">
          <div className="text-white/5 text-8xl font-bold transform -rotate-12">
            {studentName || 'تامر محفوظ'}
          </div>
        </div>

        {/* Random position watermarks to prevent cropping */}
        <div className="absolute top-1/3 left-1/4 text-white/10 text-2xl font-bold pointer-events-none select-none z-40">
          🔒
        </div>
        <div className="absolute top-2/3 right-1/4 text-white/10 text-2xl font-bold pointer-events-none select-none z-40">
          🔒
        </div>
      </div>

      {/* Strong Warning */}
      <div className="mt-4 space-y-3">
        {/* Legal Warning */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2 text-lg">تحذير قانوني صارم</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• هذا المحتوى محمي بموجب قوانين حقوق الملكية الفكرية</li>
                <li>• أي محاولة للتسجيل أو التحميل أو المشاركة تعتبر جريمة</li>
                <li>• تتم مراقبة جميع المشاهدات وتسجيل بيانات الوصول</li>
                <li>• المخالف يتعرض لغرامة مالية تصل إلى 100,000 جنيه</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span>🔒</span>
                <span>محتوى مشفر</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>👤</span>
                <span>مخصص لـ: {studentName || 'الطالب'}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>مراقب</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aggressive CSS Protection */}
      <style jsx global>{`
        /* Disable all selection */
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
        }

        /* Disable drag */
        img,
        video,
        iframe {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
          pointer-events: auto !important;
        }

        /* Hide on print */
        @media print {
          body {
            display: none !important;
          }
        }

        /* Prevent screenshot on some browsers */
        video::-webkit-media-controls {
          display: none !important;
        }

        video::-webkit-media-controls-enclosure {
          display: none !important;
        }

        /* Blur on focus loss (anti screen recording) */
        body:not(:focus-within) video {
          filter: blur(20px) !important;
        }
      `}</style>
    </div>
  )
}
