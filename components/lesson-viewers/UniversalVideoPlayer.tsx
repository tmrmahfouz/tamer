'use client'

import PrestoPlayer from '../PrestoPlayer'
import { useSettings } from '@/contexts/SettingsContext'

interface UniversalVideoPlayerProps {
  videoUrl: string
  videoProvider: 'youtube' | 'vimeo' | 'upload' | 'google-drive' | 'onedrive' | 'html5'
  title: string
  studentName?: string
}

export default function UniversalVideoPlayer({ 
  videoUrl, 
  videoProvider, 
  title, 
  studentName 
}: UniversalVideoPlayerProps) {
  const settings = useSettings()
  
  // For YouTube, use Presto Player
  if (videoProvider === 'youtube') {
    return (
      <PrestoPlayer 
        key={videoUrl}
        videoUrl={videoUrl}
        title={title}
        studentName={studentName}
      />
    )
  }

  // For Google Drive
  if (videoProvider === 'google-drive') {
    // Extract file ID and create proper embed URL
    let fileId = ''
    
    // Try different URL formats
    if (videoUrl.includes('/file/d/')) {
      fileId = videoUrl.split('/file/d/')[1].split('/')[0].split('?')[0]
    } else if (videoUrl.includes('id=')) {
      fileId = videoUrl.split('id=')[1].split('&')[0]
    }
    
    // Create clean embed URL
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
    
    // Check if fileId was extracted
    if (!fileId) {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-600 font-bold mb-2">❌ رابط Google Drive غير صحيح</p>
          <p className="text-gray-600 text-sm">الرجاء التأكد من الرابط</p>
        </div>
      )
    }
    
    return (
      <div className="bg-black rounded-lg overflow-hidden shadow-xl">
        <div className="relative aspect-video">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={title}
            style={{ border: 'none' }}
            sandbox="allow-scripts allow-same-origin allow-presentation"
            onError={() => {
              console.error('Google Drive video failed to load. Check sharing settings.')
            }}
          />
          
          {/* Multiple Watermarks for Protection */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600/90 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold pointer-events-none select-none z-50">
            🔒 {studentName || settings.siteName}
          </div>
          
          {/* Center Large Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-40">
            <div className="text-white/10 text-4xl md:text-8xl font-bold transform -rotate-12">
              {studentName || settings.siteName}
            </div>
          </div>
          
          {/* Bottom Watermark */}
          <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-red-600/90 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs font-bold pointer-events-none select-none z-50">
            ID: {studentName?.substring(0, 8) || 'PROTECTED'}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-3 py-2 md:px-4 md:py-3 text-xs text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0 mb-1 md:mb-2">
            <span className="font-bold text-center md:text-right">🔒 محتوى محمي</span>
            <span className="font-semibold hidden md:inline">© {settings.siteName}</span>
          </div>
          <div className="flex items-center justify-center gap-1 md:gap-2 text-yellow-300 font-bold text-center">
            <span>⚠️</span>
            <span className="text-xs">محاولة التحميل تؤدي لحذف الحساب</span>
            <span>⚠️</span>
          </div>
        </div>
      </div>
    )
  }

  // For OneDrive
  if (videoProvider === 'onedrive') {
    // Convert OneDrive share link to embed
    const embedUrl = videoUrl.replace('view.aspx', 'embed')
    
    return (
      <div className="bg-black rounded-lg overflow-hidden shadow-xl">
        <div className="relative aspect-video">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={title}
            style={{ border: 'none' }}
          />
          
          {/* Watermark */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600/90 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold pointer-events-none select-none z-50">
            🔒 {studentName || settings.siteName}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-3 py-2 md:px-4 md:py-3 text-xs text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0 mb-1 md:mb-2">
            <span className="font-bold text-center md:text-right">🔒 محتوى محمي</span>
            <span className="font-semibold hidden md:inline">© {settings.siteName}</span>
          </div>
          <div className="flex items-center justify-center gap-1 md:gap-2 text-yellow-300 font-bold text-center">
            <span>⚠️</span>
            <span className="text-xs">محاولة التحميل تؤدي لحذف الحساب</span>
            <span>⚠️</span>
          </div>
        </div>
      </div>
    )
  }

  // For uploaded videos (HTML5)
  if (videoProvider === 'upload' || videoProvider === 'html5') {
    return (
      <div className="bg-black rounded-lg overflow-hidden shadow-xl">
        <div className="relative aspect-video">
          <video
            src={videoUrl}
            controls
            controlsList="nodownload"
            disablePictureInPicture
            className="w-full h-full"
            onContextMenu={(e) => e.preventDefault()}
          >
            متصفحك لا يدعم تشغيل الفيديو
          </video>
          
          {/* Watermark */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600/90 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold pointer-events-none select-none z-50">
            🔒 {studentName || settings.siteName}
          </div>
          
          {/* Center Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-40">
            <div className="text-white/5 text-3xl md:text-7xl font-bold transform -rotate-12">
              {studentName || settings.siteName}
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-3 py-2 md:px-4 md:py-3 text-xs text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0 mb-1 md:mb-2">
            <span className="font-bold text-center md:text-right">🔒 محتوى محمي</span>
            <span className="font-semibold hidden md:inline">© {settings.siteName}</span>
          </div>
          <div className="flex items-center justify-center gap-1 md:gap-2 text-yellow-300 font-bold text-center">
            <span>⚠️</span>
            <span className="text-xs">محاولة التحميل تؤدي لحذف الحساب</span>
            <span>⚠️</span>
          </div>
        </div>

        <style jsx>{`
          video::-webkit-media-controls-download-button {
            display: none !important;
          }
          video::-webkit-media-controls-enclosure {
            overflow: hidden;
          }
          video::-webkit-media-controls-panel {
            width: calc(100% + 30px);
          }
        `}</style>
      </div>
    )
  }

  // Vimeo
  if (videoProvider === 'vimeo') {
    // Extract Vimeo ID
    const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]
    
    return (
      <div className="bg-black rounded-lg overflow-hidden shadow-xl">
        <div className="relative aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title}
            style={{ border: 'none' }}
          />
          
          {/* Watermark */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600/90 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold pointer-events-none select-none z-50">
            🔒 {studentName || settings.siteName}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-3 py-2 md:px-4 md:py-3 text-xs text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0 mb-1 md:mb-2">
            <span className="font-bold text-center md:text-right">🔒 محتوى محمي</span>
            <span className="font-semibold hidden md:inline">© {settings.siteName}</span>
          </div>
          <div className="flex items-center justify-center gap-1 md:gap-2 text-yellow-300 font-bold text-center">
            <span>⚠️</span>
            <span className="text-xs">محاولة التحميل تؤدي لحذف الحساب</span>
            <span>⚠️</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
