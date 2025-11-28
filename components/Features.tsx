import * as LucideIcons from 'lucide-react'
import { Video, FileText, Award, Users, Clock, Headphones } from 'lucide-react'

interface FeaturesProps {
  title?: string
  subtitle?: string
  items?: Array<{
    title?: string
    description?: string
    icon?: string
    value?: string
    color?: string
  }>
}

export default function Features({ title, subtitle, items }: FeaturesProps = {}) {
  const defaultFeatures = [
    {
      icon: 'Video',
      title: 'محاضرات فيديو عالية الجودة',
      description: 'شروحات مفصلة ومبسطة بجودة عالية لضمان فهم أفضل',
      color: 'from-blue-500 to-blue-600',
      value: 'from-blue-500 to-blue-600',
    },
    {
      icon: 'FileText',
      title: 'ملفات ومراجع شاملة',
      description: 'مذكرات وملفات PDF وأكواد جاهزة لكل محاضرة',
      color: 'from-green-500 to-green-600',
      value: 'from-green-500 to-green-600',
    },
    {
      icon: 'Award',
      title: 'شهادات معتمدة',
      description: 'احصل على شهادة إتمام معتمدة بعد إنهاء كل دورة',
      color: 'from-yellow-500 to-yellow-600',
      value: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: 'Users',
      title: 'مجتمع تفاعلي',
      description: 'انضم لمجتمع الطلاب وشارك الخبرات والمشاريع',
      color: 'from-purple-500 to-purple-600',
      value: 'from-purple-500 to-purple-600',
    },
    {
      icon: 'Clock',
      title: 'تعلم بالوتيرة المناسبة',
      description: 'وصول مدى الحياة للمحتوى، تعلم في أي وقت ومن أي مكان',
      color: 'from-pink-500 to-pink-600',
      value: 'from-pink-500 to-pink-600',
    },
    {
      icon: 'Headphones',
      title: 'دعم فني مستمر',
      description: 'فريق دعم متاح للإجابة على استفساراتك ومساعدتك',
      color: 'from-indigo-500 to-indigo-600',
      value: 'from-indigo-500 to-indigo-600',
    },
  ]

  const features = items || defaultFeatures

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">{title || 'لماذا تختار منصتنا؟'}</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            {subtitle || 'نوفر لك كل ما تحتاجه لتصبح محترفاً في البرمجة والذكاء الاصطناعي'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = typeof feature.icon === 'string' 
              ? (LucideIcons as any)[feature.icon] 
              : feature.icon
            const gradientColor = feature.value || feature.color || 'from-blue-500 to-blue-600'
            return (
              <div
                key={index}
                className="card p-8 group hover:scale-105 text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${gradientColor} rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform mx-auto`}>
                  {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
