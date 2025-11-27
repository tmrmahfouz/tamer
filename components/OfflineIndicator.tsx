'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { setupOnlineOfflineListeners, isOffline } from '@/lib/pwa'

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    setOffline(isOffline())

    const cleanup = setupOnlineOfflineListeners(
      () => {
        setOffline(false)
        setShowMessage(true)
        setTimeout(() => setShowMessage(false), 3000)
      },
      () => {
        setOffline(true)
        setShowMessage(true)
      }
    )

    return cleanup
  }, [])

  if (!showMessage && !offline) return null

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 transition-all ${
        offline
          ? 'bg-red-500 text-white'
          : 'bg-green-500 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {offline ? (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="font-semibold">لا يوجد اتصال بالإنترنت</span>
          </>
        ) : (
          <>
            <Wifi className="w-5 h-5" />
            <span className="font-semibold">تم الاتصال بالإنترنت</span>
          </>
        )}
      </div>
    </div>
  )
}
