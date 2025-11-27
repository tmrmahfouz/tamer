'use client'

import { useState, useEffect } from 'react'
import { Trophy, Award, TrendingUp, Target, Flame } from 'lucide-react'

export default function AchievementsPanel() {
  const [achievements, setAchievements] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      const data = await response.json()

      if (data.success) {
        setAchievements(data.achievements)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            إنجازاتك
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {stats?.totalPoints || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
              <Target className="w-4 h-4" />
              <span>نقطة</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {stats?.coursesCompleted || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" />
              <span>دورة</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {stats?.currentStreak || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              <span>يوم متتالي</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {achievements.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>شارة</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              المستوى {Math.floor((stats?.totalPoints || 0) / 1000) + 1}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {(stats?.totalPoints || 0) % 1000} / 1000
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-secondary-600 transition-all duration-500"
              style={{ width: `${((stats?.totalPoints || 0) % 1000) / 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <span>الشارات المكتسبة</span>
        </h3>

        {achievements.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لم تحصل على أي شارات بعد</p>
            <p className="text-sm mt-2">ابدأ التعلم لفتح الإنجازات!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement._id}
                className="relative bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        +{achievement.points} نقطة
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Shine Effect */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-lg pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <span>إحصائيات تفصيلية</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stats?.lessonsCompleted || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">دروس مكتملة</div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stats?.quizzesTaken || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">اختبارات</div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stats?.questionsAsked || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">أسئلة مطروحة</div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stats?.answersGiven || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">إجابات مقدمة</div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stats?.acceptedAnswers || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">إجابات مقبولة</div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stats?.notesCreated || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ملاحظات</div>
          </div>
        </div>
      </div>
    </div>
  )
}
