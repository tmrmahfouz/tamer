'use client'

import { useEffect, useState } from 'react'

export default function ContentProtection() {
  const [showWarning, setShowWarning] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // التحقق من دور المستخدم
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && (data.user?.role === 'admin' || data.user?.role === 'instructor')) {
          setIsAdmin(true)
        }
      } catch (e) {
        // Not logged in or error
      }
    }
    checkUserRole()
  }, [])

  useEffect(() => {
    // إذا كان المستخدم أدمن أو معلم، لا تطبق الحماية
    if (isAdmin) {
      console.log('🔓 Content protection disabled for admin/instructor')
      return
    }
    // === CRITICAL: Protect against prototype modification ===
    try {
      const originalPreventDefault = Event.prototype.preventDefault
      const originalStopPropagation = Event.prototype.stopPropagation
      
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
      // Continue with other protections
    }

    // Store original methods to detect tampering
    const originalPreventDefault = Event.prototype.preventDefault
    const originalStopPropagation = Event.prototype.stopPropagation
    const originalAddEventListener = EventTarget.prototype.addEventListener
    
    let protectionBypassed = false

    // Check if protection methods have been tampered with
    const checkProtectionIntegrity = () => {
      if (EventTarget.prototype.addEventListener !== originalAddEventListener) {
        protectionBypassed = true
      }
      if (Event.prototype.preventDefault !== originalPreventDefault) {
        protectionBypassed = true
      }
      if (Event.prototype.stopPropagation !== originalStopPropagation) {
        protectionBypassed = true
      }
      
      // Check for known extension indicators
      if ((window as any).__allowRightClick || 
          (window as any).__rightClickEnabled ||
          (window as any).allowRightClick ||
          (window as any).enableRightClick ||
          (window as any).__ALLOW_RIGHT_CLICK__ ||
          (window as any).ALLOW_RIGHT_CLICK ||
          (window as any).__extension__ ||
          (window as any).extensionId) {
        protectionBypassed = true
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
        setShowWarning(true)
      }
    }

    // منع النقر بالزر الأيمن مع طبقات متعددة
    const handleContextMenu = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      return false
    }

    // تطبيق الحماية على جميع العناصر
    const applyProtection = () => {
      document.oncontextmenu = (e) => {
        e.preventDefault()
        return false
      }
      
      document.body.oncontextmenu = (e) => {
        e.preventDefault()
        return false
      }

      // تطبيق على جميع العناصر
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        (el as HTMLElement).oncontextmenu = (e) => {
          e.preventDefault()
          return false
        }
      })
    }

    // منع اختصارات لوحة المفاتيح
    const handleKeyDown = (e: KeyboardEvent) => {
      try {
        // التحقق من أن e و e.key موجودان
        if (!e || typeof e.key !== 'string') return

        const pressedKey = e.key.toLowerCase()
        
        // F12
        if (pressedKey === 'f12') {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
        
        // Ctrl+Shift+I/J/C (DevTools)
        if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(pressedKey)) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
        
        // Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print)
        if (e.ctrlKey && !e.shiftKey && ['u', 's', 'p'].includes(pressedKey)) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      } catch (err) {
        // تجاهل أي أخطاء
      }
    }

    // منع الأحداث الأخرى
    const preventEvent = (e: Event) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      return false
    }

    // MutationObserver لمراقبة التغييرات
    const observer = new MutationObserver(() => {
      applyProtection()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['oncontextmenu', 'style']
    })

    // تطبيق الحماية الأولي
    applyProtection()

    // فحص دوري
    const protectionInterval = setInterval(() => {
      checkProtectionIntegrity()
      applyProtection()
    }, 500)

    // اكتشاف أدوات المطورين
    const detectDevTools = () => {
      const threshold = 160
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        setShowWarning(true)
      }
    }

    const devToolsInterval = setInterval(detectDevTools, 1000)

    // مسح Console
    const clearConsoleInterval = setInterval(() => {
      console.clear()
    }, 100)

    // إضافة المستمعين مع capture phase
    document.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: false })
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false })
    document.addEventListener('copy', preventEvent, { capture: true, passive: false })
    document.addEventListener('cut', preventEvent, { capture: true, passive: false })
    document.addEventListener('dragstart', preventEvent, { capture: true, passive: false })
    document.addEventListener('selectstart', preventEvent, { capture: true, passive: false })

    // تجاوز على مستوى window
    window.oncontextmenu = (e) => {
      e.preventDefault()
      return false
    }

    return () => {
      clearInterval(protectionInterval)
      clearInterval(devToolsInterval)
      clearInterval(clearConsoleInterval)
      observer.disconnect()
      document.removeEventListener('contextmenu', handleContextMenu, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('copy', preventEvent, true)
      document.removeEventListener('cut', preventEvent, true)
      document.removeEventListener('dragstart', preventEvent, true)
      document.removeEventListener('selectstart', preventEvent, true)
    }
  }, [isAdmin])

  // عرض تحذير إذا تم اكتشاف تجاوز
  if (showWarning) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ fontSize: '28px', marginBottom: '16px', color: '#ff4444' }}>
          تم اكتشاف محاولة تجاوز الحماية
        </h2>
        <p style={{ color: '#ccc', marginBottom: '24px', maxWidth: '400px' }}>
          يرجى تعطيل إضافات المتصفح التي تتجاوز الحماية مثل "Allow Right-Click" ثم إعادة تحميل الصفحة
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '14px 32px',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    )
  }

  return null
}
