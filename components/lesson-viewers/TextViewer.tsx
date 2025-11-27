'use client'

import { useRef } from 'react'
import { Maximize, Type } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

interface TextViewerProps {
  textContent: string
  title: string
  studentName?: string
}

export default function TextViewer({ textContent, title, studentName }: TextViewerProps) {
  const settings = useSettings()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    }
  }

  // تحويل Markdown بسيط إلى HTML
  const parseMarkdown = (text: string) => {
    if (!text) return ''
    
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono"><code>$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/gim, '<code class="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Unordered lists
      .replace(/^\- (.*$)/gim, '<li class="mr-6">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="mr-6 list-decimal">$1</li>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" class="text-primary-600 hover:underline">$1</a>')
      // Line breaks
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, '<br/>')
    
    // Wrap lists
    html = html.replace(/(<li.*?<\/li>)+/gim, '<ul class="list-disc mb-4 space-y-2">$&</ul>')
    
    return `<p class="mb-4">${html}</p>`
  }

  return (
    <div ref={containerRef} className="bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-3 py-3 md:px-6 md:py-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm md:text-lg truncate">{title}</h3>
            <p className="text-xs md:text-sm text-indigo-100">📝 محتوى نصي</p>
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

      {/* Text Content */}
      <div className="relative bg-white p-4 md:p-8" style={{ minHeight: '400px' }}>
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(textContent) }}
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
          <span>📝 محتوى نصي محمي</span>
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
