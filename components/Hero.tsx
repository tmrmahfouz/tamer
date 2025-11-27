'use client'

import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { Code2, Brain, Sparkles, ArrowLeft } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

interface HeroProps {
  title?: string
  subtitle?: string
  items?: Array<{
    title?: string
    description?: string
    icon?: string
    value?: string
  }>
}

export default function Hero({ title, subtitle, items }: HeroProps = {}) {
  const settings = useSettings()
  
  // استخدام القيم المخصصة أو القيم الافتراضية
  const heroTitle = title || settings.homeHeroTitle
  const heroSubtitle = subtitle || settings.homeHeroSubtitle
  
  // العناصر الافتراضية
  const defaultItems = [
    { title: 'Badge', description: 'منصة تعليمية متخصصة', icon: 'Sparkles', value: 'badge' },
    { title: 'Python & JavaScript', description: 'لغات البرمجة', icon: 'Code2', value: 'feature1' },
    { title: 'Machine Learning & AI', description: 'الذكاء الاصطناعي', icon: 'Brain', value: 'feature2' },
    { title: 'استكشف الدورات', description: 'زر أساسي', icon: 'ArrowLeft', value: '/courses' },
    { title: 'تعرف على المدرس', description: 'زر ثانوي', icon: 'ArrowLeft', value: '/about' },
  ]
  
  const heroItems = items || defaultItems
  const badge = heroItems.find(item => item.value === 'badge')
  const feature1 = heroItems.find(item => item.value === 'feature1')
  const feature2 = heroItems.find(item => item.value === 'feature2')
  const primaryButton = heroItems.find(item => item.value === '/courses' || item.value?.startsWith('/courses/'))
  const secondaryButton = heroItems.find(item => item.value === '/about' || item.value?.startsWith('/about/'))
  
  const BadgeIcon = badge?.icon ? (LucideIcons as any)[badge.icon] : Sparkles
  const Feature1Icon = feature1?.icon ? (LucideIcons as any)[feature1.icon] : Code2
  const Feature2Icon = feature2?.icon ? (LucideIcons as any)[feature2.icon] : Brain

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg mb-6">
            {BadgeIcon && <BadgeIcon className="w-5 h-5 text-yellow-500" />}
            <span className="text-sm font-semibold text-gray-700">
              {badge?.description || 'منصة تعليمية متخصصة'}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            <span className="block text-gray-900 mb-3">تعلم</span>
            <span className="block bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent animate-gradient leading-relaxed pb-2">
              البرمجة والذكاء الاصطناعي
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Features Icons */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {feature1 && (
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-md">
                {Feature1Icon && <Feature1Icon className="w-6 h-6 text-primary-600" />}
                <span className="font-semibold text-gray-700">{feature1.title}</span>
              </div>
            )}
            {feature2 && (
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-md">
                {Feature2Icon && <Feature2Icon className="w-6 h-6 text-secondary-600" />}
                <span className="font-semibold text-gray-700">{feature2.title}</span>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {primaryButton && (
              <Link href={primaryButton.value || '/courses'} className="btn-primary flex items-center gap-2 text-lg">
                <span>{primaryButton.title || 'استكشف الدورات'}</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            {secondaryButton && (
              <Link href={secondaryButton.value || '/about'} className="btn-secondary text-lg">
                {secondaryButton.title || 'تعرف على المدرس'}
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient mb-2">{settings.statsStudents}</div>
              <div className="text-gray-600 font-semibold">طالب</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient mb-2">{settings.statsCourses}</div>
              <div className="text-gray-600 font-semibold">دورة تدريبية</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient mb-2">{settings.statsSatisfaction}</div>
              <div className="text-gray-600 font-semibold">رضا الطلاب</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
