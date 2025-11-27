import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BackToDashboard() {
  return (
    <Link href="/dashboard">
      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span>العودة للوحة التحكم</span>
      </button>
    </Link>
  )
}
