'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Database,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
  Shield,
} from 'lucide-react'

export default function AdminBackupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([
    'users',
    'courses',
    'enrollments',
    'payments',
    'coupons',
    'tickets',
  ])

  const collections = [
    { id: 'users', label: 'المستخدمون', icon: '👥' },
    { id: 'courses', label: 'الدورات', icon: '📚' },
    { id: 'enrollments', label: 'التسجيلات', icon: '📝' },
    { id: 'payments', label: 'المدفوعات', icon: '💰' },
    { id: 'coupons', label: 'الكوبونات', icon: '🎟️' },
    { id: 'tickets', label: 'تذاكر الدعم', icon: '💬' },
  ]

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.success || data.user.role !== 'admin') {
        router.push('/dashboard')
      }
    } catch (error) {
      router.push('/login')
    }
  }

  const handleBackup = async () => {
    if (selectedCollections.length === 0) {
      alert('الرجاء اختيار مجموعة واحدة على الأقل')
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams({
        collections: selectedCollections.join(','),
      })

      const response = await fetch(`/api/admin/backup?${params}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert('تم إنشاء النسخة الاحتياطية بنجاح')
    } catch (error) {
      console.error('Backup error:', error)
      alert('حدث خطأ أثناء إنشاء النسخة الاحتياطية')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('⚠️ تحذير: استعادة النسخة الاحتياطية قد تستبدل البيانات الحالية. هل أنت متأكد؟')) {
      return
    }

    try {
      setLoading(true)
      const text = await file.text()
      const backup = JSON.parse(text)

      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      })

      const data = await response.json()

      if (data.success) {
        alert(`تم استعادة النسخة الاحتياطية بنجاح\n\nتم الاستعادة: ${data.results.restored.length}\nفشل: ${data.results.failed.length}`)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Restore error:', error)
      alert('حدث خطأ أثناء استعادة النسخة الاحتياطية')
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">النسخ الاحتياطي والاستعادة</h1>
        <p className="text-gray-600">إدارة النسخ الاحتياطية لقاعدة البيانات</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-r-4 border-yellow-400 p-6 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-900 mb-2">تحذير هام</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• قم بإنشاء نسخة احتياطية بشكل دوري لحماية بياناتك</li>
              <li>• احفظ ملفات النسخ الاحتياطية في مكان آمن</li>
              <li>• استعادة النسخة الاحتياطية قد تستبدل البيانات الحالية</li>
              <li>• تأكد من صحة ملف النسخة الاحتياطية قبل الاستعادة</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Backup */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">إنشاء نسخة احتياطية</h2>
              <p className="text-sm text-gray-600">تصدير البيانات إلى ملف JSON</p>
            </div>
          </div>

          {/* Collections Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">اختر المجموعات:</h3>
            <div className="space-y-2">
              {collections.map((collection) => (
                <label
                  key={collection.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(collection.id)}
                    onChange={() => toggleCollection(collection.id)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-600"
                  />
                  <span className="text-2xl">{collection.icon}</span>
                  <span className="font-medium text-gray-900">{collection.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Backup Button */}
          <button
            onClick={handleBackup}
            disabled={loading || selectedCollections.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            <span>{loading ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية'}</span>
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">ما يتم تضمينه:</p>
                <ul className="space-y-1">
                  <li>• جميع البيانات من المجموعات المحددة</li>
                  <li>• معلومات التاريخ والإصدار</li>
                  <li>• ملف JSON قابل للاستعادة</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Restore Backup */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">استعادة نسخة احتياطية</h2>
              <p className="text-sm text-gray-600">استيراد البيانات من ملف JSON</p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="mb-6">
            <label className="block w-full">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-600 hover:bg-primary-50 transition-all cursor-pointer">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-semibold mb-2">
                  اضغط لاختيار ملف النسخة الاحتياطية
                </p>
                <p className="text-sm text-gray-600">JSON فقط</p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>

          {/* Warning */}
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900">
                <p className="font-semibold mb-1">⚠️ تحذير:</p>
                <ul className="space-y-1">
                  <li>• قد تستبدل البيانات الحالية</li>
                  <li>• تأكد من صحة الملف قبل الاستعادة</li>
                  <li>• قم بإنشاء نسخة احتياطية حالية أولاً</li>
                  <li>• العملية لا يمكن التراجع عنها</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">أفضل الممارسات</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">نسخ احتياطية منتظمة</h3>
            </div>
            <p className="text-sm text-gray-600">
              قم بإنشاء نسخة احتياطية يومياً أو أسبوعياً حسب حجم التغييرات في المنصة
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">تخزين آمن</h3>
            </div>
            <p className="text-sm text-gray-600">
              احفظ النسخ الاحتياطية في أكثر من مكان (سحابة، قرص خارجي، إلخ)
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">اختبار الاستعادة</h3>
            </div>
            <p className="text-sm text-gray-600">
              اختبر عملية الاستعادة بشكل دوري للتأكد من صحة النسخ الاحتياطية
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
