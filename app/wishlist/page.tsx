'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'

export default function WishlistPage() {
  const router = useRouter()
  const [wishlist, setWishlist] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      const data = await response.json()

      if (data.success) {
        setWishlist(data.wishlist)
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (courseId: string) => {
    try {
      const response = await fetch(`/api/wishlist?courseId=${courseId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        loadWishlist()
      }
    } catch (error) {
      console.error('Error:', error)
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              <span>المفضلة</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              الدورات التي أضفتها لقائمة المفضلة
            </p>
          </div>

          {!wishlist || wishlist.courses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                لا توجد دورات في المفضلة
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ابدأ بإضافة الدورات التي تهمك
              </p>
              <button
                onClick={() => router.push('/courses')}
                className="btn-primary"
              >
                استكشف الدورات
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.courses.map((course: any) => (
                <div
                  key={course._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-6xl">
                      {course.image}
                    </div>
                    <button
                      onClick={() => removeFromWishlist(course._id)}
                      className="absolute top-4 left-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="إزالة من المفضلة"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold">
                        {course.category}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {course.price} جنيه
                      </div>
                      <button
                        onClick={() => router.push(`/courses/${course._id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>عرض</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
