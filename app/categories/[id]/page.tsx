'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react'

interface Category {
  _id: string
  name: string
  nameEn?: string
  description?: string
  icon?: string
  color?: string
  coursesCount?: number
  parentCategory?: string | null
}

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.id as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (categoryId) {
      loadCategoryData()
    }
  }, [categoryId])

  const loadCategoryData = async () => {
    try {
      // Load parent category
      const catRes = await fetch(`/api/categories/${categoryId}`)
      const catData = await catRes.json()
      
      if (catData.success) {
        setCategory(catData.category)
      }

      // Load all categories and filter subcategories
      const allRes = await fetch('/api/categories?published=true')
      const allData = await allRes.json()
      
      if (allData.success) {
        const subs = allData.categories.filter(
          (cat: Category) => cat.parentCategory === categoryId
        )
        setSubcategories(subs)
      }
    } catch (error) {
      console.error('Error loading category:', error)
    } finally {
      setLoading(false)
    }
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
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{category.name}</span>
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
                {category.name}
              </h1>
              {category.nameEn && (
                <p className="text-lg text-gray-500">{category.nameEn}</p>
              )}
              {category.description && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {subcategories.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                الفئات الفرعية ({subcategories.length})
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategories.map((sub) => (
                  <Link
                    key={sub._id}
                    href={`/courses?category=${sub._id}`}
                    className="group"
                  >
                    <div 
                      className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all hover:-translate-y-1"
                      style={{ borderTop: `4px solid ${sub.color || category.color || '#3B82F6'}` }}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
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
                              {sub.coursesCount || 0} دورة
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">لا توجد فئات فرعية</p>
              <Link 
                href={`/courses?category=${categoryId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                عرض الدورات مباشرة
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
