'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { BookOpen, Play, Award, Clock, TrendingUp, Search } from 'lucide-react'

function MyCoursesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const urlFilter = searchParams.get('filter')
    if (urlFilter) setFilter(urlFilter)
    loadEnrollments()
  }, [searchParams])

  const loadEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      if (data.success) setEnrollments(data.enrollments)
      else router.push('/login')
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filter === 'in-progress' && enrollment.completionPercentage >= 100) return false
    if (filter === 'completed' && enrollment.completionPercentage < 100) return false
    if (searchTerm) return enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    return true
  })

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">دوراتي</h1>
          <p className="text-gray-600">تابع تقدمك في الدورات المسجل فيها</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لم تسجل في أي دورة بعد</h3>
            <p className="text-gray-600 mb-6">استكشف دوراتنا وابدأ رحلتك التعليمية</p>
            <button onClick={() => router.push('/courses')} className="btn-primary">استكشف الدورات</button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ابحث عن دورة..." className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[{ value: 'all', label: 'الكل' }, { value: 'in-progress', label: 'قيد التقدم' }, { value: 'completed', label: 'مكتملة' }].map((f) => (
                    <button key={f.value} onClick={() => setFilter(f.value)} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === f.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><BookOpen className="w-6 h-6 text-blue-600" /></div>
                  <div><div className="text-2xl font-bold text-gray-900">{enrollments.length}</div><div className="text-sm text-gray-600">إجمالي الدورات</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-green-600" /></div>
                  <div><div className="text-2xl font-bold text-gray-900">{enrollments.filter((e) => e.completionPercentage < 100).length}</div><div className="text-sm text-gray-600">قيد التقدم</div></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><Award className="w-6 h-6 text-purple-600" /></div>
                  <div><div className="text-2xl font-bold text-gray-900">{enrollments.filter((e) => e.certificateIssued).length}</div><div className="text-sm text-gray-600">شهادات مكتسبة</div></div>
                </div>
              </div>
            </div>

            {filteredEnrollments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center"><p className="text-gray-600">لا توجد دورات تطابق البحث</p></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.map((enrollment) => (
                  <div key={enrollment._id} className="card group">
                    <div className="bg-gradient-to-br from-primary-500 to-secondary-500 h-40 flex items-center justify-center text-6xl relative overflow-hidden">
                      {enrollment.course.image}
                      {enrollment.completionPercentage === 100 && <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">مكتمل</div>}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{enrollment.course.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{enrollment.course.description}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">التقدم</span><span className="font-semibold text-primary-600">{enrollment.completionPercentage}%</span></div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-600 to-secondary-600 transition-all duration-300" style={{ width: `${enrollment.completionPercentage}%` }}></div></div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" /><span>{enrollment.course.lessons} درس</span></div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{enrollment.course.duration}</span></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/courses/${enrollment.course._id}`)} className="flex-1 btn-primary flex items-center justify-center gap-2">
                          <Play className="w-4 h-4" /><span>{enrollment.completionPercentage === 0 ? 'ابدأ' : enrollment.completionPercentage === 100 ? 'مراجعة' : 'متابعة'}</span>
                        </button>
                        {enrollment.certificateIssued && <button onClick={() => router.push(`/student/certificates`)} className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="عرض الشهادة"><Award className="w-5 h-5" /></button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default function MyCoursesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <MyCoursesContent />
      </Suspense>
      <Footer />
    </main>
  )
}
