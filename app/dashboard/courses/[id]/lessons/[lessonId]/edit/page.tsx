'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Save, Youtube, FileText, Type, HelpCircle, Eye, Presentation, Code, Upload, Plus, Edit, Trash2, Paperclip } from 'lucide-react'
import FileUploader from '@/components/FileUploader'
import AttachmentsManager from '@/components/AttachmentsManager'

interface Question {
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer: string
  points: number
  explanation?: string
}

export default function EditLessonPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1)
  const [questionForm, setQuestionForm] = useState<Question>({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    explanation: '',
  })
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
          title: lesson.title || '',
          description: lesson.description || '',
          type: lesson.type || 'video',
          content: {
            videoUrl: lesson.content?.videoUrl || '',
            videoProvider: lesson.content?.videoProvider || 'youtube',
            pdfUrl: lesson.content?.pdfUrl || '',
            pdfUploadType: 'url',
            presentationUrl: lesson.content?.presentationUrl || '',
            presentationType: lesson.content?.presentationType || 'google-slides',
            textContent: lesson.content?.textContent || '',
            html5Content: lesson.content?.html5Content || '',
            duration: lesson.content?.duration || 0,
            fileName: lesson.content?.fileName || '',
            fileSize: lesson.content?.fileSize || 0,
          },
          isFree: lesson.isFree || false,
          isPublished: lesson.isPublished || false,
          attachments: lesson.attachments || [],
        })
        
        // Load questions if quiz type
        if (lesson.type === 'quiz' && lesson.questions) {
          setQuestions(lesson.questions)
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error)
      setError('حدث خطأ أثناء تحميل الدرس')
    } finally {
      setLoadingData(false)
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

    if (formData.type === 'quiz' && questions.length === 0) {
      setError('يجب إضافة سؤال واحد على الأقل للاختبار')
      setLoading(false)
      return
    }

    try {
      // Prepare data with questions for quiz type
      const dataToSend = {
        ...formData,
        ...(formData.type === 'quiz' && { questions }),
      }

      const response = await fetch(`/api/lessons/${params.lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/dashboard/courses/${params.id}/lessons`)
      } else {
        setError(data.message || 'حدث خطأ أثناء تحديث الدرس')
      }
    } catch (error) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الدرس...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">لوحة التحكم</span>
          </Link>
          <Link
            href="/dashboard/courses"
            className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-semibold"
          >
            الدورات
          </Link>
        </div>
      </div>

      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden lg:block fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg">لوحة التحكم</span>
          </Link>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
            >
              الرئيسية
            </Link>
            <Link
              href="/dashboard/courses"
              className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg font-semibold"
            >
              الدورات
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <Link
              href={`/dashboard/courses/${params.id}/lessons`}
              className="text-primary-600 hover:text-primary-700 mb-2 inline-block text-sm lg:text-base"
            >
              ← العودة للدروس
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">تعديل الدرس</h1>
            <p className="text-gray-600 text-sm lg:text-base">تحديث محتوى الدرس</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
                {[
                  { value: 'video', label: 'فيديو', icon: Youtube },
                  { value: 'pdf', label: 'PDF', icon: FileText },
                  { value: 'presentation', label: 'عرض تقديمي', icon: Presentation },
                  { value: 'text', label: 'نص', icon: Type },
                  { value: 'html5', label: 'HTML5', icon: Code },
                  { value: 'quiz', label: 'اختبار', icon: HelpCircle },
                ].map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value as any })}
                      className={`p-2 sm:p-4 border-2 rounded-lg transition-all ${
                        formData.type === type.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${
                        formData.type === type.value ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs sm:text-sm font-semibold block ${
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
              <div className="space-y-4 p-4 sm:p-6 bg-gray-50 rounded-lg">
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
              <div className="space-y-4 p-4 sm:p-6 bg-gray-50 rounded-lg">
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
              <div className="space-y-4 p-4 sm:p-6 bg-gray-50 rounded-lg">
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
              <div className="space-y-4 p-4 sm:p-6 bg-gray-50 rounded-lg">
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
              <div className="space-y-4 p-4 sm:p-6 bg-gray-50 rounded-lg">
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

            {/* Quiz Questions */}
            {formData.type === 'quiz' && (
              <div className="space-y-4 p-4 sm:p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">أسئلة الاختبار</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuestionIndex(-1)
                      setQuestionForm({
                        question: '',
                        type: 'multiple-choice',
                        options: ['', '', '', ''],
                        correctAnswer: '',
                        points: 1,
                        explanation: '',
                      })
                      setShowQuestionModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة سؤال</span>
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>لم يتم إضافة أسئلة بعد</p>
                    <p className="text-sm">اضغط "إضافة سؤال" لبدء إنشاء الاختبار</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-gray-900">س{index + 1}:</span>
                              <span className="text-gray-700">{q.question}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {q.type === 'multiple-choice' && 'اختيار متعدد'}
                                {q.type === 'true-false' && 'صح/خطأ'}
                                {q.type === 'short-answer' && 'إجابة قصيرة'}
                              </span>
                              <span>{q.points} نقطة</span>
                            </div>
                            {q.type === 'multiple-choice' && q.options && (
                              <div className="mt-2 mr-6 space-y-1">
                                {q.options.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm">
                                    <span className={opt === q.correctAnswer ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                                      {opt === q.correctAnswer && '✓ '}
                                      {opt}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestionIndex(index)
                                setQuestionForm(q)
                                setShowQuestionModal(true)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
                                  setQuestions(questions.filter((_, i) => i !== index))
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-800">
                      <strong>إجمالي الأسئلة:</strong> {questions.length}
                    </span>
                    <span className="text-blue-800">
                      <strong>إجمالي النقاط:</strong> {questions.reduce((sum, q) => sum + q.points, 0)}
                    </span>
                  </div>
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
            <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
              <AttachmentsManager
                attachments={formData.attachments}
                onChange={(attachments) => setFormData({ ...formData, attachments })}
              />
            </div>

            {/* Options */}
            <div className="space-y-3 p-4 sm:p-6 bg-gray-50 rounded-lg">
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:flex-1 px-4 sm:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold order-2 sm:order-1"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>تحديث الدرس</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingQuestionIndex >= 0 ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!questionForm.question.trim()) {
                  alert('الرجاء إدخال نص السؤال')
                  return
                }
                if (!questionForm.correctAnswer) {
                  alert('الرجاء تحديد الإجابة الصحيحة')
                  return
                }

                const updatedQuestions = [...questions]
                if (editingQuestionIndex >= 0) {
                  updatedQuestions[editingQuestionIndex] = questionForm
                } else {
                  updatedQuestions.push(questionForm)
                }
                setQuestions(updatedQuestions)
                setShowQuestionModal(false)
              }}
              className="p-6 space-y-4"
            >
              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نص السؤال *
                </label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none"
                  placeholder="اكتب السؤال هنا..."
                  required
                />
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نوع السؤال *
                </label>
                <select
                  value={questionForm.type}
                  onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                >
                  <option value="multiple-choice">اختيار متعدد</option>
                  <option value="true-false">صح/خطأ</option>
                  <option value="short-answer">إجابة قصيرة</option>
                </select>
              </div>

              {/* Multiple Choice Options */}
              {questionForm.type === 'multiple-choice' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الخيارات *
                  </label>
                  <div className="space-y-2">
                    {questionForm.options?.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...(questionForm.options || [])]
                          newOptions[i] = e.target.value
                          setQuestionForm({ ...questionForm, options: newOptions })
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                        placeholder={`الخيار ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionForm({
                        ...questionForm,
                        options: [...(questionForm.options || []), ''],
                      })
                    }}
                    className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-semibold"
                  >
                    + إضافة خيار
                  </button>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الإجابة الصحيحة *
                    </label>
                    <select
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                      required
                    >
                      <option value="">اختر الإجابة الصحيحة</option>
                      {questionForm.options?.filter(opt => opt.trim()).map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* True/False */}
              {questionForm.type === 'true-false' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الإجابة الصحيحة *
                  </label>
                  <select
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                    required
                  >
                    <option value="">اختر الإجابة</option>
                    <option value="true">صح</option>
                    <option value="false">خطأ</option>
                  </select>
                </div>
              )}

              {/* Short Answer */}
              {questionForm.type === 'short-answer' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الإجابة الصحيحة *
                  </label>
                  <textarea
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none"
                    placeholder="الإجابة المتوقعة..."
                    required
                  />
                </div>
              )}

              {/* Points */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  النقاط *
                </label>
                <input
                  type="number"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  required
                />
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  التوضيح (اختياري)
                </label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 resize-none"
                  placeholder="توضيح للإجابة..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingQuestionIndex >= 0 ? 'تحديث السؤال' : 'إضافة السؤال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
