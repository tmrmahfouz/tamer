'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to unified settings page
export default function OldSettingsPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/dashboard/admin/settings')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحويل إلى صفحة الإعدادات...</p>
      </div>
    </div>
  )
}
