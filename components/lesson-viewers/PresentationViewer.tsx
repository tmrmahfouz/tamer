'use client'

import { useSettings } from '@/contexts/SettingsContext'

interface PresentationViewerProps {
  presentationUrl: string
  presentationType: 'google-slides' | 'powerpoint' | 'upload'
  title: string
  studentName?: string
}

export default function PresentationViewer({ 
  presentationUrl, 
  presentationType,
  title, 
  studentName 
}: PresentationViewerProps) {
  const settings = useSettings()
  
  // Convert to embed format based on type
  const getEmbedUrl = () => {
    if (presentationType === 'google-slides') {
      // Convert Google Slides to embed format
      return presentationUrl.replace('/edit', '/embed')
    } else if (presentationType === 'upload' || presentationUrl.includes('.pptx') || presentationUrl.includes('.ppt')) {
      // For uploaded PowerPoint files, use Office Online viewer
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(presentationUrl)}`
    }
    return presentationUrl
  }

  const embedUrl = getEmbedUrl()

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-3 md:px-6 md:py-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm md:text-lg truncate">{title}</h3>
            <p className="text-xs md:text-sm text-purple-100">
              📊 {presentationType === 'google-slides' ? 'Google Slides' : 'عرض تقديمي'}
            </p>
          </div>
          <div className="text-xs md:text-sm hidden md:block">
            🔒 {studentName || settings.siteName}
          </div>
        </div>
      </div>

      {/* Presentation Viewer */}
      <div className="relative bg-gray-100" style={{ height: '500px', minHeight: '400px' }}>
        <iframe
          src={embedUrl}
          className="w-full h-full"
          title={title}
          allowFullScreen
          style={{ border: 'none' }}
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
          <span>📊 عرض تقديمي محمي</span>
          <span>⚠️ ممنوع التحميل أو المشاركة</span>
        </div>
      </div>

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
