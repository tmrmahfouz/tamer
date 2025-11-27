'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Award,
  BookOpen,
  TrendingUp,
  Clock,
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    totalHours: 0,
  })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
  })

  useEffect(() => {
    loadProfile()
    loadStats()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          bio: data.user.bio || '',
          location: data.user.location || '',
          website: data.user.website || '',
        })
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert('تم تحديث الملف الشخصي بنجاح')
        setEditing(false)
        loadProfile()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('حدث خطأ')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الملف الشخصي</h1>
        <p className="text-gray-600">إدارة معلوماتك الشخصية وإعداداتك</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <Camera className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h2>
              <p className="text-gray-600 mb-2">{user?.email}</p>
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold">
                {user?.role === 'admin' && 'مدير'}
                {user?.role === 'instructor' && 'مدرس'}
                {user?.role === 'student' && 'طالب'}
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="w-5 h-5" />
                  <span>الدورات المسجلة</span>
                </div>
                <span className="font-bold text-gray-900">{stats.enrolledCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-5 h-5" />
                  <span>الدورات المكتملة</span>
                </div>
                <span className="font-bold text-green-600">{stats.completedCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="w-5 h-5" />
                  <span>الشهادات</span>
                </div>
                <span className="font-bold text-blue-600">{stats.certificates}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>ساعات التعلم</span>
                </div>
                <span className="font-bold text-purple-600">{stats.totalHours}</span>
              </div>
            </div>

            {/* Member Since */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar className="w-4 h-4" />
                <span>عضو منذ {new Date(user?.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">المعلومات الشخصية</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditing(false)
                    loadProfile()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>إلغاء</span>
                </button>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  الاسم الكامل
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    required
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user?.name}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  رقم الهاتف
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    placeholder="+20 123 456 7890"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user?.phone || 'غير محدد'}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  الموقع
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    placeholder="القاهرة، مصر"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user?.location || 'غير محدد'}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  نبذة عني
                </label>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 h-32"
                    placeholder="اكتب نبذة مختصرة عنك..."
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{user?.bio || 'لم يتم إضافة نبذة بعد'}</p>
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  الموقع الإلكتروني
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    placeholder="https://example.com"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    {user?.website ? (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {user.website}
                      </a>
                    ) : (
                      <span className="text-gray-900">غير محدد</span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {editing && (
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    <span>حفظ التغييرات</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">الأمان والخصوصية</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/dashboard/settings?tab=password')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="font-semibold text-gray-900">تغيير كلمة المرور</span>
                <Edit className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => router.push('/dashboard/settings?tab=privacy')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="font-semibold text-gray-900">إعدادات الخصوصية</span>
                <Edit className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
