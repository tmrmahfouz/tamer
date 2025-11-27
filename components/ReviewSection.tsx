'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp } from 'lucide-react'

export default function ReviewSection({ courseId }: { courseId: string }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [courseId])

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?courseId=${courseId}`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.reviews)
        setAverageRating(data.averageRating)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          rating: formData.rating,
          comment: formData.comment,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowForm(false)
        setFormData({ rating: 5, comment: '' })
        loadReviews()
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('حدث خطأ أثناء إضافة التقييم')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && setFormData({ ...formData, rating: star })}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            التقييمات والمراجعات
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              ({reviews.length} تقييم)
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'إلغاء' : 'أضف تقييمك'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              التقييم
            </label>
            {renderStars(formData.rating, true)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              التعليق (10 أحرف على الأقل)
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
              minLength={10}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="شارك تجربتك مع الدورة..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'جاري الإرسال...' : 'نشر التقييم'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              لا توجد تقييمات بعد. كن أول من يقيّم هذه الدورة!
            </p>
          </div>
        ) : (
          reviews.map((review) => {
            const user = review.user as any
            return (
              <div
                key={review._id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user?.name?.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                          {user?.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {review.comment}
                    </p>

                    <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                      <ThumbsUp className="w-4 h-4" />
                      <span>مفيد ({review.helpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
