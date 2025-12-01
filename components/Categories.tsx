'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?published=true')
      const data = await response.json()

      if (data.success && data.categories && data.categories.length > 0) {
        // Filter to show only root categories (no parentCategory)
        const rootCategories = data.categories.filter((cat: any) => !cat.parentCategory)
        setCategories(rootCategories.slice(0, 8))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">جاري تحميل الفئات...</p>
          </div>
        </div>
      </section>
    )
  }

  // Don't show anything if no categories (hide section completely)
  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            المراحل الدراسية
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اختر المرحلة الدراسية المناسبة لك وابدأ رحلتك التعليمية
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category._id}`}
              className="group"
            >
              <div
                className="card p-8 group hover:scale-105 h-full"
                style={{
                  borderTop: `4px solid ${category.color}`,
                }}
              >
                {/* Icon */}
                <div
                  className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl mb-6 mx-auto transition-transform group-hover:rotate-6"
                  style={{
                    backgroundColor: category.color + '20',
                  }}
                >
                  {category.icon}
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>

                {/* Description */}
                {category.description && (
                  <p className="text-sm text-gray-500 text-center line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
