'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Youtube, FileText, Type, Presentation, Code, Upload, Loader2 } from 'lucide-react'
import FileUploader from '@/components/FileUploader'
import AttachmentsManager from '@/components/AttachmentsManager'
import InstructorLayout from '@/components/InstructorLayout'

export default function EditLessonPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'video',
    content: {
      videoUrl: '', videoProvider: 'youtube', pdfUrl: '', pdfUploadType: 'url',
      presentationUrl: '', presentationType: 'google-slides', textContent: '',
      html5Content: '', duration: 0, fileName: '', fileSize: 0,
    },
    isFree: false, isPublished: false,
    attachments: [] as { name: string; url: string; type: string; size?: number }[],
  })

  useEffect(() => {
    loadLesson()
  }, [])

  const loadLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${params.lessonId}`)
      const data = await response.json()
      if (data.success) {
        const lesson = data.lesson
        setFormData({
          title: lesson.title || '', description: lesson.description || '', type: lesson.type || 'video',
          content: lesson.content || {
            videoUrl: '', videoProvider: 'youtube', pdfUrl: '', pdfUploadType: 'url',
            presentationUrl: '', presentationType: 'google-slides', textContent: '',
            html5Content: '', duration: 0, fileName: '', fileSize: 0,
          },
          isFree: lesson.isFree || false, isPublished: lesson.isPublished || false,
          attachments: lesson.attachments || [],
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleContentChange = (field: string, value: any) => {
    setFormData({ ...formData, content: { ...formData.content, [field]: value } })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!formData.title) { setError('عنوان الدرس مطلوب'); setSaving(false); return }

    try {
      const response = await fetch(`/api/lessons/${params.lessonId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) router.push(`/instructor/courses/${params.id}/edit`)
      else setError(data.message || 'حدث خطأ أثناء تحديث الدرس')
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <InstructorLayout title="تعديل الدرس">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout title="تعديل الدرس">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link href={`/instructor/courses/${params.id}/edit`} className="text-green-600 hover:text-green-700 mb-2 inline-block text-sm md:text-base">
            ← العودة للدورة
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">تعديل الدرس</h1>
          <p className="text-gray-600 text-sm md:text-base">عدّل محتوى الدرس</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الدرس *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">نوع الدرس *</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { value: 'video', label: 'فيديو', icon: Youtube },
                { value: 'pdf', label: 'PDF', icon: FileText },
                { value: 'presentation', label: 'عرض تقديمي', icon: Presentation },
                { value: 'text', label: 'نص', icon: Type },
                { value: 'html5', label: 'HTML5', icon: Code },
              ].map((type) => {
                const Icon = type.icon
                return (
                  <button key={type.value} type="button" onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`p-4 border-2 rounded-lg transition-all ${formData.type === type.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${formData.type === type.value ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-semibold ${formData.type === type.value ? 'text-green-600' : 'text-gray-700'}`}>{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Video Content */}
          {formData.type === 'video' && (
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900">محتوى الفيديو</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">مصدر الفيديو</label>
                <select value={formData.content.videoProvider} onChange={(e) => handleContentChange('videoProvider', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600">
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="google-drive">Google Drive</option>
                  <option value="onedrive">OneDrive</option>
                  <option value="upload">رفع ملف</option>
                  <option value="html5">رابط مباشر</option>
                </select>
              </div>
              {formData.content.videoProvider === 'upload' ? (
                <FileUploader type="video" onUploadComplete={(url, filename, size) => {
                  handleContentChange('videoUrl', url); handleContentChange('fileName', filename); handleContentChange('fileSize', size)
                }} />
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رابط الفيديو *</label>
                  <input type="url" value={formData.content.videoUrl} onChange={(e) => handleContentChange('videoUrl', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" />
                </div>
              )}
            </div>
          )}

          {/* PDF Content */}
          {formData.type === 'pdf' && (
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900">محتوى PDF</h3>
              <div className="flex gap-4 mb-4">
                <button type="button" onClick={() => handleContentChange('pdfUploadType', 'upload')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${formData.content.pdfUploadType === 'upload' ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-200'}`}>
                  <Upload className="w-5 h-5 mx-auto mb-1" />رفع ملف
                </button>
                <button type="button" onClick={() => handleContentChange('pdfUploadType', 'url')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${formData.content.pdfUploadType !== 'upload' ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-200'}`}>
                  <FileText className="w-5 h-5 mx-auto mb-1" />رابط خارجي
                </button>
              </div>
              {formData.content.pdfUploadType === 'upload' ? (
                <FileUploader type="pdf" onUploadComplete={(url, filename, size) => {
                  handleContentChange('pdfUrl', url); handleContentChange('fileName', filename); handleContentChange('fileSize', size)
                }} />
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رابط PDF *</label>
                  <input type="url" value={formData.content.pdfUrl} onChange={(e) => handleContentChange('pdfUrl', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" />
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          {formData.type === 'text' && (
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900">المحتوى النصي</h3>
              <textarea value={formData.content.textContent} onChange={(e) => handleContentChange('textContent', e.target.value)} rows={15}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600 resize-none font-mono" />
            </div>
          )}

          {/* HTML5 Content */}
          {formData.type === 'html5' && (
            <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900">محتوى HTML5</h3>
              <textarea value={formData.content.html5Content} onChange={(e) => handleContentChange('html5Content', e.target.value)} rows={15}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600 resize-none font-mono text-sm" />
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">المدة (بالدقائق)</label>
            <input type="number" value={formData.content.duration} onChange={(e) => handleContentChange('duration', parseInt(e.target.value) || 0)} min="0"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600" />
          </div>

          {/* Attachments */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <AttachmentsManager attachments={formData.attachments} onChange={(attachments) => setFormData({ ...formData, attachments })} />
          </div>

          {/* Options */}
          <div className="space-y-3 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">خيارات إضافية</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
              <div>
                <span className="text-gray-900 font-semibold">درس مجاني</span>
                <p className="text-sm text-gray-600">متاح للجميع بدون اشتراك</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
              <div>
                <span className="text-gray-900 font-semibold">نشر الدرس</span>
                <p className="text-sm text-gray-600">سيكون مرئياً للطلاب فوراً</p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 md:gap-4 pt-6 border-t">
            <button type="button" onClick={() => router.back()}
              className="flex-1 px-4 md:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              إلغاء
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50">
              {saving ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>جاري الحفظ...</span></>
              ) : (
                <><Save className="w-5 h-5" /><span>حفظ التغييرات</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </InstructorLayout>
  )
}
