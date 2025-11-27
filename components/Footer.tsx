'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Facebook, Youtube, Instagram, Mail, Phone, MapPin, Twitter, Linkedin } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

interface PopularCourse {
  _id: string
  title: string
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const settings = useSettings()
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([])
  
  useEffect(() => {
    // Fetch popular courses from API
    fetch('/api/courses/popular')
      .then(res => res.json())
      .then(data => setPopularCourses(data))
      .catch(err => console.error('Error fetching popular courses:', err))
  }, [])

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
                <span className="text-2xl">{settings.siteLogo}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{settings.siteName}</span>
                <span className="text-xs text-gray-400">{settings.siteSlogan}</span>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-4">
              {settings.footerAboutText}
            </p>
            <div className="flex gap-3">
              {settings.facebookUrl && settings.facebookUrl !== '#' && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.youtubeUrl && settings.youtubeUrl !== '#' && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {settings.instagramUrl && settings.instagramUrl !== '#' && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.twitterUrl && settings.twitterUrl !== '#' && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {settings.linkedinUrl && settings.linkedinUrl !== '#' && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary-400 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-400 hover:text-primary-400 transition-colors">
                  الدورات
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary-400 transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-primary-400 transition-colors">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-lg font-bold mb-4">الدورات الشائعة</h3>
            <ul className="space-y-2">
              {popularCourses.length > 0 ? (
                popularCourses.map((course) => (
                  <li key={course._id}>
                    <Link 
                      href={`/courses/${course._id}`} 
                      className="text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {course.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">لا توجد دورات متاحة حالياً</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400">
                <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>{settings.contactEmail}</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                <span dir="ltr">{settings.contactPhone}</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>{settings.contactAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
            <p>
              © {currentYear} {settings.footerCopyright}
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="hover:text-primary-400 transition-colors">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
