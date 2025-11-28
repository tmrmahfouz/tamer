'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import { 
  Clock, CheckCircle, XCircle, Award, 
  AlertCircle, ArrowRight, ArrowLeft, Send 
} from 'lucide-react'

interface Question {
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer: string | number
  points: number
  explanation?: string
}

interface Quiz {
  _id: string
  title: string
  description: string
  questions: Question[]
  passingScore: number
  timeLimit?: number
  attempts: number
  lesson?: string | { _id: string }
  course?: string | { _id: string }
}

export default function TakeQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(string | number)[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [startTime] = useState(new Date())
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [lessons, setLessons] = useState<any[]>([])
  const [nextLesson, setNextLesson] = useState<any>(null)
  const [isLastLesson, setIsLastLesson] = useState(false)
  const [courseId, setCourseId] = useState<string>('')

  useEffect(() => {
    checkAuth()
    loadQuiz()
  }, [quizId])

  // تحميل الدروس بعد تحميل الاختبار
  useEffect(() => {
    if (quiz && courseId) {
      loadLessons()
    }
  }, [quiz, courseId])

  // Timer
  useEffect(() => {
    if (quiz && quiz.timeLimit && timeLeft > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft, quiz, submitted])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.success || !data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
    } catch (error) {
      router.push('/login')
    }
  }

  const loadQuiz = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/quizzes/${quizId}`)
      const data = await response.json()

      console.log('Quiz API response:', data)
      if (data.success && data.quiz) {
        setQuiz(data.quiz)
        setAnswers(new Array(data.quiz.questions.length).fill(''))
        if (data.quiz.timeLimit) {
          setTimeLeft(data.quiz.timeLimit * 60) // Convert to seconds
        }
        // حفظ معرف الدورة
        const cId = typeof data.quiz.course === 'object' ? data.quiz.course._id : data.quiz.course
        setCourseId(cId)
      } else {
        console.error('Quiz not found:', data.message)
        alert(data.message || 'الاختبار غير موجود')
        router.back()
      }
    } catch (error) {
      console.error('Error loading quiz:', error)
      alert('حدث خطأ أثناء تحميل الاختبار')
    } finally {
      setLoading(false)
    }
  }

  const loadLessons = async () => {
    if (!courseId) return
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`)
      const data = await response.json()
      if (data.success && data.lessons) {
        setLessons(data.lessons)
        
        // البحث عن الدرس التالي
        const lessonId = typeof quiz?.lesson === 'object' ? quiz.lesson._id : quiz?.lesson
        if (lessonId) {
          const currentLessonIndex = data.lessons.findIndex((l: any) => l._id === lessonId)
          if (currentLessonIndex !== -1) {
            if (currentLessonIndex < data.lessons.length - 1) {
              setNextLesson(data.lessons[currentLessonIndex + 1])
              setIsLastLesson(false)
            } else {
              setIsLastLesson(true)
              setNextLesson(null)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }

  const handleAnswerChange = (answer: string | number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index)
  }

  const nextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quiz) return

    // Check if all questions are answered
    const unanswered = answers.filter(a => !a || a === '').length
    if (unanswered > 0 && !showConfirmDialog) {
      setShowConfirmDialog(true)
      return
    }

    setShowConfirmDialog(false)
    setSubmitted(true)

    try {
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)

      const response = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          timeSpent,
          startedAt: startTime,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.attempt)
      } else {
        alert(data.message || 'حدث خطأ أثناء تقديم الاختبار')
        setSubmitted(false)
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('حدث خطأ أثناء تقديم الاختبار')
      setSubmitted(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    )
  }

  if (!quiz) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 pb-20 px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الاختبار غير موجود</h2>
        </div>
      </main>
    )
  }

  // Show results
  if (submitted && result) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Result Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
              <div className="text-center mb-8">
                {result.passed ? (
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-16 h-16 text-red-600" />
                  </div>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {result.passed ? 'تهانينا! 🎉' : 'حاول مرة أخرى'}
                </h1>
                <p className="text-gray-600">
                  {result.passed 
                    ? 'لقد نجحت في الاختبار بنجاح' 
                    : 'للأسف، لم تحقق درجة النجاح'}
                </p>
              </div>

              {/* Score */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-900 mb-1">
                    {result.score}/{result.totalPoints}
                  </div>
                  <div className="text-sm text-blue-700">النقاط</div>
                </div>

                <div className={`bg-gradient-to-br ${
                  result.passed ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'
                } rounded-xl p-6 text-center`}>
                  {result.passed ? (
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  )}
                  <div className={`text-3xl font-bold mb-1 ${
                    result.passed ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.percentage}%
                  </div>
                  <div className={`text-sm ${
                    result.passed ? 'text-green-700' : 'text-red-700'
                  }`}>
                    النسبة المئوية
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-purple-900 mb-1">
                    {quiz.passingScore}%
                  </div>
                  <div className="text-sm text-purple-700">درجة النجاح</div>
                </div>
              </div>

              {/* Questions Review */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">مراجعة الإجابات</h2>
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => {
                    const studentAnswer = result.answers[index]
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          studentAnswer.isCorrect
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-2">{question.question}</p>
                            
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-700">
                                <strong>إجابتك:</strong> {studentAnswer.answer || 'لم تجب'}
                              </p>
                              {!studentAnswer.isCorrect && (
                                <p className="text-green-700">
                                  <strong>الإجابة الصحيحة:</strong> {question.correctAnswer}
                                </p>
                              )}
                              {question.explanation && (
                                <p className="text-blue-700 mt-2">
                                  <strong>التوضيح:</strong> {question.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {studentAnswer.isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 mt-8">
                {/* زر الانتقال للدرس التالي أو إتمام الدورة */}
                {result.passed && (
                  <div className="w-full">
                    {isLastLesson ? (
                      <button
                        onClick={() => router.push(`/courses/${courseId}`)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                      >
                        <Award className="w-6 h-6" />
                        <span>🎉 أكملت الدورة! عرض صفحة الدورة</span>
                      </button>
                    ) : nextLesson ? (
                      <button
                        onClick={() => router.push(`/learn/${courseId}/${nextLesson._id}`)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                      >
                        <ArrowLeft className="w-6 h-6" />
                        <span>الانتقال للدرس التالي: {nextLesson.title}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/courses/${courseId}`)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                      >
                        <ArrowLeft className="w-6 h-6" />
                        <span>العودة للدورة</span>
                      </button>
                    )}
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    العودة للدرس
                  </button>
                  {!result.passed && (
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      إعادة المحاولة
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-gray-600">{quiz.description}</p>
              </div>
              {quiz.timeLimit && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>السؤال {currentQuestion + 1} من {quiz.questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                  {currentQuestion + 1}
                </span>
                <h2 className="text-xl font-bold text-gray-900 flex-1">{question.question}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-4 h-4" />
                <span>{question.points} نقطة</span>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {question.type === 'multiple-choice' && question.options && (
                question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerChange(option)}
                    className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                      answers[currentQuestion] === option
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion] === option
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion] === option && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </button>
                ))
              )}

              {question.type === 'true-false' && (
                <>
                  <button
                    onClick={() => handleAnswerChange('صح')}
                    className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                      answers[currentQuestion] === 'صح'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${
                        answers[currentQuestion] === 'صح' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <span className="text-gray-900 font-semibold">صح</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAnswerChange('خطأ')}
                    className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                      answers[currentQuestion] === 'خطأ'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className={`w-5 h-5 ${
                        answers[currentQuestion] === 'خطأ' ? 'text-red-600' : 'text-gray-400'
                      }`} />
                      <span className="text-gray-900 font-semibold">خطأ</span>
                    </div>
                  </button>
                </>
              )}

              {question.type === 'short-answer' && (
                <input
                  type="text"
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  placeholder="اكتب إجابتك هنا..."
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              <ArrowRight className="w-5 h-5" />
              <span>السابق</span>
            </button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-semibold transition-colors"
              >
                <Send className="w-5 h-5" />
                <span>إنهاء الاختبار</span>
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-md font-semibold transition-colors"
              >
                <span>التالي</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">الأسئلة</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-full aspect-square rounded-lg font-semibold transition-all ${
                    index === currentQuestion
                      ? 'bg-primary-600 text-white'
                      : answers[index] && answers[index] !== ''
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">تأكيد الإرسال</h3>
            </div>
            
            {answers.filter(a => !a || a === '').length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-orange-800 text-sm">
                  <strong>تنبيه:</strong> لديك {answers.filter(a => !a || a === '').length} سؤال لم تجب عليه
                </p>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من إنهاء الاختبار؟ لن تتمكن من تعديل إجاباتك بعد الإرسال.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                تأكيد الإرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
