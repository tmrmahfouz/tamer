'use client'

import { useState, useEffect } from 'react'
import { Play, RotateCcw, X } from 'lucide-react'

interface ResumePromptProps {
  lastPosition: number
  duration: number
  onResume: () => void
  onStartOver: () => void
  onDismiss: () => void
}

export default function ResumePrompt({
  lastPosition,
  duration,
  onResume,
  onStartOver,
  onDismiss,
}: ResumePromptProps) {
  const [show, setShow] = useState(true)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = (lastPosition / duration) * 100

  if (!show || lastPosition < 10) return null

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
        <button
          onClick={() => { setShow(false); onDismiss(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-primary-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          استئناف المشاهدة؟
        </h3>
        
        <p className="text-gray-600 mb-4">
          توقفت عند {formatTime(lastPosition)} من {formatTime(duration)}
        </p>

        {/* Progress indicator */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setShow(false); onStartOver(); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>من البداية</span>
          </button>
          <button
            onClick={() => { setShow(false); onResume(); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            <Play className="w-4 h-4" />
            <span>استئناف</span>
          </button>
        </div>
      </div>
    </div>
  )
}
