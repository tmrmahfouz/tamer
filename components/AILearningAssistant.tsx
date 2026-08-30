'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader, Brain, Lightbulb, X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  courseId?: string
  lessonId?: string
  lessonTitle?: string
  courseTitle?: string
  onClose?: () => void
}

export default function AILearningAssistant({
  courseId,
  lessonId,
  lessonTitle,
  courseTitle,
  onClose
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // رسالة ترحيب عند البدء
  useEffect(() => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: `مرحباً! 👋 أنا مساعدك الذكي في التعلم.${
          lessonTitle ? ` أنت الآن في درس "${lessonTitle}"` : ''
        }

أنا هنا لمساعدتك في:
• 💡 شرح المفاهيم البرمجية
• 💻 حل المسائل والتمارين
• 🔧 تصحيح الأخطاء
• 📝 إعطاء أمثلة عملية

اسألني أي سؤال! 🚀`,
        timestamp: new Date()
      }
    ])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          courseId,
          lessonId
        })
      })

      if (!response.ok) {
        throw new Error('فشل الحصول على الرد من المساعد الذكي')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما')
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `عذراً، حدث خطأ في الاتصال. الرجاء المحاولة لاحقاً.\n\nالخطأ: ${err instanceof Error ? err.message : 'غير معروف'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 text-white p-4 rounded-t-xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">مساعدك الذكي</h3>
              <p className="text-sm text-blue-100">متخصص في البرمجة والتكنولوجيا</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Lesson Context */}
      {(lessonTitle || courseTitle) && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 px-4 py-2 text-sm text-blue-800 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span>
              {courseTitle && `📖 ${courseTitle}`}
              {courseTitle && lessonTitle && ' • '}
              {lessonTitle && `📝 ${lessonTitle}`}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg whitespace-pre-wrap break-words ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span>يفكر المساعد...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mx-4 mb-2 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-b-xl"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="اسأل سؤالك هنا..."
            disabled={loading}
            className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white p-2 rounded-lg transition flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          💡 اسأل عن المفاهيم أو اطلب شرح مع أمثلة
        </p>
      </form>
    </div>
  )
}
