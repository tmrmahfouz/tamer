'use client'

import { useHomeSections } from '@/contexts/HomeSectionsContext'
import DynamicSection from '@/components/DynamicSection'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Eye, Edit } from 'lucide-react'

export default function DynamicHomePage() {
  const { activeSections, loading } = useHomeSections()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Admin Control Bar (visible only in this demo) */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span className="font-semibold">معاينة الصفحة الرئيسية الديناميكية</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/home-editor"
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              تحرير الأقسام
            </Link>
            <Link
              href="/"
              className="bg-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-800"
            >
              الصفحة الأصلية
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {activeSections.length === 0 ? (
          <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-bold text-gray-700 mb-4">لا توجد أقسام نشطة</h2>
            <p className="text-gray-600 mb-8">قم بإضافة وتفعيل أقسام من محرر الصفحة الرئيسية</p>
            <Link
              href="/admin/home-editor"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              فتح المحرر
            </Link>
          </div>
        ) : (
          activeSections.map((section) => (
            <DynamicSection
              key={section._id}
              type={section.type}
              title={section.title}
              subtitle={section.subtitle}
              content={section.content}
              settings={section.settings}
            />
          ))
        )}
      </main>

      <Footer />
    </div>
  )
}
