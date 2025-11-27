'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, FileText, X, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

interface TranscriptSegment {
  startTime: number
  endTime: number
  text: string
}

interface TranscriptPanelProps {
  lessonId: string
  currentTime: number
  onSeek: (time: number) => void
  isOpen: boolean
  onToggle: () => void
}

export default function TranscriptPanel({
  lessonId,
  currentTime,
  onSeek,
  isOpen,
  onToggle,
}: TranscriptPanelProps) {
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSegments, setFilteredSegments] = useState<TranscriptSegment[]>([])
  const [copied, setCopied] = useState(false)
  const activeRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadTranscript()
  }, [lessonId])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = segments.filter(seg => 
        seg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSegments(filtered)
    } else {
      setFilteredSegments(segments)
    }
  }, [searchQuery, segments])

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeRef.current && containerRef.current && !searchQuery) {
      const container = containerRef.current
      const active = activeRef.current
      const containerRect = container.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      
      if (activeRect.top < containerRect.top || activeRect.bottom > containerRect.bottom) {
        active.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentTime, searchQuery])

  const loadTranscript = async () => {
    try {
      const res = await fetch(`/api/transcripts?lessonId=${lessonId}`)
      const data = await res.json()
      if (data.success && data.transcript) {
        setSegments(data.transcript.segments || [])
        setFilteredSegments(data.transcript.segments || [])
      }
    } catch (error) {
      console.error('Error loading transcript:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isActiveSegment = (segment: TranscriptSegment) => {
    return currentTime >= segment.startTime && currentTime < segment.endTime
  }

  const copyFullTranscript = async () => {
    const fullText = segments.map(s => s.text).join(' ')
    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-300 text-gray-900 px-0.5 rounded">{part}</mark>
        : part
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-20 left-4 md:relative md:bottom-auto md:left-auto bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors shadow-lg z-40"
      >
        <FileText className="w-4 h-4" />
        <span className="text-sm">النص</span>
        <ChevronUp className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">نص الفيديو</h3>
          {segments.length > 0 && (
            <span className="text-xs text-gray-500">({segments.length} مقطع)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyFullTranscript}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            title="نسخ النص الكامل"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث في النص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-gray-500 mt-2">
            {filteredSegments.length} نتيجة
          </p>
        )}
      </div>

      {/* Transcript Content */}
      <div 
        ref={containerRef}
        className="max-h-80 overflow-y-auto p-3 space-y-2"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'لا توجد نتائج' : 'لا يوجد نص متاح لهذا الفيديو'}
          </div>
        ) : (
          filteredSegments.map((segment, index) => {
            const isActive = isActiveSegment(segment)
            return (
              <div
                key={index}
                ref={isActive ? activeRef : null}
                onClick={() => onSeek(segment.startTime)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-primary-100 border-r-4 border-primary-600' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-xs font-mono flex-shrink-0 ${
                    isActive ? 'text-primary-600 font-bold' : 'text-gray-400'
                  }`}>
                    {formatTime(segment.startTime)}
                  </span>
                  <p className={`text-sm leading-relaxed ${
                    isActive ? 'text-gray-900 font-medium' : 'text-gray-700'
                  }`}>
                    {highlightText(segment.text, searchQuery)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
