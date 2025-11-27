'use client'

import { useEffect, useState } from 'react'

interface CourseProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  className?: string
}

export default function CourseProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
  className = '',
}: CourseProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedProgress / 100) * circumference

  useEffect(() => {
    // Animate progress
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  const getColor = () => {
    if (progress >= 100) return '#10B981' // green
    if (progress >= 75) return '#3B82F6' // blue
    if (progress >= 50) return '#F59E0B' // yellow
    if (progress >= 25) return '#F97316' // orange
    return '#EF4444' // red
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-2xl font-bold"
            style={{ color: getColor() }}
          >
            {Math.round(progress)}%
          </span>
          <span className="text-xs text-gray-500">مكتمل</span>
        </div>
      )}
    </div>
  )
}
