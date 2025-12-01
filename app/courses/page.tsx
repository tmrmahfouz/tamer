'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Clock, Users, Star, BookOpen, Search } from 'lucide-react'

interface Category {
  _id: string
  name: string
  icon?: string
  color?: string
  parentCategory?: string | null
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [mainCategories, setMainCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Check for category filter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const categoryParam = urlParams.get('category')
    if (categoryParam && allCategories.length > 0) {
      // Check if it's a main category or subcategory
      const cat = allCategories.find(c => c._id === categoryParam)
      if (cat) {
        if (cat.parentCategory) {
          // It's a subcategory
          setSelectedCategory(cat.parentCategory)
          setSelectedSubcategory(categoryParam)
        } else {
          // It's a main category
          setSelectedCategory(categoryParam)
        }
      }
    }
  }, [allCategories])

  useEffect(() => {
    // Update subcategories when main category changes
    if (selectedCategory !== 'all') {
      const subs = allCategories
        .filter(cat => cat.parentCategory === selectedCategory)
        .sort((a: Category, b: Category) => ((a as any).order || 0) - ((b as any).order || 0))
      setSubcategories(subs)
    } else {
      setSubcategories([])
    }
    setSelectedSubcategory('all')
  }, [selectedCategory, allCategories])

  useEffect(() => {
    filterCourses()
  }, [searchTerm, selectedCategory, selectedSubcategory, courses])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load courses and categories in parallel
      const [coursesRes, categoriesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/categories?published=true')
      ])
      
      const coursesData = await coursesRes.json()
      const categoriesData = await categoriesRes.json()

      if (coursesData.success) {
        setCourses(coursesData.courses || [])
        setFilteredCourses(coursesData.courses || [])
      }

      if (categoriesData.success) {
        const cats = categoriesData.categories || []
        setAllCategories(cats)
        // Main categories are those without parentCategory, sorted by order
        setMainCategories(
          cats
            .filter((cat: Category) => !cat.parentCategory)
            .sort((a: Category, b: Category) => ((a as any).order || 0) - ((b as any).order || 0))
        )
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedSubcategory !== 'all') {
        // Filter by specific subcategory
        filtered = filtered.filter(course => course.category === selectedSubcategory)
      } else {
        // Filter by main category and all its subcategories
        const categoryIds = [selectedCategory]
        const subCats = allCategories.filter(cat => cat.parentCategory === selectedCategory)
        categoryIds.push(...subCats.map(cat => cat._id))
        filtered = filtered.filter(course => categoryIds.includes(course.category))
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCourses(filtered)
  }

  const getCategoryInfo = (categoryId: string) => {
    const category = allCategories.find(c => c._id === categoryId)
    if (category) {
      // If it's a subcategory, get parent info too
      if (category.parentCategory) {
        const parent = allCategories.find(c => c._id === category.parentCategory)
        return {
          name: category.name,
          icon: category.icon || parent?.icon || '📚',
          color: category.color || parent?.color || '#3B82F6'
        }
      }
      return {
        name: category.name,
        icon: category.icon || '📚',
        color: category.color || '#3B82F6'
      }
    }
    return { name: categoryId, icon: '📚', color: '#3B82F6' }
  }

  const getCoursesCountForCategory = (categoryId: string, isMain: boolean = false) => {
    if (isMain) {
      // Count courses in main category and all subcategories
      const categoryIds = [categoryId]
      const subCats = allCategories.filter(cat => cat.parentCategory === categoryId)
      categoryIds.push(...subCats.map(cat => cat._id))
      return courses.filter(course => categoryIds.includes(course.category)).length
    }
    return courses.filter(course => course.category === categoryId).length
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              جميع الدورات
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              اختر الدورة المناسبة لك وابدأ رحلتك التعليمية
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن دورة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600"
              />
            </div>
          </div>

          {/* Main Categories */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                📚 الكل ({courses.length})
              </button>
              {mainCategories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedCategory === category._id
                      ? 'text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category._id ? (category.color || '#3B82F6') : undefined,
                  }}
                >
                  {category.icon} {category.name} ({getCoursesCountForCategory(category._id, true)})
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="mb-8 p-4 bg-white rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 text-center">التخصصات:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedSubcategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedSubcategory === 'all'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  الكل
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() => setSelectedSubcategory(sub._id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedSubcategory === sub._id
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedSubcategory === sub._id ? (sub.color || '#3B82F6') : undefined,
                    }}
                  >
                    {sub.icon} {sub.name} ({getCoursesCountForCategory(sub._id)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => {
                const catInfo = getCategoryInfo(course.category)
                return (
                  <Link
                    key={course._id}
                    href={`/courses/${course._id}`}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow group"
                  >
                    {/* Course Image */}
                    <div 
                      className="h-48 flex items-center justify-center text-6xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${catInfo.color} 0%, ${catInfo.color}99 100%)` 
                      }}
                    >
                      {course.image || '📚'}
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      {/* Category Badge */}
                      <div 
                        className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3"
                        style={{ 
                          backgroundColor: `${catInfo.color}20`,
                          color: catInfo.color
                        }}
                      >
                        {catInfo.icon} {catInfo.name}
                      </div>

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
                          style={{ color: catInfo.color }}
                        >
                          {course.price} جنيه
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                          {course.level}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لا توجد دورات
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all'
                  ? 'لم يتم العثور على دورات تطابق البحث'
                  : 'لا توجد دورات متاحة حالياً'}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
