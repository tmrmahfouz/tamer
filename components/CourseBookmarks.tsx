'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, Clock, Trash2, Search, Filter, BookOpen } from 'lucide-react'

interface BookmarkItem {
  _id: string
  timestamp: number
  title: string
  note?: string
  color: string
  lesson: {
    _id: string
    title: string
  }
  createdAt: string
}

interface CourseBookmarksProps {
  courseId: string
}

export default function CourseBookmarks({ courseId }: CourseBookmarksProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  useEffect(() => {
    loadBookmarks()
  }, [courseId])

  const loadBookmarks = async () => {
    try {
      const res = await fetch(`/api/bookmarks?courseId=${courseId}`)
      const data = await res.json()
      if (data.success) {
        setBookmarks(data.bookmarks || [])
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteBookmark = async (id: string) => {
    if (!confirm('هل تريد حذف هذه العلامة؟')) return
    
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

  const filteredBookmarks = bookmarks.filter(b => {
    const matchesSearch = !searchQuery || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesColor = !selectedColor || b.color === selectedColor
    return matchesSearch && matchesColor
  })

  // Group by lesson
  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    const lessonId = bookmark.lesson._id
    if (!acc[lessonId]) {
      acc[lessonId] = {
        lessonTitle: bookmark.lesson.title,
        bookmarks: [],
      }
    }
    acc[lessonId].bookmarks.push(bookmark)
    return acc
  }, {} as Record<string, { lessonTitle: string; bookmarks: BookmarkItem[] }>)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-yellow-600" />
            <h3 className="font-bold text-gray-900">العلامات المرجعية</h3>
            <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-sm">
              {bookmarks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث في العلامات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          
          {/* Color Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => setSelectedColor(null)}
              className={`px-3 py-1 rounded-full text-xs ${!selectedColor ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              الكل
            </button>
            {['yellow', 'green', 'blue', 'red', 'purple'].map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                className={`w-6 h-6 rounded-full ${getColorClass(color)} ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{searchQuery || selectedColor ? 'لا توجد نتائج' : 'لا توجد علامات مرجعية'}</p>
          </div>
        ) : (
          Object.entries(groupedBookmarks).map(([lessonId, { lessonTitle, bookmarks: lessonBookmarks }]) => (
            <div key={lessonId} className="border-b last:border-0">
              {/* Lesson Header */}
              <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{lessonTitle}</span>
                <span className="text-xs text-gray-400">({lessonBookmarks.length})</span>
              </div>
              
              {/* Bookmarks */}
              {lessonBookmarks.map(bookmark => (
                <Link
                  key={bookmark._id}
                  href={`/learn/${courseId}/${lessonId}?t=${bookmark.timestamp}`}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-3 h-3 ${getColorClass(bookmark.color)} rounded-full mt-1.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{bookmark.title}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(bookmark.timestamp)}
                      </span>
                    </div>
                    {bookmark.note && (
                      <p className="text-sm text-gray-500 line-clamp-2">{bookmark.note}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); deleteBookmark(bookmark._id); }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Link>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
