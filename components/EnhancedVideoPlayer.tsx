'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Bookmark, BookmarkCheck,
  PictureInPicture2, Clock, ChevronDown, X, Plus, Trash2
} from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

interface BookmarkItem {
  _id: string
  timestamp: number
  title: string
  note?: string
  color: string
}

interface EnhancedVideoPlayerProps {
  videoUrl: string
  title: string
  lessonId: string
  courseId: string
  studentName?: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export default function EnhancedVideoPlayer({
  videoUrl,
  title,
  lessonId,
  courseId,
  studentName,
  onProgress,
  onComplete,
}: EnhancedVideoPlayerProps) {
  const settings = useSettings()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isPiP, setIsPiP] = useState(false)
  
  // UI state
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(false)
  const [showAddBookmark, setShowAddBookmark] = useState(false)
  const [bookmarkTitle, setBookmarkTitle] = useState('')
  const [bookmarkNote, setBookmarkNote] = useState('')
  const [bookmarkColor, setBookmarkColor] = useState('yellow')
  
  // Data state
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [completedSegments, setCompletedSegments] = useState<number[][]>([])
  const [lastSavedTime, setLastSavedTime] = useState(0)
  
  // Refs for tracking
  const segmentStartRef = useRef<number>(0)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // Load saved progress and bookmarks
  useEffect(() => {
    loadProgress()
    loadBookmarks()
  }, [lessonId])

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isPlaying])

  const loadProgress = async () => {
    try {
      const res = await fetch(`/api/video-progress?lessonId=${lessonId}`)
      const data = await res.json()
      if (data.success && data.progress) {
        setPlaybackSpeed(data.progress.playbackSpeed || 1)
        setCompletedSegments(data.progress.completedSegments || [])
        if (data.progress.lastPosition > 0 && videoRef.current) {
          videoRef.current.currentTime = data.progress.lastPosition
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const loadBookmarks = async () => {
    try {
      const res = await fetch(`/api/bookmarks?lessonId=${lessonId}`)
      const data = await res.json()
      if (data.success) {
        setBookmarks(data.bookmarks || [])
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    }
  }

  const saveProgress = useCallback(async () => {
    if (!duration) return
    
    try {
      await fetch('/api/video-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          courseId,
          currentTime,
          duration,
          playbackSpeed,
          completedSegments,
        }),
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }, [lessonId, courseId, currentTime, duration, playbackSpeed, completedSegments])

  // Debounced save
  useEffect(() => {
    if (Math.abs(currentTime - lastSavedTime) >= 5) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveProgress()
        setLastSavedTime(currentTime)
      }, 1000)
    }
  }, [currentTime, lastSavedTime, saveProgress])

  // Save on unmount
  useEffect(() => {
    return () => {
      saveProgress()
    }
  }, [saveProgress])

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const time = videoRef.current.currentTime
    setCurrentTime(time)
    
    // Track watched segment
    const segmentEnd = time
    if (segmentEnd - segmentStartRef.current >= 1) {
      const newSegment = [segmentStartRef.current, segmentEnd]
      setCompletedSegments(prev => [...prev, newSegment])
      segmentStartRef.current = segmentEnd
    }
    
    // Notify parent
    if (onProgress && duration > 0) {
      onProgress((time / duration) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      videoRef.current.playbackRate = playbackSpeed
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    saveProgress()
    if (onComplete) {
      onComplete()
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
      segmentStartRef.current = videoRef.current.currentTime
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const newTime = pos * duration
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    segmentStartRef.current = newTime
  }

  const skip = (seconds: number) => {
    if (!videoRef.current) return
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
    videoRef.current.currentTime = newTime
    segmentStartRef.current = newTime
  }

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
      setShowSpeedMenu(false)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    
    if (!isFullscreen) {
      await containerRef.current.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const togglePiP = async () => {
    if (!videoRef.current) return
    
    try {
      if (isPiP) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
      setIsPiP(!isPiP)
    } catch (error) {
      console.error('PiP error:', error)
    }
  }

  const addBookmark = async () => {
    if (!bookmarkTitle.trim()) return
    
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          courseId,
          timestamp: currentTime,
          title: bookmarkTitle,
          note: bookmarkNote,
          color: bookmarkColor,
        }),
      })
      
      const data = await res.json()
      if (data.success) {
        setBookmarks(prev => [...prev, data.bookmark].sort((a, b) => a.timestamp - b.timestamp))
        setBookmarkTitle('')
        setBookmarkNote('')
        setShowAddBookmark(false)
      }
    } catch (error) {
      console.error('Error adding bookmark:', error)
    }
  }

  const deleteBookmark = async (id: string) => {
    try {
      const res = await fetch(`/api/bookmarks?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setBookmarks(prev => prev.filter(b => b._id !== id))
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error)
    }
  }

  const seekToBookmark = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      segmentStartRef.current = timestamp
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      yellow: 'bg-yellow-400',
      green: 'bg-green-400',
      blue: 'bg-blue-400',
      red: 'bg-red-400',
      purple: 'bg-purple-400',
    }
    return colors[color] || colors.yellow
  }

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controlsList="nodownload"
        disablePictureInPicture={false}
      />

      {/* Watermarks */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600/90 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold pointer-events-none select-none z-30">
        🔒 {studentName || settings.siteName}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
        <div className="text-white/5 text-4xl md:text-8xl font-bold transform -rotate-12">
          {studentName || settings.siteName}
        </div>
      </div>

      {/* Bookmarks on timeline */}
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark._id}
          className={`absolute bottom-16 w-3 h-3 ${getColorClass(bookmark.color)} rounded-full cursor-pointer z-40 transform -translate-x-1/2 hover:scale-150 transition-transform`}
          style={{ left: `${(bookmark.timestamp / duration) * 100}%` }}
          onClick={() => seekToBookmark(bookmark.timestamp)}
          title={bookmark.title}
        />
      ))}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-3 md:p-4 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm md:text-base truncate flex-1">{title}</h3>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 md:w-20 md:h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 md:w-10 md:h-10 text-white" />
            ) : (
              <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="h-1.5 md:h-2 bg-white/30 rounded-full cursor-pointer mb-3 relative group/progress"
            onClick={handleSeek}
          >
            {/* Watched segments visualization */}
            {completedSegments.map((seg, i) => (
              <div
                key={i}
                className="absolute h-full bg-green-500/50 rounded-full"
                style={{
                  left: `${(seg[0] / duration) * 100}%`,
                  width: `${((seg[1] - seg[0]) / duration) * 100}%`,
                }}
              />
            ))}
            
            {/* Current progress */}
            <div 
              className="h-full bg-primary-500 rounded-full relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Controls */}
            <div className="flex items-center gap-1 md:gap-3">
              <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-colors">
                {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
              
              <button onClick={() => skip(-10)} className="text-white hover:text-primary-400 transition-colors hidden sm:block">
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button onClick={() => skip(10)} className="text-white hover:text-primary-400 transition-colors hidden sm:block">
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-primary-400 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-16 md:group-hover/volume:w-20 transition-all duration-300 accent-primary-500"
                />
              </div>

              {/* Time */}
              <span className="text-white text-xs md:text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Add Bookmark */}
              <button 
                onClick={() => setShowAddBookmark(true)}
                className="text-white hover:text-yellow-400 transition-colors"
                title="إضافة علامة"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Bookmarks Panel Toggle */}
              <button 
                onClick={() => setShowBookmarkPanel(!showBookmarkPanel)}
                className={`transition-colors ${showBookmarkPanel ? 'text-yellow-400' : 'text-white hover:text-yellow-400'}`}
                title="العلامات المرجعية"
              >
                {bookmarks.length > 0 ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>

              {/* Speed Control */}
              <div className="relative">
                <button 
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="text-white hover:text-primary-400 transition-colors flex items-center gap-1"
                >
                  <Clock className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">{playbackSpeed}x</span>
                </button>
                
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl py-2 min-w-[80px]">
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={`w-full px-4 py-1.5 text-sm text-right hover:bg-gray-800 transition-colors ${
                          playbackSpeed === speed ? 'text-primary-400' : 'text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PiP */}
              <button 
                onClick={togglePiP}
                className={`transition-colors hidden md:block ${isPiP ? 'text-primary-400' : 'text-white hover:text-primary-400'}`}
                title="صورة في صورة"
              >
                <PictureInPicture2 className="w-5 h-5" />
              </button>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white hover:text-primary-400 transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks Panel */}
      {showBookmarkPanel && (
        <div className="absolute top-12 right-2 md:right-4 w-64 md:w-80 bg-gray-900/95 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-700 flex items-center justify-between">
            <h4 className="text-white font-semibold text-sm">العلامات المرجعية ({bookmarks.length})</h4>
            <button onClick={() => setShowBookmarkPanel(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {bookmarks.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">لا توجد علامات</p>
            ) : (
              bookmarks.map((bookmark) => (
                <div 
                  key={bookmark._id}
                  className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 group"
                  onClick={() => seekToBookmark(bookmark.timestamp)}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-3 h-3 ${getColorClass(bookmark.color)} rounded-full mt-1 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white text-sm font-medium truncate">{bookmark.title}</span>
                        <span className="text-gray-400 text-xs flex-shrink-0">{formatTime(bookmark.timestamp)}</span>
                      </div>
                      {bookmark.note && (
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{bookmark.note}</p>
                      )}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteBookmark(bookmark._id); }}
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Bookmark Modal */}
      {showAddBookmark && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-4 md:p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-bold">إضافة علامة مرجعية</h4>
              <button onClick={() => setShowAddBookmark(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              الوقت: {formatTime(currentTime)}
            </p>
            
            <input
              type="text"
              placeholder="عنوان العلامة"
              value={bookmarkTitle}
              onChange={(e) => setBookmarkTitle(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-primary-500 outline-none"
              autoFocus
            />
            
            <textarea
              placeholder="ملاحظة (اختياري)"
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-primary-500 outline-none resize-none h-20"
            />
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-400 text-sm">اللون:</span>
              {['yellow', 'green', 'blue', 'red', 'purple'].map((color) => (
                <button
                  key={color}
                  onClick={() => setBookmarkColor(color)}
                  className={`w-6 h-6 rounded-full ${getColorClass(color)} ${
                    bookmarkColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddBookmark(false)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={addBookmark}
                disabled={!bookmarkTitle.trim()}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protection Footer */}
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
        video::-webkit-media-controls {
          display: none !important;
        }
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  )
}
