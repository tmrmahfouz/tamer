'use client'

import { useEffect, useState } from 'react'

export default function TestSettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
      console.log('Full settings object:', data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">اختبار الإعدادات</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">معلومات أساسية</h2>
        <div className="space-y-2">
          <p><strong>ID:</strong> {settings?._id}</p>
          <p><strong>Site Name:</strong> {settings?.siteName}</p>
          <p><strong>Created At:</strong> {settings?.createdAt}</p>
          <p><strong>Updated At:</strong> {settings?.updatedAt}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">أطوال المحتوى</h2>
        <div className="space-y-2">
          <p><strong>aboutPageContent:</strong> {settings?.aboutPageContent?.length || 0} حرف</p>
          <p><strong>privacyPolicyContent:</strong> {settings?.privacyPolicyContent?.length || 0} حرف</p>
          <p><strong>termsAndConditionsContent:</strong> {settings?.termsAndConditionsContent?.length || 0} حرف</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">محتوى "من نحن" (أول 500 حرف)</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
          {settings?.aboutPageContent?.substring(0, 500)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">سياسة الخصوصية (أول 500 حرف)</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
          {settings?.privacyPolicyContent?.substring(0, 500)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">كامل البيانات (JSON)</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={fetchSettings}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          إعادة التحميل
        </button>
        
        <a
          href="/admin/settings"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block text-center"
        >
          فتح صفحة الإعدادات الرسمية
        </a>
      </div>
    </div>
  )
}
