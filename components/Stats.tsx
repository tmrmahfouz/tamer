import * as LucideIcons from 'lucide-react'
import { TrendingUp, Award, BookOpen, Users } from 'lucide-react'

interface StatsProps {
  title?: string
  subtitle?: string
  items?: Array<{
    title?: string
    description?: string
    icon?: string
    value?: string
  }>
}

export default function Stats({ title, subtitle, items }: StatsProps = {}) {
  const defaultStats = [
    {
      iconName: 'Users',
      value: '500+',
      label: 'طالب نشط',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      iconName: 'BookOpen',
      value: '15+',
      label: 'دورة تدريبية',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-400',
    },
    {
      iconName: 'Award',
      value: '450+',
      label: 'شهادة صادرة',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
    },
    {
      iconName: 'TrendingUp',
      value: '98%',
      label: 'معدل رضا الطلاب',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10',
      iconColor: 'text-pink-400',
    },
  ]

  // تحويل items إلى تنسيق stats
  const stats = items && items.length > 0
    ? items.map(item => {
        // تحديد الألوان بناءً على index أو استخدام default
        const colors = [
          { color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-400' },
          { color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', iconColor: 'text-green-400' },
          { color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', iconColor: 'text-purple-400' },
          { color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-500/10', iconColor: 'text-pink-400' },
        ]
        const colorIndex = items.indexOf(item) % colors.length
        
        return {
          iconName: item.icon || 'TrendingUp',
          value: item.value || '0',
          label: item.title || '',
          ...colors[colorIndex]
        }
      })
    : defaultStats

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-100 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20"></div>
      
      <div className="container mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title || 'أرقام تتحدث عن نفسها'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {subtitle || 'انضم إلى مجتمع متنامٍ من المتعلمين المتميزين'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = (LucideIcons as any)[stat.iconName]
            return (
              <div
                key={index}
                className="group relative"
              >
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:scale-105">
                  {/* Icon */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {IconComponent && <IconComponent className="w-10 h-10 text-white" />}
                  </div>
                  
                  {/* Value */}
                  <div className={`text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-lg text-gray-700 font-semibold">
                    {stat.label}
                  </div>

                  {/* Decorative Gradient Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
