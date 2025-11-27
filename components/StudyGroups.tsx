'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Lock, Unlock, Calendar, Link as LinkIcon, UserPlus, LogOut, Settings, Copy, Check, X } from 'lucide-react'

interface StudyGroup {
  _id: string
  name: string
  description: string
  course: { _id: string; title: string }
  creator: { _id: string; name: string }
  members: { _id: string; name: string }[]
  maxMembers: number
  isPrivate: boolean
  inviteCode?: string
  meetingSchedule?: string
  meetingLink?: string
  tags: string[]
}

interface StudyGroupsProps {
  courseId: string
  currentUserId?: string
}

export default function StudyGroups({ courseId, currentUserId }: StudyGroupsProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '', description: '', maxMembers: 10, isPrivate: false, meetingSchedule: '', meetingLink: ''
  })
  const [joinCode, setJoinCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [courseId])

  const loadGroups = async () => {
    try {
      const res = await fetch(`/api/study-groups?courseId=${courseId}`)
      const data = await res.json()
      if (data.success) setGroups(data.groups)
    } catch (error) {
      console.error('Error loading groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async () => {
    if (!formData.name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, courseId }),
      })
      const data = await res.json()
      if (data.success) {
        setGroups([data.group, ...groups])
        setShowCreateForm(false)
        setFormData({ name: '', description: '', maxMembers: 10, isPrivate: false, meetingSchedule: '', meetingLink: '' })
      }
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const joinGroup = async (groupId: string, inviteCode?: string) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/study-groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', inviteCode }),
      })
      const data = await res.json()
      if (data.success) {
        setGroups(groups.map(g => g._id === data.group._id ? data.group : g))
        setShowJoinModal(false)
        setJoinCode('')
        setSelectedGroup(null)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error joining group:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const leaveGroup = async (groupId: string) => {
    if (!confirm('هل تريد مغادرة هذه المجموعة؟')) return
    try {
      const res = await fetch(`/api/study-groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.group.isActive) {
          setGroups(groups.map(g => g._id === data.group._id ? data.group : g))
        } else {
          setGroups(groups.filter(g => g._id !== groupId))
        }
      }
    } catch (error) {
      console.error('Error leaving group:', error)
    }
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const isMember = (group: StudyGroup) => group.members.some(m => m._id === currentUserId)
  const isCreator = (group: StudyGroup) => group.creator._id === currentUserId

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Users className="w-6 h-6" />
            <h3 className="text-xl font-bold">مجموعات الدراسة</h3>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{groups.length}</span>
          </div>
          <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold text-sm">
            <Plus className="w-4 h-4" /> إنشاء مجموعة
          </button>
        </div>
      </div>

      {/* نموذج إنشاء مجموعة */}
      {showCreateForm && (
        <div className="p-4 border-b bg-purple-50">
          <h4 className="font-bold text-gray-900 mb-3">إنشاء مجموعة دراسة جديدة</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <input type="text" placeholder="اسم المجموعة *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
            <input type="number" placeholder="الحد الأقصى للأعضاء" value={formData.maxMembers} onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value)})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" min={2} max={50} />
            <textarea placeholder="وصف المجموعة" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none md:col-span-2" rows={2} />
            <input type="text" placeholder="موعد الاجتماعات (مثال: كل سبت 8 مساءً)" value={formData.meetingSchedule} onChange={(e) => setFormData({...formData, meetingSchedule: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
            <input type="url" placeholder="رابط الاجتماع (Zoom, Meet, etc.)" value={formData.meetingLink} onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
            <label className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" checked={formData.isPrivate} onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})} className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-700">مجموعة خاصة (تحتاج كود دعوة للانضمام)</span>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={createGroup} disabled={submitting || !formData.name.trim()} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {submitting ? 'جاري الإنشاء...' : 'إنشاء'}
            </button>
            <button onClick={() => setShowCreateForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">إلغاء</button>
          </div>
        </div>
      )}

      {/* قائمة المجموعات */}
      <div className="p-4">
        {groups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد مجموعات دراسة بعد</p>
            <p className="text-sm">كن أول من ينشئ مجموعة!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div key={group._id} className="border-2 rounded-xl p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{group.name}</h4>
                      {group.isPrivate ? <Lock className="w-4 h-4 text-gray-400" /> : <Unlock className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-500">بواسطة {group.creator.name}</p>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {group.members.length}/{group.maxMembers}
                  </span>
                </div>
                
                {group.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>}
                
                <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
                  {group.meetingSchedule && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{group.meetingSchedule}</span>
                  )}
                  {group.meetingLink && (
                    <a href={group.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-600 hover:underline">
                      <LinkIcon className="w-3 h-3" />رابط الاجتماع
                    </a>
                  )}
                </div>

                {/* الأعضاء */}
                <div className="flex items-center gap-1 mb-3">
                  {group.members.slice(0, 5).map((member, i) => (
                    <div key={member._id} className="w-7 h-7 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold text-purple-700" style={{marginRight: i > 0 ? '-8px' : 0}}>
                      {member.name?.charAt(0)}
                    </div>
                  ))}
                  {group.members.length > 5 && <span className="text-xs text-gray-500 mr-2">+{group.members.length - 5}</span>}
                </div>

                {/* الأزرار */}
                <div className="flex gap-2">
                  {isMember(group) ? (
                    <>
                      {isCreator(group) && group.isPrivate && group.inviteCode && (
                        <button onClick={() => copyInviteCode(group.inviteCode!)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                          {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          {copiedCode ? 'تم النسخ' : group.inviteCode}
                        </button>
                      )}
                      <button onClick={() => leaveGroup(group._id)} className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm">
                        <LogOut className="w-4 h-4" /> مغادرة
                      </button>
                    </>
                  ) : group.members.length < group.maxMembers ? (
                    <button onClick={() => group.isPrivate ? (setSelectedGroup(group), setShowJoinModal(true)) : joinGroup(group._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                      <UserPlus className="w-4 h-4" /> انضمام
                    </button>
                  ) : (
                    <span className="flex-1 text-center py-2 text-gray-500 text-sm">المجموعة ممتلئة</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نافذة إدخال كود الدعوة */}
      {showJoinModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">الانضمام لـ {selectedGroup.name}</h4>
              <button onClick={() => { setShowJoinModal(false); setSelectedGroup(null); setJoinCode('') }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">هذه مجموعة خاصة. أدخل كود الدعوة للانضمام:</p>
            <input type="text" placeholder="كود الدعوة" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border-2 rounded-lg focus:border-purple-500 outline-none text-center text-lg font-mono tracking-widest mb-4" maxLength={6} />
            <div className="flex gap-2">
              <button onClick={() => { setShowJoinModal(false); setSelectedGroup(null); setJoinCode('') }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">إلغاء</button>
              <button onClick={() => joinGroup(selectedGroup._id, joinCode)} disabled={submitting || joinCode.length < 6}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {submitting ? 'جاري...' : 'انضمام'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
