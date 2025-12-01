'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { Smartphone, Trash2, Monitor, Tablet, Clock, MapPin, Loader2, ArrowRight, RefreshCw, Settings, User } from 'lucide-react'

interface Device {
  deviceId: string
  deviceName: string
  browser: string
  os: string
  ip: string
  lastUsed: string
  createdAt: string
}

interface UserInfo {
  name: string
  email: string
  maxDevices: number | null
}

export default function UserDevicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [maxDevices, setMaxDevices] = useState<number>(0)
  const [savingMax, setSavingMax] = useState(false)

  useEffect(() => {
    loadDevices()
  }, [id])

  const loadDevices = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}/devices`)
      const data = await res.json()
      if (data.success) {
        setUser(data.user)
        setDevices(data.devices || [])
        setMaxDevices(data.user.maxDevices || 0)
      }
    } catch (error) {
      console.error('Error loading devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeDevice = async (deviceId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا الجهاز؟')) return

    setRemoving(deviceId)
    try {
      const res = await fetch(`/api/admin/users/${id}/devices?deviceId=${deviceId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setDevices(data.devices || [])
      }
    } catch (error) {
      console.error('Error removing device:', error)
    } finally {
      setRemoving(null)
    }
  }

  const clearAllDevices = async () => {
    if (!confirm('هل أنت متأكد من مسح جميع الأجهزة؟ سيحتاج المستخدم لتسجيل الدخول مرة أخرى.')) return

    setClearing(true)
    try {
      const res = await fetch(`/api/admin/users/${id}/devices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAllDevices: true })
      })
      const data = await res.json()
      if (data.success) {
        setDevices([])
        alert('✅ تم مسح جميع الأجهزة')
      }
    } catch (error) {
      console.error('Error clearing devices:', error)
    } finally {
      setClearing(false)
    }
  }

  const updateMaxDevices = async () => {
    setSavingMax(true)
    try {
      const res = await fetch(`/api/admin/users/${id}/devices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDevices })
      })
      const data = await res.json()
      if (data.success) {
        alert('✅ تم تحديث الحد الأقصى للأجهزة')
      }
    } catch (error) {
      console.error('Error updating max devices:', error)
    } finally {
      setSavingMax(false)
    }
  }

  const getDeviceIcon = (os: string) => {
    if (os?.includes('Android') || os?.includes('iOS')) return <Smartphone className="w-8 h-8" />
    if (os?.includes('iPad')) return <Tablet className="w-8 h-8" />
    return <Monitor className="w-8 h-8" />
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout title="أجهزة المستخدم">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="أجهزة المستخدم">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowRight className="w-5 h-5" />
          العودة
        </button>

        {/* User Info */}
        {user && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Max Devices Setting */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="font-bold text-gray-900">إعدادات الأجهزة</h2>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">الحد الأقصى للأجهزة</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxDevices}
                  onChange={(e) => setMaxDevices(parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border rounded-lg text-center"
                />
                <span className="text-sm text-gray-500">(0 = استخدام الإعداد العام)</span>
              </div>
            </div>
            <button
              onClick={updateMaxDevices}
              disabled={savingMax}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {savingMax ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
            </button>
          </div>
        </div>

        {/* Devices Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            الأجهزة المسجلة ({devices.length})
          </h2>
          {devices.length > 0 && (
            <button
              onClick={clearAllDevices}
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              مسح الكل
            </button>
          )}
        </div>

        {/* Devices List */}
        {devices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <Smartphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">لا توجد أجهزة مسجلة</h3>
            <p className="text-gray-500 mt-1">لم يسجل هذا المستخدم الدخول من أي جهاز بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.deviceId} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                    {getDeviceIcon(device.os)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{device.deviceName}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      <span>{device.browser}</span>
                      <span>{device.os}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        آخر استخدام: {formatDate(device.lastUsed)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        تاريخ التسجيل: {formatDate(device.createdAt)}
                      </span>
                      {device.ip && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {device.ip}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeDevice(device.deviceId)}
                    disabled={removing === device.deviceId}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="إزالة الجهاز"
                  >
                    {removing === device.deviceId ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
