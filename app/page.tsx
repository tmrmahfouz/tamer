'use client'

import { useHomeSections } from '@/contexts/HomeSectionsContext'
import DynamicSection from '@/components/DynamicSection'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Categories from '@/components/Categories'
import Courses from '@/components/Courses'
import Stats from '@/components/Stats'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'

export default function Home() {
  const { activeSections, loading } = useHomeSections()

  // إذا كان يحمل، عرض loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // إذا لم توجد أقسام ديناميكية، عرض الصفحة الثابتة الأصلية
  if (activeSections.length === 0) {
    return (
      <main className="min-h-screen">
        <Header />
        <Hero />
        <Features />
        <Categories />
        <Courses />
        <Stats />
        <Testimonials />
        <CTA />
        <Footer />
      </main>
    )
  }

  // عرض الأقسام الديناميكية
  return (
    <main className="min-h-screen">
      <Header />
      {activeSections.map((section) => (
        <DynamicSection
          key={section._id}
          type={section.type}
          title={section.title}
          subtitle={section.subtitle}
          content={section.content}
          settings={section.settings}
        />
      ))}
      <Footer />
    </main>
  )
}
