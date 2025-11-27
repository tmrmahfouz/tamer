'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DiscussionForum from '@/components/DiscussionForum'
import StudyGroups from '@/components/StudyGroups'
import { ArrowRight, MessageCircle, Users, BookOpen } from 'lucide-react'

export default function CourseCommunityPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'discussions' | 'groups'>('discussions')

  useEffect(() => {
    checkAuth()
    loadCourse()
  }, [params.id])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) setUser(data.user)
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  const loadCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`)
      const data = await res.json()
      if (data.success) setCourse(data.course)
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الدورة غير موجودة</h1>
          <Link href="/courses" className="text-primary-600 hover:underline">العودة للدورات</Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/courses/${params.id}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4">
              <ArrowRight className="w-5 h-5" />
              <span>العودة للدورة</span>
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-3xl">
                {course.image}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">مجتمع الدورة</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('discussions')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'discussions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              <MessageCircle className="w-5 h-5" />
              <span>المناقشات</span>
            </button>
            <button onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'groups' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              <Users className="w-5 h-5" />
              <span>مجموعات الدراسة</span>
            </button>
          </div>

          {/* Content */}
          {activeTab === 'discussions' ? (
            <DiscussionForum courseId={params.id as string} currentUserId={user?.id} />
          ) : (
            <StudyGroups courseId={params.id as string} currentUserId={user?.id} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
