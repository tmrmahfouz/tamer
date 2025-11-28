'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Youtube, FileText, Type, Presentation, Code, Upload } from 'lucide-react'
import FileUploader from '@/components/FileUploader'
import AttachmentsManager from '@/components/AttachmentsManager'
import AdminLayout from '@/components/AdminLayout'

export default function NewLessonPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    content: {
      videoUrl: '',
      videoProvider: 'youtube',
      pdfUrl: '',
      pdfUploadType: 'url',
      presentationUrl: '',
      presentationType: 'google-slides',
      textContent: '',
      html5Content: '',
      duration: 0,
      fileName: '',
      fileSize: 0,
    },
    isFree: false,
    isPublished: false,
    attachments: [] as { name: string; url: string; type: string; size?: number }[],
  })

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
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        [field]: value,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.title) {
      setError('عنوان الدرس مطلوب')
      setLoading(false)
      return
    }

    if (formData.type === 'video' && !formData.content.videoUrl) {
      setError('رابط الفيديو مطلوب')
      setLoading(false)
      return
    }

    if (formData.type === 'pdf' && !formData.content.pdfUrl) {
      setError('رابط PDF مطلوب')
      setLoading(false)
      return
    }

    if (formData.type === 'text' && !formData.content.textContent) {
      setError('المحتوى النصي مطلوب')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/courses/${params.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/dashboard/courses/${params.id}/lessons`)
      } else {
        setError(data.message || 'حدث خطأ أثناء إضافة الدرس')
      }
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="إضافة درس جديد">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            href={`/dashboard/courses/${params.id}/modules`}
            className="text-primary-600 hover:text-primary-700 mb-2 inline-block text-sm md:text-base"
          >
            ← العودة للمحتوى
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">إضافة درس جديد</h1>
          <p className="text-gray-600 text-sm md:text-base">أضف محتوى تعليمي للدورة</p>
        </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                عنوان الدرس *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                placeholder="مثال: مقدمة في Python"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الوصف
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none"
                placeholder="وصف مختصر للدرس..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع الدرس *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { value: 'video', label: 'فيديو', icon: Youtube },
                  { value: 'pdf', label: 'PDF', icon: FileText },
                  { value: 'presentation', label: 'عرض تقديمي', icon: Presentation },
                  { value: 'text', label: 'نص', icon: Type },
                  { value: 'html5', label: 'HTML5', icon: Code },
                ].map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value as any })}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.type === type.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        formData.type === type.value ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-semibold ${
                        formData.type === type.value ? 'text-primary-600' : 'text-gray-700'
                      }`}>
                        {type.label}
                      </span>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    مصدر الفيديو
                  </label>
                  <select
                    value={formData.content.videoProvider}
                    onChange={(e) => handleContentChange('videoProvider', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="google-drive">Google Drive</option>
                    <option value="onedrive">OneDrive</option>
                    <option value="upload">رفع ملف</option>
                    <option value="html5">رابط مباشر</option>
                  </select>
                </div>

                {formData.content.videoProvider === 'upload' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      رفع فيديو
                    </label>
                    <FileUploader
                      type="video"
                      onUploadComplete={(url, filename, size) => {
                        handleContentChange('videoUrl', url)
                        handleContentChange('fileName', filename)
                        handleContentChange('fileSize', size)
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      رابط الفيديو *
                    </label>
                    <input
                      type="url"
                      value={formData.content.videoUrl}
                      onChange={(e) => handleContentChange('videoUrl', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {formData.content.videoProvider === 'youtube' && 'مثال: https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                      {formData.content.videoProvider === 'vimeo' && 'مثال: https://vimeo.com/123456789'}
                      {formData.content.videoProvider === 'google-drive' && 'مثال: https://drive.google.com/file/d/FILE_ID/view'}
                      {formData.content.videoProvider === 'onedrive' && 'مثال: https://onedrive.live.com/embed?...'}
                      {formData.content.videoProvider === 'html5' && 'رابط الفيديو المباشر'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PDF Content */}
            {formData.type === 'pdf' && (
              <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900">محتوى PDF</h3>
                
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handleContentChange('pdfUploadType', 'upload')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.content.pdfUploadType === 'upload'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Upload className="w-5 h-5 mx-auto mb-1" />
                    رفع ملف
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContentChange('pdfUploadType', 'url')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.content.pdfUploadType !== 'upload'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-5 h-5 mx-auto mb-1" />
                    رابط خارجي
                  </button>
                </div>

                {formData.content.pdfUploadType === 'upload' ? (
                  <FileUploader
                    type="pdf"
                    onUploadComplete={(url, filename, size) => {
                      handleContentChange('pdfUrl', url)
                      handleContentChange('fileName', filename)
                      handleContentChange('fileSize', size)
                    }}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      رابط PDF *
                    </label>
                    <input
                      type="url"
                      value={formData.content.pdfUrl}
                      onChange={(e) => handleContentChange('pdfUrl', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                      placeholder="https://example.com/file.pdf"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      يمكنك رفع الملف على Google Drive أو Dropbox ثم نسخ الرابط
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Presentation Content */}
            {formData.type === 'presentation' && (
              <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900">العرض التقديمي</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    نوع العرض
                  </label>
                  <select
                    value={formData.content.presentationType}
                    onChange={(e) => handleContentChange('presentationType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  >
                    <option value="google-slides">Google Slides</option>
                    <option value="powerpoint">PowerPoint Online</option>
                    <option value="upload">رفع ملف</option>
                  </select>
                </div>

                {formData.content.presentationType === 'upload' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      رفع عرض تقديمي
                    </label>
                    <FileUploader
                      type="presentation"
                      onUploadComplete={(url, filename, size) => {
                        handleContentChange('presentationUrl', url)
                        handleContentChange('fileName', filename)
                        handleContentChange('fileSize', size)
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      رابط العرض التقديمي *
                    </label>
                    <input
                      type="url"
                      value={formData.content.presentationUrl}
                      onChange={(e) => handleContentChange('presentationUrl', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                      placeholder="https://docs.google.com/presentation/d/..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {formData.content.presentationType === 'google-slides' && 'مثال: https://docs.google.com/presentation/d/ABC123/edit'}
                      {formData.content.presentationType === 'powerpoint' && 'رابط PowerPoint Online'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* HTML5 Content */}
            {formData.type === 'html5' && (
              <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900">محتوى HTML5</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    كود HTML *
                  </label>
                  <textarea
                    value={formData.content.html5Content}
                    onChange={(e) => handleContentChange('html5Content', e.target.value)}
                    rows={15}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none font-mono text-sm"
                    placeholder="<h1>عنوان</h1>&#10;<p>محتوى...</p>"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    يمكنك كتابة HTML, CSS, JavaScript
                  </p>
                </div>
              </div>
            )}

            {/* Text Content */}
            {formData.type === 'text' && (
              <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900">المحتوى النصي</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المحتوى *
                  </label>
                  <textarea
                    value={formData.content.textContent}
                    onChange={(e) => handleContentChange('textContent', e.target.value)}
                    rows={15}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none font-mono"
                    placeholder="اكتب محتوى الدرس هنا...&#10;&#10;يمكنك استخدام Markdown للتنسيق:&#10;# عنوان&#10;## عنوان فرعي&#10;**نص عريض**&#10;*نص مائل*&#10;- قائمة"
                  />
                </div>
              </div>
            )}

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                المدة (بالدقائق)
              </label>
              <input
                type="number"
                value={formData.content.duration}
                onChange={(e) => handleContentChange('duration', parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                placeholder="15"
              />
            </div>

            {/* Attachments */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <AttachmentsManager
                attachments={formData.attachments}
                onChange={(attachments) => setFormData({ ...formData, attachments })}
              />
            </div>

            {/* Options */}
            <div className="space-y-3 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">خيارات إضافية</h3>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-gray-900 font-semibold">درس مجاني</span>
                  <p className="text-sm text-gray-600">متاح للجميع بدون اشتراك</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-gray-900 font-semibold">نشر الدرس</span>
                  <p className="text-sm text-gray-600">سيكون مرئياً للطلاب فوراً</p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 md:gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 md:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm md:text-base"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>حفظ الدرس</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </AdminLayout>
  )
}
