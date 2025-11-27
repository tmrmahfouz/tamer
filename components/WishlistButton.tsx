'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

export default function WishlistButton({ courseId }: { courseId: string }) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkWishlist()
  }, [courseId])

  const checkWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist')
      const data = await response.json()
      
      if (data.success && data.wishlist) {
        const inWishlist = data.wishlist.courses.some(
          (course: any) => course._id === courseId
        )
        setIsInWishlist(inWishlist)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const toggleWishlist = async () => {
    setLoading(true)

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?courseId=${courseId}`, {
          method: 'DELETE',
        })
        const data = await response.json()
        
        if (data.success) {
          setIsInWishlist(false)
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        })
        const data = await response.json()
        
        if (data.success) {
          setIsInWishlist(true)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-3 rounded-lg transition-all ${
        isInWishlist
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      title={isInWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
    >
      <Heart
        className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`}
      />
    </button>
  )
}
