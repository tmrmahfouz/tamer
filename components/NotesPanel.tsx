'use client'

import { useState, useEffect } from 'react'
import { StickyNote, Plus, Edit2, Trash2, Clock, Save, X } from 'lucide-react'

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

  useEffect(() => {
    loadNotes()
  }, [lessonId])

  const loadNotes = async () => {
    try {
      const response = await fetch(`/api/notes?lessonId=${lessonId}`)
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
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewNote('')
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
      const response = await fetch(`/api/notes/${id}`, {
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
    if (!confirm('هل تريد حذف هذه الملاحظة؟')) return

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        loadNotes()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <StickyNote className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          ملاحظاتي
        </h3>
        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold">
          {notes.length}
        </span>
      </div>

      {/* Add Note */}
      <div className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="أضف ملاحظة جديدة..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-900 dark:text-gray-100 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          {currentTime !== undefined && (
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(Math.floor(currentTime))}
            </span>
          )}
          <button
            onClick={addNote}
            disabled={adding || !newNote.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 mr-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{adding ? 'جاري الإضافة...' : 'إضافة'}</span>
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            جاري التحميل...
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد ملاحظات بعد</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {editingId === note._id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-primary-600 rounded-lg focus:outline-none dark:bg-gray-800 dark:text-gray-100 resize-none mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateNote(note._id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditContent('')
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>إلغاء</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-900 dark:text-gray-100 mb-2 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {note.timestamp !== undefined && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(note.timestamp)}
                        </span>
                      )}
                      <span>
                        {new Date(note.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(note._id)
                          setEditContent(note.content)
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => deleteNote(note._id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
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
