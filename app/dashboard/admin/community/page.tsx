'use client'

import { useState, useEffect } from 'react'
import { 
  Users, MessageSquare, Trash2, Pin, CheckCircle, 
  Eye, Search, Filter, AlertTriangle, UserX, 
  MoreVertical, RefreshCw, Shield, Ban, Loader2
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface Discussion {
  _id: string
  title: string
  content: string
  type: 'question' | 'discussion' | 'announcement'
  user: { _id: string; name: string; email: string }
  course: { _id: string; title: string }
  replies: any[]
  likes: string[]
  views: number
  isPinned: boolean
  isResolved: boolean
  createdAt: string
}

interface StudyGroup {
  _id: string
  name: string
  description: string
  course: { _id: string; title: string }
  creator: { _id: string; name: string; email: string }
  members: any[]
  maxMembers: number
  isPrivate: boolean
  isActive: boolean
  createdAt: string
}

export default function AdminCommunityPage() {
  const [activeTab, setActiveTab] = useState<'discussions' | 'groups'>('discussions')
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [discussionsRes, groupsRes] = await Promise.all([
        fetch('/api/admin/discussions'),
        fetch('/api/admin/study-groups')
      ])
      
      const discussionsData = await discussionsRes.json()
      const groupsData = await groupsRes.json()
      
      if (discussionsData.success) setDiscussions(discussionsData.discussions)
      if (groupsData.success) setStudyGroups(groupsData.groups)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDiscussion = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا النقاش؟')) return
    
    try {
      const res = await fetch(`/api/admin/discussions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDiscussions(prev => prev.filter(d => d._id !== id))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const res = await fetch(`/api/admin/discussions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned })
      })
      if (res.ok) {
        setDiscussions(prev => prev.map(d => 
          d._id === id ? { ...d, isPinned: !isPinned } : d
        ))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return
    
    try {
      const res = await fetch(`/api/admin/study-groups/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setStudyGroups(prev => prev.filter(g => g._id !== id))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleToggleGroupActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/study-groups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      if (res.ok) {
        setStudyGroups(prev => prev.map(g => 
          g._id === id ? { ...g, isActive: !isActive } : g
        ))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return
    if (!confirm(`هل أنت متأكد من حذف ${selectedItems.length} عنصر؟`)) return
    
    try {
      const endpoint = activeTab === 'discussions' ? '/api/admin/discussions/bulk-delete' : '/api/admin/study-groups/bulk-delete'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedItems })
      })
      
      if (res.ok) {
        if (activeTab === 'discussions') {
          setDiscussions(prev => prev.filter(d => !selectedItems.includes(d._id)))
        } else {
          setStudyGroups(prev => prev.filter(g => !selectedItems.includes(g._id)))
        }
        setSelectedItems([])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredDiscussions = discussions.filter(d => {
    const userName = d.user?.name || ''
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || d.type === filterType
    return matchesSearch && matchesFilter
  })

  const filteredGroups = studyGroups.filter(g => {
    const creatorName = g.creator?.name || ''
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creatorName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const stats = {
    totalDiscussions: discussions.length,
    totalGroups: studyGroups.length,
    pinnedDiscussions: discussions.filter(d => d.isPinned).length,
    activeGroups: studyGroups.filter(g => g.isActive).length,
    totalMembers: studyGroups.reduce((acc, g) => acc + g.members.length, 0),
    totalReplies: discussions.reduce((acc, d) => acc + d.replies.length, 0),
  }

  if (loading) {
    return (
      <AdminLayout title="إدارة المجتمع">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إدارة المجتمع">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المجتمع</h1>
          <p className="text-gray-600">إدارة النقاشات ومجموعات الدراسة</p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDiscussions}</p>
              <p className="text-xs text-gray-500">نقاش</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
              <p className="text-xs text-gray-500">مجموعة</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Pin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pinnedDiscussions}</p>
              <p className="text-xs text-gray-500">مثبت</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeGroups}</p>
              <p className="text-xs text-gray-500">نشط</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              <p className="text-xs text-gray-500">عضو</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReplies}</p>
              <p className="text-xs text-gray-500">رد</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => { setActiveTab('discussions'); setSelectedItems([]) }}
            className={`flex-1 px-6 py-4 font-medium flex items-center justify-center gap-2 ${
              activeTab === 'discussions' ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' : 'text-gray-600'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            النقاشات ({discussions.length})
          </button>
          <button
            onClick={() => { setActiveTab('groups'); setSelectedItems([]) }}
            className={`flex-1 px-6 py-4 font-medium flex items-center justify-center gap-2 ${
              activeTab === 'groups' ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-600' : 'text-gray-600'
            }`}
          >
            <Users className="w-5 h-5" />
            مجموعات الدراسة ({studyGroups.length})
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3 items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {activeTab === 'discussions' && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">جميع الأنواع</option>
                <option value="question">أسئلة</option>
                <option value="discussion">نقاشات</option>
                <option value="announcement">إعلانات</option>
              </select>
            )}
          </div>
          
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                حذف ({selectedItems.length})
              </button>
            )}
            <button
              onClick={loadData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'discussions' ? (
            <div className="space-y-3">
              {filteredDiscussions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد نقاشات</p>
                </div>
              ) : (
                filteredDiscussions.map((discussion) => (
                  <div key={discussion._id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${discussion.isPinned ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(discussion._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, discussion._id])
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== discussion._id))
                          }
                        }}
                        className="mt-1 w-4 h-4 rounded border-gray-300"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {discussion.isPinned && <Pin className="w-4 h-4 text-amber-600" />}
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                discussion.type === 'question' ? 'bg-blue-100 text-blue-700' :
                                discussion.type === 'announcement' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {discussion.type === 'question' ? 'سؤال' : discussion.type === 'announcement' ? 'إعلان' : 'نقاش'}
                              </span>
                              {discussion.isResolved && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">محلول</span>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900">{discussion.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{discussion.content}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTogglePin(discussion._id, discussion.isPinned)}
                              className={`p-2 rounded-lg ${discussion.isPinned ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'} hover:opacity-80`}
                              title={discussion.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
                            >
                              <Pin className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDiscussion(discussion._id)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {discussion.user?.name || 'مستخدم محذوف'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {discussion.replies.length} رد
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {discussion.views} مشاهدة
                          </span>
                          <span>{discussion.course?.title}</span>
                          <span>{new Date(discussion.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد مجموعات</p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group._id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${!group.isActive ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(group._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, group._id])
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== group._id))
                          }
                        }}
                        className="mt-1 w-4 h-4 rounded border-gray-300"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {group.isPrivate && <Shield className="w-4 h-4 text-purple-600" />}
                              <span className={`px-2 py-0.5 text-xs rounded-full ${group.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {group.isActive ? 'نشط' : 'معطل'}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">{group.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{group.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleGroupActive(group._id, group.isActive)}
                              className={`p-2 rounded-lg ${group.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} hover:opacity-80`}
                              title={group.isActive ? 'تعطيل' : 'تفعيل'}
                            >
                              {group.isActive ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group._id)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {group.members.length}/{group.maxMembers} عضو
                          </span>
                          <span>أنشأها: {group.creator?.name || 'مستخدم محذوف'}</span>
                          <span>{group.course?.title}</span>
                          <span>{new Date(group.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}
