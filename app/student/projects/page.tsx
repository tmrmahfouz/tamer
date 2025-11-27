'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  FolderKanban, Star, CheckCircle, Clock, AlertCircle,
  ExternalLink, Github, Eye, ThumbsUp, MessageSquare,
  Edit, Send, Loader2, ChevronDown, ChevronUp
} from 'lucide-react'

interface Project {
  _id: string
  title: string
  description: string
  course: { _id: string; title: string }
  status: string
  files: any[]
  liveUrl?: string
  repoUrl?: string
  technologies: string[]
  isPublic: boolean
  likes: string[]
  comments: any[]
  views: number
  feedback?: {
    description: string
    rating: number
    strengths: string[]
    improvements: string[]
    reviewedAt: string
  }
  revisionNotes?: string
  submittedAt?: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  draft: { label: 'مسودة', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Edit },
  submitted: { label: 'تم التسليم', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Send },
  under_review: { label: 'قيد المراجعة', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
  needs_revision: { label: 'يحتاج تعديل', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: AlertCircle },
  approved: { label: 'معتمد', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  featured: { label: 'مميز', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Star },
}

export default function StudentProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects/my')
      const data = await res.json()
      if (data.success) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedProject(expandedProject === id ? null : id)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FolderKanban className="w-8 h-8 text-primary-600" />
                مشاريعي
              </h1>
              <p className="text-gray-600">عرض جميع مشاريعك وتقييمات المدرسين</p>
            </div>
            <Link
              href="/student/projects/new"
              className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
            >
              <Send className="w-5 h-5" />
              تسليم مشروع جديد
            </Link>
          </div>

          {/* Projects List */}
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مشاريع</h3>
              <p className="text-gray-600 mb-4">لم تقم بتسليم أي مشاريع بعد</p>
              <Link href="/courses" className="btn-primary inline-block">
                استكشف الدورات
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const status = statusConfig[project.status] || statusConfig.draft
                const StatusIcon = status.icon
                const isExpanded = expandedProject === project._id

                return (
                  <div key={project._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {/* Project Header */}
                    <div 
                      className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(project._id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${status.bgColor} ${status.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {status.label}
                            </span>
                            {project.feedback && (
                              <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                <Star className="w-4 h-4 fill-current" />
                                {project.feedback.rating}/5
                              </span>
                            )}
                            {project.isPublic && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">عام</span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{project.course?.title}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {project.views} مشاهدة
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {project.likes?.length || 0} إعجاب
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {project.comments?.length || 0} تعليق
                            </span>
                          </div>
                        </div>
                        
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t">
                        {/* Feedback Section */}
                        {project.feedback && (
                          <div className="p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-500" />
                              تقييم المدرس
                            </h4>
                            
                            {/* Rating Stars */}
                            <div className="flex items-center gap-1 mb-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-6 h-6 ${
                                    star <= project.feedback!.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="mr-2 text-lg font-bold text-gray-900">
                                {project.feedback.rating}/5
                              </span>
                            </div>
                            
                            {/* Feedback Description */}
                            {project.feedback.description && (
                              <div className="mb-4 p-4 bg-white rounded-lg border">
                                <p className="text-gray-700">{project.feedback.description}</p>
                              </div>
                            )}
                            
                            {/* Strengths */}
                            {project.feedback.strengths && project.feedback.strengths.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  نقاط القوة
                                </h5>
                                <ul className="space-y-1">
                                  {project.feedback.strengths.map((strength, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                      <span className="text-green-500 mt-1">✓</span>
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Improvements */}
                            {project.feedback.improvements && project.feedback.improvements.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  نقاط التحسين
                                </h5>
                                <ul className="space-y-1">
                                  {project.feedback.improvements.map((improvement, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                      <span className="text-orange-500 mt-1">•</span>
                                      {improvement}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {project.feedback.reviewedAt && (
                              <p className="text-sm text-gray-500">
                                تاريخ التقييم: {new Date(project.feedback.reviewedAt).toLocaleDateString('ar-EG')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Revision Notes */}
                        {project.status === 'needs_revision' && project.revisionNotes && (
                          <div className="p-4 md:p-6 bg-orange-50 border-b">
                            <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" />
                              ملاحظات التعديل المطلوبة
                            </h4>
                            <p className="text-orange-700 bg-white p-4 rounded-lg border border-orange-200">
                              {project.revisionNotes}
                            </p>
                          </div>
                        )}

                        {/* Project Details */}
                        <div className="p-4 md:p-6 space-y-4">
                          {/* Description */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">الوصف</h5>
                            <p className="text-gray-600">{project.description}</p>
                          </div>
                          
                          {/* Links */}
                          <div className="flex flex-wrap gap-3">
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                معاينة المشروع
                              </a>
                            )}
                            {project.repoUrl && (
                              <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <Github className="w-4 h-4" />
                                المستودع
                              </a>
                            )}
                          </div>
                          
                          {/* Technologies */}
                          {project.technologies && project.technologies.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-2">التقنيات</h5>
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, i) => (
                                  <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Files */}
                          {project.files && project.files.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-2">الملفات ({project.files.length})</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {project.files.map((file, i) => (
                                  <a
                                    key={i}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <span className="text-xl">
                                      {file.type === 'image' ? '🖼️' :
                                       file.type === 'video' ? '🎬' :
                                       file.type === 'document' ? '📄' :
                                       file.type === 'code' ? '💻' : '📁'}
                                    </span>
                                    <span className="flex-1 truncate">{file.name}</span>
                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
