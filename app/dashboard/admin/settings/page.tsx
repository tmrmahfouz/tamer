'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Save, Globe, Palette, Phone, Share2, 
  FileText, Award, Shield, Bell, Layout, RefreshCw, Loader2
} from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

interface SiteSettings {
  siteName: string
  siteSlogan: string
  siteLogo: string
  siteDescription: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  facebookUrl: string
  youtubeUrl: string
  instagramUrl: string
  twitterUrl: string
  linkedinUrl: string
  homeHeroTitle: string
  homeHeroSubtitle: string
  homeAboutSection: string
  statsStudents: string
  statsCourses: string
  statsSatisfaction: string
  aboutPageContent: string
  privacyPolicyContent: string
  termsAndConditionsContent: string
  footerAboutText: string
  footerCopyright: string
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  // Certificate Settings
  certificateTitle: string
  certificateSubtitle: string
  certificateIntroText: string
  certificateBodyText: string
  certificateFooterText: string
  certificateDirectorName: string
  certificateDirectorTitle: string
  certificateSignature: string
  certificateSealText: string
  certificateVerifyText: string
  // External Quiz Platform
  externalQuizPlatformEnabled: boolean
  externalQuizPlatformName: string
  externalQuizPlatformUrl: string
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('identity')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    siteSlogan: '',
    siteLogo: '🎓',
    siteDescription: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#10B981',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    facebookUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    homeHeroTitle: '',
    homeHeroSubtitle: '',
    homeAboutSection: '',
    statsStudents: '500+',
    statsCourses: '15+',
    statsSatisfaction: '98%',
    aboutPageContent: '',
    privacyPolicyContent: '',
    termsAndConditionsContent: '',
    footerAboutText: '',
    footerCopyright: '',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    certificateTitle: 'شهادة إتمام',
    certificateSubtitle: 'Certificate of Completion',
    certificateIntroText: 'تشهد {platformName} بأن',
    certificateBodyText: 'قد أتمّ بنجاح جميع متطلبات الدورة التدريبية',
    certificateFooterText: 'وقد أظهر التزاماً واجتهاداً ملحوظاً في التعلم',
    certificateDirectorName: '',
    certificateDirectorTitle: 'المدير التنفيذي',
    certificateSignature: '',
    certificateSealText: 'معتمد رسمياً',
    certificateVerifyText: 'للتحقق من صحة الشهادة',
    externalQuizPlatformEnabled: false,
    externalQuizPlatformName: 'منصة الاختبارات الخارجية',
    externalQuizPlatformUrl: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      console.log('Fetched settings:', data)
      console.log('External Quiz Platform:', {
        enabled: data.externalQuizPlatformEnabled,
        name: data.externalQuizPlatformName,
        url: data.externalQuizPlatformUrl
      })
      if (data) {
        setSettings(prev => ({ 
          ...prev, 
          ...data,
          // تأكد من تحميل القيم الصحيحة للحقول الجديدة
          externalQuizPlatformEnabled: data.externalQuizPlatformEnabled === true,
          externalQuizPlatformName: data.externalQuizPlatformName || 'منصة الاختبارات الخارجية',
          externalQuizPlatformUrl: data.externalQuizPlatformUrl || '',
        }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    console.log('Saving settings:', settings)
    console.log('External Quiz Platform to save:', {
      enabled: settings.externalQuizPlatformEnabled,
      name: settings.externalQuizPlatformName,
      url: settings.externalQuizPlatformUrl
    })
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      
      if (res.ok) {
        const savedData = await res.json()
        console.log('Saved response:', savedData)
        alert('✅ تم حفظ الإعدادات بنجاح!')
        // لا نعيد تحميل الصفحة فوراً لنرى النتيجة
        fetchSettings()
      } else {
        const data = await res.json()
        alert('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('❌ حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('⚠️ هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/settings', { method: 'DELETE' })
      if (res.ok) {
        alert('✅ تمت إعادة التعيين بنجاح!')
        window.location.reload()
      }
    } catch (error) {
      alert('❌ حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'identity', label: 'هوية الموقع', icon: Globe },
    { id: 'colors', label: 'الألوان', icon: Palette },
    { id: 'contact', label: 'التواصل', icon: Phone },
    { id: 'social', label: 'وسائل التواصل', icon: Share2 },
    { id: 'pages', label: 'محتوى الصفحات', icon: FileText },
    { id: 'certificate', label: 'الشهادات', icon: Award },
    { id: 'external', label: 'روابط خارجية', icon: Layout },
    { id: 'security', label: 'الأمان', icon: Shield },
  ]

  if (loading) {
    return (
      <AdminLayout title="إعدادات المنصة">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="إعدادات المنصة">
      <div>
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-7 h-7 text-primary-600" />
              إعدادات المنصة
            </h1>
            <p className="text-gray-600 mt-1">إدارة جميع إعدادات الموقع والتخصيصات</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/home-editor"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Layout className="w-4 h-4" />
              محرر الصفحة الرئيسية
            </Link>
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة تعيين
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ التغييرات
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Tabs */}
          <div className="border-b bg-gray-50">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Identity Tab */}
            {activeTab === 'identity' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم الموقع</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="أكاديمية التعلم"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">شعار الموقع</label>
                    <input
                      type="text"
                      value={settings.siteSlogan}
                      onChange={(e) => setSettings({ ...settings, siteSlogan: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="تعلم بلا حدود"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">أيقونة الموقع</label>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center text-3xl">
                      {settings.siteLogo || '🎓'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['🎓', '📚', '💡', '🚀', '⭐', '🏆', '💻', '🎯', '📖', '✏️', '🧠', '🔥'].map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setSettings({ ...settings, siteLogo: icon })}
                          className={`w-10 h-10 text-xl rounded-lg border-2 transition-colors ${
                            settings.siteLogo === icon 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف الموقع</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="منصة تعليمية متكاملة..."
                  />
                </div>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { key: 'primaryColor', label: 'اللون الأساسي' },
                    { key: 'secondaryColor', label: 'اللون الثانوي' },
                    { key: 'accentColor', label: 'لون التمييز' },
                  ].map((color) => (
                    <div key={color.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{color.label}</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={(settings as any)[color.key]}
                          onChange={(e) => setSettings({ ...settings, [color.key]: e.target.value })}
                          className="h-10 w-14 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={(settings as any)[color.key]}
                          onChange={(e) => setSettings({ ...settings, [color.key]: e.target.value })}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">معاينة الألوان:</p>
                  <div className="flex gap-3">
                    <div className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-medium" style={{ backgroundColor: settings.primaryColor }}>أساسي</div>
                    <div className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-medium" style={{ backgroundColor: settings.secondaryColor }}>ثانوي</div>
                    <div className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-medium" style={{ backgroundColor: settings.accentColor }}>تمييز</div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="info@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <input type="tel" value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="+966 XX XXX XXXX" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                  <input type="text" value={settings.contactAddress} onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="المدينة، الدولة" />
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                {[
                  { key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                  { key: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/...' },
                  { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                  { key: 'twitterUrl', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                  { key: 'linkedinUrl', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
                ].map((social) => (
                  <div key={social.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{social.label}</label>
                    <input type="url" value={(settings as any)[social.key]} onChange={(e) => setSettings({ ...settings, [social.key]: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" placeholder={social.placeholder} />
                  </div>
                ))}
              </div>
            )}

            {/* Pages Tab */}
            {activeTab === 'pages' && (
              <div className="space-y-8">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">صفحة من نحن</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">محتوى صفحة من نحن</label>
                    <textarea 
                      value={settings.aboutPageContent} 
                      onChange={(e) => setSettings({ ...settings, aboutPageContent: e.target.value })} 
                      rows={6} 
                      className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                      placeholder="اكتب محتوى صفحة من نحن هنا... يمكنك استخدام HTML"
                    />
                    <p className="text-xs text-gray-500 mt-1">يمكنك استخدام HTML لتنسيق المحتوى</p>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">سياسة الخصوصية</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">محتوى سياسة الخصوصية</label>
                    <textarea 
                      value={settings.privacyPolicyContent} 
                      onChange={(e) => setSettings({ ...settings, privacyPolicyContent: e.target.value })} 
                      rows={8} 
                      className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                      placeholder="اكتب سياسة الخصوصية هنا..."
                    />
                    <p className="text-xs text-gray-500 mt-1">يمكنك استخدام HTML لتنسيق المحتوى</p>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">الشروط والأحكام</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">محتوى الشروط والأحكام</label>
                    <textarea 
                      value={settings.termsAndConditionsContent} 
                      onChange={(e) => setSettings({ ...settings, termsAndConditionsContent: e.target.value })} 
                      rows={8} 
                      className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                      placeholder="اكتب الشروط والأحكام هنا..."
                    />
                    <p className="text-xs text-gray-500 mt-1">يمكنك استخدام HTML لتنسيق المحتوى</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">الفوتر</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نص الفوتر</label>
                      <textarea value={settings.footerAboutText} onChange={(e) => setSettings({ ...settings, footerAboutText: e.target.value })} rows={2} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">حقوق النشر</label>
                      <input type="text" value={settings.footerCopyright} onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Tab */}
            {activeTab === 'certificate' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الشهادة (عربي)</label>
                    <input type="text" value={settings.certificateTitle} onChange={(e) => setSettings({ ...settings, certificateTitle: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الشهادة (إنجليزي)</label>
                    <input type="text" value={settings.certificateSubtitle} onChange={(e) => setSettings({ ...settings, certificateSubtitle: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نص المقدمة</label>
                  <input type="text" value={settings.certificateIntroText} onChange={(e) => setSettings({ ...settings, certificateIntroText: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="تشهد {platformName} بأن" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نص الشهادة</label>
                  <textarea value={settings.certificateBodyText} onChange={(e) => setSettings({ ...settings, certificateBodyText: e.target.value })} rows={2} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم المدير</label>
                    <input type="text" value={settings.certificateDirectorName} onChange={(e) => setSettings({ ...settings, certificateDirectorName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">منصب المدير</label>
                    <input type="text" value={settings.certificateDirectorTitle} onChange={(e) => setSettings({ ...settings, certificateDirectorTitle: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نص الختم</label>
                    <input type="text" value={settings.certificateSealText} onChange={(e) => setSettings({ ...settings, certificateSealText: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نص التحقق</label>
                    <input type="text" value={settings.certificateVerifyText} onChange={(e) => setSettings({ ...settings, certificateVerifyText: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            {/* External Links Tab */}
            {activeTab === 'external' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">📝 منصة الاختبارات الخارجية</h4>
                  <p className="text-sm text-blue-700">
                    يمكنك إضافة رابط لمنصة اختبارات خارجية ليظهر في القائمة العلوية للموقع
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">تفعيل رابط منصة الاختبارات</h4>
                    <p className="text-sm text-gray-600">إظهار الرابط في القائمة العلوية</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, externalQuizPlatformEnabled: !settings.externalQuizPlatformEnabled })}
                    className={`relative w-14 h-7 rounded-full transition-colors ${settings.externalQuizPlatformEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.externalQuizPlatformEnabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                {settings.externalQuizPlatformEnabled && (
                  <div className="grid md:grid-cols-2 gap-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم الرابط في القائمة
                      </label>
                      <input
                        type="text"
                        value={settings.externalQuizPlatformName}
                        onChange={(e) => setSettings({ ...settings, externalQuizPlatformName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="منصة الاختبارات الخارجية"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رابط المنصة (URL)
                      </label>
                      <input
                        type="url"
                        value={settings.externalQuizPlatformUrl}
                        onChange={(e) => setSettings({ ...settings, externalQuizPlatformUrl: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="https://example.com/quizzes"
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}

                {/* زر حفظ مباشر */}
                <div className="pt-4 border-t">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    حفظ إعدادات الرابط الخارجي
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">وضع الصيانة</h4>
                    <p className="text-sm text-gray-600">إيقاف الموقع مؤقتاً للصيانة</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    className={`relative w-14 h-7 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">السماح بالتسجيل</h4>
                    <p className="text-sm text-gray-600">السماح للمستخدمين الجدد بإنشاء حسابات</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                    className={`relative w-14 h-7 rounded-full transition-colors ${settings.allowRegistration ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.allowRegistration ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">تأكيد البريد الإلكتروني</h4>
                    <p className="text-sm text-gray-600">طلب تأكيد البريد عند التسجيل</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, requireEmailVerification: !settings.requireEmailVerification })}
                    className={`relative w-14 h-7 rounded-full transition-colors ${settings.requireEmailVerification ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.requireEmailVerification ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
