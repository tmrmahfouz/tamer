'use client'

import { useState, useEffect } from 'react'
import InstructorLayout from '@/components/InstructorLayout'
import {
  MessageCircle,
  Users,
  Search,
  Trash2,
  Eye,
  RefreshCw,
  ExternalLink,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react'

interface Conversation {
  _id: string
  type: 'direct' | 'group'
  title?: string
  participants: Array<{
    _id: string
    name: string
    email: string
    role: string
  }>
  lastMessage?: {
    content: string
    createdAt: string
  }
  lastMessageAt: string
  createdAt: string
  messagesCount?: number
}

export default function InstructorChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group'>('all')
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [stats, setStats] = useState({ total: 0, direct: 0, groups: 0, totalMessages: 0 })


  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/conversations')
      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (convId: string) => {
    setLoadingMessages(true)
    try {
      const response = await fetch(`/api/admin/conversations/${convId}/messages`)
      const data = await response.json()
      if (data.success) setMessages(data.messages)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const deleteConversation = async (convId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟')) return
    try {
      const response = await fetch(`/api/admin/conversations/${convId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setConversations(conversations.filter(c => c._id !== convId))
        if (selectedConv?._id === convId) {
          setSelectedConv(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants.some(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesType = filterType === 'all' || conv.type === filterType
    return matchesSearch && matchesType
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const getConversationTitle = (conv: Conversation) => {
    if (conv.type === 'group') return conv.title || 'مجموعة بدون اسم'
    return conv.participants.map(p => p.name).join(' و ')
  }

  return (
    <InstructorLayout title="إدارة الدردشة">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المحادثات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">محادثات مباشرة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.direct}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">المجموعات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.groups}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الرسائل</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث في المحادثات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">جميع المحادثات</option>
                <option value="direct">محادثات مباشرة</option>
                <option value="group">مجموعات</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={loadConversations} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <RefreshCw className="w-4 h-4" />
                تحديث
              </button>
              <a href="/chat" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <ExternalLink className="w-4 h-4" />
                فتح صفحة الدردشة
              </a>
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">المحادثات ({filteredConversations.length})</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-600">جاري التحميل...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد محادثات</p>
              </div>
            ) : (
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedConv?._id === conv._id ? 'bg-green-50' : ''}`}
                    onClick={() => { setSelectedConv(conv); loadMessages(conv._id) }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        conv.type === 'group' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}>
                        {conv.type === 'group' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{getConversationTitle(conv)}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${conv.type === 'group' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {conv.type === 'group' ? 'مجموعة' : 'مباشر'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">{conv.lastMessage?.content || 'لا توجد رسائل'}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{conv.participants.length} مشاركين</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(conv.lastMessageAt || conv.createdAt)}</span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv._id) }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation Details */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">تفاصيل المحادثة</h3>
            </div>

            {selectedConv ? (
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">المشاركون</h4>
                  <div className="space-y-2">
                    {selectedConv.participants.map((p) => (
                      <div key={p._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-medium text-sm">{p.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate">{p.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          p.role === 'admin' ? 'bg-red-100 text-red-700' : p.role === 'instructor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {p.role === 'admin' ? 'مدير' : p.role === 'instructor' ? 'مدرس' : 'طالب'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">آخر الرسائل</h4>
                  {loadingMessages ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">لا توجد رسائل</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {messages.slice(-10).map((msg) => (
                        <div key={msg._id} className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">{msg.sender?.name || 'مستخدم محذوف'}</span>
                            <span className="text-xs text-gray-500">{formatDate(msg.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-600 break-words">{msg.type === 'text' ? msg.content : `[${msg.type}]`}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>اختر محادثة لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </InstructorLayout>
  )
}
