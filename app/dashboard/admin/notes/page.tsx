'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { StickyNote, MessageCircle, Send, Clock, User, BookOpen, FileText, ExternalLink, Paperclip, Filter, CheckCircle, AlertCircle, Search, Download, X, Image, Trash2, Link2, Plus } from 'lucide-react'

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
  status: 'private' | 'shared' | 'replied'
  isSharedWithInstructor: boolean
  instructorReply?: string
  instructorReplyLinks?: Attachment[]
  instructorRepliedAt?: Date
  createdAt: string
  user: { _id: string; name: string; email: string; avatar?: string }
  course: { _id: string; title: string }
  lesson: { _id: string; title: string }
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'private' | 'shared' | 'replied'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyLinks, setReplyLinks] = useState<Attachment[]>([])
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')
  const [sending, setSending] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

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
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          instructorReply: replyContent,
          instructorReplyLinks: replyLinks 
        }),
      })

      const data = await response.json()
      if (data.success) {
        setReplyingTo(null)
        setReplyContent('')
        setReplyLinks([])
        loadNotes()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSending(false)
    }
  }

  const addReplyLink = () => {
    if (!linkUrl.trim()) return
    setReplyLinks(prev => [...prev, {
      type: 'link',
      name: linkName.trim() || linkUrl,
      url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    }])
    setLinkUrl('')
    setLinkName('')
    setShowLinkInput(false)
  }

  const removeReplyLink = (index: number) => {
    setReplyLinks(prev => prev.filter((_, i) => i !== index))
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟ سيتم حذف جميع المرفقات أيضاً.')) return

    setDeleting(noteId)
    try {
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        loadNotes()
      } else {
        alert(data.message || 'حدث خطأ أثناء الحذف')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء الحذف')
    } finally {
      setDeleting(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isImageFile = (fileType?: string) => {
    if (!fileType) return false
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileType.toLowerCase())
  }

  const filteredNotes = notes.filter(note => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      note.content.toLowerCase().includes(search) ||
      note.user.name.toLowerCase().includes(search) ||
      note.user.email.toLowerCase().includes(search) ||
      note.course.title.toLowerCase().includes(search) ||
      note.lesson.title.toLowerCase().includes(search)
    )
  })

  const privateCount = notes.filter(n => n.status === 'private').length
  const sharedCount = notes.filter(n => n.status === 'shared').length
  const repliedCount = notes.filter(n => n.status === 'replied').length

  return (
    <AdminLayout title="ملاحظات الطلاب">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">ملاحظات الطلاب</h1>
          <p className="text-gray-600">جميع ملاحظات الطلاب في المنصة</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <StickyNote className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
                <p className="text-sm text-gray-500">إجمالي</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <StickyNote className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{privateCount}</p>
                <p className="text-sm text-gray-500">خاصة</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sharedCount}</p>
                <p className="text-sm text-gray-500">بانتظار الرد</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{repliedCount}</p>
                <p className="text-sm text-gray-500">تم الرد</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث في الملاحظات..."
              className="w-full pr-10 pl-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'private', label: 'خاصة' },
                { value: 'shared', label: 'بانتظار الرد' },
                { value: 'replied', label: 'تم الرد' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">جاري التحميل...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد ملاحظات</h3>
            <p className="text-gray-500">لم يشارك أي طالب ملاحظاته بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                  note.status === 'private' ? 'border-gray-300' : note.status === 'shared' ? 'border-yellow-300' : 'border-green-300'
                }`}
              >
                {/* Header */}
                <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{note.user.name}</p>
                      <p className="text-sm text-gray-500">{note.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      note.status === 'private' 
                        ? 'bg-gray-100 text-gray-700' 
                        : note.status === 'shared' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {note.status === 'private' ? 'خاصة' : note.status === 'shared' ? 'بانتظار الرد' : 'تم الرد'}
                    </span>
                    <button
                      onClick={() => deleteNote(note._id)}
                      disabled={deleting === note._id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="حذف الملاحظة"
                    >
                      {deleting === note._id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Course & Lesson Info */}
                <div className="px-6 py-3 bg-gray-50/50 border-b flex flex-wrap items-center gap-4 text-sm">
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
                    <div className="flex flex-wrap gap-3 mt-3">
                      {note.attachments.map((att, idx) => (
                        <div key={idx}>
                          {att.type === 'file' && isImageFile(att.fileType) ? (
                            <div className="relative group cursor-pointer" onClick={() => setPreviewImage(att.url)}>
                              <img 
                                src={att.url} 
                                alt={att.name} 
                                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-primary-400 transition-colors"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                <Image className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate rounded-b-lg">{att.name}</span>
                            </div>
                          ) : (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={att.type === 'file' ? att.name : undefined}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            >
                              {att.type === 'link' ? (
                                <ExternalLink className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Paperclip className="w-4 h-4 text-gray-500" />
                              )}
                              <span>{att.name}</span>
                              {att.type === 'file' && (
                                <Download className="w-3 h-3 text-gray-400" />
                              )}
                            </a>
                          )}
                        </div>
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
                      <span className="text-sm font-semibold text-green-700">الرد:</span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{note.instructorReply}</p>
                    {note.instructorReplyLinks && note.instructorReplyLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {note.instructorReplyLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-300 rounded-lg text-sm hover:bg-green-100 transition-colors text-green-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>{link.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
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
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none"
                        />
                        
                        {/* Reply Links */}
                        {replyLinks.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {replyLinks.map((link, idx) => (
                              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                                <Link2 className="w-4 h-4 text-blue-500" />
                                <span className="max-w-[200px] truncate">{link.name}</span>
                                <button onClick={() => removeReplyLink(idx)} className="text-red-500 hover:text-red-700">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Link Input */}
                        {showLinkInput ? (
                          <div className="flex flex-wrap gap-2 p-3 bg-white border rounded-lg">
                            <input
                              type="text"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              placeholder="رابط URL (فيديو، ملف، موقع...)"
                              className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm"
                            />
                            <input
                              type="text"
                              value={linkName}
                              onChange={(e) => setLinkName(e.target.value)}
                              placeholder="اسم الرابط (اختياري)"
                              className="flex-1 min-w-[150px] px-3 py-2 border rounded-lg text-sm"
                            />
                            <button onClick={addReplyLink} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                              إضافة
                            </button>
                            <button onClick={() => setShowLinkInput(false)} className="px-3 py-2 bg-gray-200 rounded-lg text-sm">
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowLinkInput(true)}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                            إضافة رابط (فيديو، ملف، موقع...)
                          </button>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => sendReply(note._id)}
                            disabled={sending || !replyContent.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            <span>{sending ? 'جاري الإرسال...' : 'إرسال الرد'}</span>
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyContent(''); setReplyLinks([]); setShowLinkInput(false) }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(note._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button onClick={() => setPreviewImage(null)} className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
              <X className="w-6 h-6" />
            </button>
            <a href={previewImage} download className="absolute bottom-2 right-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              تحميل
            </a>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
