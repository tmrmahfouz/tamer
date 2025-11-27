'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, FileQuestion, Award, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'

interface MatchingPair {
  left: string
  right: string
}

interface Question {
  _id?: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'ordering'
  options?: string[]
  correctAnswer: string | number | number[]
  matchingPairs?: MatchingPair[]
  orderItems?: string[]
  points: number
  explanation?: string
}

interface Quiz {
  _id: string
  title: string
  description?: string
  questions: Question[]
  passingScore: number
  timeLimit?: number
  maxAttempts?: number
}

interface InlineQuizProps {
  quiz: Quiz
  lessonId: string
  onComplete: (passed: boolean, score: number) => void
  required?: boolean
}

export default function InlineQuiz({ quiz, lessonId, onComplete, required = false }: InlineQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(string | number | number[] | Record<number, number> | null)[]>(
    new Array(quiz.questions.length).fill(null)
  )
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [passed, setPassed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : 0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  
  // للتوصيل والترتيب
  const [shuffledRightItems, setShuffledRightItems] = useState<Record<number, string[]>>({})
  const [shuffledOrderItems, setShuffledOrderItems] = useState<Record<number, string[]>>({})

  // خلط المصفوفة
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // إعداد الأسئلة عند بدء الاختبار
  useEffect(() => {
    if (quizStarted) {
      const rightItems: Record<number, string[]> = {}
      const orderItems: Record<number, string[]> = {}
      
      quiz.questions.forEach((q, idx) => {
        if (q.type === 'matching' && q.matchingPairs) {
          rightItems[idx] = shuffleArray(q.matchingPairs.map(p => p.right))
        } else if (q.type === 'ordering' && q.orderItems) {
          orderItems[idx] = shuffleArray([...q.orderItems])
        }
      })
      
      setShuffledRightItems(rightItems)
      setShuffledOrderItems(orderItems)
      
      // تهيئة الإجابات
      const initialAnswers = quiz.questions.map((q, idx) => {
        if (q.type === 'matching' && q.matchingPairs) {
          return {} as Record<number, number>
        } else if (q.type === 'ordering' && q.orderItems) {
          return orderItems[idx]?.map((_, i) => i) || []
        }
        return null
      })
      setSelectedAnswers(initialAnswers)
    }
  }, [quizStarted])

  // Timer
  useEffect(() => {
    if (!quizStarted || !quiz.timeLimit || showResults) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, showResults])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (answer: number | string) => {
    if (showResults) return
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answer
    setSelectedAnswers(newAnswers)
  }

  // للتوصيل: ربط عنصر من اليسار بعنصر من اليمين
  const handleMatchingSelect = (leftIndex: number, rightIndex: number) => {
    if (showResults) return
    const newAnswers = [...selectedAnswers]
    const currentMatching = (newAnswers[currentQuestion] as Record<number, number>) || {}
    newAnswers[currentQuestion] = { ...currentMatching, [leftIndex]: rightIndex }
    setSelectedAnswers(newAnswers)
  }

  // للترتيب: تحريك عنصر لأعلى أو لأسفل
  const handleOrderMove = (fromIndex: number, direction: 'up' | 'down') => {
    if (showResults) return
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    const currentOrder = (selectedAnswers[currentQuestion] as number[]) || []
    if (toIndex < 0 || toIndex >= currentOrder.length) return
    
    const newOrder = [...currentOrder]
    ;[newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]]
    
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = newOrder
    setSelectedAnswers(newAnswers)
  }

  const handleSubmit = () => {
    let correctCount = 0
    quiz.questions.forEach((q, idx) => {
      const studentAnswer = selectedAnswers[idx]
      let isCorrect = false

      if (q.type === 'short-answer') {
        // مقارنة نصية غير حساسة لحالة الأحرف
        isCorrect = String(studentAnswer).trim().toLowerCase() === 
                   String(q.correctAnswer).trim().toLowerCase()
      } else if (q.type === 'matching' && q.matchingPairs) {
        // التحقق من التوصيل
        const matching = studentAnswer as Record<number, number>
        const shuffledRight = shuffledRightItems[idx] || []
        let allCorrect = true
        
        q.matchingPairs.forEach((pair, leftIdx) => {
          const selectedRightIdx = matching[leftIdx]
          if (selectedRightIdx === undefined || shuffledRight[selectedRightIdx] !== pair.right) {
            allCorrect = false
          }
        })
        isCorrect = allCorrect
      } else if (q.type === 'ordering' && q.orderItems) {
        // التحقق من الترتيب
        const order = studentAnswer as number[]
        const shuffled = shuffledOrderItems[idx] || []
        
        if (order && order.length === q.orderItems.length) {
          isCorrect = order.every((idx, pos) => shuffled[idx] === q.orderItems![pos])
        }
      } else {
        // مقارنة عادية للخيارات المتعددة وصح/خطأ
        isCorrect = String(studentAnswer) === String(q.correctAnswer)
      }

      if (isCorrect) {
        correctCount++
      }
    })

    const scorePercent = Math.round((correctCount / quiz.questions.length) * 100)
    const hasPassed = scorePercent >= quiz.passingScore

    setScore(scorePercent)
    setPassed(hasPassed)
    setShowResults(true)
    onComplete(hasPassed, scorePercent)

    // Save quiz attempt
    saveQuizAttempt(scorePercent, hasPassed)
  }

  const saveQuizAttempt = async (scorePercent: number, hasPassed: boolean) => {
    try {
      // استخدام API الموجود لحفظ محاولة الاختبار
      await fetch(`/api/quizzes/${quiz._id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: selectedAnswers,
          timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60 - timeLeft) : 0,
          startedAt: new Date(),
        }),
      })
    } catch (error) {
      console.error('Error saving quiz attempt:', error)
    }
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelectedAnswers(new Array(quiz.questions.length).fill(null))
    setShowResults(false)
    setScore(0)
    setPassed(false)
    setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : 0)
    setShowExplanation(false)
  }

  const startQuiz = () => {
    setQuizStarted(true)
  }

  // Start Screen
  if (!quizStarted) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
          {quiz.description && (
            <p className="text-gray-600 mb-4">{quiz.description}</p>
          )}
          
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
              <FileQuestion className="w-4 h-4 text-purple-600" />
              <span>{quiz.questions.length} سؤال</span>
            </div>
            {quiz.timeLimit && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>{quiz.timeLimit} دقيقة</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
              <Award className="w-4 h-4 text-purple-600" />
              <span>درجة النجاح: {quiz.passingScore}%</span>
            </div>
          </div>

          {required && (
            <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-lg mb-4 text-sm">
              <strong>⚠️ اختبار إلزامي:</strong> يجب اجتياز هذا الاختبار للانتقال للدرس التالي
            </div>
          )}

          <button
            onClick={startQuiz}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            ابدأ الاختبار
          </button>
        </div>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {passed ? '🎉 مبروك! نجحت في الاختبار' : '❌ للأسف لم تنجح'}
          </h3>
          <p className="text-gray-600 mb-4">
            حصلت على <span className="font-bold text-2xl">{score}%</span> من {quiz.passingScore}% المطلوبة
          </p>
        </div>

        {/* Questions Review */}
        <div className="space-y-4 mb-6">
          <h4 className="font-bold text-gray-900">مراجعة الإجابات:</h4>
          {quiz.questions.map((q, idx) => {
            const studentAnswer = selectedAnswers[idx]
            let isCorrect = false
            
            // حساب صحة الإجابة
            if (q.type === 'short-answer') {
              isCorrect = String(studentAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
            } else if (q.type === 'matching' && q.matchingPairs) {
              const matching = studentAnswer as Record<number, number>
              const shuffledRight = shuffledRightItems[idx] || []
              let allCorrect = true
              q.matchingPairs.forEach((pair, leftIdx) => {
                const selectedRightIdx = matching?.[leftIdx]
                if (selectedRightIdx === undefined || shuffledRight[selectedRightIdx] !== pair.right) {
                  allCorrect = false
                }
              })
              isCorrect = allCorrect
            } else if (q.type === 'ordering' && q.orderItems) {
              const order = studentAnswer as number[]
              const shuffled = shuffledOrderItems[idx] || []
              if (order && order.length === q.orderItems.length) {
                isCorrect = order.every((i, pos) => shuffled[i] === q.orderItems![pos])
              }
            } else {
              isCorrect = String(studentAnswer) === String(q.correctAnswer)
            }
            
            return (
              <div key={q._id || idx} className={`p-4 rounded-lg border-2 ${
                isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{idx + 1}. {q.question}</p>
                    
                    {/* عرض نتائج أسئلة الاختيار والإجابة القصيرة */}
                    {(q.type === 'multiple-choice' || q.type === 'true-false' || q.type === 'short-answer') && (
                      <>
                        <p className="text-sm">
                          <span className="text-gray-600">إجابتك: </span>
                          <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                            {studentAnswer !== null 
                              ? (q.type === 'short-answer' 
                                  ? String(studentAnswer)
                                  : q.options?.[Number(studentAnswer)] || String(studentAnswer))
                              : 'لم تجب'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-700">
                            الإجابة الصحيحة: {q.type === 'short-answer' 
                              ? String(q.correctAnswer)
                              : q.options?.[Number(q.correctAnswer)] || String(q.correctAnswer)}
                          </p>
                        )}
                      </>
                    )}
                    
                    {/* عرض نتائج التوصيل */}
                    {q.type === 'matching' && q.matchingPairs && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 mb-2">التوصيل الصحيح:</p>
                        {q.matchingPairs.map((pair, pairIdx) => (
                          <p key={pairIdx} className="text-sm">
                            <span className="text-blue-700">{pair.left}</span>
                            <span className="mx-2">←</span>
                            <span className="text-green-700">{pair.right}</span>
                          </p>
                        ))}
                      </div>
                    )}
                    
                    {/* عرض نتائج الترتيب */}
                    {q.type === 'ordering' && q.orderItems && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">الترتيب الصحيح:</p>
                        <ol className="text-sm list-decimal list-inside">
                          {q.orderItems.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-purple-700">{item}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    
                    {q.explanation && (
                      <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!passed && (
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            إعادة الاختبار
          </button>
        )}
      </div>
    )
  }

  // Quiz Screen
  const question = quiz.questions[currentQuestion]
  const answeredCount = selectedAnswers.filter((a, idx) => {
    if (a === null) return false
    const q = quiz.questions[idx]
    if (q.type === 'matching' && q.matchingPairs) {
      const matching = a as Record<number, number>
      return Object.keys(matching).length === q.matchingPairs.length
    }
    if (q.type === 'ordering') {
      return Array.isArray(a) && a.length > 0
    }
    return a !== null && a !== ''
  }).length

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileQuestion className="w-5 h-5 text-purple-600" />
          <span className="font-bold text-gray-900">{quiz.title}</span>
        </div>
        {quiz.timeLimit && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>السؤال {currentQuestion + 1} من {quiz.questions.length}</span>
          <span>تم الإجابة على {answeredCount} سؤال</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          {currentQuestion + 1}. {question.question}
        </h4>
        
        {/* Multiple Choice or True/False */}
        {(question.type === 'multiple-choice' || question.type === 'true-false') && question.options && (
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion] === idx
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedAnswers[currentQuestion] === idx
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === idx && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Short Answer */}
        {question.type === 'short-answer' && (
          <div className="mt-4">
            <input
              type="text"
              value={String(selectedAnswers[currentQuestion] || '')}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              placeholder="اكتب إجابتك هنا..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none text-right"
              dir="rtl"
            />
          </div>
        )}

        {/* Matching - التوصيل */}
        {question.type === 'matching' && question.matchingPairs && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">قم بتوصيل كل عنصر من العمود الأول بما يناسبه من العمود الثاني</p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* العمود الأيسر */}
              <div className="space-y-3">
                <div className="text-center text-sm font-semibold text-blue-700 bg-blue-50 py-2 rounded-lg">العمود الأول</div>
                {question.matchingPairs.map((pair, leftIdx) => {
                  const currentMatching = (selectedAnswers[currentQuestion] as Record<number, number>) || {}
                  const selectedRight = currentMatching[leftIdx]
                  
                  return (
                    <div key={leftIdx} className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900">{pair.left}</span>
                        <select
                          value={selectedRight ?? ''}
                          onChange={(e) => handleMatchingSelect(leftIdx, parseInt(e.target.value))}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:border-purple-600 focus:outline-none"
                        >
                          <option value="">اختر...</option>
                          {shuffledRightItems[currentQuestion]?.map((item, rightIdx) => (
                            <option key={rightIdx} value={rightIdx}>{item}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* العمود الأيمن */}
              <div className="space-y-3">
                <div className="text-center text-sm font-semibold text-green-700 bg-green-50 py-2 rounded-lg">العمود الثاني</div>
                {shuffledRightItems[currentQuestion]?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <span className="font-medium text-gray-900">{idx + 1}. {item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ordering - الترتيب */}
        {question.type === 'ordering' && question.orderItems && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">قم بترتيب العناصر التالية بالترتيب الصحيح باستخدام الأسهم</p>
            <div className="space-y-2">
              {(selectedAnswers[currentQuestion] as number[] || []).map((itemIdx, pos) => {
                const shuffled = shuffledOrderItems[currentQuestion] || []
                const itemText = shuffled[itemIdx]
                
                return (
                  <div key={pos} className="flex items-center gap-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleOrderMove(pos, 'up')}
                        disabled={pos === 0}
                        className="p-1 text-purple-600 hover:bg-purple-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOrderMove(pos, 'down')}
                        disabled={pos === (selectedAnswers[currentQuestion] as number[])?.length - 1}
                        className="p-1 text-purple-600 hover:bg-purple-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
                      {pos + 1}
                    </div>
                    <span className="font-medium text-gray-900 flex-1">{itemText}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
          السابق
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < quiz.questions.length}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            إنهاء الاختبار
            <CheckCircle className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            التالي
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-gray-600 mb-3">انتقل إلى سؤال:</p>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                currentQuestion === idx
                  ? 'bg-purple-600 text-white'
                  : selectedAnswers[idx] !== null
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
