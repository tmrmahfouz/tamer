'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, ThumbsUp, CheckCircle, Pin, Send, Plus, Search, Filter, Clock, Eye, User } from 'lucide-react'

interface Discussion {
  _id: string
  title: string
  content: string
  type: 'question' | 'discussion' | 'announcement'
  user: { _id: string; name: string; avatar?: string }
  likes: string[]
  replies: any[]
  views: number
  isPinned: boolean
  isResolved: boolean
  createdAt: string
}

interface DiscussionForumProps {
  courseId: string
  lessonId?: string
  currentUserId?: string
}

export default function DiscussionForum({ courseId, lessonId, currentUserId }: DiscussionForumProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  
  // Form state
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState<'question' | 'discussion'>('question')
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadDiscussions()
  }, [courseId, lessonId, filterType])

  const loadDiscussions = async () => {
    try {
      let url = `/api/discussions?courseId=${courseId}`
      if (lessonId) url += `&lessonId=${lessonId}`
      if (filterType) url += `&type=${filterType}`
      
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setDiscussions(data.discussions)
      }
    } catch (error) {
      console.error('Error loading discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId, lessonId, title: newTitle, content: newContent, type: newType
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDiscussions([data.discussion, ...discussions])
        setNewTitle(''); setNewContent(''); setShowNewForm(false)
      }
    } catch (error) {
      console.error('Error creating discussion:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const addReply = async () => {
    if (!replyContent.trim() || !selectedDiscussion) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/discussions/${selectedDiscussion._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedDiscussion(data.discussion)
        setDiscussions(discussions.map(d => d._id === data.discussion._id ? data.discussion : d))
        setReplyContent('')
      }
    } catch (error) {
      console.error('Error adding reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLike = async (discussionId: string, replyId?: string) => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: replyId ? 'likeReply' : 'like', replyId }),
      })
      const data = await res.json()
      if (data.success) {
        setDiscussions(discussions.map(d => d._id === data.discussion._id ? data.discussion : d))
        if (selectedDiscussion?._id === data.discussion._id) {
          setSelectedDiscussion(data.discussion)
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const markResolved = async (discussionId: string) => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve' }),
      })
      const data = await res.json()
      if (data.success) {
        setDiscussions(discussions.map(d => d._id === data.discussion._id ? data.discussion : d))
        if (selectedDiscussion?._id === data.discussion._id) {
          setSelectedDiscussion(data.discussion)
        }
      }
    } catch (error) {
      console.error('Error marking resolved:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (mins < 60) return `منذ ${mins} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    if (days < 7) return `منذ ${days} يوم`
    return date.toLocaleDateString('ar-EG')
  }

  const filteredDiscussions = discussions.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>)}
        </div>
      </div>
    )
  }

  // عرض تفاصيل المناقشة
  if (selectedDiscussion) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <button onClick={() => setSelectedDiscussion(null)} className="text-white/80 hover:text-white mb-2 text-sm">
            ← العودة للمناقشات
          </button>
          <h3 className="text-xl font-bold text-white">{selectedDiscussion.title}</h3>
          <div className="flex items-center gap-4 mt-2 text-blue-100 text-sm">
            <span className="flex items-center gap-1"><User className="w-4 h-4" />{selectedDiscussion.user.name}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDate(selectedDiscussion.createdAt)}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{selectedDiscussion.views}</span>
          </div>
        </div>

        <div className="p-6">
          {/* المحتوى الأصلي */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{selectedDiscussion.content}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <button onClick={() => toggleLike(selectedDiscussion._id)} className={`flex items-center gap-1 text-sm ${selectedDiscussion.likes.includes(currentUserId || '') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                <ThumbsUp className="w-4 h-4" /> {selectedDiscussion.likes.length}
              </button>
              {selectedDiscussion.type === 'question' && (
                <button onClick={() => markResolved(selectedDiscussion._id)} className={`flex items-center gap-1 text-sm ${selectedDiscussion.isResolved ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}>
                  <CheckCircle className="w-4 h-4" /> {selectedDiscussion.isResolved ? 'تم الحل' : 'وضع كمحلول'}
                </button>
              )}
            </div>
          </div>

          {/* الردود */}
          <h4 className="font-bold text-gray-900 mb-4">الردود ({selectedDiscussion.replies.length})</h4>
          <div className="space-y-4 mb-6">
            {selectedDiscussion.replies.map((reply: any) => (
              <div key={reply._id} className={`p-4 rounded-lg ${reply.isInstructorReply ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                    {reply.user.name?.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{reply.user.name}</span>
                    {reply.isInstructorReply && <span className="mr-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">المدرس</span>}
                  </div>
                  <span className="text-xs text-gray-500 mr-auto">{formatDate(reply.createdAt)}</span>
                </div>
                <p className="text-gray-700 pr-10">{reply.content}</p>
                <button onClick={() => toggleLike(selectedDiscussion._id, reply._id)} className={`flex items-center gap-1 text-sm mt-2 pr-10 ${reply.likes.includes(currentUserId || '') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                  <ThumbsUp className="w-3 h-3" /> {reply.likes.length}
                </button>
              </div>
            ))}
          </div>

          {/* إضافة رد */}
          <div className="border-t pt-4">
            <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="اكتب ردك هنا..." rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none resize-none" />
            <button onClick={addReply} disabled={submitting || !replyContent.trim()}
              className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              <Send className="w-4 h-4" /> {submitting ? 'جاري الإرسال...' : 'إرسال الرد'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // القائمة الرئيسية
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <MessageCircle className="w-6 h-6" />
            <h3 className="text-xl font-bold">منتدى النقاش</h3>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{discussions.length}</span>
          </div>
          <button onClick={() => setShowNewForm(true)} className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-sm">
            <Plus className="w-4 h-4" /> سؤال جديد
          </button>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="ابحث في المناقشات..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">كل الأنواع</option>
            <option value="question">أسئلة</option>
            <option value="discussion">نقاشات</option>
            <option value="announcement">إعلانات</option>
          </select>
        </div>
      </div>

      {/* نموذج إضافة مناقشة */}
      {showNewForm && (
        <div className="p-4 border-b bg-blue-50">
          <h4 className="font-bold text-gray-900 mb-3">إضافة سؤال أو نقاش جديد</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <button onClick={() => setNewType('question')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${newType === 'question' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                سؤال
              </button>
              <button onClick={() => setNewType('discussion')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${newType === 'discussion' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                نقاش
              </button>
            </div>
            <input type="text" placeholder="عنوان السؤال أو النقاش" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <textarea placeholder="اكتب تفاصيل سؤالك أو نقاشك..." value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            <div className="flex gap-2">
              <button onClick={createDiscussion} disabled={submitting || !newTitle.trim() || !newContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'جاري النشر...' : 'نشر'}
              </button>
              <button onClick={() => { setShowNewForm(false); setNewTitle(''); setNewContent('') }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* قائمة المناقشات */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد مناقشات بعد</p>
          </div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <div key={discussion._id} onClick={() => setSelectedDiscussion(discussion)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {discussion.user.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {discussion.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                    {discussion.isResolved && <CheckCircle className="w-4 h-4 text-green-600" />}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${discussion.type === 'question' ? 'bg-orange-100 text-orange-700' : discussion.type === 'announcement' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {discussion.type === 'question' ? 'سؤال' : discussion.type === 'announcement' ? 'إعلان' : 'نقاش'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 truncate">{discussion.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">{discussion.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{discussion.user.name}</span>
                    <span>{formatDate(discussion.createdAt)}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{discussion.likes.length}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{discussion.replies.length}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{discussion.views}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
