'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearCookiesPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })

    // Also clear localStorage
    localStorage.clear()
    sessionStorage.clear()

    // Redirect to login after 2 seconds
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">✅ تم مسح الكوكيز</h1>
        <p className="text-gray-600 mb-4">جاري التحويل لصفحة تسجيل الدخول...</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  )
}
