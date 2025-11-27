'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, Phone, MapPin, Send, Facebook, Youtube, Instagram, MessageCircle } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

export default function ContactPage() {
  const settings = useSettings()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.')
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      value: settings.contactEmail,
      link: `mailto:${settings.contactEmail}`,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Phone,
      title: 'الهاتف',
      value: settings.contactPhone,
      link: `tel:${settings.contactPhone.replace(/\s+/g, '')}`,
      color: 'from-green-500 to-green-600',
    },
    {
      icon: MapPin,
      title: 'العنوان',
      value: settings.contactAddress,
      link: '#',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: MessageCircle,
      title: 'واتساب',
      value: settings.contactPhone,
      link: `https://wa.me/${settings.contactPhone.replace(/[^0-9]/g, '')}`,
      color: 'from-green-400 to-green-500',
    },
  ]

  const socialMedia = [
    {
      icon: Facebook,
      name: 'Facebook',
      link: settings.facebookUrl,
      color: 'hover:bg-blue-600',
    },
    {
      icon: Youtube,
      name: 'YouTube',
      link: settings.youtubeUrl,
      color: 'hover:bg-red-600',
    },
    {
      icon: Instagram,
      name: 'Instagram',
      link: settings.instagramUrl,
      color: 'hover:bg-pink-600',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {settings.contactPageTitle}
          </h1>
          <p className="text-xl text-white/90">
            {settings.contactPageDescription}
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <a
                  key={index}
                  href={info.link}
                  className="card p-6 text-center hover:scale-105 transition-transform"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-gray-600">{info.value}</p>
                </a>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
                    placeholder="+20 123 456 7890"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    الموضوع *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
                  >
                    <option value="">اختر الموضوع</option>
                    <option value="course">استفسار عن دورة</option>
                    <option value="technical">مشكلة تقنية</option>
                    <option value="payment">الدفع والاشتراك</option>
                    <option value="general">استفسار عام</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    الرسالة *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-600 transition-colors resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <span>إرسال الرسالة</span>
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">معلومات إضافية</h2>
              
              <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">ساعات العمل</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold">السبت - الخميس:</span>
                    <span>9:00 ص - 6:00 م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">الجمعة:</span>
                    <span>مغلق</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">تابعنا على</h3>
                <div className="flex gap-4">
                  {socialMedia.map((social, index) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={index}
                        href={social.link}
                        className={`w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white transition-colors ${social.color}`}
                        title={social.name}
                      >
                        <Icon className="w-6 h-6" />
                      </a>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">الأسئلة الشائعة</h3>
                <p className="text-gray-700 mb-4">
                  هل لديك سؤال؟ تحقق من صفحة الأسئلة الشائعة للحصول على إجابات سريعة.
                </p>
                <a href="/faq" className="btn-secondary inline-block">
                  عرض الأسئلة الشائعة
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">موقعنا</h2>
          <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <MapPin className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl font-semibold">خريطة الموقع</p>
              <p className="text-sm">القاهرة، مصر</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
