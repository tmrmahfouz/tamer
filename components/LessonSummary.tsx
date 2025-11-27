'use client'

import { useState, useEffect } from 'react'
import { FileText, ChevronDown, ChevronUp, Sparkles, Copy, Check } from 'lucide-react'

interface LessonSummaryProps {
  lessonId: string
  lessonTitle: string
}

export default function LessonSummary({ lessonId, lessonTitle }: LessonSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [keyPoints, setKeyPoints] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadSummary()
  }, [lessonId])

  const loadSummary = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/summary`)
      const data = await res.json()
      if (data.success) {
        setSummary(data.summary || null)
        setKeyPoints(data.keyPoints || [])
      }
    } catch (error) {
      console.error('Error loading summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    const text = `${lessonTitle}\n\n${summary}\n\nالنقاط الرئيسية:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    )
  }

  if (!summary && keyPoints.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-gray-900">ملخص الدرس</h3>
            <p className="text-xs text-gray-500">{keyPoints.length} نقاط رئيسية</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Summary Text */}
          {summary && (
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Key Points */}
          {keyPoints.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                النقاط الرئيسية
              </h4>
              <ul className="space-y-2">
                {keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-500">تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ الملخص</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
