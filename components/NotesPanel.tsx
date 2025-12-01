'use client'

import { useState, useEffect, useRef } from 'react'
import { StickyNote, Plus, Edit2, Trash2, Clock, Save, X, Link2, FileUp, Share2, MessageCircle, ExternalLink, Paperclip, CheckCircle } from 'lucide-react'

interface Attachment {
  type: 'file' | 'link'
  name: string
  url: string
  fileType?: string
}

interface NotesPanelProps {
  courseId: string
  lessonId: string
  currentTime?: number
}

export default function NotesPanel({ courseId, lessonId, currentTime }: NotesPanelProps) {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [adding, setAdding] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')
  const [shareWithInstructor, setShareWithInstructor] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadNotes()
  }, [lessonId])

  const loadNotes = async () => {
    try {
      const response = await fetch(/api/notes?lessonId=+lessonId)
      const data = await response.json()
      if (data.success) setNotes(data.notes)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          type: 'file',
          name: file.name,
          url: reader.result as string,
          fileType: file.type.split('/')[1] || 'file'
        }])
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addLink = () => {
    if (!linkUrl.trim()) return
    setAttachments(prev => [...prev, {
      type: 'link',
      name: linkName.trim() || linkUrl,
      url: linkUrl.startsWith('http') ? linkUrl : 'https://'+linkUrl
    }])
    setLinkUrl('')
    setLinkName('')
    setShowLinkInput(false)
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    setAdding(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId,
          content: newNote,
          timestamp: currentTime ? Math.floor(currentTime) : undefined,
          attachments,
          isSharedWithInstructor: shareWithInstructor,
          status: shareWithInstructor ? 'shared' : 'private'
        }),
      })
      const data = await response.json()
      if (data.success) {
        setNewNote('')
        setAttachments([])
        setShareWithInstructor(false)
        loadNotes()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setAdding(false)
    }
  }

  const updateNote = async (id: string) => {
    if (!editContent.trim()) return
    try {
      const response = await fetch('/api/notes/'+id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      const data = await response.json()
      if (data.success) {
        setEditingId(null)
        setEditContent('')
        loadNotes()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return
    try {
      const response = await fetch('/api/notes/'+id, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) loadNotes()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const shareNote = async (id: string) => {
    try {
      const response = await fetch('/api/notes/'+id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSharedWithInstructor: true, status: 'shared' }),
      })
      const data = await response.json()
      if (data.success) loadNotes()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins+':'+(secs.toString().padStart(2, '0'))
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return 'file'
    if (fileType.includes('pdf')) return 'pdf'
    if (['png', 'jpg', 'jpeg', 'gif'].includes(fileType)) return 'image'
    if (['doc', 'docx'].includes(fileType)) return 'doc'
    return 'file'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <StickyNote className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Notes</h3>
        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">{notes.length}</span>
      </div>

      <div className="mb-6 space-y-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-900 dark:text-gray-100 resize-none"
        />

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                {att.type === 'link' ? <Link2 className="w-4 h-4 text-blue-500" /> : <Paperclip className="w-4 h-4" />}
                <span className="max-w-[150px] truncate">{att.name}</span>
                <button onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showLinkInput && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="URL" className="flex-1 min-w-[150px] px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
            <input type="text" value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="Name (optional)" className="flex-1 min-w-[150px] px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
            <button onClick={addLink} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Add</button>
            <button onClick={() => setShowLinkInput(false)} className="px-3 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg text-sm">Cancel</button>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {currentTime !== undefined && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />{formatTime(Math.floor(currentTime))}
              </span>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Attach file">
              <FileUp className="w-5 h-5" /><span className="text-sm hidden sm:inline">File</span>
            </button>
            <button onClick={() => setShowLinkInput(!showLinkInput)} className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Add link">
              <Link2 className="w-5 h-5" /><span className="text-sm hidden sm:inline">Link</span>
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={shareWithInstructor} onChange={(e) => setShareWithInstructor(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1"><Share2 className="w-4 h-4" />Share with instructor</span>
            </label>
            <button onClick={addNote} disabled={adding || !newNote.trim()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              <Plus className="w-4 h-4" /><span>{adding ? 'Adding...' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No notes yet</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note._id} className={'p-4 rounded-lg border '+(note.status === 'replied' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : note.status === 'shared' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'bg-gray-50 dark:bg-gray-700 border-gray-200')}>
              {editingId === note._id ? (
                <div>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="w-full px-3 py-2 border-2 border-primary-600 rounded-lg resize-none mb-2 dark:bg-gray-800 dark:text-white" />
                  <div className="flex gap-2">
                    <button onClick={() => updateNote(note._id)} className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm"><Save className="w-4 h-4" />Save</button>
                    <button onClick={() => { setEditingId(null); setEditContent('') }} className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded text-sm"><X className="w-4 h-4" />Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {note.status !== 'private' && (
                    <div className="flex items-center gap-2 mb-2">
                      {note.status === 'shared' && <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"><Share2 className="w-3 h-3" />Shared</span>}
                      {note.status === 'replied' && <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="w-3 h-3" />Replied</span>}
                    </div>
                  )}
                  <p className="text-gray-900 dark:text-gray-100 mb-2 whitespace-pre-wrap">{note.content}</p>
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {note.attachments.map((att: Attachment, idx: number) => (
                        <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-600 border rounded text-sm hover:bg-gray-50">
                          {att.type === 'link' ? <ExternalLink className="w-3.5 h-3.5 text-blue-500" /> : <Paperclip className="w-3.5 h-3.5 text-gray-500" />}
                          <span className="max-w-[120px] truncate">{att.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  {note.instructorReply && (
                    <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border-r-4 border-green-500">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">Instructor Reply:</span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm">{note.instructorReply}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {note.timestamp !== undefined && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(note.timestamp)}</span>}
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1">
                      {note.status === 'private' && (
                        <button onClick={() => shareNote(note._id)} className="p-1.5 hover:bg-blue-100 rounded text-blue-600" title="Share with instructor">
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => { setEditingId(note._id); setEditContent(note.content) }} className="p-1.5 hover:bg-gray-200 rounded">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => deleteNote(note._id)} className="p-1.5 hover:bg-gray-200 rounded">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
