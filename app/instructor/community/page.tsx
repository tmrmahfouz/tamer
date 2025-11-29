'use client'

import { useState, useEffect } from 'react'
import InstructorLayout from '@/components/InstructorLayout'
import { MessageCircle, Users, Search, Trash2, Eye, Calendar } from 'lucide-react'

export default function InstructorCommunityPage() {
  const [discussions, setDiscussions] = useState<any[]>([])
  const [studyGroups, setStudyGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'discussions' | 'groups'>('discussions')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [discussionsRes, groupsRes] = await Promise.all([
        fetch('/api/discussions'),
        fetch('/api/study-groups')
      ])
      const discussionsData = await discussionsRes.json()
      const groupsData = await groupsRes.json()
      if (discussionsData.success) setDiscussions(discussionsData.discussions || [])
      if (groupsData.success) setStudyGroups(groupsData.studyGroups || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteDiscussion = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return
    try {
      const res = await fetch(`/api/discussions/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) loadData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteGroup = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return
    try {
      const res = await fetch(`/api/study-groups/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) loadData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredDiscussions = discussions.filter(d =>
    d.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredGroups = studyGroups.filter(g =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <InstructorLayout title="المجتمع">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">إدارة المجتمع</h1>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'discussions'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-5 h-5 inline ml-2" />
            المناقشات ({discussions.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'groups'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5 inline ml-2" />
            مجموعات الدراسة ({studyGroups.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'discussions' ? (
          filteredDiscussions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">لا توجد مناقشات بعد</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكاتب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الردود</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDiscussions.map((discussion) => (
                    <tr key={discussion._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{discussion.title}</td>
                      <td className="px-6 py-4 text-gray-600">{discussion.author?.name || 'غير معروف'}</td>
                      <td className="px-6 py-4 text-gray-600">{discussion.replies?.length || 0}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(discussion.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteDiscussion(discussion._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredGroups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">لا توجد مجموعات دراسة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <div key={group._id} className="bg-white rounded-xl shadow-sm p-4 border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    </div>
                    <button
                      onClick={() => deleteGroup(group._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.members?.length || 0} أعضاء
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(group.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </InstructorLayout>
  )
}
