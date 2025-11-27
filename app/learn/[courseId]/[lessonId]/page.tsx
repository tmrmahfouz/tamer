'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Clock, Lock, ArrowRight, ArrowLeft, FileText, Presentation, Code, CheckCircle, Circle, FileQuestion, Award, Bookmark, StickyNote, TrendingUp } from 'lucide-react'
import UniversalVideoPlayer from '@/components/lesson-viewers/UniversalVideoPlayer'
import PDFViewer from '@/components/lesson-viewers/PDFViewer'
import PresentationViewer from '@/components/lesson-viewers/PresentationViewer'
import HTML5Viewer from '@/components/lesson-viewers/HTML5Viewer'
import TextViewer from '@/components/lesson-viewers/TextViewer'
import InlineQuiz from '@/components/InlineQuiz'
import AttachmentsManager from '@/components/AttachmentsManager'
import NotesPanel from '@/components/NotesPanel'
import CourseProgressRing from '@/components/CourseProgressRing'
import LessonSummary from '@/components/LessonSummary'
import AIChatAssistant from '@/components/AIChatAssistant'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [lessonQuiz, setLessonQuiz] = useState<any>(null)
  const [quizPassed, setQuizPassed] = useState(false)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [issuingCertificate, setIssuingCertificate] = useState(false)

  useEffect(() => {
    // Reset lesson state when changing lessons
    setLesson(null)
    setLoading(true)
    setLessonQuiz(null)
    setQuizPassed(false)
    setIsCompleted(false)
    setProgressLoaded(false)
    
    checkAuth()
    loadLesson()
    loadCourse()
    loadLessons()
    loadQuizzes()
  }, [params.lessonId])

  // Load progress after user is authenticated
  useEffect(() => {
    if (user) {
      loadProgress()
    }
  }, [user, params.lessonId])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        checkEnrollment(data.user.id)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }

  const checkEnrollment = async (userId: string) => {
    try {
      const response = await fetch(`/api/enrollments/check?courseId=${params.courseId}&userId=${userId}`)
      const data = await response.json()
      setIsEnrolled(data.isEnrolled)
      if (data.enrollment) {
        setEnrollment(data.enrollment)
      }
    } catch (error) {
      console.error('Enrollment check error:', error)
    }
  }

  const loadLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${params.lessonId}`)
      const data = await response.json()

      if (data.success) {
        setLesson(data.lesson)
      }
    } catch (error) {
      console.error('Error loading lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}`)
      const data = await response.json()

      if (data.success) {
        setCourse(data.course)
        console.log('Course loaded:', {
          title: data.course.title,
          enforceSequentialLessons: data.course.enforceSequentialLessons
        })
      }
    } catch (error) {
      console.error('Error loading course:', error)
    }
  }

  const loadLessons = async () => {
    try {
      const response = await fetch(`/api/courses/${params.courseId}/lessons`)
      const data = await response.json()
      if (data.success) {
        setLessons(data.lessons)
      }
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }

  const loadQuizzes = async () => {
    try {
      const response = await fetch(`/api/quizzes?courseId=${params.courseId}`)
      const data = await response.json()
      if (data.success) {
        setQuizzes(data.quizzes || [])
        
        // البحث عن اختبار مرتبط بالدرس الحالي
        const currentLessonQuiz = (data.quizzes || []).find(
          (q: any) => q.lesson === params.lessonId || q.lesson?._id === params.lessonId
        )
        setLessonQuiz(currentLessonQuiz || null)
        
        // تحقق إذا كان الطالب قد اجتاز الاختبار مسبقاً
        if (currentLessonQuiz) {
          checkQuizAttempt(currentLessonQuiz._id)
        }
      }
    } catch (error) {
      console.error('Error loading quizzes:', error)
    }
  }

  const checkQuizAttempt = async (quizId: string) => {
    try {
      // استخدام API الموجود لجلب محاولات الاختبار
      const response = await fetch(`/api/quizzes/${quizId}/attempt`)
      const data = await response.json()
      if (data.success && data.attempts && data.attempts.length > 0) {
        // التحقق إذا كان هناك محاولة ناجحة
        const passedAttempt = data.attempts.find((a: any) => a.passed)
        if (passedAttempt) {
          setQuizPassed(true)
        }
      }
    } catch (error) {
      console.error('Error checking quiz attempt:', error)
    }
  }

  const handleQuizComplete = (passed: boolean, score: number) => {
    setQuizPassed(passed)
    if (passed && !isCompleted) {
      // تحديث تلقائي للدرس كمكتمل عند اجتياز الاختبار
      toggleComplete()
    }
  }

  const getCurrentLessonIndex = () => {
    return lessons.findIndex(l => l._id === params.lessonId)
  }

  const goToNextLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex < lessons.length - 1) {
      // Use window.location for full page reload to fix video player issues
      window.location.href = `/learn/${params.courseId}/${lessons[currentIndex + 1]._id}`
    }
  }

  const goToPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex > 0) {
      // Use window.location for full page reload to fix video player issues
      window.location.href = `/learn/${params.courseId}/${lessons[currentIndex - 1]._id}`
    }
  }

  const loadProgress = async () => {
    if (!user) {
      setProgressLoaded(true)
      return
    }
    
    try {
      const response = await fetch(`/api/progress?courseId=${params.courseId}`)
      const data = await response.json()
      
      console.log('Progress data loaded:', data)
      
      if (data.success && data.progress?.lessons) {
        // Set completed lessons
        const completed = new Set<string>(
          data.progress.lessons
            .filter((p: any) => p.completed)
            .map((p: any) => {
              const lessonId = p.lesson?._id || p.lesson
              return String(lessonId)
            })
        )
        setCompletedLessons(completed)
        
        console.log('Completed lessons:', Array.from(completed))
        
        // Check current lesson
        const currentLessonId = params.lessonId as string
        const lessonProgress = data.progress.lessons.find(
          (p: any) => {
            const lessonId = p.lesson?._id || p.lesson
            return String(lessonId) === currentLessonId
          }
        )
        
        if (lessonProgress) {
          setIsCompleted(lessonProgress.completed)
          console.log('Current lesson completed:', lessonProgress.completed)
        } else {
          setIsCompleted(false)
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setProgressLoaded(true)
    }
  }

  const toggleComplete = async () => {
    if (!user || markingComplete) return
    
    setMarkingComplete(true)
    const newCompletedState = !isCompleted
    
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: params.courseId,
          lessonId: params.lessonId,
          completed: newCompletedState,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsCompleted(newCompletedState)
        
        // تحديث قائمة الدروس المكتملة
        setCompletedLessons(prev => {
          const newSet = new Set(prev)
          if (newCompletedState) {
            newSet.add(params.lessonId as string)
          } else {
            newSet.delete(params.lessonId as string)
          }
          return newSet
        })
        
        // تحديث بيانات التسجيل إذا تم إرجاعها
        if (data.enrollment) {
          setEnrollment((prev: any) => ({
            ...prev,
            completionPercentage: data.enrollment.completionPercentage,
            status: data.enrollment.status
          }))
        }
        
        console.log('Progress updated successfully:', data)
      } else {
        console.error('Failed to update progress:', data.message)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    } finally {
      setMarkingComplete(false)
    }
  }

  const canAccessLesson = () => {
    if (!lesson) return false
    if (lesson.isFree) return true
    // السماح للأدمن بالوصول دائماً
    if (user?.role === 'admin') return true
    // السماح للمعلم بالوصول إذا كان صاحب الدورة
    if (user?.role === 'instructor' && course) {
      const isCourseOwner = course.instructor === user.id || course.instructor?._id === user.id
      if (isCourseOwner) return true
    }
    return isEnrolled
  }

  // التحقق من القفل التسلسلي
  const isLockedBySequentialOrder = () => {
    console.log('🔒 Checking sequential lock:', {
      enforceSequentialLessons: course?.enforceSequentialLessons,
      userRole: user?.role,
      userId: user?.id,
      courseInstructor: course?.instructor,
      lessonsCount: lessons.length,
      completedLessonsCount: completedLessons.size,
      completedLessons: Array.from(completedLessons),
      progressLoaded
    })
    
    if (!course?.enforceSequentialLessons) {
      console.log('❌ Sequential lessons NOT enforced')
      return false
    }
    
    if (user?.role === 'admin') {
      console.log('✅ User is admin - access granted')
      return false
    }
    
    if (user?.role === 'instructor' && course) {
      const instructorId = course.instructor?._id || course.instructor
      const isCourseOwner = instructorId === user.id || String(instructorId) === String(user.id)
      console.log('Instructor check:', { instructorId, userId: user.id, isCourseOwner })
      if (isCourseOwner) {
        console.log('✅ User is course owner - access granted')
        return false
      }
    }
    
    const currentIndex = lessons.findIndex(l => l._id === params.lessonId)
    console.log('Current lesson index:', currentIndex)
    if (currentIndex <= 0) {
      console.log('✅ First lesson - always accessible')
      return false
    }
    
    // التحقق من إكمال الدرس السابق
    const previousLesson = lessons[currentIndex - 1]
    const isPreviousCompleted = completedLessons.has(previousLesson?._id)
    console.log('Previous lesson:', previousLesson?._id, 'completed:', isPreviousCompleted)
    
    if (previousLesson && !isPreviousCompleted) {
      console.log('🔒 LOCKED - Previous lesson not completed')
      return true
    }
    
    console.log('✅ Access granted - previous lesson completed')
    return false
  }

  // التحقق من إكمال الدورة
  const isCourseCompleted = () => {
    if (!lessons.length) return false
    return lessons.every(l => completedLessons.has(l._id))
  }

  // التحقق من إمكانية الحصول على الشهادة
  const canGetCertificate = () => {
    if (!enrollment) return false
    if (!course?.certificateEnabled) return false
    if (enrollment.certificateIssued) return false
    return isCourseCompleted()
  }

  // إصدار الشهادة
  const handleIssueCertificate = async () => {
    if (!enrollment || issuingCertificate) return
    
    setIssuingCertificate(true)
    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId: enrollment._id }),
      })
      const data = await response.json()
      
      if (data.success) {
        alert('🎉 مبروك! تم إصدار شهادتك بنجاح!')
        // تحديث حالة الـ enrollment
        setEnrollment({ ...enrollment, certificateIssued: true })
        // الانتقال لصفحة الشهادة
        router.push(`/certificates/${data.certificate._id}`)
      } else {
        alert(data.message || 'حدث خطأ أثناء إصدار الشهادة')
      }
    } catch (error) {
      alert('حدث خطأ أثناء إصدار الشهادة')
    } finally {
      setIssuingCertificate(false)
    }
  }

  // انتظار تحميل كل البيانات المطلوبة
  const isDataLoading = loading || !course || lessons.length === 0 || (user && !progressLoaded)
  
  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الدرس غير موجود</h1>
          <Link href={`/courses/${params.courseId}`} className="text-primary-600 hover:underline">
            العودة للدورة
          </Link>
        </div>
      </div>
    )
  }

  if (!canAccessLesson()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">هذا الدرس مغلق</h1>
          <p className="text-gray-600 mb-6">
            يجب التسجيل في الدورة للوصول إلى هذا الدرس
          </p>
          <Link
            href={`/courses/${params.courseId}`}
            className="btn-primary inline-block"
          >
            التسجيل في الدورة
          </Link>
        </div>
      </div>
    )
  }

  const currentIndex = getCurrentLessonIndex()
  
  // التأكد من تحميل البيانات قبل التحقق من القفل
  const sequentialLocked = course && lessons.length > 0 ? isLockedBySequentialOrder() : false

  // عرض رسالة القفل التسلسلي
  if (sequentialLocked) {
    const previousLessonIndex = currentIndex - 1
    const previousLesson = lessons[previousLessonIndex]
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🔒 الدرس مقفل</h1>
          <p className="text-gray-600 mb-4">
            يجب إكمال الدرس السابق أولاً للوصول إلى هذا الدرس
          </p>
          {previousLesson && (
            <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium mb-2">الدرس المطلوب إكماله:</p>
              <p className="text-orange-900 font-bold">{previousLesson.title}</p>
            </div>
          )}
          <Link
            href={previousLesson ? `/learn/${params.courseId}/${previousLesson._id}` : `/courses/${params.courseId}`}
            className="btn-primary inline-block"
          >
            {previousLesson ? 'الذهاب للدرس السابق' : 'العودة للدورة'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/courses/${params.courseId}`}
              className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-primary-600 transition-colors flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-base hidden sm:inline">العودة للدورة</span>
            </Link>

            <div className="text-center flex-1 min-w-0 px-2">
              <h1 className="text-sm md:text-xl font-bold text-gray-900 truncate">{course?.title}</h1>
              <p className="text-xs md:text-sm text-gray-600">
                {currentIndex + 1}/{lessons.length}
              </p>
            </div>

            <div className="w-8 md:w-32"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Lesson Header - Compact */}
            <div className="bg-white rounded-xl shadow-md p-3 md:p-4 mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base md:text-xl font-bold text-gray-900 truncate">
                    {lesson.title}
                  </h1>
                  <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500">
                    {(lesson.content?.duration || lesson.duration) && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{lesson.content?.duration || lesson.duration} د</span>
                      </div>
                    )}
                    {lesson.isFree && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        مجاني
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {lesson.description && (
                <p className="text-xs md:text-sm text-gray-600 mt-2 pr-10 md:pr-12 line-clamp-2">{lesson.description}</p>
              )}
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8 mb-4 md:mb-6">
              <div className="prose prose-lg max-w-none">
                {/* Video Content */}
                {lesson.type === 'video' && lesson.content?.videoUrl && (
                  <div className="mb-6">
                    <UniversalVideoPlayer 
                      key={`video-${params.lessonId}`}
                      videoUrl={lesson.content.videoUrl}
                      videoProvider={lesson.content.videoProvider || 'youtube'}
                      title={lesson.title}
                      studentName={user?.name}
                    />
                  </div>
                )}

                {/* PDF Content */}
                {lesson.type === 'pdf' && lesson.content?.pdfUrl && (
                  <div className="mb-6">
                    <PDFViewer 
                      pdfUrl={lesson.content.pdfUrl}
                      title={lesson.title}
                      studentName={user?.name}
                    />
                  </div>
                )}

                {/* Presentation Content */}
                {lesson.type === 'presentation' && lesson.content?.presentationUrl && (
                  <div className="mb-6">
                    <PresentationViewer 
                      presentationUrl={lesson.content.presentationUrl}
                      presentationType={lesson.content.presentationType || 'google-slides'}
                      title={lesson.title}
                      studentName={user?.name}
                    />
                  </div>
                )}

                {/* HTML5 Content */}
                {lesson.type === 'html5' && lesson.content?.html5Content && (
                  <div className="mb-6">
                    <HTML5Viewer 
                      html5Content={lesson.content.html5Content}
                      title={lesson.title}
                      studentName={user?.name}
                    />
                  </div>
                )}

                {/* Text Content */}
                {lesson.type === 'text' && lesson.content?.textContent && (
                  <div className="mb-6">
                    <TextViewer 
                      textContent={lesson.content.textContent}
                      title={lesson.title}
                      studentName={user?.name}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Summary - ملخص الدرس */}
            <div className="mb-4 md:mb-6">
              <LessonSummary lessonId={params.lessonId as string} lessonTitle={lesson.title} />
            </div>

            {/* Attachments - الملفات المرفقة */}
            {lesson.attachments && lesson.attachments.length > 0 && (
              <div className="mb-4 md:mb-6">
                <AttachmentsManager
                  attachments={lesson.attachments}
                  onChange={() => {}}
                  readOnly={true}
                />
              </div>
            )}

            {/* Notes Panel - الملاحظات */}
            {user && (
              <div className="mb-4 md:mb-6">
                <NotesPanel
                  courseId={params.courseId as string}
                  lessonId={params.lessonId as string}
                />
              </div>
            )}

            {/* Lesson Quiz - اختبار الدرس */}
            {lessonQuiz && (
              <div className="mb-4 md:mb-6">
                {quizPassed ? (
                  <div className="bg-green-50 border-2 border-green-300 rounded-xl md:rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">✅ تم اجتياز الاختبار</h3>
                    <p className="text-green-700">أحسنت! لقد اجتزت اختبار هذا الدرس بنجاح</p>
                  </div>
                ) : (
                  <InlineQuiz
                    quiz={lessonQuiz}
                    lessonId={params.lessonId as string}
                    onComplete={handleQuizComplete}
                    required={course?.enforceSequentialLessons}
                  />
                )}
              </div>
            )}

            {/* Complete Button */}
            {user && (
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
                <button
                  onClick={toggleComplete}
                  disabled={markingComplete || (lessonQuiz && !quizPassed && course?.enforceSequentialLessons)}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold transition-all ${
                    isCompleted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${(markingComplete || (lessonQuiz && !quizPassed && course?.enforceSequentialLessons)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      <span>تم الإكمال ✓</span>
                    </>
                  ) : lessonQuiz && !quizPassed && course?.enforceSequentialLessons ? (
                    <>
                      <Lock className="w-6 h-6" />
                      <span>اجتز الاختبار أولاً</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-6 h-6" />
                      <span>وضع علامة كمكتمل</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2 md:gap-4">
              <button
                onClick={goToPreviousLesson}
                disabled={currentIndex === 0}
                className={`flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-colors ${
                  currentIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">الدرس السابق</span>
                <span className="sm:hidden">السابق</span>
              </button>

              {(() => {
                const isLastLesson = currentIndex === lessons.length - 1
                const needsQuizPass = lessonQuiz && !quizPassed && course?.enforceSequentialLessons
                const needsCompletion = course?.enforceSequentialLessons && !isCompleted && !lessonQuiz
                const isDisabled = isLastLesson || needsQuizPass || needsCompletion

                return (
                  <button
                    onClick={goToNextLesson}
                    disabled={isDisabled}
                    className={`flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-colors ${
                      isDisabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                    }`}
                    title={needsQuizPass ? 'يجب اجتياز الاختبار أولاً' : needsCompletion ? 'يجب إنهاء الدرس أولاً' : ''}
                  >
                    {needsQuizPass ? (
                      <>
                        <Lock className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">اجتز الاختبار</span>
                        <span className="sm:hidden">مقفل</span>
                      </>
                    ) : needsCompletion ? (
                      <>
                        <Lock className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">أنهِ الدرس</span>
                        <span className="sm:hidden">مقفل</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">الدرس التالي</span>
                        <span className="sm:hidden">التالي</span>
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                      </>
                    )}
                  </button>
                )
              })()}
            </div>

          </div>

          {/* Sidebar - Lessons List */}
          <div className="lg:col-span-1">
            {/* Course Progress Ring */}
            {enrollment && (
              <div className="bg-white rounded-xl shadow-lg p-4 mb-4 flex items-center justify-center">
                <CourseProgressRing 
                  progress={enrollment.completionPercentage || 0}
                  size={100}
                />
              </div>
            )}

            {/* Certificate Banner */}
            {canGetCertificate() && (
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-4 text-center">
                <Award className="w-12 h-12 text-white mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">🎉 مبروك!</h3>
                <p className="text-white/90 text-sm mb-4">لقد أكملت جميع دروس الدورة</p>
                <button
                  onClick={handleIssueCertificate}
                  disabled={issuingCertificate}
                  className="w-full bg-white text-amber-600 font-bold py-3 px-4 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {issuingCertificate ? (
                    <>
                      <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الإصدار...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      <span>احصل على شهادتك</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Show certificate link if already issued */}
            {enrollment?.certificateIssued && (
              <Link
                href="/student/certificates"
                className="block bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 text-center hover:bg-green-100 transition-colors"
              >
                <Award className="w-10 h-10 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-semibold">لديك شهادة لهذه الدورة</p>
                <p className="text-green-600 text-sm">انقر لعرض شهاداتك ←</p>
              </Link>
            )}

            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">محتوى الدورة</h2>
              <div className="space-y-2 max-h-96 lg:max-h-[calc(100vh-200px)] overflow-y-auto">
                {lessons.map((l, index) => {
                  const isCurrentLesson = l._id === params.lessonId
                  const isAdmin = user?.role === 'admin' || user?.role === 'instructor'
                  
                  // التحقق من إمكانية الوصول للدرس
                  let canAccess = l.isFree || isEnrolled || isAdmin
                  
                  // إذا كان إجبار الترتيب مفعّل، تحقق من إكمال الدروس السابقة
                  let isLockedBySequence = false
                  if (canAccess && course?.enforceSequentialLessons && !isAdmin && index > 0) {
                    // الدرس الأول دائماً متاح
                    // الدروس التالية تحتاج إكمال الدرس السابق
                    const previousLesson = lessons[index - 1]
                    if (previousLesson && !completedLessons.has(previousLesson._id)) {
                      isLockedBySequence = true
                      canAccess = false
                    }
                  }

                  // البحث عن اختبار مرتبط بهذا الدرس
                  const relatedQuiz = quizzes.find(
                    (q: any) => q.lesson === l._id || q.lesson?._id === l._id
                  )

                  return (
                    <div key={l._id}>
                      {/* الدرس */}
                      <button
                        onClick={() => canAccess && (window.location.href = `/learn/${params.courseId}/${l._id}`)}
                        disabled={!canAccess}
                        className={`w-full text-right p-3 md:p-4 rounded-lg transition-colors ${
                          isCurrentLesson
                            ? 'bg-primary-100 border-2 border-primary-600'
                            : canAccess
                            ? 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                            : 'bg-gray-50 opacity-50 cursor-not-allowed border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isCurrentLesson
                              ? 'bg-primary-600 text-white'
                              : canAccess
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {canAccess ? (
                              <span className="text-xs md:text-sm font-bold">{index + 1}</span>
                            ) : (
                              <Lock className="w-3 h-3 md:w-4 md:h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`font-semibold text-xs md:text-sm mb-1 ${
                                isCurrentLesson ? 'text-primary-900' : 'text-gray-900'
                              }`}>
                                {l.title}
                              </p>
                              {completedLessons.has(l._id) && (
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {l.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {l.duration}
                                </span>
                              )}
                              {l.isFree && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold text-xs">
                                  مجاني
                                </span>
                              )}
                              {isLockedBySequence && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold text-xs">
                                  أكمل الدرس السابق
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      {/* اختبار الدرس (إن وجد) */}
                      {relatedQuiz && (
                        <button
                          onClick={() => {
                            // التحقق من إمكانية الوصول للاختبار
                            if (course?.enforceSequentialLessons && !isAdmin && !completedLessons.has(l._id)) {
                              alert('يجب إكمال الدرس أولاً قبل الاختبار')
                              return
                            }
                            router.push(`/quiz/${relatedQuiz._id}`)
                          }}
                          disabled={course?.enforceSequentialLessons && !isAdmin && !completedLessons.has(l._id)}
                          className={`w-full text-right p-2 md:p-3 mr-6 md:mr-8 rounded-lg transition-colors mt-1 ${
                            course?.enforceSequentialLessons && !isAdmin && !completedLessons.has(l._id)
                              ? 'bg-purple-50 opacity-50 cursor-not-allowed border border-purple-200'
                              : 'bg-purple-50 hover:bg-purple-100 border border-purple-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-purple-600 text-white">
                              <FileQuestion className="w-3 h-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs text-purple-900">
                                📝 {relatedQuiz.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-purple-600">
                                <span>{relatedQuiz.questions?.length || 0} سؤال</span>
                                {relatedQuiz.timeLimit && <span>• {relatedQuiz.timeLimit} د</span>}
                                {course?.enforceSequentialLessons && !completedLessons.has(l._id) && (
                                  <span className="text-orange-600">🔒 أكمل الدرس أولاً</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  )
                })}
                
                {/* الاختبارات العامة (غير المرتبطة بدرس معين) */}
                {quizzes.filter(q => !q.lesson).length > 0 && (
                  <>
                    <div className="border-t pt-3 md:pt-4 mt-3 md:mt-4">
                      <h3 className="text-xs md:text-sm font-bold text-gray-700 mb-2">اختبارات عامة</h3>
                    </div>
                    {quizzes.filter(q => !q.lesson).map((quiz) => (
                      <button
                        key={quiz._id}
                        onClick={() => router.push(`/quiz/${quiz._id}`)}
                        className="w-full text-right p-3 md:p-4 rounded-lg transition-colors bg-purple-50 hover:bg-purple-100 border-2 border-purple-200"
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-600 text-white">
                            <FileQuestion className="w-3 h-3 md:w-4 md:h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs md:text-sm mb-1 text-purple-900">
                              {quiz.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-purple-700">
                              <span className="flex items-center gap-1">
                                <FileQuestion className="w-3 h-3" />
                                {quiz.questions?.length || 0} سؤال
                              </span>
                              {quiz.timeLimit && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {quiz.timeLimit} دقيقة
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Chat Assistant */}
      <AIChatAssistant 
        courseId={params.courseId as string}
        lessonId={params.lessonId as string}
        courseTitle={course?.title}
        lessonTitle={lesson?.title}
      />
    </div>
  )
}
