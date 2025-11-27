'use client'

import { useEffect, useRef } from 'react'

interface SecureVideoPlayerProps {
  videoUrl: string
  title: string
  studentName?: string
}

export default function SecureVideoPlayer({ videoUrl, title, studentName }: SecureVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYouTubeId(videoUrl)

  // Prevent right-click on entire container
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      alert('⚠️ هذا المحتوى محمي ولا يمكن نسخه أو تحميله')
      return false
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('contextmenu', preventContextMenu, true)
      return () => container.removeEventListener('contextmenu', preventContextMenu, true)
    }
  }, [])

  // Prevent keyboard shortcuts
  useEffect(() => {
    const preventShortcuts = (e: KeyboardEvent) => {
      // Prevent Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        alert('⚠️ لا يمكن حفظ هذا المحتوى')
        return false
      }
      // Prevent Ctrl+C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        return false
      }
      // Prevent Print Screen
      if (e.key === 'PrintScreen') {
        alert('⚠️ لقطات الشاشة غير مسموحة')
        return false
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', preventShortcuts, true)
      return () => container.removeEventListener('keydown', preventShortcuts, true)
    }
  }, [])

  // Disable text selection
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.style.userSelect = 'none'
      container.style.webkitUserSelect = 'none'
      // @ts-ignore
      container.style.mozUserSelect = 'none'
      // @ts-ignore
      container.style.msUserSelect = 'none'
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
        WebkitTouchCallout: 'none'
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        alert('⚠️ هذا المحتوى محمي')
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
        {/* YouTube Embed with security settings */}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=1&controls=1&autoplay=0`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          style={{ 
            border: 'none'
          }}
        />

        {/* Watermark Overlay - Always visible */}
        <div className="absolute top-4 right-4 bg-red-600/80 text-white px-4 py-2 rounded-lg text-sm font-bold pointer-events-none select-none z-50 shadow-lg">
          🔒 {studentName || 'منصة تامر محفوظ'}
        </div>

        {/* Bottom Watermark */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-xs font-semibold pointer-events-none select-none z-50">
          محتوى محمي - للاستخدام الشخصي فقط
        </div>
      </div>

      {/* Security Warning */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="text-red-500">🔒</span>
          <span>محتوى محمي</span>
        </div>
        <span>•</span>
        <span>ممنوع التحميل أو المشاركة</span>
        <span>•</span>
        <span>للاستخدام الشخصي فقط</span>
      </div>

      {/* Copyright Notice */}
      <div className="mt-2 text-center text-xs text-gray-400">
        © جميع الحقوق محفوظة - منصة تامر محفوظ التعليمية
      </div>

      <style jsx>{`
        /* Disable text selection */
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Disable drag */
        img, video, iframe {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }

        /* Disable screenshot on some browsers */
        @media print {
          body {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
