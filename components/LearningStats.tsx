'use client'

import { useState, useEffect } from 'react'
import { Clock, BookOpen, Trophy, TrendingUp, Calendar, Target, Flame } from 'lucide-react'

interface LearningStatsProps {
  userId?: string
  courseId?: string
}

interface Stats {
  totalWatchTime: number
  lessonsCompleted: number
  totalLessons: number
  currentStreak: number
  longestStreak: number
  averageSessionTime: number
  lastStudyDate: string
  weeklyProgress: number[]
}

export default function LearningStats({ userId, courseId }: LearningStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [userId, courseId])

  const loadStats = async () => {
    try {
      const params = new URLSearchParams()
      if (courseId) params.append('courseId', courseId)
      
      const res = await fetch(`/api/learning-stats?${params}`)
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} دقيقة`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours} ساعة ${mins > 0 ? `و ${mins} دقيقة` : ''}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const completionPercentage = stats.totalLessons > 0 
    ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100) 
    : 0

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary-600" />
        إحصائيات التعلم
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Watch Time */}
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{formatTime(stats.totalWatchTime)}</p>
          <p className="text-xs text-blue-600">وقت المشاهدة</p>
        </div>

        {/* Lessons Completed */}
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700">
            {stats.lessonsCompleted}/{stats.totalLessons}
          </p>
          <p className="text-xs text-green-600">الدروس المكتملة</p>
        </div>

        {/* Current Streak */}
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats.currentStreak}</p>
          <p className="text-xs text-orange-600">أيام متتالية</p>
        </div>

        {/* Completion */}
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700">{completionPercentage}%</p>
          <p className="text-xs text-purple-600">نسبة الإنجاز</p>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          نشاط الأسبوع
        </h4>
        <div className="flex items-end justify-between gap-2 h-20">
          {['سبت', 'أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع'].map((day, index) => {
            const value = stats.weeklyProgress[index] || 0
            const maxValue = Math.max(...stats.weeklyProgress, 1)
            const height = (value / maxValue) * 100
            
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={`w-full rounded-t transition-all ${
                    value > 0 ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${value} دقيقة`}
                />
                <span className="text-xs text-gray-500">{day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements hint */}
      {stats.currentStreak >= 7 && (
        <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <p className="font-semibold text-yellow-800">🔥 رائع!</p>
            <p className="text-sm text-yellow-700">
              {stats.currentStreak} يوم متتالي من التعلم!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
