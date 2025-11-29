'use client'

import { useState, useEffect } from 'react'
import InstructorLayout from '@/components/InstructorLayout'
import { FolderKanban, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function InstructorProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
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

  const updateProjectStatus = async (id: string, status: string, feedback?: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback })
      })
      const data = await res.json()
      if (data.success) loadProjects()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="w-3 h-3" />مقبول</span>
      case 'rejected':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><XCircle className="w-3 h-3" />مرفوض</span>
      default:
        return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="w-3 h-3" />قيد المراجعة</span>
    }
  }

  return (
    <InstructorLayout title="المشروعات">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">مشروعات الطلاب</h1>
          <div className="flex gap-4">
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">لا توجد مشروعات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div key={project._id} className="bg-white rounded-xl shadow-sm p-4 border">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  {getStatusBadge(project.status)}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                <div className="text-xs text-gray-500 mb-3">
                  <p>الطالب: {project.user?.name || 'غير معروف'}</p>
                  <p>الدورة: {project.course?.title || '-'}</p>
                </div>
                {project.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateProjectStatus(project._id, 'approved')}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => {
                        const feedback = prompt('سبب الرفض:')
                        if (feedback) updateProjectStatus(project._id, 'rejected', feedback)
                      }}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      رفض
                    </button>
                  </div>
                )}
                {project.fileUrl && (
                  <a
                    href={project.fileUrl}
                    target="_blank"
                    className="mt-2 flex items-center gap-2 text-sm text-green-600 hover:underline"
                  >
                    <Eye className="w-4 h-4" />
                    عرض المشروع
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </InstructorLayout>
  )
}
