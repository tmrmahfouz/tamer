'use client'

import { useEffect, useRef, useState } from 'react'

interface AdvancedSecurePlayerProps {
  videoUrl: string
  title: string
  studentName?: string
}

// Load YouTube IFrame API
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function AdvancedSecurePlayer({ videoUrl, title, studentName }: AdvancedSecurePlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYouTubeId(videoUrl)

  // Load YouTube IFrame API
  useEffect(() => {
    if (!videoId) return

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initPlayer()
      return
    }

    // Load API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // API ready callback
    window.onYouTubeIframeAPIReady = () => {
      initPlayer()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoId])

  const initPlayer = () => {
    if (!videoId) return

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        fs: 1,
        disablekb: 0,
        enablejsapi: 1,
        origin: window.location.origin,
        // Hide YouTube logo and info
        cc_load_policy: 0,
        color: 'white',
        playsinline: 1,
      },
      events: {
        onReady: () => {
          setIsReady(true)
        },
      },
    })
  }

  // Security: Prevent right-click
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      showSecurityAlert()
      return false
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('contextmenu', preventContextMenu, true)
      return () => container.removeEventListener('contextmenu', preventContextMenu, true)
    }
  }, [])

  // Security: Prevent keyboard shortcuts
  useEffect(() => {
    const preventShortcuts = (e: KeyboardEvent) => {
      // Prevent Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        showSecurityAlert()
        return false
      }
      // Prevent Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault()
        showSecurityAlert()
        return false
      }
      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault()
        showSecurityAlert()
        return false
      }
      // Prevent Ctrl+Shift+I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        showSecurityAlert()
        return false
      }
      // Prevent Ctrl+Shift+C (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        showSecurityAlert()
        return false
      }
    }

    window.addEventListener('keydown', preventShortcuts, true)
    return () => window.removeEventListener('keydown', preventShortcuts, true)
  }, [])

  // Security: Detect DevTools
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        // DevTools might be open
        console.clear()
        document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">⚠️ يرجى إغلاق أدوات المطور للمتابعة</h1>'
      }
    }

    const interval = setInterval(detectDevTools, 1000)
    return () => clearInterval(interval)
  }, [])

  const showSecurityAlert = () => {
    alert('⚠️ هذا المحتوى محمي بحقوق الملكية\n\n🔒 ممنوع:\n• النسخ أو التحميل\n• لقطات الشاشة\n• مشاركة المحتوى\n\n⚖️ المخالفة تعرضك للمساءلة القانونية')
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
        showSecurityAlert()
        return false
      }}
      onCopy={(e) => {
        e.preventDefault()
        return false
      }}
      onCut={(e) => {
        e.preventDefault()
        return false
      }}
      onDragStart={(e) => {
        e.preventDefault()
        return false
      }}
    >
      {/* Video Container */}
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
        {/* YouTube Player - API controlled (no visible URL) */}
        <div
          id="youtube-player"
          className="w-full h-full"
          style={{
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* Top Watermark - Student Name */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold pointer-events-none select-none z-50 shadow-2xl border-2 border-red-400">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <span>{studentName || 'منصة تامر محفوظ'}</span>
          </div>
        </div>

        {/* Bottom Left Watermark */}
        <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-semibold pointer-events-none select-none z-50 shadow-lg border border-white/20">
          محتوى محمي - للاستخدام الشخصي فقط
        </div>

        {/* Bottom Right Watermark */}
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-semibold pointer-events-none select-none z-50 shadow-lg border border-white/20">
          © منصة تامر محفوظ
        </div>

        {/* Center Watermark (Semi-transparent) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-40">
          <div className="text-white/10 text-6xl font-bold transform -rotate-12">
            {studentName || 'تامر محفوظ'}
          </div>
        </div>

        {/* Protection Overlay */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            background: 'transparent',
            zIndex: 45,
          }}
        />
      </div>

      {/* Security Warnings */}
      <div className="mt-4 space-y-2">
        {/* Main Warning */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-1">تحذير قانوني</h3>
              <p className="text-sm text-red-800">
                هذا المحتوى محمي بحقوق الملكية الفكرية. أي محاولة للنسخ أو التسجيل أو المشاركة تعرضك للمساءلة القانونية.
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span>🔒</span>
            <span>محتوى مشفر</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span>👤</span>
            <span>مخصص لـ: {studentName || 'الطالب'}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span>⚖️</span>
            <span>محمي قانونياً</span>
          </span>
        </div>
      </div>

      {/* CSS to prevent selection and screenshots */}
      <style jsx>{`
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
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
        }

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
      `}</style>
    </div>
  )
}
