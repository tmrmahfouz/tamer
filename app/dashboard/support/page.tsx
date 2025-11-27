'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Paperclip,
  User,
} from 'lucide-react'

interface Ticket {
  _id: string
  subject: string
  category: string
  priority: string
  status: string
  messages: any[]
  user: any
  createdAt: string
  updatedAt: string
}

export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  })

  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    message: '',
  })

  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    checkAuth()
    loadTickets()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.success) {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const loadTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/support/tickets')
      const data = await response.json()

      if (data.success) {
        setTickets(data.tickets)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicketData),
      })

      const data = await response.json()

      if (data.success) {
        alert('تم إنشاء التذكرة بنجاح')
        setShowNewTicket(false)
        setNewTicketData({
          subject: '',
          category: 'technical',
          priority: 'medium',
          message: '',
        })
        loadTickets()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('حدث خطأ')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTicket || !newMessage.trim()) return

    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      })

      const data = await response.json()

      if (data.success) {
        setSelectedTicket(data.ticket)
        setNewMessage('')
        loadTickets()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('حدث خطأ')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      open: { color: 'blue', icon: Clock, text: 'مفتوحة' },
      in_progress: { color: 'yellow', icon: AlertCircle, text: 'قيد المعالجة' },
      resolved: { color: 'green', icon: CheckCircle, text: 'محلولة' },
      closed: { color: 'gray', icon: XCircle, text: 'مغلقة' },
    }

    const badge = badges[status] || badges.open
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 bg-${badge.color}-100 text-${badge.color}-800 rounded-full text-sm font-medium`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    )
  }

  const getCategoryText = (category: string) => {
    const categories: any = {
      technical: 'مشكلة تقنية',
      payment: 'الدفع',
      course: 'الدورة',
      account: 'الحساب',
      other: 'أخرى',
    }
    return categories[category] || category
  }

  const getPriorityBadge = (priority: string) => {
    const colors: any = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      urgent: 'red',
    }
    return (
      <span className={`px-2 py-1 bg-${colors[priority]}-100 text-${colors[priority]}-800 rounded text-xs font-medium`}>
        {priority === 'low' && 'منخفضة'}
        {priority === 'medium' && 'متوسطة'}
        {priority === 'high' && 'عالية'}
        {priority === 'urgent' && 'عاجلة'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الدعم الفني</h1>
        <p className="text-gray-600">تواصل معنا للحصول على المساعدة</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">إجمالي التذاكر</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.open}</div>
          <div className="text-sm text-gray-600">مفتوحة</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">قيد المعالجة</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.resolved}</div>
          <div className="text-sm text-gray-600">محلولة</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-gray-600 mb-1">{stats.closed}</div>
          <div className="text-sm text-gray-600">مغلقة</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>تذكرة جديدة</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tickets */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">تذاكري</h2>
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => setSelectedTicket(ticket)}
              className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
                selectedTicket?._id === ticket._id ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-lg">{ticket.subject}</h3>
                {getStatusBadge(ticket.status)}
              </div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm text-gray-600">{getCategoryText(ticket.category)}</span>
                {getPriorityBadge(ticket.priority)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare className="w-4 h-4" />
                <span>{ticket.messages.length} رسالة</span>
                <span>•</span>
                <span>{new Date(ticket.updatedAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          ))}

          {tickets.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد تذاكر</p>
            </div>
          )}
        </div>

        {/* Ticket Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {selectedTicket ? (
            <div className="h-full flex flex-col">
              <div className="mb-4 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {selectedTicket.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      msg.senderRole === 'admin' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className={`flex-1 ${msg.senderRole === 'admin' ? 'text-left' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {msg.sender?.name || 'مستخدم'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleString('ar-EG')}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          msg.senderRole === 'admin'
                            ? 'bg-primary-100 text-gray-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {selectedTicket.status !== 'closed' && (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>اختر تذكرة لعرض التفاصيل</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">تذكرة دعم جديدة</h2>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  الموضوع *
                </label>
                <input
                  type="text"
                  value={newTicketData.subject}
                  onChange={(e) => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  placeholder="اكتب موضوع المشكلة"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    الفئة *
                  </label>
                  <select
                    value={newTicketData.category}
                    onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    required
                  >
                    <option value="technical">مشكلة تقنية</option>
                    <option value="payment">الدفع</option>
                    <option value="course">الدورة</option>
                    <option value="account">الحساب</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    الأولوية
                  </label>
                  <select
                    value={newTicketData.priority}
                    onChange={(e) => setNewTicketData({ ...newTicketData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجلة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  الرسالة *
                </label>
                <textarea
                  value={newTicketData.message}
                  onChange={(e) => setNewTicketData({ ...newTicketData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 h-32"
                  placeholder="اشرح المشكلة بالتفصيل..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                >
                  إرسال
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
