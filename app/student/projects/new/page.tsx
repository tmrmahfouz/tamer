'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProjectSubmission from '@/components/ProjectSubmission'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Course {
  _id: string
  title: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnrolledCourses()
  }, [])

  const loadEnrolledCourses = async () => {
    try {
      const res = await fetch('/api/enrollments')
      const data = await res.json()
      if (data.success) {
        const enrolledCourses = data.enrollments.map((e: any) => ({
          _id: e.course._id,
          title: e.course.title
        }))
        setCourses(enrolledCourses)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (project: any) => {
    router.push('/student/projects')
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
        <div className="container mx-auto max-w-3xl">
          {/* Back Link */}
          <Link
            href="/student/projects"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لمشاريعي
          </Link>

          {/* Course Selection */}
          {!selectedCourse ? (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">تسليم مشروع جديد</h1>
              <p className="text-gray-600 mb-6">اختر الدورة التي تريد تسليم المشروع لها</p>

              {courses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">لم تسجل في أي دورة بعد</p>
                  <Link href="/courses" className="btn-primary inline-block">
                    استكشف الدورات
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <button
                      key={course._id}
                      onClick={() => setSelectedCourse(course._id)}
                      className="w-full p-4 text-right bg-gray-50 rounded-lg border-2 border-transparent hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{course.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ProjectSubmission
              courseId={selectedCourse}
              onSubmit={handleSubmit}
              onCancel={() => setSelectedCourse('')}
            />
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
