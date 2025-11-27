'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, ThumbsUp, ThumbsDown, Check, Plus, Filter, Search } from 'lucide-react'

interface QASectionProps {
  courseId: string
  lessonId?: string
}

export default function QASection({ courseId, lessonId }: QASectionProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAskForm, setShowAskForm] = useState(false)
  const [sort, setSort] = useState('recent')
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' })
  const [newAnswer, setNewAnswer] = useState('')

  useEffect(() => {
    loadQuestions()
  }, [courseId, lessonId, sort])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      let url = `/api/questions?courseId=${courseId}&sort=${sort}`
      if (lessonId) url += `&lessonId=${lessonId}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuestionDetails = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`)
      const data = await response.json()

      if (data.success) {
        setSelectedQuestion(data.question)
        setAnswers(data.answers)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const askQuestion = async () => {
    if (!newQuestion.title || !newQuestion.content) return

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId,
          ...newQuestion,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewQuestion({ title: '', content: '' })
        setShowAskForm(false)
        loadQuestions()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('حدث خطأ')
    }
  }

  const submitAnswer = async () => {
    if (!newAnswer.trim() || !selectedQuestion) return

    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: selectedQuestion._id,
          content: newAnswer,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewAnswer('')
        loadQuestionDetails(selectedQuestion._id)
      }
    } catch (error) {
      alert('حدث خطأ')
    }
  }

  const voteQuestion = async (questionId: string, vote: 'up' | 'down') => {
    try {
      await fetch(`/api/questions/${questionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      })
      loadQuestions()
      if (selectedQuestion?._id === questionId) {
        loadQuestionDetails(questionId)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const voteAnswer = async (answerId: string, vote: 'up' | 'down') => {
    try {
      await fetch(`/api/answers/${answerId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      })
      if (selectedQuestion) {
        loadQuestionDetails(selectedQuestion._id)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const acceptAnswer = async (answerId: string) => {
    try {
      await fetch(`/api/answers/${answerId}`, {
        method: 'PATCH',
      })
      if (selectedQuestion) {
        loadQuestionDetails(selectedQuestion._id)
      }
      loadQuestions()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const markSolved = async (questionId: string) => {
    try {
      await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
      })
      loadQuestions()
      if (selectedQuestion?._id === questionId) {
        loadQuestionDetails(questionId)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            الأسئلة والأجوبة
          </h3>
          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold">
            {questions.length}
          </span>
        </div>
        <button
          onClick={() => setShowAskForm(!showAskForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>اطرح سؤال</span>
        </button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <input
            type="text"
            value={newQuestion.title}
            onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
            placeholder="عنوان السؤال (10 أحرف على الأقل)"
            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-800 dark:text-gray-100 mb-3"
          />
          <textarea
            value={newQuestion.content}
            onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
            placeholder="تفاصيل السؤال (20 حرف على الأقل)"
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-800 dark:text-gray-100 resize-none mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={askQuestion}
              disabled={!newQuestion.title || !newQuestion.content}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              نشر السؤال
            </button>
            <button
              onClick={() => setShowAskForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Sort Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSort('recent')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            sort === 'recent'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          الأحدث
        </button>
        <button
          onClick={() => setSort('popular')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            sort === 'popular'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          الأكثر تصويتاً
        </button>
        <button
          onClick={() => setSort('unsolved')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            sort === 'unsolved'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          غير محلولة
        </button>
      </div>

      {/* Questions List or Question Details */}
      {loading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : selectedQuestion ? (
        <div>
          {/* Question Details */}
          <button
            onClick={() => setSelectedQuestion(null)}
            className="text-primary-600 dark:text-primary-400 hover:underline mb-4"
          >
            ← العودة للأسئلة
          </button>
          
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => voteQuestion(selectedQuestion._id, 'up')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <span className="font-bold">{selectedQuestion.upvotes - selectedQuestion.downvotes}</span>
                <button
                  onClick={() => voteQuestion(selectedQuestion._id, 'down')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {selectedQuestion.title}
                  </h4>
                  {selectedQuestion.solved && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      محلول
                    </span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                  {selectedQuestion.content}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{selectedQuestion.user?.name}</span>
                  <span>•</span>
                  <span>{new Date(selectedQuestion.createdAt).toLocaleDateString('ar-EG')}</span>
                  <span>•</span>
                  <span>{answers.length} إجابة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-4 mb-6">
            <h4 className="font-bold text-gray-900 dark:text-gray-100">
              الإجابات ({answers.length})
            </h4>
            {answers.map((answer) => (
              <div
                key={answer._id}
                className={`p-4 rounded-lg ${
                  answer.isAccepted
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => voteAnswer(answer._id, 'up')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm">{answer.upvotes - answer.downvotes}</span>
                    <button
                      onClick={() => voteAnswer(answer._id, 'down')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    {answer.isAccepted && (
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                          إجابة مقبولة
                        </span>
                      </div>
                    )}
                    <p className="text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                      {answer.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>{answer.user?.name}</span>
                        <span>•</span>
                        <span>{new Date(answer.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      {!answer.isAccepted && (
                        <button
                          onClick={() => acceptAnswer(answer._id)}
                          className="text-sm text-green-600 dark:text-green-400 hover:underline"
                        >
                          قبول الإجابة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Answer */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
              إجابتك
            </h4>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="اكتب إجابتك هنا (10 أحرف على الأقل)"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-900 dark:text-gray-100 resize-none mb-3"
            />
            <button
              onClick={submitAnswer}
              disabled={!newAnswer.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              نشر الإجابة
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد أسئلة بعد. كن أول من يطرح سؤالاً!</p>
            </div>
          ) : (
            questions.map((question) => (
              <div
                key={question._id}
                onClick={() => loadQuestionDetails(question._id)}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 text-sm">
                    <span className="font-bold">{question.upvotes - question.downvotes}</span>
                    <ThumbsUp className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        {question.title}
                      </h4>
                      {question.solved && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          محلول
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                      {question.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{question.user?.name}</span>
                      <span>•</span>
                      <span>{question.answers?.length || 0} إجابة</span>
                      <span>•</span>
                      <span>{new Date(question.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
