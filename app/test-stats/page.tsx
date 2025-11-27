'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { useEffect, useState } from 'react'

export default function TestStatsPage() {
  const settings = useSettings()
  const [apiData, setApiData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        console.log('API Data:', data)
        setApiData(data)
      })
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">اختبار الإحصائيات</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* From Context */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-blue-600">من Context</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">عدد الطلاب:</span>
              <span className="text-lg font-bold">{settings.statsStudents}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">عدد الدورات:</span>
              <span className="text-lg font-bold">{settings.statsCourses}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">نسبة الرضا:</span>
              <span className="text-lg font-bold">{settings.statsSatisfaction}</span>
            </div>
          </div>
        </div>

        {/* From API */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-green-600">من API مباشرة</h2>
          {apiData ? (
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">عدد الطلاب:</span>
                <span className="text-lg font-bold">{apiData.statsStudents || 'غير موجود'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">عدد الدورات:</span>
                <span className="text-lg font-bold">{apiData.statsCourses || 'غير موجود'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">نسبة الرضا:</span>
                <span className="text-lg font-bold">{apiData.statsSatisfaction || 'غير موجود'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">جاري التحميل...</p>
          )}
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg">
        <h3 className="font-bold text-lg mb-3">ملاحظات:</h3>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>إذا كانت القيم من Context و API متطابقة = كل شيء يعمل ✅</li>
          <li>إذا كانت القيم من API تظهر "غير موجود" = المشكلة في Model أو Database ❌</li>
          <li>إذا كانت القيم من Context مختلفة = المشكلة في Context ❌</li>
        </ul>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          إعادة تحميل الصفحة
        </button>
        <a
          href="/admin/settings"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block"
        >
          فتح صفحة الإعدادات
        </a>
        <a
          href="/"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block"
        >
          فتح الصفحة الرئيسية
        </a>
      </div>
    </div>
  )
}
