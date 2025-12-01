'use client'

import { useState, useEffect } from 'react'
import InstructorLayout from '@/components/InstructorLayout'
import { StickyNote, MessageCircle, Send, Clock, User, BookOpen, FileText, ExternalLink, Paperclip, Filter, CheckCircle, AlertCircle } from 'lucide-react'

interface Attachment {
  type: 'file' | 'link'
  name: string
  url: string
  fileType?: string
}

interface Note {
  _id: string
  content: string
  timestamp?: number
  attachments?: Attachment[]
  status: 'shared' | 'replied'
  instructorReply?: string
  instructorRepliedAt?: Date
  createdAt: string
  user: { _id: string; name: string; email: string; avatar?: string }
  course: { _id: string; title: string }
  lesson: { _id: string; title: string }
}

export default function InstructorNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'shared' | 'replied'>('all')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadNotes()
  }, [filter])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const status = filter === 'all' ? '' : filter
      const response = await fetch(`/api/admin/notes?status=${status}`)
      const data = await response.json()
      if (data.success) {
        setNotes(data.notes)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendReply = async (noteId: string) => {
    if (!replyContent.trim()) return

    setSending(true)
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorReply: replyContent }),
      })

      const data = await response.json()
      if (data.success) {
        setReplyingTo(null)
        setReplyContent('')
        loadNotes()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const sharedCount = notes.filter(n => n.status === 'shared').length
  const repliedCount = notes.filter(n => n.status === 'replied').length

  return (
    <InstructorLayout title="ملاحظات الطلاب">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">ملاحظات الطلاب</h1>
          <p className="text-gray-600">الملاحظات التي شاركها الطلاب معك</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
                <p className="text-sm text-gray-500">إجمالي الملاحظات</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sharedCount}</p>
                <p className="text-sm text-gray-500">بانتظار الرد</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{repliedCount}</p>
                <p className="text-sm text-gray-500">تم الرد</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'shared', label: 'بانتظار الرد' },
              { value: 'replied', label: 'تم الرد' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">جاري التحميل...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد ملاحظات</h3>
            <p className="text-gray-500">لم يشارك أي طالب ملاحظاته معك بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                  note.status === 'shared' ? 'border-yellow-300' : 'border-green-300'
                }`}
              >
                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{note.user.name}</p>
                      <p className="text-sm text-gray-500">{note.user.email}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      note.status === 'shared' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {note.status === 'shared' ? 'بانتظار الرد' : 'تم الرد'}
                    </span>
                  </div>
                </div>

                {/* Course & Lesson Info */}
                <div className="px-6 py-3 bg-gray-50/50 border-b flex items-center gap-6 text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    {note.course.title}
                  </span>
                  <span className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    {note.lesson.title}
                  </span>
                  {note.timestamp !== undefined && (
                    <span className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {formatTime(note.timestamp)}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>

                  {/* Attachments */}
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {note.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          {att.type === 'link' ? (
                            <ExternalLink className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Paperclip className="w-4 h-4 text-gray-500" />
                          )}
                          <span>{att.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(note.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Instructor Reply */}
                {note.instructorReply && (
                  <div className="px-6 py-4 bg-green-50 border-t border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">ردك:</span>
                    </div>
                    <p className="text-gray-800">{note.instructorReply}</p>
                    {note.instructorRepliedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.instructorRepliedAt).toLocaleDateString('ar-EG')}
                      </p>
                    )}
                  </div>
                )}

                {/* Reply Form */}
                {note.status === 'shared' && (
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    {replyingTo === note._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="اكتب ردك هنا..."
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => sendReply(note._id)}
                            disabled={sending || !replyContent.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            <span>{sending ? 'جاري الإرسال...' : 'إرسال الرد'}</span>
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyContent('') }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(note._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>الرد على الملاحظة</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
