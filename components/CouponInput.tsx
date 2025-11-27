'use client'

import { useState } from 'react'
import { Tag, Check, X } from 'lucide-react'

interface CouponInputProps {
  courseId?: string
  originalPrice: number
  onApply: (discount: number) => void
}

export default function CouponInput({ courseId, originalPrice, onApply }: CouponInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [message, setMessage] = useState('')
  const [discount, setDiscount] = useState(0)

  const handleApply = async () => {
    if (!code.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, courseId }),
      })

      const data = await response.json()

      if (data.success) {
        const coupon = data.coupon
        let discountAmount = 0

        if (coupon.discountType === 'percentage') {
          discountAmount = (originalPrice * coupon.discountValue) / 100
        } else {
          discountAmount = coupon.discountValue
        }

        setDiscount(discountAmount)
        setApplied(true)
        setMessage(`تم تطبيق الخصم: ${discountAmount} جنيه`)
        onApply(discountAmount)
      } else {
        setMessage(data.message)
        setApplied(false)
        setDiscount(0)
        onApply(0)
      }
    } catch (error) {
      setMessage('حدث خطأ أثناء التحقق من الكوبون')
      setApplied(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setCode('')
    setApplied(false)
    setMessage('')
    setDiscount(0)
    onApply(0)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={applied}
            placeholder="أدخل كود الكوبون"
            className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
          />
        </div>
        {!applied ? (
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-semibold whitespace-nowrap"
          >
            {loading ? 'جاري التحقق...' : 'تطبيق'}
          </button>
        ) : (
          <button
            onClick={handleRemove}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold whitespace-nowrap"
          >
            إزالة
          </button>
        )}
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            applied
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}
        >
          {applied ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <X className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold">{message}</span>
        </div>
      )}
    </div>
  )
}
