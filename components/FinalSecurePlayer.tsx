'use client'

import { useEffect, useRef } from 'react'

interface FinalSecurePlayerProps {
  videoUrl: string
  title: string
  studentName?: string
}

export default function FinalSecurePlayer({ videoUrl, title, studentName }: FinalSecurePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYouTubeId(videoUrl)

  // Security measures
  useEffect(() => {
    // Prevent right-click
    const preventContextMenu = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Prevent DevTools shortcuts
    const preventShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault()
        return false
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('contextmenu', preventContextMenu)
      document.addEventListener('keydown', preventShortcuts)
    }

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', preventContextMenu)
      }
      document.removeEventListener('keydown', preventShortcuts)
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
      className="relative"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Video Container */}
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
        {/* YouTube iframe */}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&fs=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          style={{ border: 'none' }}
        />

        {/* Watermark - Top Right */}
        <div className="absolute top-3 right-3 bg-red-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold pointer-events-none select-none z-50 shadow-lg">
          🔒 {studentName || 'منصة تامر محفوظ'}
        </div>

        {/* Watermark - Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold pointer-events-none select-none z-50">
          © منصة تامر محفوظ
        </div>

        {/* Center Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-40">
          <div className="text-white/5 text-7xl font-bold transform -rotate-12">
            {studentName || 'تامر محفوظ'}
          </div>
        </div>
      </div>

      {/* Simple warning */}
      <div className="mt-3 text-center text-xs text-gray-500">
        🔒 محتوى محمي - للاستخدام الشخصي فقط
      </div>

      {/* CSS Protection */}
      <style jsx>{`
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  )
}
