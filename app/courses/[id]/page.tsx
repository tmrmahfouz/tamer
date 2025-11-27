'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContentProtection from '@/components/ContentProtection'
import Link from 'next/link'
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  FileText,
  Award,
  CheckCircle,
  Lock,
  ShoppingCart,
  MessageCircle,
  FolderOpen,
} from 'lucide-react'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false)

  useEffect(() => {
    loadCourse()
    checkAuth()
  }, [params.id])

  // التحقق من ملكية الدورة عند تحميل بيانات المستخدم والدورة
  useEffect(() => {
    if (user && course) {
      const isAdmin = user.role === 'admin'
      const isInstructor = user.role === 'instructor'
      const isCourseOwner = course.instructor === user.id || course.instructor?._id === user.id
      
      if (isAdmin || (isInstructor && isCourseOwner)) {
        setIsOwnerOrAdmin(true)
      }
    }
  }, [user, course])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        // Check if enrolled
        checkEnrollment(data.user.id)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }

  const checkEnrollment = async (userId: string) => {
    try {
      const response = await fetch(`/api/enrollments/check?courseId=${params.id}&userId=${userId}`)
      const data = await response.json()
      setIsEnrolled(data.isEnrolled)
    } catch (error) {
      console.error('Enrollment check error:', error)
    }
  }

  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setCourse(data.course)
        loadLessons()
      }
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLessons = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}/lessons`)
      const data = await response.json()
      if (data.success) {
        setLessons(data.lessons)
      }
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    // If course is free, enroll directly
    if (course.price === 0) {
      try {
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: params.id,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Reload lessons if not loaded
          if (lessons.length === 0) {
            const lessonsResponse = await fetch(`/api/courses/${params.id}/lessons`)
            const lessonsData = await lessonsResponse.json()
            if (lessonsData.success && lessonsData.lessons.length > 0) {
              router.push(`/learn/${params.id}/${lessonsData.lessons[0]._id}`)
              return
            }
          }
          
          // Redirect to first lesson
          if (lessons.length > 0) {
            router.push(`/learn/${params.id}/${lessons[0]._id}`)
          } else {
            router.push(`/student/my-courses`)
          }
        } else {
          alert(data.message || 'حدث خطأ أثناء التسجيل')
        }
      } catch (error) {
        console.error('Enrollment error:', error)
        alert('حدث خطأ أثناء التسجيل')
      }
    } else {
      // Paid course, go to checkout
      router.push(`/courses/${params.id}/checkout`)
    }
  }

  const handleStartCourse = async () => {
    // Make sure lessons are loaded
    if (lessons.length === 0) {
      try {
        const response = await fetch(`/api/courses/${params.id}/lessons`)
        const data = await response.json()
        if (data.success && data.lessons.length > 0) {
          const firstLessonId = data.lessons[0]._id
          router.push(`/learn/${params.id}/${firstLessonId}`)
          return
        }
      } catch (error) {
        console.error('Error loading lessons:', error)
      }
      alert('لا توجد دروس متاحة في هذه الدورة بعد. سيتم إضافتها قريباً.')
      return
    }
    
    // Go to first lesson
    const firstLessonId = lessons[0]._id
    router.push(`/learn/${params.id}/${firstLessonId}`)
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الدورة غير موجودة</h2>
          <button onClick={() => router.push('/courses')} className="btn-primary">
            العودة للدورات
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ContentProtection />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <div className="text-white">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <span className="font-semibold">{course.category}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-white/90 mb-6">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.students} طالب</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.lessons} درس</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400" />
                  <span>{course.rating}</span>
                </div>
              </div>

              {/* Level */}
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="font-semibold">المستوى: {course.level}</span>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">{course.image}</div>
                {course.price === 0 ? (
                  <>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      مجاناً
                    </div>
                    <p className="text-gray-600">دورة مجانية بالكامل</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {course.price} جنيه
                    </div>
                    <p className="text-gray-600">سعر الدورة الكاملة</p>
                  </>
                )}
              </div>

              {isEnrolled || isOwnerOrAdmin ? (
                <button
                  onClick={handleStartCourse}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  <span>{isOwnerOrAdmin && !isEnrolled ? 'معاينة الدورة' : 'متابعة الدورة'}</span>
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {course.price === 0 ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>اشترك مجاناً</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>اشترك الآن</span>
                    </>
                  )}
                </button>
              )}

              {/* إشارة للمعلم/الأدمن */}
              {isOwnerOrAdmin && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <span className="text-blue-700 text-sm font-semibold">
                    👨‍🏫 أنت {user?.role === 'admin' ? 'المدير' : 'صاحب هذه الدورة'}
                  </span>
                </div>
              )}

              {/* Community Link */}
              <Link
                href={`/courses/${params.id}/community`}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>انضم للمجتمع</span>
              </Link>

              {/* Projects Link */}
              <Link
                href={`/courses/${params.id}/projects`}
                className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-5 h-5" />
                <span>مشاريع الطلاب</span>
              </Link>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>وصول مدى الحياة</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>شهادة إتمام</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>دعم فني مستمر</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* What You'll Learn */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">ماذا ستتعلم؟</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {course.topics?.map((topic: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Curriculum */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">محتوى الدورة</h2>
            
            {lessons.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                لم يتم إضافة دروس بعد
              </p>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson: any, index: number) => (
                  <div
                    key={lesson._id}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        {lesson.type === 'video' && <Play className="w-5 h-5 text-primary-600" />}
                        {lesson.type === 'pdf' && <FileText className="w-5 h-5 text-primary-600" />}
                        {lesson.type === 'quiz' && <Award className="w-5 h-5 text-primary-600" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {index + 1}. {lesson.title}
                        </h3>
                        {lesson.content?.duration && (
                          <p className="text-sm text-gray-600">{lesson.content.duration} دقيقة</p>
                        )}
                      </div>
                    </div>
                    {!isEnrolled && !lesson.isFree && (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructor */}
          {course.instructor && (
            <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">المدرس</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {course.instructor.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{course.instructor.name}</h3>
                  {course.instructor.bio && (
                    <p className="text-gray-600">{course.instructor.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
