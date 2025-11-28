'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

interface PrestoPlayerProps {
  videoUrl: string
  title: string
  studentName?: string
}

export default function PrestoPlayer({ videoUrl, title, studentName }: PrestoPlayerProps) {
  const settings = useSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState('auto')

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

    // Cleanup previous player if exists
    if (playerRef.current) {
      try {
        playerRef.current.destroy()
      } catch (e) {
        console.log('Player cleanup error:', e)
      }
      playerRef.current = null
    }

    // Reset states
    setIsReady(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    // Check if API already loaded
    if (window.YT && window.YT.Player) {
      // Small delay to ensure DOM is ready
      setTimeout(() => initPlayer(), 100)
      return
    }

    // Load API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      initPlayer()
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          console.log('Player cleanup error:', e)
        }
        playerRef.current = null
      }
    }
  }, [videoId])

  // Generate unique player ID based on videoId
  const playerId = `presto-player-${videoId}`

  const initPlayer = () => {
    if (!videoId) return

    // Check if element exists
    const playerElement = document.getElementById(playerId)
    if (!playerElement) {
      console.log('Player element not found, retrying...')
      setTimeout(() => initPlayer(), 100)
      return
    }

    playerRef.current = new window.YT.Player(playerId, {
      videoId: videoId,
      playerVars: {
        controls: 0, // Hide default controls
        modestbranding: 1, // Hide YouTube logo
        rel: 0, // Don't show related videos
        showinfo: 0, // Hide video title
        iv_load_policy: 3, // Hide annotations
        fs: 0, // Disable fullscreen button
        disablekb: 1, // Disable keyboard controls
        enablejsapi: 1, // Enable JS API
        autohide: 1, // Auto-hide controls
        cc_load_policy: 0, // Hide captions by default
        playsinline: 1, // Play inline on mobile
      },
      events: {
        onReady: (event: any) => {
          setIsReady(true)
          setDuration(event.target.getDuration())
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true)
            startProgressTracking()
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false)
          } else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false)
          }
        },
      },
    })
  }

  const startProgressTracking = () => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime()
        setCurrentTime(current)
      }
    }, 100)

    return () => clearInterval(interval)
  }

  // Handle mobile orientation and fullscreen
  const handleMobileOrientation = async () => {
    // On mobile, directly request fullscreen which triggers landscape rotation
    if (!containerRef.current) return
    
    try {
      const elem = containerRef.current as any
      
      // Try all fullscreen methods
      if (elem.requestFullscreen) {
        await elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen()
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen()
      }
      
      // Set fullscreen state after successful request
      setIsFullscreen(true)
      
      // After entering fullscreen, try to lock orientation to landscape
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape').catch(() => {
            // If lock fails, just continue - fullscreen is enough
            console.log('Screen orientation lock not supported')
          })
        }
      } catch (orientErr) {
        console.log('Orientation lock not available')
      }
    } catch (err) {
      // Silently fail - user can still watch in normal mode
      console.log('Fullscreen request declined or not supported')
    }
  }

  // Player controls
  const togglePlay = () => {
    if (!playerRef.current || !playerRef.current.playVideo) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const toggleMute = () => {
    if (!playerRef.current || !playerRef.current.mute) return
    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume)
      if (newVolume === 0) {
        setIsMuted(true)
      } else {
        setIsMuted(false)
      }
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !playerRef.current || !playerRef.current.seekTo) return
    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const newTime = pos * duration
    playerRef.current.seekTo(newTime, true)
    setCurrentTime(newTime)
  }

  const skipBackward = () => {
    if (!playerRef.current || !playerRef.current.seekTo) return
    const newTime = Math.max(0, currentTime - 10)
    playerRef.current.seekTo(newTime, true)
  }

  const skipForward = () => {
    if (!playerRef.current || !playerRef.current.seekTo) return
    const newTime = Math.min(duration, currentTime + 10)
    playerRef.current.seekTo(newTime, true)
  }

  const changePlaybackRate = (rate: number) => {
    if (!playerRef.current || !playerRef.current.setPlaybackRate) return
    playerRef.current.setPlaybackRate(rate)
    setPlaybackRate(rate)
    setShowSettings(false)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen()
      } else if ((containerRef.current as any).mozRequestFullScreen) {
        (containerRef.current as any).mozRequestFullScreen()
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
      
      // When entering fullscreen on mobile, try to lock orientation to landscape
      if (isCurrentlyFullscreen && window.innerWidth < 768) {
        try {
          if (screen.orientation && (screen.orientation as any).lock) {
            await (screen.orientation as any).lock('landscape').catch(() => {
              console.log('Orientation lock not supported in fullscreen event')
            })
          }
        } catch (err) {
          console.log('Could not lock orientation')
        }
      }
      
      // When exiting fullscreen, unlock orientation
      if (!isCurrentlyFullscreen) {
        try {
          if (screen.orientation && (screen.orientation as any).unlock) {
            (screen.orientation as any).unlock()
          }
        } catch (err) {
          console.log('Could not unlock orientation')
        }
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Advanced Security - Protection against browser extensions
  useEffect(() => {
    // === CRITICAL: Protect against prototype modification ===
    try {
      // Lock down critical methods
      const originalPreventDefault = Event.prototype.preventDefault
      const originalStopPropagation = Event.prototype.stopPropagation
      
      // Try to freeze the prototypes (some extensions can still bypass this)
      Object.defineProperty(Event.prototype, 'preventDefault', {
        value: originalPreventDefault,
        writable: false,
        configurable: false
      })
      
      Object.defineProperty(Event.prototype, 'stopPropagation', {
        value: originalStopPropagation,
        writable: false,
        configurable: false
      })
    } catch (e) {
      // If we can't lock, continue with other protections
    }

    // Store original methods to detect tampering
    const originalPreventDefault = Event.prototype.preventDefault
    const originalStopPropagation = Event.prototype.stopPropagation
    const originalAddEventListener = EventTarget.prototype.addEventListener
    
    let protectionBypassed = false
    let warningShown = false

    // Function to show security warning
    const showSecurityWarning = () => {
      if (!warningShown) {
        warningShown = true
        // Hide video content when protection is bypassed
        if (containerRef.current) {
          const overlay = document.createElement('div')
          overlay.id = 'security-overlay'
          overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #1a1a1a;
            z-index: 50;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            padding: 20px;
          `
          overlay.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
            <h2 style="font-size: 24px; margin-bottom: 10px; color: #ff4444;">تم اكتشاف محاولة تجاوز الحماية</h2>
            <p style="color: #ccc; margin-bottom: 20px;">يرجى تعطيل إضافات المتصفح التي تتجاوز الحماية</p>
            <button onclick="window.location.reload()" style="padding: 12px 24px; background: #ff4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
              إعادة تحميل الصفحة
            </button>
          `
          containerRef.current.style.position = 'relative'
          containerRef.current.appendChild(overlay)
        }
      }
    }

    // Check if protection methods have been tampered with
    const checkProtectionIntegrity = () => {
      // Check if addEventListener has been modified
      if (EventTarget.prototype.addEventListener !== originalAddEventListener) {
        protectionBypassed = true
      }
      
      // Check if preventDefault has been modified
      if (Event.prototype.preventDefault !== originalPreventDefault) {
        protectionBypassed = true
      }

      // Check if stopPropagation has been modified
      if (Event.prototype.stopPropagation !== originalStopPropagation) {
        protectionBypassed = true
      }

      // Check for known extension indicators
      if ((window as any).__allowRightClick || 
          (window as any).__rightClickEnabled ||
          (window as any).allowRightClick ||
          (window as any).enableRightClick ||
          (window as any).__ALLOW_RIGHT_CLICK__ ||
          (window as any).ALLOW_RIGHT_CLICK) {
        protectionBypassed = true
      }

      // Check for extension-specific properties
      if ((window as any).chrome?.extension ||
          (window as any).__extension__ ||
          (window as any).extensionId) {
        // Extension detected, check if it's modifying our protection
        const testEvent = new MouseEvent('contextmenu')
        const originalPrevent = testEvent.preventDefault
        if (testEvent.preventDefault !== originalPrevent) {
          protectionBypassed = true
        }
      }

      // Check if document.oncontextmenu has been overridden
      if (document.oncontextmenu && typeof document.oncontextmenu === 'function') {
        const testFunc = document.oncontextmenu.toString()
        if (testFunc.includes('allowRightClick') || 
            testFunc.includes('rightClick') ||
            testFunc.includes('return true')) {
          protectionBypassed = true
        }
      }

      if (protectionBypassed) {
        showSecurityWarning()
      }
    }

    // Prevent right-click with multiple layers
    const preventContextMenu = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      return false
    }

    // Apply protection to document and all elements
    const applyProtection = () => {
      // Remove any existing overlay if protection is working
      const existingOverlay = document.getElementById('security-overlay')
      if (existingOverlay && !protectionBypassed) {
        existingOverlay.remove()
        warningShown = false
      }

      // Re-apply event listeners (some extensions remove them)
      document.oncontextmenu = (e) => {
        e.preventDefault()
        return false
      }
      
      // Apply to body
      document.body.oncontextmenu = (e) => {
        e.preventDefault()
        return false
      }

      // Apply to all elements in container
      if (containerRef.current) {
        containerRef.current.oncontextmenu = (e) => {
          e.preventDefault()
          return false
        }
        
        const allElements = containerRef.current.querySelectorAll('*')
        allElements.forEach((el: Element) => {
          (el as HTMLElement).oncontextmenu = (e) => {
            e.preventDefault()
            return false
          }
        })
      }
    }

    // Prevent all DevTools shortcuts
    const preventShortcuts = (e: KeyboardEvent) => {
      const blockedKeys = [
        { key: 'F12' },
        { ctrlKey: true, shiftKey: true, key: 'I' },
        { ctrlKey: true, shiftKey: true, key: 'i' },
        { ctrlKey: true, shiftKey: true, key: 'J' },
        { ctrlKey: true, shiftKey: true, key: 'j' },
        { ctrlKey: true, shiftKey: true, key: 'C' },
        { ctrlKey: true, shiftKey: true, key: 'c' },
        { ctrlKey: true, key: 'U' },
        { ctrlKey: true, key: 'u' },
        { ctrlKey: true, key: 'S' },
        { ctrlKey: true, key: 's' },
        { ctrlKey: true, key: 'P' },
        { ctrlKey: true, key: 'p' },
      ]

      for (const combo of blockedKeys) {
        const matches = combo.key === e.key &&
          (!combo.ctrlKey || e.ctrlKey) &&
          (!combo.shiftKey || e.shiftKey)
        
        if (matches) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }
      }
    }

    // Prevent text selection
    const preventSelection = (e: Event) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      return false
    }

    // Detect DevTools opening
    const detectDevTools = () => {
      const threshold = 160
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        showSecurityWarning()
      }
    }

    // MutationObserver to detect DOM changes that might remove protection
    const observer = new MutationObserver((mutations) => {
      // Re-apply protection when DOM changes
      applyProtection()
    })

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['oncontextmenu', 'style']
    })

    // Initial protection application
    applyProtection()

    // Periodic checks
    const protectionInterval = setInterval(() => {
      checkProtectionIntegrity()
      applyProtection()
    }, 500)

    const devToolsInterval = setInterval(detectDevTools, 1000)

    // Clear console repeatedly
    const clearConsole = setInterval(() => {
      console.clear()
      console.log('%c⛔ STOP!', 'color: red; font-size: 60px; font-weight: bold;')
      console.log('%cهذا المحتوى محمي', 'color: red; font-size: 30px;')
    }, 100)

    // Add event listeners with capture phase
    document.addEventListener('contextmenu', preventContextMenu, { capture: true, passive: false })
    document.addEventListener('keydown', preventShortcuts, { capture: true, passive: false })
    document.addEventListener('selectstart', preventSelection, { capture: true, passive: false })
    document.addEventListener('copy', preventSelection, { capture: true, passive: false })
    document.addEventListener('cut', preventSelection, { capture: true, passive: false })
    document.addEventListener('dragstart', preventSelection, { capture: true, passive: false })

    // Override right-click on window level
    window.oncontextmenu = (e) => {
      e.preventDefault()
      return false
    }

    return () => {
      clearInterval(protectionInterval)
      clearInterval(devToolsInterval)
      clearInterval(clearConsole)
      observer.disconnect()
      document.removeEventListener('contextmenu', preventContextMenu, true)
      document.removeEventListener('keydown', preventShortcuts, true)
      document.removeEventListener('selectstart', preventSelection, true)
      document.removeEventListener('copy', preventSelection, true)
      document.removeEventListener('cut', preventSelection, true)
      document.removeEventListener('dragstart', preventSelection, true)
    }
  }, [])

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
      }
      clearTimeout(timeout)
    }
  }, [isPlaying])

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-white">رابط الفيديو غير صحيح</p>
      </div>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg group"
      style={{ userSelect: 'none' }}
    >

      {/* Video Player */}
      <div className="relative aspect-video">
        {/* YouTube iframe */}
        <div
          id={playerId}
          key={playerId}
          className="w-full h-full"
        />
        
        {/* Protection Overlay - Prevents clicking on YouTube links */}
        <div
          className="absolute inset-0"
          style={{
            background: 'transparent',
            cursor: 'pointer',
            zIndex: 15,
            touchAction: 'manipulation',
          }}
          onClick={togglePlay}
          onTouchStart={(e) => {
            // Allow touch but prevent default YouTube behavior
            e.stopPropagation()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            return false
          }}
        />
        
        {/* Top Protection Overlay - Specifically for mobile title bar */}
        <div
          className="absolute top-0 left-0 right-0 h-16"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
            zIndex: 16,
            touchAction: 'none',
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onTouchEnd={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />

        {/* Watermark - اسم المستخدم كعلامة مائية */}
        {studentName && (
          <div
            className="absolute inset-0 pointer-events-none select-none"
            style={{ zIndex: 17 }}
          >
            {/* علامة مائية في الزاوية العلوية */}
            <div 
              className="absolute"
              style={{
                top: '10%',
                right: '5%',
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '16px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                transform: 'rotate(-10deg)',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              {studentName}
            </div>
            
            {/* علامة مائية كبيرة في الوسط */}
            <div 
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-20deg)',
                color: 'rgba(255, 255, 255, 0.15)',
                fontSize: '36px',
                fontWeight: 'bold',
                textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              {studentName}
            </div>
            
            {/* علامة مائية في الأسفل */}
            <div 
              className="absolute"
              style={{
                bottom: '15%',
                left: '8%',
                color: 'rgba(255, 255, 255, 0.25)',
                fontSize: '14px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                transform: 'rotate(8deg)',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              {studentName}
            </div>
            
            {/* علامة مائية إضافية في الزاوية اليسرى العلوية */}
            <div 
              className="absolute"
              style={{
                top: '8%',
                left: '5%',
                color: 'rgba(255, 255, 255, 0.22)',
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              🔒 {studentName}
            </div>
          </div>
        )}

        {/* Custom Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: 20 }}
        >
          {/* Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 hover:h-2 transition-all"
          >
            <div
              className="h-full bg-red-600 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between text-white">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="hover:text-red-500 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" fill="white" />
                ) : (
                  <Play className="w-6 h-6" fill="white" />
                )}
              </button>

              {/* Skip Backward */}
              <button
                onClick={skipBackward}
                className="hover:text-red-500 transition-colors"
                title="رجوع 10 ثواني"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="hover:text-red-500 transition-colors"
                title="تقديم 10 ثواني"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="hover:text-red-500 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-20 transition-all duration-300 accent-red-600"
                />
              </div>

              {/* Time */}
              <div className="text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:text-red-500 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-[-20px] mb-2 bg-gray-900/95 backdrop-blur-sm rounded shadow-xl border border-gray-700 overflow-hidden w-32">
                    <div className="text-xs font-semibold px-2 py-1.5 bg-gray-800 border-b border-gray-700">
                      السرعة
                    </div>
                    <div className="py-0.5">
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`w-full text-center px-2 py-1.5 hover:bg-gray-800 transition-colors text-xs ${
                            playbackRate === rate ? 'bg-red-600 text-white font-bold' : 'text-gray-200'
                          }`}
                        >
                          {rate}x {rate === 1 && '✓'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="hover:text-red-500 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info with Strong Warning */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 px-3 py-2 md:px-4 md:py-3 text-white relative" style={{ zIndex: 5 }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0 mb-1 md:mb-2">
          <span className="font-bold text-xs md:text-sm text-center md:text-right">🔒 محتوى محمي</span>
          <span className="font-semibold text-xs hidden md:inline">© {settings.siteName}</span>
        </div>
        <div className="flex items-center justify-center gap-1 md:gap-2 text-yellow-300 font-bold text-center">
          <span className="text-xs">⚠️</span>
          <span className="text-xs md:text-sm">محاولة التحميل تؤدي لحذف الحساب</span>
          <span className="text-xs">⚠️</span>
        </div>
      </div>

      <style jsx global>{`
        /* ===== CRITICAL: CSS-BASED PROTECTION (Cannot be bypassed by extensions) ===== */
        
        /* Make the iframe completely non-interactive via CSS */
        #presto-player,
        #presto-player * {
          pointer-events: none !important;
        }

        /* Prevent any context menu on the entire player area */
        #presto-player iframe {
          pointer-events: none !important;
          -webkit-touch-callout: none !important;
        }

        /* Prevent text selection */
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
        }

        /* Block right-click via CSS (backup) */
        body {
          -webkit-touch-callout: none !important;
        }

        /* Fullscreen optimizations for mobile */
        @media (max-width: 768px) {
          *:fullscreen,
          *:-webkit-full-screen,
          *:-moz-full-screen,
          *:-ms-fullscreen {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            object-fit: contain !important;
          }
          
          *:fullscreen iframe,
          *:-webkit-full-screen iframe,
          *:-moz-full-screen iframe {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            object-fit: contain !important;
          }
        }
        
        /* Video container fullscreen styles */
        .group:fullscreen,
        .group:-webkit-full-screen,
        .group:-moz-full-screen {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          background: black !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .group:fullscreen > div,
        .group:-webkit-full-screen > div,
        .group:-moz-full-screen > div {
          width: 100% !important;
          height: 100% !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
        }
        
        .group:fullscreen .aspect-video,
        .group:-webkit-full-screen .aspect-video,
        .group:-moz-full-screen .aspect-video {
          aspect-ratio: unset !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
        }
        
        .group:fullscreen iframe,
        .group:-webkit-full-screen iframe,
        .group:-moz-full-screen iframe {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          object-fit: contain !important;
        }

        /* Hide YouTube branding and buttons - COMPREHENSIVE */
        .ytp-title,
        .ytp-title-text,
        .ytp-title-link,
        .ytp-title-channel,
        .ytp-title-channel-logo,
        .ytp-chrome-top,
        .ytp-chrome-top-buttons,
        .ytp-show-cards-title,
        .ytp-watermark,
        .ytp-gradient-top,
        .ytp-pause-overlay,
        .ytp-share-button,
        .ytp-watch-later-button,
        .ytp-youtube-button,
        .ytp-cards-button,
        .ytp-endscreen-content,
        .ytp-button[aria-label*="YouTube"],
        .ytp-button[title*="YouTube"],
        .ytp-impression-link,
        .ytp-contextmenu,
        .ytp-popup,
        .iv-branding,
        .branding-img,
        .ytp-chrome-controls .ytp-button[aria-label*="Watch"],
        .annotation,
        .video-annotations,
        .ytp-mobile-a11y-hidden-seek-button,
        .ytp-title-expanded-title,
        .ytp-title-expanded-subtitle,
        .html5-video-info-panel,
        .ytp-info-panel-preview {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Hide YouTube logo and all links */
        a[href*="youtube.com"],
        a[href*="youtu.be"],
        a[href*="youtube"],
        .yt-uix-sessionlink {
          display: none !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        /* Hide info overlay */
        .ytp-ce-element,
        .ytp-ce-covering-overlay,
        .ytp-ce-element-show,
        .ytp-ce-covering-image,
        .ytp-cued-thumbnail-overlay,
        .ytp-cued-thumbnail-overlay-image {
          display: none !important;
          pointer-events: none !important;
        }

        /* Block all clickable elements in YouTube player */
        #presto-player a,
        #presto-player button[class*="ytp"],
        #presto-player .ytp-button,
        #presto-player [class*="ytp-"] a,
        #presto-player [class*="ytp-"] button {
          pointer-events: none !important;
          display: none !important;
          visibility: hidden !important;
        }

        /* Make iframe non-interactive */
        #presto-player iframe {
          pointer-events: none !important;
        }

        /* Hide end screen and cards */
        .ytp-endscreen-content,
        .ytp-endscreen-previous,
        .ytp-endscreen-next,
        .html5-endscreen {
          display: none !important;
          pointer-events: none !important;
        }

        /* ===== HIDE IDM DOWNLOAD BUTTONS ===== */
        /* Hide any element with IDM in id or class */
        [id*="IDM"],
        [id*="idm"],
        [class*="IDM"],
        [class*="idm"],
        [data-idm],
        #IDMDownloadPanel,
        .IDMDownloadPanel {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Hide OBJECT and EMBED tags (IDM uses these) */
        object[type*="idm"],
        embed[type*="idm"],
        object[classid*="IDM"],
        embed[classid*="IDM"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }

        /* Hide any button/link with "download" text */
        button[title*="download" i],
        a[title*="download" i],
        div[title*="download" i],
        button[title*="تحميل" i],
        a[title*="تحميل" i],
        div[title*="تحميل" i] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }

        /* Hide floating download buttons */
        div[style*="position: absolute"][style*="z-index"],
        div[style*="position: fixed"][style*="z-index"] {
          /* Check if it contains download-related content */
        }

        /* Aggressive: Hide any suspicious floating elements over video */
        video + div[style*="position: absolute"],
        video + div[style*="position: fixed"],
        iframe + div[style*="position: absolute"],
        iframe + div[style*="position: fixed"] {
          pointer-events: none !important;
        }
      `}</style>
    </div>
  )
}

// Declare global types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}
