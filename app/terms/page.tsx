'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FileText } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

export default function TermsPage() {
  const settings = useSettings()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="container mx-auto text-center text-white">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <FileText className="w-6 h-6" />
            <span className="text-lg font-semibold">الشروط والأحكام</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            شروط استخدام المنصة
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            يرجى قراءة هذه الشروط بعناية قبل استخدام منصتنا
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                {settings.termsAndConditionsContent}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
