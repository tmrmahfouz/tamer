'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SearchBar from '@/components/SearchBar'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['البرمجة', 'الذكاء الاصطناعي', 'تحليل البيانات', 'تطوير التطبيقات', 'الأمن السيبراني']
  const levels = ['مبتدئ', 'متوسط', 'متقدم']

  useEffect(() => {
    searchCourses()
  }, [query, filters])

  const searchCourses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()

      if (data.success) {
        let filtered = data.courses

        // البحث في العنوان والوصف
        if (query) {
          filtered = filtered.filter((course: any) =>
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase())
          )
        }

        // تطبيق الفلاتر
        if (filters.category) {
          filtered = filtered.filter((c: any) => c.category === filters.category)
        }
        if (filters.level) {
          filtered = filtered.filter((c: any) => c.level === filters.level)
        }
        if (filters.minPrice) {
          filtered = filtered.filter((c: any) => c.price >= parseInt(filters.minPrice))
        }
        if (filters.maxPrice) {
          filtered = filtered.filter((c: any) => c.price <= parseInt(filters.maxPrice))
        }
        if (filters.rating) {
          filtered = filtered.filter((c: any) => c.rating >= parseInt(filters.rating))
        }

        setCourses(filtered)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              نتائج البحث {query && `عن "${query}"`}
            </h1>
            <div className="flex gap-4">
              <div className="flex-1">
                <SearchBar />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-600 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>فلترة</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">الفلاتر</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      مسح الكل
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        التصنيف
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-900 dark:text-gray-100"
                      >
                        <option value="">الكل</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Level */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        المستوى
                      </label>
                      <select
                        value={filters.level}
                        onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-900 dark:text-gray-100"
                      >
                        <option value="">الكل</option>
                        {levels.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        السعر
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="من"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-900 dark:text-gray-100"
                        />
                        <input
                          type="number"
                          placeholder="إلى"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        التقييم
                      </label>
                      <select
                        value={filters.rating}
                        onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-900 dark:text-gray-100"
                      >
                        <option value="">الكل</option>
                        <option value="4">4+ نجوم</option>
                        <option value="3">3+ نجوم</option>
                        <option value="2">2+ نجوم</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    لا توجد نتائج
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    جرب كلمات بحث أخرى أو قم بتعديل الفلاتر
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-gray-600 dark:text-gray-400">
                    وجدنا {courses.length} دورة
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div
                        key={course._id}
                        onClick={() => router.push(`/courses/${course._id}`)}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                      >
                        <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-6xl">
                          {course.image}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold">
                              {course.category}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                              {course.level}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                              {course.price} جنيه
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
