'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Award, BookOpen, Users, TrendingUp, Code2, Brain, Sparkles } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

export default function AboutPage() {
  const settings = useSettings()
  const achievements = [
    {
      icon: Users,
      value: '500+',
      label: 'طالب تخرج',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: BookOpen,
      value: '15+',
      label: 'دورة منشورة',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Award,
      value: '450+',
      label: 'شهادة صادرة',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: TrendingUp,
      value: '5+',
      label: 'سنوات خبرة',
      color: 'from-pink-500 to-pink-600',
    },
  ]

  const skills = [
    { name: 'Python', level: 95, icon: '🐍' },
    { name: 'JavaScript', level: 90, icon: '🌐' },
    { name: 'Machine Learning', level: 92, icon: '🤖' },
    { name: 'Data Science', level: 88, icon: '📊' },
    { name: 'Deep Learning', level: 85, icon: '🧠' },
    { name: 'Web Development', level: 90, icon: '💻' },
  ]

  const experience = [
    {
      year: '2024',
      title: 'مدرس برمجة وذكاء اصطناعي',
      company: 'منصة مستر تامر محفوظ',
      description: 'إنشاء وإدارة منصة تعليمية متخصصة في البرمجة والذكاء الاصطناعي',
    },
    {
      year: '2022-2023',
      title: 'مطور Full Stack',
      company: 'شركة تقنية رائدة',
      description: 'تطوير تطبيقات ويب وموبايل باستخدام أحدث التقنيات',
    },
    {
      year: '2020-2022',
      title: 'مهندس ذكاء اصطناعي',
      company: 'مركز أبحاث AI',
      description: 'العمل على مشاريع التعلم الآلي والتعلم العميق',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold">معلم متخصص في البرمجة والذكاء الاصطناعي</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              مستر تامر محفوظ
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              مهندس برمجيات ومتخصص في الذكاء الاصطناعي
              <br />
              شغوف بتعليم البرمجة وتبسيط المفاهيم المعقدة
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
                <Code2 className="w-6 h-6" />
                <span className="font-semibold">Full Stack Developer</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
                <Brain className="w-6 h-6" />
                <span className="font-semibold">AI Specialist</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <div key={index} className="text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gradient mb-2">{achievement.value}</div>
                  <div className="text-gray-600 font-semibold">{achievement.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* About Text */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">من أنا؟</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                {settings.aboutPageContent}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">المهارات والتخصصات</h2>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{skill.icon}</span>
                        <span className="font-semibold text-gray-900">{skill.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary-600">{skill.level}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full transition-all duration-1000"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">الخبرة العملية</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <div key={index} className="relative pr-8 border-r-4 border-primary-600">
                  <div className="absolute -right-3 top-0 w-6 h-6 bg-primary-600 rounded-full"></div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-sm font-semibold text-primary-600 mb-2">{exp.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{exp.title}</h3>
                    <div className="text-gray-600 font-semibold mb-3">{exp.company}</div>
                    <p className="text-gray-700">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            جاهز لبدء رحلتك التعليمية؟
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            انضم إلى مئات الطلاب الذين يتعلمون البرمجة والذكاء الاصطناعي معي
          </p>
          <a href="/courses" className="btn-primary inline-block">
            استكشف الدورات
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
