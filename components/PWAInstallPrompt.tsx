'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { isAppInstalled, setupInstallPrompt, showInstallPrompt } from '@/lib/pwa'

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (isAppInstalled()) {
      return
    }

    // Setup install prompt
    setupInstallPrompt()

    // Show prompt after 30 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  const handleInstall = async () => {
    const accepted = await showInstallPrompt()
    if (accepted) {
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-primary-500 p-6 z-50 animate-slide-up">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 left-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
            ثبّت التطبيق
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            احصل على تجربة أفضل وأسرع مع تطبيقنا. يعمل حتى بدون إنترنت!
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm"
            >
              تثبيت الآن
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
