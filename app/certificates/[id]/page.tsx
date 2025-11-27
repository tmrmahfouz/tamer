'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Award, Share2, CheckCircle, Printer, ArrowRight, Star } from 'lucide-react'

interface SiteSettings {
  siteName: string
  siteSlogan: string
  siteLogo: string
  primaryColor: string
  secondaryColor: string
  // Certificate specific settings
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
}

const defaultSettings: SiteSettings = {
  siteName: 'أكاديمية التعلم',
  siteSlogan: 'نحو مستقبل أفضل بالتعلم',
  siteLogo: '🎓',
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  certificateTitle: 'شهادة إتمام',
  certificateSubtitle: 'Certificate of Completion',
  certificateIntroText: 'تشهد {platformName} بأن',
  certificateBodyText: 'قد أتمّ بنجاح جميع متطلبات الدورة التدريبية',
  certificateFooterText: 'وقد أظهر التزاماً واجتهاداً ملحوظاً في التعلم واستيعاب المحتوى التعليمي',
  certificateDirectorName: 'المدير',
  certificateDirectorTitle: 'المدير التنفيذي',
  certificateSignature: '',
  certificateSealText: 'معتمد رسمياً',
  certificateVerifyText: 'للتحقق من صحة الشهادة',
}

export default function CertificateViewPage() {
  const params = useParams()
  const router = useRouter()
  const [certificate, setCertificate] = useState<any>(null)
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now()
      const [certRes, settingsRes] = await Promise.all([
        fetch(`/api/certificates/${params.id}?t=${timestamp}`),
        fetch(`/api/settings?t=${timestamp}`)
      ])
      
      const certData = await certRes.json()
      const settingsData = await settingsRes.json()
      
      console.log('Certificate data:', certData)
      console.log('Settings data:', settingsData)
      console.log('Certificate settings fields:', {
        certificateTitle: settingsData.certificateTitle,
        certificateDirectorName: settingsData.certificateDirectorName,
        siteName: settingsData.siteName,
      })
      
      if (certData.success) setCertificate(certData.certificate)
      
      // API returns settings object directly (not wrapped in success/settings)
      if (settingsData && !settingsData.error) {
        const mergedSettings = {
          ...defaultSettings,
          siteName: settingsData.siteName || defaultSettings.siteName,
          siteSlogan: settingsData.siteSlogan || defaultSettings.siteSlogan,
          siteLogo: settingsData.siteLogo || defaultSettings.siteLogo,
          primaryColor: settingsData.primaryColor || defaultSettings.primaryColor,
          secondaryColor: settingsData.secondaryColor || defaultSettings.secondaryColor,
          certificateTitle: settingsData.certificateTitle || defaultSettings.certificateTitle,
          certificateSubtitle: settingsData.certificateSubtitle || defaultSettings.certificateSubtitle,
          certificateIntroText: settingsData.certificateIntroText || defaultSettings.certificateIntroText,
          certificateBodyText: settingsData.certificateBodyText || defaultSettings.certificateBodyText,
          certificateFooterText: settingsData.certificateFooterText || defaultSettings.certificateFooterText,
          certificateDirectorName: settingsData.certificateDirectorName || defaultSettings.certificateDirectorName,
          certificateDirectorTitle: settingsData.certificateDirectorTitle || defaultSettings.certificateDirectorTitle,
          certificateSignature: settingsData.certificateSignature || defaultSettings.certificateSignature,
          certificateSealText: settingsData.certificateSealText || defaultSettings.certificateSealText,
          certificateVerifyText: settingsData.certificateVerifyText || defaultSettings.certificateVerifyText,
        }
        console.log('Merged settings:', mergedSettings)
        setSettings(mergedSettings)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => window.print()

  const handleShare = async () => {
    const url = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`
    try {
      await navigator.clipboard.writeText(url)
      alert('تم نسخ رابط التحقق')
    } catch {
      alert('تعذر نسخ الرابط')
    }
  }

  // Replace placeholders in text
  const replacePlaceholders = (text: string) => {
    return text
      .replace('{platformName}', settings.siteName)
      .replace('{studentName}', certificate?.student?.name || 'الطالب')
      .replace('{courseName}', certificate?.course?.title || 'الدورة')
      .replace('{directorName}', settings.certificateDirectorName)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800 font-medium">جاري تحميل الشهادة...</p>
        </div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl">
          <Award className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3 text-gray-800">الشهادة غير موجودة</h2>
          <p className="text-gray-500 mb-6">لم نتمكن من العثور على هذه الشهادة</p>
          <button onClick={() => router.push('/certificates')} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
            العودة للشهادات
          </button>
        </div>
      </div>
    )
  }

  const student = certificate.student
  const course = certificate.course
  const gradeText = certificate.grade >= 90 ? 'امتياز' : certificate.grade >= 80 ? 'جيد جداً' : certificate.grade >= 70 ? 'جيد' : 'مقبول'
  const gradeStars = certificate.grade >= 90 ? 5 : certificate.grade >= 80 ? 4 : certificate.grade >= 70 ? 3 : 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-amber-50 to-orange-50 print:bg-white" dir="rtl">
      {/* Actions Bar */}
      <div className="no-print py-4 px-6 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors">
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">العودة</span>
          </button>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all font-medium">
              <Printer className="w-5 h-5" />
              <span>طباعة</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium">
              <Share2 className="w-5 h-5" />
              <span>مشاركة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Container */}
      <div className="py-10 px-4 print:p-0 print:m-0">
        <div className="certificate-wrapper mx-auto print:max-w-none print:w-full" style={{ maxWidth: '1122px' }}>
          {/* Certificate Card - A4 Landscape ratio (297mm x 210mm) */}
          <div className="certificate-page bg-white rounded-2xl shadow-2xl print:shadow-none print:rounded-none relative" style={{ aspectRatio: '297/210', width: '100%' }}>
            
            {/* Elegant Background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50"></div>
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L100 50L50 100L0 50Z' fill='%23d97706'/%3E%3C/svg%3E")`,
                backgroundSize: '50px 50px'
              }}></div>
            </div>

            {/* Golden Border Frame */}
            <div className="absolute inset-3 border-4 border-amber-400/40 rounded-2xl"></div>
            <div className="absolute inset-5 border-2 border-amber-300/30 rounded-xl"></div>
            <div className="absolute inset-7 border border-amber-200/20 rounded-lg"></div>

            {/* Corner Decorations */}
            {['top-6 right-6', 'top-6 left-6', 'bottom-6 right-6', 'bottom-6 left-6'].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-16 h-16`}>
                <div className={`w-full h-full ${i < 2 ? 'border-t-4' : 'border-b-4'} ${i % 2 === 0 ? 'border-r-4' : 'border-l-4'} border-amber-500`}
                  style={{ borderRadius: i === 0 ? '0 24px 0 0' : i === 1 ? '24px 0 0 0' : i === 2 ? '0 0 24px 0' : '0 0 0 24px' }}></div>
                <div className={`absolute ${i < 2 ? 'top-1' : 'bottom-1'} ${i % 2 === 0 ? 'right-1' : 'left-1'} w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-md`}></div>
              </div>
            ))}

            {/* Main Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 z-10">
              
              {/* Header Section */}
              <div className="text-center">
                {/* Platform Logo & Name */}
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg text-3xl transform -rotate-3">
                    {settings.siteLogo}
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{settings.siteName}</h2>
                    <p className="text-gray-500 text-sm">{settings.siteSlogan}</p>
                  </div>
                </div>
                
                {/* Certificate Title */}
                <div className="relative inline-block">
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-800" style={{ fontFamily: 'serif' }}>
                    {settings.certificateTitle}
                  </h1>
                  <p className="text-amber-600 tracking-[0.3em] text-xs font-bold uppercase">{settings.certificateSubtitle}</p>
                </div>
                
                {/* Decorative Line */}
                <div className="flex items-center justify-center gap-3 mt-1">
                  <div className="flex-1 max-w-28 h-0.5 bg-gradient-to-r from-transparent to-amber-400"></div>
                  <Award className="w-5 h-5 text-amber-500" />
                  <div className="flex-1 max-w-28 h-0.5 bg-gradient-to-l from-transparent to-amber-400"></div>
                </div>
              </div>

              {/* Body Section */}
              <div className="text-center flex-1 flex flex-col justify-center">
                <p className="text-2xl text-gray-600 mb-1">
                  {replacePlaceholders(settings.certificateIntroText)}
                </p>
                
                {/* Student Name */}
                <div className="my-2">
                  <div className="inline-block relative">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 px-8 py-1" style={{ fontFamily: 'serif' }}>
                      {student?.name || 'الطالب'}
                    </h2>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-full"></div>
                  </div>
                </div>
                
                <p className="text-2xl text-gray-600 mb-2">
                  {settings.certificateBodyText}
                </p>
                
                {/* Course Title */}
                <div className="inline-block mx-auto mb-2">
                  <div className="relative bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-xl py-2 px-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                      {course?.title || 'الدورة التدريبية'}
                    </h3>
                  </div>
                </div>

                {/* Footer Text */}
                {settings.certificateFooterText && (
                  <p className="text-gray-500 mb-1 text-base max-w-2xl mx-auto">
                    {settings.certificateFooterText}
                  </p>
                )}
                
                {/* Grade Section */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="text-base text-gray-600">بتقدير</span>
                  <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white rounded-full font-bold text-lg shadow">
                    <span>{gradeText}</span>
                    <span className="w-px h-5 bg-white/30"></span>
                    <span>{certificate.grade}%</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < gradeStars ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t-2 border-amber-100">
                {/* Signature */}
                <div className="text-center">
                  <div className="mb-1 h-12 flex items-end justify-center">
                    {settings.certificateSignature ? (
                      <img src={settings.certificateSignature} alt="التوقيع" className="h-12 mx-auto object-contain" />
                    ) : (
                      <p className="text-3xl text-amber-700 italic leading-none" style={{ fontFamily: 'cursive' }}>
                        {settings.certificateDirectorName ? settings.certificateDirectorName.split(' ')[0] : 'التوقيع'}
                      </p>
                    )}
                  </div>
                  <div className="w-28 border-t-2 border-gray-800 mx-auto mb-1"></div>
                  <p className="font-bold text-gray-900 text-base">{settings.certificateDirectorName || 'المدير'}</p>
                  <p className="text-sm text-gray-600">{settings.certificateDirectorTitle}</p>
                </div>

                {/* Official Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-double border-amber-500 flex items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 shadow-xl">
                      <div className="w-16 h-16 rounded-full border-2 border-amber-400 flex flex-col items-center justify-center bg-white">
                        <span className="text-3xl">{settings.siteLogo}</span>
                        <p className="text-[8px] text-amber-800 font-bold text-center leading-tight">{settings.certificateSealText}</p>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    {new Date(certificate.issuedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Verification Code */}
                <div className="text-center flex flex-col justify-center">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-3 rounded-xl inline-block mx-auto">
                    <p className="text-xs text-gray-400 mb-0.5">كود التحقق</p>
                    <p className="font-mono font-bold text-amber-700 text-lg tracking-wider">{certificate.verificationCode}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    الشهادة: {certificate.certificateNumber?.slice(-10)}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Verification Footer */}
      <div className="no-print pb-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">شهادة موثقة</span>
              </div>
              <div className="w-px h-6 bg-gray-200"></div>
              <p className="text-gray-600">
                {settings.certificateVerifyText}: 
                <span className="font-mono font-bold text-amber-700 mr-2 bg-amber-50 px-3 py-1 rounded-lg">{certificate.verificationCode}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 0; 
          }
          html, body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print { 
            display: none !important; 
          }
          .certificate-wrapper { 
            max-width: none !important; 
            width: 100% !important;
            margin: 0 !important; 
            padding: 0 !important; 
          }
          .certificate-page { 
            width: 297mm !important; 
            height: 210mm !important; 
            aspect-ratio: auto !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
        }
        
        /* Screen preview - A4 landscape ratio */
        @media screen {
          .certificate-page {
            aspect-ratio: 297 / 210;
          }
        }
      `}</style>
    </div>
  )
}
