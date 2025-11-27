'use client'

import { useState } from 'react'
import { Download, Share2, Linkedin, Twitter, Facebook, Printer } from 'lucide-react'
import { getLinkedInShareUrl, getTwitterShareUrl, getFacebookShareUrl } from '@/lib/certificateGenerator'

interface CertificateViewerProps {
  certificate: any
}

export default function CertificateViewer({ certificate }: CertificateViewerProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // في الإنتاج، قم بتوليد PDF وتحميله
    window.print()
  }

  const shareOnLinkedIn = () => {
    const url = getLinkedInShareUrl({
      studentName: certificate.user?.name || '',
      courseName: certificate.course?.title || '',
      completionDate: certificate.issuedAt,
      certificateId: certificate.certificateId,
      instructorName: certificate.course?.instructor?.name || '',
    })
    window.open(url, '_blank')
  }

  const shareOnTwitter = () => {
    const url = getTwitterShareUrl({
      studentName: certificate.user?.name || '',
      courseName: certificate.course?.title || '',
      completionDate: certificate.issuedAt,
      certificateId: certificate.certificateId,
      instructorName: certificate.course?.instructor?.name || '',
    })
    window.open(url, '_blank')
  }

  const shareOnFacebook = () => {
    const url = getFacebookShareUrl({
      studentName: certificate.user?.name || '',
      courseName: certificate.course?.title || '',
      completionDate: certificate.issuedAt,
      certificateId: certificate.certificateId,
      instructorName: certificate.course?.instructor?.name || '',
    })
    window.open(url, '_blank')
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mb-8 print:hidden">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
        >
          <Download className="w-5 h-5" />
          <span>تحميل PDF</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
        >
          <Printer className="w-5 h-5" />
          <span>طباعة</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <Share2 className="w-5 h-5" />
            <span>مشاركة</span>
          </button>

          {showShareMenu && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 p-2 z-10 min-w-[200px]">
              <button
                onClick={shareOnLinkedIn}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-right"
              >
                <Linkedin className="w-5 h-5 text-[#0077B5]" />
                <span className="text-gray-900 dark:text-gray-100 font-semibold">LinkedIn</span>
              </button>

              <button
                onClick={shareOnTwitter}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-right"
              >
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                <span className="text-gray-900 dark:text-gray-100 font-semibold">Twitter</span>
              </button>

              <button
                onClick={shareOnFacebook}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-right"
              >
                <Facebook className="w-5 h-5 text-[#1877F2]" />
                <span className="text-gray-900 dark:text-gray-100 font-semibold">Facebook</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="bg-white rounded-xl shadow-2xl p-12 border-4 border-primary-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-4xl">
            🎓
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            شهادة إتمام
          </h1>
          <p className="text-xl text-gray-600 font-semibold">Certificate of Completion</p>
        </div>

        <div className="text-center my-12">
          <p className="text-lg text-gray-600 mb-4">تُمنح هذه الشهادة إلى</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-primary-500 inline-block pb-2">
            {certificate.user?.name}
          </h2>

          <p className="text-lg text-gray-600 mb-4">تقديراً لإتمامه بنجاح دورة</p>

          <h3 className="text-3xl font-bold text-primary-600 my-6">
            {certificate.course?.title}
          </h3>

          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            نشهد بأن الطالب قد أكمل جميع متطلبات الدورة بنجاح
            وأظهر التزاماً وتفانياً في التعلم
          </p>
        </div>

        <div className="flex justify-between items-end mt-12 pt-8 border-t-2 border-gray-200">
          <div className="text-center">
            <div className="w-48 h-0.5 bg-gray-900 mb-2"></div>
            <p className="font-bold text-gray-900">{certificate.course?.instructor?.name || 'المدرب'}</p>
            <p className="text-sm text-gray-600">المدرب المعتمد</p>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-2">
              {new Date(certificate.issuedAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500 font-mono">
              ID: {certificate.certificateId}
            </p>
          </div>

          <div className="text-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://platform.com'}/certificates/verify/${certificate.certificateId}`)}`}
              alt="QR Code"
              className="w-24 h-24 border-2 border-gray-200 rounded-lg p-1"
            />
            <p className="text-xs text-gray-500 mt-1">تحقق من الشهادة</p>
          </div>
        </div>
      </div>

      {/* Certificate Info */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 print:hidden">
        <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2">
          ℹ️ معلومات الشهادة
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• يمكنك تحميل الشهادة بصيغة PDF عالية الجودة</li>
          <li>• شارك إنجازك على LinkedIn لتعزيز ملفك المهني</li>
          <li>• استخدم QR Code للتحقق من صحة الشهادة</li>
          <li>• الشهادة صالحة مدى الحياة ومعترف بها</li>
        </ul>
      </div>
    </div>
  )
}
