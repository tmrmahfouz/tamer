'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  MessageCircle,
  Send,
  Search,
  Plus,
  MoreVertical,
  ArrowLeft,
  User as UserIcon,
  Users,
  X,
  CheckCircle,
  Image as ImageIcon,
  Paperclip,
  Mic,
  Smile,
  File,
  Download,
  Monitor,
  MonitorStop,
  Video,
  VideoOff,
  MicOff,
} from 'lucide-react'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [groupTitle, setGroupTitle] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [showLiveStreamModal, setShowLiveStreamModal] = useState(false)
  const [liveStreamUrl, setLiveStreamUrl] = useState('')
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  // Scroll function (disabled by user request)
  const scrollToBottomOnSend = () => {
    // Disabled - user finds auto-scroll annoying
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-refresh messages every 5 seconds (without auto-scroll)
  useEffect(() => {
    if (!selectedConv) return

    const interval = setInterval(() => {
      loadMessages(selectedConv._id)
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [selectedConv])

  // Auto-refresh conversations every 10 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      loadConversations(true) // Keep selected conversation
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [user, selectedConv])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const loadConversations = async (keepSelected = false) => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()

      if (data.success) {
        setConversations(data.conversations)
        
        // Auto-select the first conversation if exists and no conversation is selected
        if (data.conversations.length > 0 && !selectedConv && !keepSelected) {
          const firstConv = data.conversations[0]
          setSelectedConv(firstConv)
          loadMessages(firstConv._id, true) // Scroll on first open
        }
        
        // Update selected conversation data if it exists
        if (selectedConv && keepSelected) {
          const updatedConv = data.conversations.find((c: any) => c._id === selectedConv._id)
          if (updatedConv) {
            setSelectedConv(updatedConv)
          }
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (convId: string, scrollToBottom = false) => {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`)
      const data = await response.json()

      if (data.success) {
        setMessages(data.messages)
        // Only scroll when opening conversation for first time
        if (scrollToBottom) {
          setTimeout(() => scrollToBottomOnSend(), 100)
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    // Create preview for images
    if (type === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview('')
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (!data.success) {
      throw new Error('فشل رفع الملف')
    }

    return data.url
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Try to get supported mime type
      let mimeType = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      }
      
      const recorder = new MediaRecorder(stream, { mimeType })
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = async () => {
        console.log('Recording stopped, chunks:', chunks.length)
        const audioBlob = new Blob(chunks, { type: mimeType })
        console.log('Audio blob created, size:', audioBlob.size, 'type:', mimeType)
        
        const extension = mimeType.includes('webm') ? 'webm' : mimeType.includes('ogg') ? 'ogg' : 'mp4'
        const fileName = `voice-message.${extension}`
        
        // Create FormData directly
        const formData = new FormData()
        formData.append('file', audioBlob, fileName)
        
        try {
          setSending(true)
          console.log('Uploading audio file...')
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          const uploadData = await uploadResponse.json()
          console.log('Upload response:', uploadData)
          
          if (uploadData.success) {
            console.log('Sending message with file...')
            await sendMessageWithFile(uploadData.url, fileName, audioBlob.size, 'audio', true)
            console.log('Message sent successfully')
            setSending(false)
          } else {
            console.error('Upload failed:', uploadData)
            alert('حدث خطأ أثناء رفع التسجيل الصوتي: ' + (uploadData.message || 'خطأ غير معروف'))
            setSending(false)
          }
        } catch (error) {
          console.error('Error uploading audio:', error)
          alert('حدث خطأ أثناء رفع التسجيل الصوتي')
          setSending(false)
        }

        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('لا يمكن الوصول للميكروفون')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const sendMessageWithFile = async (fileUrl: string, fileName: string, fileSize: number, type: 'image' | 'file' | 'audio', skipSendingState = false) => {
    if (!selectedConv) return

    if (!skipSendingState) {
      setSending(true)
    }
    
    try {
      const response = await fetch(`/api/conversations/${selectedConv._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fileName,
          type,
          fileUrl,
          fileName,
          fileSize,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages([...messages, data.data])
        setSelectedFile(null)
        setFilePreview('')
        loadConversations()
        scrollToBottomOnSend()
      } else {
        console.error('Send message failed:', data)
        alert('حدث خطأ أثناء إرسال الرسالة: ' + (data.message || 'خطأ غير معروف'))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('حدث خطأ أثناء إرسال الرسالة')
    } finally {
      if (!skipSendingState) {
        setSending(false)
      }
    }
  }

  const sendMessage = async () => {
    if (!selectedConv) return

    // Send file if selected
    if (selectedFile) {
      setSending(true)
      try {
        const fileUrl = await uploadFile(selectedFile)
        const type = selectedFile.type.startsWith('image/') ? 'image' : 'file'
        await sendMessageWithFile(fileUrl, selectedFile.name, selectedFile.size, type)
      } catch (error) {
        console.error('Error uploading file:', error)
        alert('حدث خطأ أثناء رفع الملف')
      } finally {
        setSending(false)
      }
      return
    }

    // Send text message
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const response = await fetch(`/api/conversations/${selectedConv._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          type: 'text',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages([...messages, data.data])
        setNewMessage('')
        loadConversations()
        scrollToBottomOnSend()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('حدث خطأ أثناء إرسال الرسالة')
    } finally {
      setSending(false)
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage(newMessage + emoji)
    setShowEmojiPicker(false)
  }

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👏', '😍', '🤔', '😎', '🚀', '💪', '🎯']

  // Start live stream
  const startLiveStream = async () => {
    if (!liveStreamUrl.trim()) {
      alert('⚠️ الرجاء إدخال رابط البث المباشر')
      return
    }

    try {
      // Validate URL
      new URL(liveStreamUrl)

      // Send live stream notification
      const message = `🎥 ${user?.name} بدأ بث مباشر\n\n📺 انضم الآن:\n${liveStreamUrl}`

      await fetch(`/api/conversations/${selectedConv._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          type: 'text',
        }),
      })

      setIsLiveStreamActive(true)
      setShowLiveStreamModal(false)
      setLiveStreamUrl('')
      loadMessages(selectedConv._id)
      
      alert('✅ تم إرسال رابط البث للطلاب!')
    } catch (error) {
      alert('⚠️ الرجاء إدخال رابط صحيح')
    }
  }

  // End live stream
  const endLiveStream = async () => {
    try {
      const message = `⏹️ ${user?.name} أنهى البث المباشر`

      await fetch(`/api/conversations/${selectedConv._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          type: 'text',
        }),
      })

      setIsLiveStreamActive(false)
      loadMessages(selectedConv._id)
    } catch (error) {
      console.error('Error ending live stream:', error)
    }
  }

  // Quick start with Google Meet
  const quickStartGoogleMeet = () => {
    const meetUrl = 'https://meet.google.com/new'
    window.open(meetUrl, '_blank')
    alert('📝 بعد إنشاء الاجتماع، انسخ الرابط والصقه في الحقل أدناه')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date: string) => {
    const messageDate = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === today.toDateString()) {
      return 'اليوم'
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'أمس'
    } else {
      return messageDate.toLocaleDateString('ar-EG')
    }
  }

  const getOtherParticipant = (conv: any) => {
    return conv.participants.find((p: any) => p._id !== user?._id)
  }

  const getConversationTitle = (conv: any) => {
    if (conv.type === 'group') {
      return conv.title
    }
    const otherUser = getOtherParticipant(conv)
    return otherUser?.name || 'مستخدم'
  }

  const getConversationIcon = (conv: any) => {
    if (conv.type === 'group') {
      return (
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
          <Users className="w-6 h-6" />
        </div>
      )
    }
    const otherUser = getOtherParticipant(conv)
    return (
      <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
        {otherUser?.name?.charAt(0)}
      </div>
    )
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      if (data.success) {
        // Filter out current user
        setUsers(data.users.filter((u: any) => u._id !== user?._id))
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const createConversation = async (userId: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: [userId],
          type: 'direct',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowNewChatModal(false)
        
        // If conversation already exists, just select it
        if (data.isExisting) {
          const existingConv = conversations.find(c => c._id === data.conversation._id)
          if (existingConv) {
            setSelectedConv(existingConv)
            loadMessages(existingConv._id, true) // Scroll on open
          } else {
            await loadConversations()
            setSelectedConv(data.conversation)
            loadMessages(data.conversation._id, true) // Scroll on open
          }
        } else {
          // New conversation created
          await loadConversations()
          setSelectedConv(data.conversation)
          loadMessages(data.conversation._id, true) // Scroll on open
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert('حدث خطأ أثناء إنشاء المحادثة')
    }
  }

  const createGroup = async () => {
    if (!groupTitle.trim()) {
      alert('الرجاء إدخال اسم المجموعة')
      return
    }

    if (selectedUsers.length === 0) {
      alert('الرجاء اختيار أعضاء للمجموعة')
      return
    }

    try {
      const response = await fetch('/api/conversations/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: groupTitle,
          participantIds: selectedUsers,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowNewGroupModal(false)
        setGroupTitle('')
        setSelectedUsers([])
        setSearchQuery('')
        await loadConversations()
        setSelectedConv(data.conversation)
        loadMessages(data.conversation._id, true) // Scroll on open
      } else {
        alert(data.message || 'حدث خطأ أثناء إنشاء المجموعة')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      alert('حدث خطأ أثناء إنشاء المجموعة')
    }
  }

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 h-screen flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className={`w-full md:w-1/3 bg-white border-l ${selectedConv ? 'hidden md:block' : 'block'}`}>
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">المحادثات</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNewGroupModal(true)
                      loadUsers()
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="إنشاء مجموعة"
                  >
                    <Users className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={() => {
                      setShowNewChatModal(true)
                      loadUsers()
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="محادثة جديدة"
                  >
                    <Plus className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث..."
                  className="w-full pr-10 pl-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="overflow-y-auto" style={{ height: 'calc(100vh - 220px)' }}>
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد محادثات بعد</p>
                  <p className="text-sm">ابدأ محادثة جديدة</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  return (
                    <div
                      key={conv._id}
                      onClick={() => {
                        setSelectedConv(conv)
                        loadMessages(conv._id, true) // Scroll when clicking on conversation
                      }}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConv?._id === conv._id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getConversationIcon(conv)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {getConversationTitle(conv)}
                              {conv.type === 'group' && (
                                <span className="text-xs text-gray-500 mr-2">
                                  ({conv.participants.length} أعضاء)
                                </span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conv.lastMessageAt && formatTime(conv.lastMessageAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conv.lastMessage?.content || 'ابدأ المحادثة'}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Messages */}
          <div className={`flex-1 flex flex-col bg-gray-50 ${selectedConv ? 'block' : 'hidden md:flex'}`}>
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="bg-white p-4 border-b flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {selectedConv.type === 'group' ? (
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {getOtherParticipant(selectedConv)?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {getConversationTitle(selectedConv)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConv.type === 'group' ? (
                        `${selectedConv.participants.length} أعضاء`
                      ) : (
                        <>
                          {getOtherParticipant(selectedConv)?.role === 'admin' && 'مدير'}
                          {getOtherParticipant(selectedConv)?.role === 'instructor' && 'مدرس'}
                          {getOtherParticipant(selectedConv)?.role === 'student' && 'طالب'}
                        </>
                      )}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 280px)' }}>
                  {messages.map((msg, index) => {
                    const isOwn = msg.sender._id === user?._id
                    const showDate =
                      index === 0 ||
                      formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt)

                    return (
                      <div key={msg._id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            {!isOwn && (
                              <p className="text-xs text-gray-600 mb-1 px-2">{msg.sender.name}</p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? 'bg-primary-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 rounded-bl-none'
                              }`}
                            >
                              {/* Image Message */}
                              {msg.type === 'image' && msg.fileUrl && (
                                <div className="mb-2">
                                  <img
                                    src={msg.fileUrl}
                                    alt={msg.fileName}
                                    className="max-w-xs rounded-lg cursor-pointer"
                                    onClick={() => window.open(msg.fileUrl, '_blank')}
                                  />
                                </div>
                              )}

                              {/* File Message */}
                              {msg.type === 'file' && msg.fileUrl && (
                                <a
                                  href={msg.fileUrl}
                                  download={msg.fileName}
                                  className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors mb-2"
                                >
                                  <File className="w-5 h-5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">{msg.fileName}</p>
                                    <p className="text-xs text-gray-500">
                                      {msg.fileSize && (msg.fileSize / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                  <Download className="w-4 h-4" />
                                </a>
                              )}

                              {/* Audio Message */}
                              {msg.type === 'audio' && msg.fileUrl && (
                                <div className="mb-2">
                                  <audio controls className="max-w-xs">
                                    <source src={msg.fileUrl} />
                                    متصفحك لا يدعم تشغيل الصوت
                                  </audio>
                                </div>
                              )}

                              {/* Text Content */}
                              {msg.type === 'text' && (
                                <>
                                  {/* Live Stream Link Detection */}
                                  {msg.content.includes('بدأ بث مباشر') && msg.content.includes('http') ? (
                                    <div className="space-y-3">
                                      <p className="font-semibold text-lg">🎥 بث مباشر نشط</p>
                                      <p className="text-sm">{msg.sender.name} بدأ بث مباشر</p>
                                      <a
                                        href={msg.content.split('\n').find((line: string) => line.includes('http'))}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-center transition-colors"
                                      >
                                        📺 انضم للبث المباشر
                                      </a>
                                    </div>
                                  ) : (
                                    <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                                  )}
                                </>
                              )}

                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? 'text-primary-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>


                {/* Input */}
                <div className="bg-white p-4 border-t">
                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <p className="text-red-700 font-semibold">جاري التسجيل... اضغط على الميكروفون للإيقاف</p>
                    </div>
                  )}

                  {/* File Preview */}
                  {(selectedFile || filePreview) && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <File className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{selectedFile?.name}</p>
                        <p className="text-xs text-gray-500">
                          {selectedFile && (selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null)
                          setFilePreview('')
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="mb-3 p-3 bg-white border rounded-lg shadow-lg">
                      <div className="grid grid-cols-8 gap-2">
                        {commonEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => addEmoji(emoji)}
                            className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    {/* Hidden file inputs */}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'image')}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => handleFileSelect(e, 'file')}
                      className="hidden"
                    />

                    {/* Attachment buttons */}
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="إرسال صورة"
                    >
                      <ImageIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="إرسال ملف"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="إيموجي"
                    >
                      <Smile className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={sending}
                      className={`p-2 rounded-lg transition-colors ${
                        isRecording ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                      } ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={isRecording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
                    >
                      {sending && !isRecording ? (
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : 'text-gray-600'}`} />
                      )}
                    </button>
                    {/* Live Stream Button - Only for Admin and Instructors */}
                    {(user?.role === 'admin' || user?.role === 'instructor') && (
                      <button
                        onClick={() => isLiveStreamActive ? endLiveStream() : setShowLiveStreamModal(true)}
                        className={`p-2 rounded-lg transition-colors ${
                          isLiveStreamActive ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-100'
                        }`}
                        title={isLiveStreamActive ? 'إنهاء البث المباشر' : 'بدء بث مباشر'}
                      >
                        {isLiveStreamActive ? (
                          <MonitorStop className="w-5 h-5" />
                        ) : (
                          <Monitor className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    )}

                    {/* Message input */}
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
                      placeholder="اكتب رسالة..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                      disabled={sending || isRecording}
                    />

                    {/* Send button */}
                    <button
                      onClick={sendMessage}
                      disabled={sending || (!newMessage.trim() && !selectedFile) || isRecording}
                      className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-bold mb-2">اختر محادثة</h3>
                  <p>اختر محادثة من القائمة لبدء المراسلة</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">إنشاء مجموعة</h2>
                <button
                  onClick={() => {
                    setShowNewGroupModal(false)
                    setGroupTitle('')
                    setSelectedUsers([])
                    setSearchQuery('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Group Title */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم المجموعة *
                </label>
                <input
                  type="text"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="مثال: مجموعة دورة Python"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>

              {/* Search Users */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أعضاء..."
                  className="w-full pr-10 pl-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>

              {/* Selected Count */}
              {selectedUsers.length > 0 && (
                <div className="mt-2 text-sm text-primary-600">
                  تم اختيار {selectedUsers.length} عضو
                </div>
              )}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 280px)' }}>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>لا يوجد مستخدمين</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => toggleUserSelection(u._id)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedUsers.includes(u._id) ? 'bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {u.name?.charAt(0)}
                        </div>
                        {selectedUsers.includes(u._id) && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{u.name}</h3>
                        <p className="text-sm text-gray-600">
                          {u.role === 'admin' && '👑 مدير'}
                          {u.role === 'instructor' && '👨‍🏫 مدرس'}
                          {u.role === 'student' && '👨‍🎓 طالب'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Create Button */}
            <div className="p-4 border-t">
              <button
                onClick={createGroup}
                disabled={!groupTitle.trim() || selectedUsers.length === 0}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إنشاء المجموعة ({selectedUsers.length} أعضاء)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">محادثة جديدة</h2>
                <button
                  onClick={() => {
                    setShowNewChatModal(false)
                    setSearchQuery('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مستخدم..."
                  className="w-full pr-10 pl-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                />
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>لا يوجد مستخدمين</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => createConversation(u._id)}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{u.name}</h3>
                        <p className="text-sm text-gray-600">
                          {u.role === 'admin' && '👑 مدير'}
                          {u.role === 'instructor' && '👨‍🏫 مدرس'}
                          {u.role === 'student' && '👨‍🎓 طالب'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Stream Modal */}
      {showLiveStreamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🎥 بدء بث مباشر</h2>
              <button
                onClick={() => {
                  setShowLiveStreamModal(false)
                  setLiveStreamUrl('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-700 mb-4">
                  اختر منصة البث المباشر أو أدخل رابط مخصص:
                </p>

                {/* Quick Start Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={quickStartGoogleMeet}
                    className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex flex-col items-center gap-2"
                  >
                    <Video className="w-8 h-8 text-blue-500" />
                    <span className="font-semibold text-blue-600">Google Meet</span>
                  </button>
                  <button
                    onClick={() => window.open('https://zoom.us/start/videomeeting', '_blank')}
                    className="p-4 border-2 border-indigo-500 rounded-lg hover:bg-indigo-50 transition-colors flex flex-col items-center gap-2"
                  >
                    <Video className="w-8 h-8 text-indigo-500" />
                    <span className="font-semibold text-indigo-600">Zoom</span>
                  </button>
                </div>

                {/* Custom URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    أو أدخل رابط البث:
                  </label>
                  <input
                    type="url"
                    value={liveStreamUrl}
                    onChange={(e) => setLiveStreamUrl(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 انسخ رابط الاجتماع والصقه هنا
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLiveStreamModal(false)
                    setLiveStreamUrl('')
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  إلغاء
                </button>
                <button
                  onClick={startLiveStream}
                  disabled={!liveStreamUrl.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎥 بدء البث
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
