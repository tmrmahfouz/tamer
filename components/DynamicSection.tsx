'use client'

import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import Categories from './Categories'
import Courses from './Courses'
import StatsComponent from './Stats'
import TestimonialsComponent from './Testimonials'
import CTAComponent from './CTA'
import HeroComponent from './Hero'
import FeaturesComponent from './Features'

interface SectionProps {
  type: string
  title: string
  subtitle?: string
  content?: string
  settings: {
    backgroundColor?: string
    textColor?: string
    showButton?: boolean
    buttonText?: string
    buttonLink?: string
    imageUrl?: string
    items?: Array<{
      title?: string
      description?: string
      icon?: string
      value?: string
    }>
  }
}

export default function DynamicSection({ type, title, subtitle, content, settings }: SectionProps) {
  const bgColor = settings.backgroundColor || '#ffffff'
  const textColor = settings.textColor || '#000000'

  // Hero Section - يستخدم التصميم الأصلي مع البيانات المخصصة
  if (type === 'hero') {
    return (
      <HeroComponent 
        title={title}
        subtitle={subtitle}
        items={settings.items}
      />
    )
  }

  // Categories Section (المراحل الدراسية)
  if (type === 'categories') {
    return <Categories />
  }

  // Courses Section (الدورات التدريبية)
  if (type === 'courses') {
    return <Courses />
  }

  // Features Section - يستخدم التصميم الأصلي مع البيانات المخصصة
  if (type === 'features') {
    return (
      <FeaturesComponent 
        title={title}
        subtitle={subtitle}
        items={settings.items as any}
      />
    )
  }

  // Stats Section - يستخدم التصميم الأصلي مع البيانات المخصصة
  if (type === 'stats') {
    return (
      <StatsComponent 
        title={title}
        subtitle={subtitle}
        items={settings.items}
      />
    )
  }

  // Testimonials Section - يستخدم التصميم الأصلي مع البيانات المخصصة
  if (type === 'testimonials') {
    return (
      <TestimonialsComponent 
        title={title}
        subtitle={subtitle}
        items={settings.items}
      />
    )
  }

  // CTA Section - يستخدم التصميم الأصلي مع البيانات المخصصة
  if (type === 'cta') {
    return (
      <CTAComponent 
        title={title}
        subtitle={subtitle}
        content={content}
        buttonText={settings.buttonText}
        buttonLink={settings.buttonLink}
      />
    )
  }

  // Custom Section
  if (type === 'custom') {
    return (
      <section 
        className="py-16"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">{title}</h2>
          {subtitle && <p className="text-xl mb-6">{subtitle}</p>}
          {content && (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
          {settings.showButton && settings.buttonText && (
            <div className="mt-8">
              <Link
                href={settings.buttonLink || '#'}
                className="inline-block btn-primary"
              >
                {settings.buttonText}
              </Link>
            </div>
          )}
        </div>
      </section>
    )
  }

  // Default fallback
  return (
    <section 
      className="py-16"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-6">{title}</h2>
        {subtitle && <p className="text-xl mb-6">{subtitle}</p>}
        {content && <p>{content}</p>}
      </div>
    </section>
  )
}
