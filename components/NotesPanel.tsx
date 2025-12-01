'use client'

import { useState, useEffect, useRef } from 'react'
import { StickyNote, Plus, Edit2, Trash2, Clock, Save, X, Link2, FileUp, Share2, MessageCircle, ExternalLink, Paperclip, CheckCircle } from 'lucide-react'

interface Attachment { type: 'file' | 'link'; name: string; url: string; fileType?: string }
interface NotesPanelProps { courseId: string; lessonId: string; currentTime?: number }

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

  useEffect(() => { loadNotes() }, [lessonId])

  const loadNotes = async () => {
    try {
      const res = await fetch(/api/notes?lessonId=+lessonId)
      const data = await res.json()
      if (data.success) setNotes(data.notes)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments(prev => [...prev, { type: 'file', name: file.name, url: reader.result as string, fileType: file.type.split('/')[1] || 'file' }])
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addLink = () => {
    if (!linkUrl.trim()) return
    setAttachments(prev => [...prev, { type: 'link', name: linkName.trim() || linkUrl, url: linkUrl.startsWith('http') ? linkUrl : 'https://'+linkUrl }])
    setLinkUrl(''); setLinkName(''); setShowLinkInput(false)
  }

  const removeAttachment = (i: number) => setAttachments(prev => prev.filter((_, idx) => idx !== i))

  const addNote = async () => {
    if (!newNote.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId, content: newNote, timestamp: currentTime ? Math.floor(currentTime) : undefined, attachments, isSharedWithInstructor: shareWithInstructor, status: shareWithInstructor ? 'shared' : 'private' }) })
      if ((await res.json()).success) { setNewNote(''); setAttachments([]); setShareWithInstructor(false); loadNotes() }
    } catch (e) { console.error(e) }
    finally { setAdding(false) }
  }

  const updateNote = async (id: string) => {
    if (!editContent.trim()) return
    try {
      const res = await fetch('/api/notes/'+id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: editContent }) })
      if ((await res.json()).success) { setEditingId(null); setEditContent(''); loadNotes() }
    } catch (e) { console.error(e) }
  }

  const deleteNote = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الملاحظة؟')) return
    try { if ((await (await fetch('/api/notes/'+id, { method: 'DELETE' })).json()).success) loadNotes() } catch (e) { console.error(e) }
  }

  const shareNote = async (id: string) => {
    try {
      const res = await fetch('/api/notes/'+id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isSharedWithInstructor: true, status: 'shared' }) })
      if ((await res.json()).success) loadNotes()
    } catch (e) { console.error(e) }
  }

  const formatTime = (s: number) => Math.floor(s/60)+':'+(s%60).toString().padStart(2,'0')
  const getFileIcon = (t?: string) => !t ? '' : t.includes('pdf') ? '' : ['png','jpg','jpeg','gif'].includes(t) ? '' : ['doc','docx'].includes(t) ? '' : ''

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = () => {
        setAttachments(prev => [...prev, { type: 'file', name: file.name, url: reader.result as string, fileType: file.type.split('/')[1] || 'file' }])
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addLink = () => {
    if (!linkUrl.trim()) return
    setAttachments(prev => [...prev, { type: 'link', name: linkName.trim() || linkUrl, url: linkUrl.startsWith('http') ? linkUrl : 'https://'+linkUrl }])
    setLinkUrl(''); setLinkName(''); setShowLinkInput(false)
  }

  const removeAttachment = (i: number) => setAttachments(prev => prev.filter((_, idx) => idx !== i))

  const addNote = async () => {
    if (!newNote.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId, content: newNote, timestamp: currentTime ? Math.floor(currentTime) : undefined, attachments, isSharedWithInstructor: shareWithInstructor, status: shareWithInstructor ? 'shared' : 'private' })
      })
      if ((await res.json()).success) { setNewNote(''); setAttachments([]); setShareWithInstructor(false); loadNotes() }
    } catch (e) { console.error(e) }
    finally { setAdding(false) }
  }

  const updateNote = async (id: string) => {
    if (!editContent.trim()) return
    try {
      const res = await fetch('/api/notes/'+id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: editContent }) })
      if ((await res.json()).success) { setEditingId(null); setEditContent(''); loadNotes() }
    } catch (e) { console.error(e) }
  }

  const deleteNote = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الملاحظة؟')) return
    try { if ((await (await fetch('/api/notes/'+id, { method: 'DELETE' })).json()).success) loadNotes() } catch (e) { console.error(e) }
  }

  const shareNote = async (id: string) => {
    try {
      const res = await fetch('/api/notes/'+id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isSharedWithInstructor: true, status: 'shared' }) })
      if ((await res.json()).success) loadNotes()
    } catch (e) { console.error(e) }
  }

  const formatTime = (s: number) => Math.floor(s/60)+':'+(s%60).toString().padStart(2,'0')
  const getFileIcon = (t?: string) => !t ? '' : t.includes('pdf') ? '' : ['png','jpg','jpeg','gif'].includes(t) ? '' : ['doc','docx'].includes(t) ? '' : ''
