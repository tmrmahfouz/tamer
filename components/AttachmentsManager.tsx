'use client'

import { useState } from 'react'
import { Paperclip, Upload, X, FileText, Image, File, Download, Trash2 } from 'lucide-react'

interface Attachment {
  name: string
  url: string
  type: string
  size?: number
}

interface AttachmentsManagerProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
  readOnly?: boolean
}

export default function AttachmentsManager({ 
  attachments, 
  onChange, 
  readOnly = false 
}: AttachmentsManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return Image
    if (type.includes('pdf') || type.includes('document')) return FileText
    return File
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileType = (url: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    const typeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      txt: 'text/plain',
    }
    return typeMap[ext] || 'application/octet-stream'
  }

  const handleAddUrl = () => {
    if (!newUrl.trim() || !newName.trim()) return

    const attachment: Attachment = {
      name: newName.trim(),
      url: newUrl.trim(),
      type: getFileType(newUrl, newName),
    }

    onChange([...attachments, attachment])
    setNewUrl('')
    setNewName('')
    setShowUrlInput(false)
  }

  const handleRemove = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const newAttachments: Attachment[] = []

      for (const file of Array.from(files)) {
        // Convert to base64 for storage (in real app, upload to cloud storage)
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })

        newAttachments.push({
          name: file.name,
          url: base64,
          type: file.type,
          size: file.size,
        })
      }

      onChange([...attachments, ...newAttachments])
    } catch (error) {
      console.error('Upload error:', error)
      alert('حدث خطأ أثناء رفع الملفات')
    } finally {
      setUploading(false)
    }
  }

  // Read-only mode for students
  if (readOnly) {
    if (attachments.length === 0) return null

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Paperclip className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-gray-900">الملفات المرفقة</h3>
        </div>

        <div className="space-y-3">
          {attachments.map((attachment, index) => {
            const Icon = getFileIcon(attachment.type)
            return (
              <a
                key={index}
                href={attachment.url}
                download={attachment.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{attachment.name}</p>
                  {attachment.size && (
                    <p className="text-sm text-gray-500">{formatSize(attachment.size)}</p>
                  )}
                </div>
                <Download className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </a>
            )
          })}
        </div>
      </div>
    )
  }

  // Edit mode for instructors
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">الملفات المرفقة</span>
        </div>
        <span className="text-sm text-gray-500">{attachments.length} ملفات</span>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => {
            const Icon = getFileIcon(attachment.type)
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{attachment.name}</p>
                  {attachment.size && (
                    <p className="text-xs text-gray-500">{formatSize(attachment.size)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Buttons */}
      <div className="flex gap-2">
        {/* Upload from device */}
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Upload className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">
              {uploading ? 'جاري الرفع...' : 'رفع ملفات'}
            </span>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif,.mp3,.mp4"
          />
        </label>

        {/* Add from URL */}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">رابط</span>
        </button>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الملف</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="مثال: كتاب المرجع.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط الملف</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!newUrl.trim() || !newName.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-semibold"
            >
              إضافة
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(false)
                setNewUrl('')
                setNewName('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        يمكنك رفع ملفات PDF، Word، Excel، PowerPoint، صور، ملفات مضغوطة، وغيرها
      </p>
    </div>
  )
}
