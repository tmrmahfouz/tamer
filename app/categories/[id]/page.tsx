'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ArrowRight, BookOpen, Loader2, Clock, Users, Star, Grid, List } from 'lucide-react'

interface Category {
  _id: string
  name: string
  nameEn?: string
  description?: string
  icon?: string
  color?: string
  coursesCount?: number
  parentCategory?: string | null
  subcategories?: string[]
}

interface Course {
  _id: string
  title: string
  description: string
  image?: string
  price: number
  duration: string
  level: string
  students?: number
  rating?: number
  category: string
  subcategory?: string
}

export default function CategoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const categoryId = params.id as string
  const subcategoryParam = searchParams.get('sub')
  
  const [category, setCategory] = useState<Category | null>(null)
  const [parentCategory, setParentCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategoryParam)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'subcategories' | 'courses'>('subcategories')

  useEffect(() => {
    if (categoryId) {
      loadCategoryData()
    }
  }, [categoryId])

  useEffect(() => {
    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam)
      setViewMode('courses')
    }
  }, [subcategoryParam])

  useEffect(() => {
    filterCourses()
  }, [selectedSubcategory, courses])

  const loadCategoryData = async () => {
    try {
      setLoading(true)
      
      // Load current category
      const catRes = await fetch(`/api/categories/${categoryId}`)
      const catData = await catRes.json()
      
      if (catData.success) {
        setCategory(catData.category)
        
        // If this is a subcategory, load parent
        if (catData.category.parentCategory) {
          const parentRes = await fetch(`/api/categories/${catData.category.parentCategory}`)
          const parentData = await parentRes.json()
          if (parentData.success) {
            setParentCategory(parentData.category)
          }
        }
      }

      // Load all categories to find subcategories
      const allRes = await fetch('/api/categories?published=true')
      const allData = await allRes.json()
      
      if (allData.success) {
        const subs = allData.categories.filter(
          (cat: Category) => cat.parentCategory === categoryId
        )
        setSubcategories(subs)
        
        // If no subcategories, show courses directly
        if (subs.length === 0) {
          setViewMode('courses')
        }
      }

      // Load courses for this category
      const coursesRes = await fetch('/api/courses')
      const coursesData = await coursesRes.json()
      
      if (coursesData.success) {
        // Filter courses that belong to this category or its subcategories
        const categoryIds = [categoryId]
        if (allData.success) {
          const subIds = allData.categories
            .filter((cat: Category) => cat.parentCategory === categoryId)
            .map((cat: Category) => cat._id)
          categoryIds.push(...subIds)
        }
        
        const categoryCourses = coursesData.courses.filter(
          (course: Course) => categoryIds.includes(course.category)
        )
        setCourses(categoryCourses)
        setFilteredCourses(categoryCourses)
      }
    } catch (error) {
      console.error('Error loading category:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    if (!selectedSubcategory) {
      setFilteredCourses(courses)
    } else {
      const filtered = courses.filter(course => course.category === selectedSubcategory)
      setFilteredCourses(filtered)
    }
  }

  const handleSubcategoryClick = (subId: string) => {
    setSelectedSubcategory(subId)
    setViewMode('courses')
    // Update URL without reload
    window.history.pushState({}, '', `/categories/${categoryId}?sub=${subId}`)
  }

  const handleShowAllCourses = () => {
    setSelectedSubcategory(null)
    setViewMode('courses')
    window.history.pushState({}, '', `/categories/${categoryId}`)
  }

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null)
    setViewMode('subcategories')
    window.history.pushState({}, '', `/categories/${categoryId}`)
  }

  const getSelectedSubcategoryName = () => {
    if (!selectedSubcategory) return null
    const sub = subcategories.find(s => s._id === selectedSubcategory)
    return sub?.name || null
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
        <Footer />
      </main>
    )
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-xl text-gray-600">الفئة غير موجودة</p>
          <Link href="/" className="mt-4 text-primary-600 hover:underline">
            العودة للرئيسية
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="py-16 px-4"
        style={{ backgroundColor: (category.color || '#3B82F6') + '15' }}
      >
        <div className="container mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
            <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
            <ArrowRight className="w-4 h-4" />
            {parentCategory ? (
              <>
                <Link href={`/categories/${parentCategory._id}`} className="hover:text-primary-600">
                  {parentCategory.name}
                </Link>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : null}
            <span className="text-gray-900 font-medium">{category.name}</span>
            {selectedSubcategory && getSelectedSubcategoryName() && (
              <>
                <ArrowRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">{getSelectedSubcategoryName()}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
              style={{ backgroundColor: (category.color || '#3B82F6') + '30' }}
            >
              {category.icon || '📚'}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {selectedSubcategory ? getSelectedSubcategoryName() : category.name}
              </h1>
              {category.nameEn && !selectedSubcategory && (
                <p className="text-lg text-gray-500">{category.nameEn}</p>
              )}
              {category.description && !selectedSubcategory && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {selectedSubcategory ? filteredCourses.length : courses.length} دورة متاحة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          
          {/* View Toggle for categories with subcategories */}
          {subcategories.length > 0 && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                {viewMode === 'courses' && selectedSubcategory && (
                  <button
                    onClick={handleBackToSubcategories}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    العودة للفئات الفرعية
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('subcategories')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'subcategories' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title="عرض الفئات الفرعية"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShowAllCourses}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'courses' && !selectedSubcategory
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title="عرض جميع الدورات"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Subcategories View */}
          {viewMode === 'subcategories' && subcategories.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                اختر التخصص ({subcategories.length})
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategories.map((sub) => {
                  const subCoursesCount = courses.filter(c => c.category === sub._id).length
                  return (
                    <button
                      key={sub._id}
                      onClick={() => handleSubcategoryClick(sub._id)}
                      className="group text-right"
                    >
                      <div 
                        className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all hover:-translate-y-1"
                        style={{ borderTop: `4px solid ${sub.color || category.color || '#3B82F6'}` }}
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: (sub.color || category.color || '#3B82F6') + '20' }}
                          >
                            {sub.icon || category.icon || '📚'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {sub.name}
                            </h3>
                            {sub.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sub.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-3 text-primary-600">
                              <BookOpen className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {subCoursesCount} دورة
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Show all courses button */}
              <div className="text-center mt-8">
                <button
                  onClick={handleShowAllCourses}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  عرض جميع الدورات ({courses.length})
                </button>
              </div>
            </>
          )}

          {/* Courses View */}
          {(viewMode === 'courses' || subcategories.length === 0) && (
            <>
              {/* Subcategory filter tabs */}
              {subcategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  <button
                    onClick={() => {
                      setSelectedSubcategory(null)
                      window.history.pushState({}, '', `/categories/${categoryId}`)
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      !selectedSubcategory
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    الكل ({courses.length})
                  </button>
                  {subcategories.map((sub) => {
                    const count = courses.filter(c => c.category === sub._id).length
                    return (
                      <button
                        key={sub._id}
                        onClick={() => handleSubcategoryClick(sub._id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          selectedSubcategory === sub._id
                            ? 'text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        style={{
                          backgroundColor: selectedSubcategory === sub._id 
                            ? (sub.color || category.color || '#3B82F6') 
                            : undefined
                        }}
                      >
                        {sub.icon} {sub.name} ({count})
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Courses Grid */}
              {filteredCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course) => (
                    <Link
                      key={course._id}
                      href={`/courses/${course._id}`}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow group"
                    >
                      {/* Course Image */}
                      <div 
                        className="h-48 flex items-center justify-center text-6xl"
                        style={{ 
                          background: `linear-gradient(135deg, ${category.color || '#3B82F6'} 0%, ${category.color || '#3B82F6'}99 100%)` 
                        }}
                      >
                        {course.image || '📚'}
                      </div>

                      {/* Course Content */}
                      <div className="p-6">
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {course.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
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
                            <span>{course.rating || 5}</span>
                          </div>
                        </div>

                        {/* Price and Level */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <span 
                            className="text-2xl font-bold"
                            style={{ color: category.color || '#3B82F6' }}
                          >
                            {course.price} جنيه
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    لا توجد دورات
                  </h3>
                  <p className="text-gray-600">
                    لا توجد دورات متاحة في هذه الفئة حالياً
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
