'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileQuestion,
  Clock,
  Award,
  BookOpen,
  Link2,
  ListOrdered,
} from 'lucide-react'

interface MatchingPair {
  left: string
  right: string
}

interface Question {
  _id?: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'ordering'
  options?: string[]
  correctAnswer: string | string[] | number[]
  matchingPairs?: MatchingPair[]
  orderItems?: string[]
  points: number
  explanation?: string
}

export default function TeacherQuizDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [editingIndex, setEditingIndex] = useState<number>(-1)
  const [questionForm, setQuestionForm] = useState<Question>({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    matchingPairs: [{ left: '', right: '' }, { left: '', right: '' }],
    orderItems: ['', '', ''],
    points: 1,
    explanation: '',
  })

  useEffect(() => {
    checkAuth()
  }, [quizId])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.success) {
        router.push('/login')
        return
      }

      if (data.user.role !== 'instructor' && data.user.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      loadQuiz()
    } catch (error) {
      router.push('/login')
    }
  }

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/quizzes/${quizId}`)
      const data = await response.json()

      if (data.success) {
        setQuiz(data.quiz)
      } else {
        alert('الاختبار غير موجود')
        router.push('/dashboard/quizzes')
      }
    } catch (error) {
      console.error('Error loading quiz:', error)
      alert('حدث خطأ أثناء تحميل الاختبار')
    } finally {
      setLoading(false)
    }
  }

  const openQuestionModal = (question?: Question, index?: number) => {
    if (question && index !== undefined) {
      setEditingQuestion(question)
      setEditingIndex(index)
      setQuestionForm({
        ...question,
        options: question.options || ['', '', '', ''],
        matchingPairs: question.matchingPairs || [{ left: '', right: '' }, { left: '', right: '' }],
        orderItems: question.orderItems || ['', '', ''],
      })
    } else {
      setEditingQuestion(null)
      setEditingIndex(-1)
      setQuestionForm({
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        matchingPairs: [{ left: '', right: '' }, { left: '', right: '' }],
        orderItems: ['', '', ''],
        points: 1,
        explanation: '',
      })
    }
    setShowQuestionModal(true)
  }

  const closeQuestionModal = () => {
    setShowQuestionModal(false)
    setEditingQuestion(null)
    setEditingIndex(-1)
    setQuestionForm({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      matchingPairs: [{ left: '', right: '' }, { left: '', right: '' }],
      orderItems: ['', '', ''],
      points: 1,
      explanation: '',
    })
  }

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!questionForm.question.trim()) {
      alert('الرجاء إدخال نص السؤال')
      return
    }

    // التحقق حسب نوع السؤال
    if (questionForm.type === 'matching') {
      const validPairs = questionForm.matchingPairs?.filter(p => p.left.trim() && p.right.trim())
      if (!validPairs || validPairs.length < 2) {
        alert('الرجاء إضافة زوجين على الأقل للتوصيل')
        return
      }
    } else if (questionForm.type === 'ordering') {
      const validItems = questionForm.orderItems?.filter(item => item.trim())
      if (!validItems || validItems.length < 2) {
        alert('الرجاء إضافة عنصرين على الأقل للترتيب')
        return
      }
    } else if (!questionForm.correctAnswer) {
      alert('الرجاء تحديد الإجابة الصحيحة')
      return
    }

    try {
      const questionToSave = { ...questionForm }
      
      if (questionForm.type === 'matching') {
        questionToSave.matchingPairs = questionForm.matchingPairs?.filter(p => p.left.trim() && p.right.trim())
        questionToSave.correctAnswer = ''
      } else if (questionForm.type === 'ordering') {
        questionToSave.orderItems = questionForm.orderItems?.filter(item => item.trim())
        questionToSave.correctAnswer = questionToSave.orderItems?.map((_, i) => i) || []
      }

      const updatedQuestions = [...(quiz.questions || [])]

      if (editingIndex >= 0) {
        updatedQuestions[editingIndex] = questionToSave
      } else {
        updatedQuestions.push(questionToSave)
      }

      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: updatedQuestions,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadQuiz()
        closeQuestionModal()
        alert(editingIndex >= 0 ? 'تم تحديث السؤال بنجاح' : 'تم إضافة السؤال بنجاح')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving question:', error)
      alert('حدث خطأ أثناء حفظ السؤال')
    }
  }

  const handleDeleteQuestion = async (index: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return

    try {
      const updatedQuestions = quiz.questions.filter((_: any, i: number) => i !== index)

      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: updatedQuestions,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadQuiz()
        alert('تم حذف السؤال بنجاح')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('حدث خطأ أثناء حذف السؤال')
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(questionForm.options || [])]
    newOptions[index] = value
    setQuestionForm({ ...questionForm, options: newOptions })
  }

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...(questionForm.options || []), ''],
    })
  }

  const removeOption = (index: number) => {
    const newOptions = (questionForm.options || []).filter((_, i) => i !== index)
    setQuestionForm({ ...questionForm, options: newOptions })
  }

  // دوال التوصيل
  const handleMatchingPairChange = (index: number, side: 'left' | 'right', value: string) => {
    const newPairs = [...(questionForm.matchingPairs || [])]
    newPairs[index] = { ...newPairs[index], [side]: value }
    setQuestionForm({ ...questionForm, matchingPairs: newPairs })
  }

  const addMatchingPair = () => {
    setQuestionForm({
      ...questionForm,
      matchingPairs: [...(questionForm.matchingPairs || []), { left: '', right: '' }],
    })
  }

  const removeMatchingPair = (index: number) => {
    const newPairs = (questionForm.matchingPairs || []).filter((_, i) => i !== index)
    setQuestionForm({ ...questionForm, matchingPairs: newPairs })
  }

  // دوال الترتيب
  const handleOrderItemChange = (index: number, value: string) => {
    const newItems = [...(questionForm.orderItems || [])]
    newItems[index] = value
    setQuestionForm({ ...questionForm, orderItems: newItems })
  }

  const addOrderItem = () => {
    setQuestionForm({
      ...questionForm,
      orderItems: [...(questionForm.orderItems || []), ''],
    })
  }

  const removeOrderItem = (index: number) => {
    const newItems = (questionForm.orderItems || []).filter((_, i) => i !== index)
    setQuestionForm({ ...questionForm, orderItems: newItems })
  }

  const moveOrderItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...(questionForm.orderItems || [])]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newItems.length) return
    ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
    setQuestionForm({ ...questionForm, orderItems: newItems })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الاختبار غير موجود</h2>
          <Link href="/dashboard/quizzes">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              العودة للاختبارات
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const totalPoints = quiz.questions.reduce((sum: number, q: Question) => sum + q.points, 0)

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'اختيار متعدد'
      case 'true-false': return 'صح/خطأ'
      case 'short-answer': return 'إجابة قصيرة'
      case 'matching': return 'توصيل'
      case 'ordering': return 'ترتيب'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/quizzes">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>العودة للاختبارات</span>
          </button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description || 'لا يوجد وصف'}</p>
          </div>

          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{quiz.questions?.length || 0}</div>
              <div className="text-sm text-gray-600">سؤال</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">نقطة</div>
            </div>
            {quiz.timeLimit && quiz.timeLimit > 0 && (
              <>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{quiz.timeLimit}</div>
                  <div className="text-sm text-gray-600">دقيقة</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Question Button */}
      <div className="mb-6">
        <button
          onClick={() => openQuestionModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة سؤال
        </button>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {quiz.questions && quiz.questions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {quiz.questions.map((question: Question, index: number) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-purple-600">{index + 1}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{question.question}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {getQuestionTypeLabel(question.type)}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          {question.points} نقطة
                        </span>
                      </div>
                    </div>

                    {/* عرض الخيارات */}
                    {question.options && question.options.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {question.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              String(question.correctAnswer) === option ||
                              Number(question.correctAnswer) === optIdx
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            {String(question.correctAnswer) === option ||
                            Number(question.correctAnswer) === optIdx ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* عرض التوصيل */}
                    {question.type === 'matching' && question.matchingPairs && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {question.matchingPairs.map((pair, pairIdx) => (
                          <div key={pairIdx} className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{pair.left}</span>
                            <Link2 className="w-4 h-4 text-gray-400" />
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded">{pair.right}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* عرض الترتيب */}
                    {question.type === 'ordering' && question.orderItems && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {question.orderItems.map((item, itemIdx) => (
                          <span key={itemIdx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded text-sm">
                            {itemIdx + 1}. {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openQuestionModal(question, index)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FileQuestion className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">لا توجد أسئلة بعد</p>
            <p className="text-sm">ابدأ بإضافة أول سؤال للاختبار</p>
          </div>
        )}
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h2>
            </div>

            <form onSubmit={handleQuestionSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    نص السؤال *
                  </label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      نوع السؤال *
                    </label>
                    <select
                      value={questionForm.type}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          type: e.target.value as any,
                          options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : undefined,
                          correctAnswer: '',
                          matchingPairs: e.target.value === 'matching' 
                            ? [{ left: '', right: '' }, { left: '', right: '' }] 
                            : questionForm.matchingPairs,
                          orderItems: e.target.value === 'ordering'
                            ? ['', '', '']
                            : questionForm.orderItems,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    >
                      <option value="multiple-choice">اختيار متعدد</option>
                      <option value="true-false">صح/خطأ</option>
                      <option value="short-answer">إجابة قصيرة</option>
                      <option value="matching">توصيل</option>
                      <option value="ordering">ترتيب</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      النقاط *
                    </label>
                    <input
                      type="number"
                      value={questionForm.points}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Multiple Choice */}
                {questionForm.type === 'multiple-choice' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">الخيارات *</label>
                    <div className="space-y-3">
                      {questionForm.options?.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder={`الخيار ${index + 1}`}
                            required
                          />
                          {(questionForm.options?.length || 0) > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                      >
                        <Plus className="w-5 h-5" />
                        إضافة خيار
                      </button>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">الإجابة الصحيحة *</label>
                      <select
                        value={questionForm.correctAnswer as string}
                        onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">اختر الإجابة الصحيحة</option>
                        {questionForm.options?.map((option, index) => (
                          <option key={index} value={option}>
                            {option || `الخيار ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* True/False */}
                {questionForm.type === 'true-false' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">الإجابة الصحيحة *</label>
                    <select
                      value={questionForm.correctAnswer as string}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">اختر الإجابة</option>
                      <option value="صح">صح</option>
                      <option value="خطأ">خطأ</option>
                    </select>
                  </div>
                )}

                {/* Short Answer */}
                {questionForm.type === 'short-answer' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">الإجابة الصحيحة *</label>
                    <input
                      type="text"
                      value={questionForm.correctAnswer as string}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="اكتب الإجابة الصحيحة"
                      required
                    />
                  </div>
                )}

                {/* Matching */}
                {questionForm.type === 'matching' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Link2 className="w-4 h-4 inline ml-2" />
                      أزواج التوصيل *
                    </label>
                    <div className="space-y-3">
                      {questionForm.matchingPairs?.map((pair, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={pair.left}
                            onChange={(e) => handleMatchingPairChange(index, 'left', e.target.value)}
                            className="flex-1 px-4 py-2 border border-blue-300 rounded-lg bg-blue-50"
                            placeholder={`عنصر ${index + 1}`}
                          />
                          <Link2 className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={pair.right}
                            onChange={(e) => handleMatchingPairChange(index, 'right', e.target.value)}
                            className="flex-1 px-4 py-2 border border-green-300 rounded-lg bg-green-50"
                            placeholder={`المقابل ${index + 1}`}
                          />
                          {(questionForm.matchingPairs?.length || 0) > 2 && (
                            <button
                              type="button"
                              onClick={() => removeMatchingPair(index)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addMatchingPair}
                        className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                      >
                        <Plus className="w-5 h-5" />
                        إضافة زوج
                      </button>
                    </div>
                  </div>
                )}

                {/* Ordering */}
                {questionForm.type === 'ordering' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <ListOrdered className="w-4 h-4 inline ml-2" />
                      عناصر الترتيب *
                    </label>
                    <p className="text-xs text-gray-500 mb-3">أدخل العناصر بالترتيب الصحيح</p>
                    <div className="space-y-2">
                      {questionForm.orderItems?.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleOrderItemChange(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-purple-300 rounded-lg bg-purple-50"
                            placeholder={`العنصر ${index + 1}`}
                          />
                          {(questionForm.orderItems?.length || 0) > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOrderItem(index)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOrderItem}
                        className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                      >
                        <Plus className="w-5 h-5" />
                        إضافة عنصر
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">التوضيح (اختياري)</label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                    rows={2}
                    placeholder="توضيح للإجابة الصحيحة"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={closeQuestionModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                >
                  {editingQuestion ? 'تحديث السؤال' : 'إضافة السؤال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
