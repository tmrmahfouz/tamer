'use client'

import { useRef } from 'react'
import { Maximize } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

interface HTML5ViewerProps {
  html5Content: string
  title: string
  studentName?: string
}

export default function HTML5Viewer({ html5Content, title, studentName }: HTML5ViewerProps) {
  const settings = useSettings()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div ref={containerRef} className="bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-3 py-3 md:px-6 md:py-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm md:text-lg truncate">{title}</h3>
            <p className="text-xs md:text-sm text-green-100">🌐 محتوى HTML5</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button
              onClick={handleFullscreen}
              className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-4 md:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="شاشة كاملة"
            >
              <Maximize className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-semibold hidden sm:inline">شاشة كاملة</span>
            </button>
            <div className="text-xs md:text-sm hidden md:block">
              🔒 {studentName || settings.siteName}
            </div>
          </div>
        </div>
      </div>

      {/* HTML5 Content */}
      <div className="relative bg-white p-4 md:p-8" style={{ minHeight: '400px' }}>
        {/* Render HTML content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: html5Content }}
        />

        {/* Watermark */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600/90 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold pointer-events-none select-none z-50">
          🔒 {studentName || settings.siteName}
        </div>

        {/* Center Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-40">
          <div className="text-gray-400/10 text-4xl md:text-8xl font-bold transform -rotate-12">
            {studentName || settings.siteName}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-3 py-2 md:px-6 md:py-3 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0 text-xs md:text-sm text-gray-600 text-center md:text-right">
          <span>🌐 محتوى HTML5 محمي</span>
          <span>⚠️ ممنوع النسخ أو المشاركة</span>
        </div>
      </div>

      <style jsx>{`
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }
        
        /* Fullscreen styles */
        div:fullscreen {
          background: white;
        }
        
        div:fullscreen .relative {
          height: calc(100vh - 120px) !important;
          overflow-y: auto;
        }
      `}</style>
    </div>
  )
}
