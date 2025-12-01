'use client'

import { useState, useEffect } from 'react'
import { 
  FolderKanban, Trash2, Eye, Star, CheckCircle, Clock, 
  AlertCircle, Search, Filter, RefreshCw, ExternalLink,
  MessageSquare, ThumbsUp, Award, XCircle, Edit, Loader2
} from 'lucide-react'
import Link from 'next/link'
import InstructorLayout from '@/components/InstructorLayout'

interface Project {
  _id: string
  title: string
  description: string
  student: { _id: string; name: string; email: string }
  course: { _id: string; title: string }
  status: 'draft' | 'submitted' | 'under_review' | 'needs_revision' | 'approved' | 'featured'
  files: any[]
  liveUrl?: string
  repoUrl?: string
  technologies: string[]
  isPublic: boolean
  likes: string[]
  comments: any[]
  views: number
  feedback?: any
  submittedAt?: string
  createdAt: string
}

const statusConfig = {
  draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-700', icon: Edit },
  submitted: { label: 'مُقدم', color: 'bg-blue-100 text-blue-700', icon: Clock },
  under_review: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
  needs_revision: { label: 'يحتاج تعديل', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  approved: { label: 'معتمد', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  featured: { label: 'مميز', color: 'bg-purple-100 text-purple-700', icon: Star },
}

export default function InstructorProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewData, setReviewData] = useState({
    status: '',
    rating: 5,
    description: '',
    strengths: '',
    improvements: '',
    revisionNotes: ''
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/instructor/projects')
      const data = await res.json()
      if (data.success) setProjects(data.projects || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setProjects(prev => prev.map(p => p._id === id ? { ...p, status: status as any } : p))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleReviewProject = async () => {
    if (!selectedProject) return
    
    try {
      const res = await fetch(`/api/projects/${selectedProject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewData.status,
          feedback: {
            rating: reviewData.rating,
            description: reviewData.description,
            strengths: reviewData.strengths.split('\n').filter(s => s.trim()),
            improvements: reviewData.improvements.split('\n').filter(s => s.trim()),
          },
          revisionNotes: reviewData.revisionNotes
        })
      })
      
      if (res.ok) {
        loadProjects()
        setShowReviewModal(false)
        setSelectedProject(null)
        setReviewData({ status: '', rating: 5, description: '', strengths: '', improvements: '', revisionNotes: '' })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return
    
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProjects(prev => prev.filter(p => p._id !== id))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic })
      })
      if (res.ok) {
        setProjects(prev => prev.map(p => p._id === id ? { ...p, isPublic: !isPublic } : p))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: projects.length,
    submitted: projects.filter(p => p.status === 'submitted').length,
    underReview: projects.filter(p => p.status === 'under_review').length,
    approved: projects.filter(p => p.status === 'approved').length,
    featured: projects.filter(p => p.status === 'featured').length,
    needsRevision: projects.filter(p => p.status === 'needs_revision').length,
  }

  if (loading) {
    return (
      <InstructorLayout title="إدارة المشروعات">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </InstructorLayout>
    )
  }

  return (
    <InstructorLayout title="إدارة المشروعات">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المشروعات</h1>
          <p className="text-gray-600">مراجعة وإدارة مشروعات الطلاب</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">إجمالي</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.submitted}</p>
                <p className="text-xs text-gray-500">مُقدم</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.underReview}</p>
                <p className="text-xs text-gray-500">قيد المراجعة</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-gray-500">معتمد</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.featured}</p>
                <p className="text-xs text-gray-500">مميز</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.needsRevision}</p>
                <p className="text-xs text-gray-500">يحتاج تعديل</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3 items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث بالعنوان أو اسم الطالب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="submitted">مُقدم</option>
                <option value="under_review">قيد المراجعة</option>
                <option value="needs_revision">يحتاج تعديل</option>
                <option value="approved">معتمد</option>
                <option value="featured">مميز</option>
              </select>
            </div>
            <button
              onClick={loadProjects}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مشروعات</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredProjects.map((project) => {
                const StatusIcon = statusConfig[project.status]?.icon || Clock
                return (
                  <div key={project._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${statusConfig[project.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[project.status]?.label || project.status}
                          </span>
                          {project.isPublic && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">عام</span>
                          )}
                          {project.feedback && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              {project.feedback.rating}/5
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{project.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span>الطالب: {project.student?.name || 'غير معروف'}</span>
                          <span>الدورة: {project.course?.title || '-'}</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {project.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {project.comments?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {project.views || 0}
                          </span>
                        </div>
                        
                        {project.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.slice(0, 5).map((tech, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">{tech}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {/* Quick Status Change */}
                        <select
                          value={project.status}
                          onChange={(e) => handleUpdateStatus(project._id, e.target.value)}
                          className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="submitted">مُقدم</option>
                          <option value="under_review">قيد المراجعة</option>
                          <option value="needs_revision">يحتاج تعديل</option>
                          <option value="approved">معتمد</option>
                          <option value="featured">مميز</option>
                        </select>
                        
                        <div className="flex gap-1">
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="معاينة">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => { setSelectedProject(project); setShowReviewModal(true); setReviewData({ ...reviewData, status: project.status }) }}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200" title="مراجعة">
                            <Award className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTogglePublic(project._id, project.isPublic)}
                            className={`p-2 rounded-lg ${project.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                            title={project.isPublic ? 'إخفاء' : 'نشر'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">مراجعة المشروع</h2>
                  <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">{selectedProject.title}</p>
              </div>
              
              {/* Project Details Section */}
              <div className="p-6 bg-gray-50 border-b space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">تفاصيل المشروع</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <p className="text-gray-600 bg-white p-3 rounded-lg border">{selectedProject.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.liveUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رابط المعاينة</label>
                      <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100">
                        <ExternalLink className="w-4 h-4" />
                        <span className="truncate">{selectedProject.liveUrl}</span>
                      </a>
                    </div>
                  )}
                  {selectedProject.repoUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رابط المستودع</label>
                      <a href={selectedProject.repoUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">
                        <ExternalLink className="w-4 h-4" />
                        <span className="truncate">{selectedProject.repoUrl}</span>
                      </a>
                    </div>
                  )}
                </div>
                
                {selectedProject.technologies?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التقنيات المستخدمة</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedProject.student?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedProject.student?.name}</p>
                    <p className="text-sm text-gray-500">{selectedProject.student?.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Review Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الحالة</label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="under_review">قيد المراجعة</option>
                    <option value="needs_revision">يحتاج تعديل</option>
                    <option value="approved">معتمد</option>
                    <option value="featured">مميز</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">التقييم</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setReviewData({ ...reviewData, rating: n })}
                        className={`p-2 rounded-lg ${reviewData.rating >= n ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}
                      >
                        <Star className={`w-6 h-6 ${reviewData.rating >= n ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">ملاحظات المراجعة</label>
                  <textarea
                    value={reviewData.description}
                    onChange={(e) => setReviewData({ ...reviewData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="اكتب ملاحظاتك هنا..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">نقاط القوة (سطر لكل نقطة)</label>
                  <textarea
                    value={reviewData.strengths}
                    onChange={(e) => setReviewData({ ...reviewData, strengths: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="تصميم جيد&#10;كود نظيف&#10;..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">نقاط التحسين (سطر لكل نقطة)</label>
                  <textarea
                    value={reviewData.improvements}
                    onChange={(e) => setReviewData({ ...reviewData, improvements: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="تحسين الأداء&#10;إضافة اختبارات&#10;..."
                  />
                </div>
                
                {reviewData.status === 'needs_revision' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات التعديل المطلوب</label>
                    <textarea
                      value={reviewData.revisionNotes}
                      onChange={(e) => setReviewData({ ...reviewData, revisionNotes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="التعديلات المطلوبة..."
                    />
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t flex gap-3 justify-end">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReviewProject}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  حفظ المراجعة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
