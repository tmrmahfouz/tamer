'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { 
  Clock, Users, Star, BookOpen, Search, 
  Code, Palette, TrendingUp, Brain, Briefcase, 
  Languages, Camera, Video, Laptop, Database,
  Smartphone, Layout, Server, Globe, Zap,
  PenTool, Target, Mail, LineChart, MessageSquare,
  Cpu, Eye, Bot, Rocket, Users2,
  FileText, Calculator, DollarSign, BarChart3, Award
} from 'lucide-react'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('الكل')
  const [selectedSubcategory, setSelectedSubcategory] = useState('الكل')
  const [showSubcategories, setShowSubcategories] = useState(false)
  const [currentCategorySubcategories, setCurrentCategorySubcategories] = useState<string[]>([])

  useEffect(() => {
    loadCourses()
    loadCategories()
    
    // Check for category filter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const categoryParam = urlParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchTerm, selectedCategory, selectedSubcategory, courses])
  
  useEffect(() => {
    // When category changes, check if it has subcategories
    if (selectedCategory !== 'الكل') {
      const category = categories.find(cat => cat._id === selectedCategory)
      if (category && category.subcategories && category.subcategories.length > 0) {
        setCurrentCategorySubcategories(category.subcategories)
        setShowSubcategories(true)
        setSelectedSubcategory('الكل')
      } else {
        setShowSubcategories(false)
        setCurrentCategorySubcategories([])
        setSelectedSubcategory('الكل')
      }
    } else {
      setShowSubcategories(false)
      setCurrentCategorySubcategories([])
      setSelectedSubcategory('الكل')
    }
  }, [selectedCategory, categories])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses || [])
        setFilteredCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?published=true')
      const data = await response.json()

      if (data.success) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    // Filter by category
    if (selectedCategory !== 'الكل') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    // Filter by subcategory
    if (selectedSubcategory !== 'الكل') {
      filtered = filtered.filter(course => course.subcategory === selectedSubcategory)
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

  // Function to get icon for subcategory
  const getSubcategoryIcon = (subcategoryName: string) => {
    const iconMap: { [key: string]: any } = {
      // البرمجة
      'تطوير الويب الأمامي (Frontend)': Code,
      'تطوير الويب الخلفي (Backend)': Server,
      'تطوير Full Stack': Laptop,
      'تطوير تطبيقات الموبايل': Smartphone,
      'برمجة قواعد البيانات': Database,
      
      // التصميم
      'تصميم الشعارات': Zap,
      'تصميم الهوية البصرية': Award,
      'تصميم الإعلانات': Target,
      'تصميم واجهات المستخدم (UI)': Layout,
      'تصميم تجربة المستخدم (UX)': Users2,
      
      // التسويق
      'التسويق عبر وسائل التواصل الاجتماعي': MessageSquare,
      'تحسين محركات البحث (SEO)': TrendingUp,
      'التسويق بالمحتوى': FileText,
      'الإعلانات المدفوعة': DollarSign,
      'التسويق بالبريد الإلكتروني': Mail,
      
      // الذكاء الاصطناعي
      'التعلم الآلي (Machine Learning)': Brain,
      'التعلم العميق (Deep Learning)': Cpu,
      'معالجة اللغات الطبيعية (NLP)': Languages,
      'رؤية الحاسوب (Computer Vision)': Eye,
      'الروبوتات والأتمتة': Bot,
      
      // إدارة الأعمال
      'إدارة المشاريع': Briefcase,
      'ريادة الأعمال': Rocket,
      'إدارة الموارد البشرية': Users2,
      'التخطيط الاستراتيجي': Target,
      'إدارة المبيعات': BarChart3,
      
      // اللغات
      'اللغة الإنجليزية': Globe,
      'اللغة الفرنسية': Globe,
      'اللغة الألمانية': Globe,
      'اللغة الإسبانية': Globe,
      'اللغة الصينية': Globe,
      
      // التصوير
      'تصوير البورتريه': Camera,
      'تصوير المناظر الطبيعية': Camera,
      'التصوير الفوتوغرافي للمنتجات': Camera,
      'تصوير الأحداث': Camera,
      'معالجة الصور': PenTool,
      
      // المونتاج
      'مونتاج الفيديو': Video,
      'صناعة المحتوى على يوتيوب': Video,
      'الموشن جرافيك': Zap,
      'المؤثرات البصرية': Eye,
      'تحرير الصوت': Video,
    }
    
    return iconMap[subcategoryName] || BookOpen
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId)
    return category ? `${category.icon} ${category.name}` : categoryId
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

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            {/* Search */}
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

            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory('الكل')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === 'الكل'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📚 الكل
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedCategory === category._id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category._id ? category.color : undefined,
                  }}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>

            {/* Subcategories */}
            {showSubcategories && (
              <div className="mt-4 p-6 bg-white rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                  اختر الفئة الفرعية:
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setSelectedSubcategory('الكل')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedSubcategory === 'الكل'
                        ? 'bg-secondary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    الكل
                  </button>
                  {currentCategorySubcategories.map((subcategory, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSubcategory(subcategory)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        selectedSubcategory === subcategory
                          ? 'bg-secondary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Show subcategories or courses */}
          {showSubcategories && selectedSubcategory === 'الكل' ? (
            // Show subcategories as cards
            <div className="max-w-7xl mx-auto">
              <div className={`grid gap-8 mb-12 ${
                currentCategorySubcategories.length === 1 
                  ? 'md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto' 
                  : currentCategorySubcategories.length === 2 
                  ? 'md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto' 
                  : 'md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {currentCategorySubcategories.map((subcategory, index) => {
                  const subcategoryCourses = courses.filter(
                    c => c.category === selectedCategory && c.subcategory === subcategory
                  )
                  
                  // Get the selected category to use its color and icon
                  const selectedCat = categories.find(cat => cat._id === selectedCategory)
                  const SubcategoryIcon = getSubcategoryIcon(subcategory)
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedSubcategory(subcategory)}
                      className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group hover:scale-105 h-full text-center border border-gray-100"
                    >
                      {/* Gradient overlay on hover */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${selectedCat?.color}10 0%, ${selectedCat?.color}20 100%)`
                        }}
                      />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon */}
                        <div
                          className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl mb-6 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                          style={{
                            background: `linear-gradient(135deg, ${selectedCat?.color}20 0%, ${selectedCat?.color}40 100%)`,
                          }}
                        >
                          <SubcategoryIcon 
                            className="w-12 h-12 transition-colors duration-300" 
                            style={{ color: selectedCat?.color || '#3B82F6' }}
                          />
                        </div>

                        {/* Subcategory Name */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-primary-600">
                          {subcategory}
                        </h3>

                        {/* Courses Count */}
                        <div className="flex items-center justify-center gap-2 font-semibold transition-colors duration-300"
                          style={{ color: selectedCat?.color || '#3B82F6' }}
                        >
                          <span className="text-2xl">{subcategoryCourses.length}</span>
                          <span className="text-sm">دورة</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            // Show courses
            <>
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
                  <div className="h-48 bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-6xl">
                    {course.image || '📚'}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="inline-block px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-3">
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
                      <span className="text-2xl font-bold text-primary-600">
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
                {searchTerm || selectedCategory !== 'الكل'
                  ? 'لم يتم العثور على دورات تطابق البحث'
                  : 'لا توجد دورات متاحة حالياً'}
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
