'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import InstructorLayout from '@/components/InstructorLayout'
import { MessageCircle, ExternalLink } from 'lucide-react'

export default function InstructorChatPage() {
  const router = useRouter()

  return (
    <InstructorLayout title="الدردشة">
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">نظام الدردشة</h1>
          <p className="text-gray-600 mb-6">
            يمكنك التواصل مع طلابك من خلال نظام الدردشة المتكامل. 
            ابدأ محادثات فردية أو أنشئ مجموعات للتواصل الجماعي.
          </p>
          <a
            href="/chat"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            فتح صفحة الدردشة
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">محادثات فردية</h3>
            <p className="text-sm text-gray-600">تواصل مباشر مع كل طالب على حدة</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">مجموعات</h3>
            <p className="text-sm text-gray-600">أنشئ مجموعات للدورات أو المواضيع</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-2">مشاركة الملفات</h3>
            <p className="text-sm text-gray-600">شارك الصور والملفات والتسجيلات</p>
          </div>
        </div>
      </div>
    </InstructorLayout>
  )
}
