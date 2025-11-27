'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Users, Star, ArrowLeft } from 'lucide-react'

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load courses and categories in parallel
      const [coursesRes, categoriesRes] = await Promise.all([
        fetch('/api/courses?published=true'),
        fetch('/api/categories?published=true')
      ])

      const coursesData = await coursesRes.json()
      const categoriesData = await categoriesRes.json()

      if (coursesData.success) {
        // Show only first 6 courses
        setCourses(coursesData.courses.slice(0, 6))
      }

      if (categoriesData.success) {
        setCategories(categoriesData.categories)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId)
    return category ? `${category.icon} ${category.name}` : 'دورة'
  }

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  if (courses.length === 0) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">الدورات التدريبية</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              لا توجد دورات متاحة حالياً
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">الدورات التدريبية</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            اختر من بين مجموعة متنوعة من الدورات المصممة خصيصاً لتطوير مهاراتك
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course._id} className="card group">
              {/* Course Image/Icon */}
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 h-48 flex items-center justify-center text-8xl">
                {course.image || '📚'}
              </div>

              <div className="p-6">
                {/* Category Badge */}
                <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  {getCategoryName(course.category)}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Topics */}
                {course.topics && course.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.topics.slice(0, 3).map((topic: string, idx: number) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating || 5.0}</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-2xl font-bold text-primary-600">
                    {course.price} جنيه
                  </div>
                  <Link 
                    href={`/courses/${course._id}`}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <span>التفاصيل</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/courses" className="btn-primary inline-flex items-center gap-2">
            <span>عرض جميع الدورات</span>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
