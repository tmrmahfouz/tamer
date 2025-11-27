'use client'

import { useState, useEffect } from 'react'
import { Shield, Key, Copy, Check, AlertTriangle } from 'lucide-react'

export default function TwoFactorSetup() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/setup')
      const data = await response.json()

      if (data.success) {
        setEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupTwoFactor = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        setBackupCodes(data.backupCodes)
        setShowBackupCodes(true)
        alert('تم إعداد 2FA بنجاح! احفظ أكواد الاحتياطي')
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const enableTwoFactor = async () => {
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        setEnabled(true)
        setShowBackupCodes(false)
        alert('تم تفعيل 2FA بنجاح!')
      }
    } catch (error) {
      alert('حدث خطأ')
    }
  }

  const disableTwoFactor = async () => {
    if (!confirm('هل أنت متأكد من تعطيل 2FA؟')) return

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '' }), // يجب إضافة كلمة المرور
      })
      const data = await response.json()

      if (data.success) {
        setEnabled(false)
        alert('تم تعطيل 2FA')
      }
    } catch (error) {
      alert('حدث خطأ')
    }
  }

  const copyBackupCodes = () => {
    const text = backupCodes.join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            المصادقة الثنائية (2FA)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            أضف طبقة أمان إضافية لحسابك
          </p>
        </div>
      </div>

      {/* Status */}
      <div className={`p-4 rounded-lg mb-6 ${
        enabled
          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
          : 'bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              enabled ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {enabled ? 'مفعّل' : 'غير مفعّل'}
            </span>
          </div>
          {enabled ? (
            <button
              onClick={disableTwoFactor}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              تعطيل 2FA
            </button>
          ) : (
            <button
              onClick={setupTwoFactor}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              إعداد 2FA
            </button>
          )}
        </div>
      </div>

      {/* Backup Codes */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                أكواد الاحتياطي
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                احفظ هذه الأكواد في مكان آمن. يمكنك استخدامها لتسجيل الدخول إذا فقدت الوصول إلى بريدك الإلكتروني.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded"
                >
                  <Key className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100">{code}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyBackupCodes}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الأكواد</span>
                </>
              )}
            </button>
            <button
              onClick={enableTwoFactor}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
            >
              تفعيل 2FA الآن
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">
          كيف يعمل 2FA؟
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <p>عند تسجيل الدخول، ستدخل بريدك الإلكتروني وكلمة المرور كالمعتاد</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <p>سنرسل رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <p>أدخل الرمز لإكمال تسجيل الدخول بأمان</p>
          </div>
        </div>
      </div>
    </div>
  )
}
