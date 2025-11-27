'use client'

import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'

export default function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [type, setType] = useState('points')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [type])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?type=${type}&limit=10`)
      const data = await response.json()

      if (data.success) {
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          المتصدرون
        </h3>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType('points')}
          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
            type === 'points'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          النقاط
        </button>
        <button
          onClick={() => setType('courses')}
          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
            type === 'courses'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          الدورات
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div>جاري التحميل...</div>
        ) : (
          leaderboard.map((item, index) => (
            <div
              key={item._id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <span className="text-2xl w-10 text-center">{getMedalIcon(index)}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.user?.name || 'مستخدم'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {type === 'points' && `${item.totalPoints} نقطة`}
                  {type === 'courses' && `${item.coursesCompleted} دورة`}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
