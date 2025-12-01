'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Trash2, Monitor, Tablet, Clock, MapPin, Loader2, AlertTriangle, Shield } from 'lucide-react'

interface Device {
  deviceId: string
  deviceName: string
  browser: string
  os: string
  ip: string
  lastUsed: string
  createdAt: string
}

export default function StudentDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [maxDevices, setMaxDevices] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const res = await fetch('/api/user/devices')
      const data = await res.json()
      if (data.success) {
        setDevices(data.devices || [])
        setMaxDevices(data.maxDevices)
      }
    } catch (error) {
      console.error('Error loading devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeDevice = async (deviceId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا الجهاز؟ ستحتاج لتسجيل الدخول مرة أخرى من هذا الجهاز.')) return

    setRemoving(deviceId)
    try {
      const res = await fetch(`/api/user/devices?deviceId=${deviceId}`, { method: 'DELETE' })
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

  const getDeviceIcon = (os: string) => {
    if (os.includes('Android') || os.includes('iOS')) return <Smartphone className="w-8 h-8" />
    if (os.includes('iPad')) return <Tablet className="w-8 h-8" />
    return <Monitor className="w-8 h-8" />
  }

  const formatDate = (dateStr: string) => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary-600" />
            أجهزتي المسجلة
          </h1>
          <p className="text-gray-600 mt-1">إدارة الأجهزة المسموح لها بالوصول لحسابك</p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900 font-medium">حماية حسابك</p>
              <p className="text-sm text-blue-700 mt-1">
                لحماية محتوى الدورات، يُسمح لك باستخدام {maxDevices || 2} أجهزة كحد أقصى.
                إذا احتجت لتسجيل الدخول من جهاز جديد، قم بإزالة أحد الأجهزة القديمة.
              </p>
            </div>
          </div>
        </div>

        {/* Devices Count */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">الأجهزة المستخدمة</span>
            <span className={`text-lg font-bold ${devices.length >= (maxDevices || 2) ? 'text-red-600' : 'text-green-600'}`}>
              {devices.length} / {maxDevices || 2}
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${devices.length >= (maxDevices || 2) ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${(devices.length / (maxDevices || 2)) * 100}%` }}
            />
          </div>
        </div>

        {/* Devices List */}
        {devices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <Smartphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">لا توجد أجهزة مسجلة</h3>
            <p className="text-gray-500 mt-1">سيتم تسجيل الأجهزة تلقائياً عند تسجيل الدخول</p>
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
    </div>
  )
}
