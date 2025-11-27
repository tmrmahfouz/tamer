import { Star, Quote } from 'lucide-react'

interface TestimonialsProps {
  title?: string
  subtitle?: string
  items?: Array<{
    title?: string
    description?: string
    icon?: string
    value?: string
  }>
}

export default function Testimonials({ title, subtitle, items }: TestimonialsProps = {}) {
  const defaultTestimonials = [
    {
      name: 'أحمد محمد',
      role: 'طالب - دورة Python',
      image: '👨‍💻',
      rating: 5,
      text: 'أفضل منصة تعليمية جربتها! الشرح واضح ومبسط والمدرس متمكن جداً. استفدت كثيراً من دورة Python.',
    },
    {
      name: 'سارة أحمد',
      role: 'طالبة - دورة الذكاء الاصطناعي',
      image: '👩‍💻',
      rating: 5,
      text: 'دورة الذكاء الاصطناعي كانت رائعة! تعلمت الكثير وأصبحت قادرة على بناء مشاريع حقيقية.',
    },
    {
      name: 'محمود علي',
      role: 'مطور ويب - دورة JavaScript',
      image: '🧑‍💻',
      rating: 5,
      text: 'المحتوى احترافي والأمثلة العملية ساعدتني كثيراً في تطوير مهاراتي في JavaScript.',
    },
    {
      name: 'فاطمة حسن',
      role: 'محللة بيانات - دورة تحليل البيانات',
      image: '👩‍🔬',
      rating: 5,
      text: 'تعلمت تحليل البيانات من الصفر وأصبحت قادرة على العمل في مجال Data Science بفضل هذه الدورة.',
    },
  ]

  // تحويل items إلى تنسيق testimonials
  const testimonials = items && items.length > 0 
    ? items.map(item => {
        // استخراج rating من value (مثال: "طالب - دورة Python|5")
        const parts = item.value?.split('|') || []
        const rating = parts[1] ? parseInt(parts[1]) : 5
        
        return {
          name: item.title || '',
          role: parts[0] || item.value || '',
          image: item.icon || '👨‍💻',
          rating: rating,
          text: item.description || '',
        }
      })
    : defaultTestimonials

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">{title || 'آراء طلابنا'}</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            {subtitle || 'اكتشف تجارب طلابنا الناجحة ورحلتهم في تعلم البرمجة والذكاء الاصطناعي'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-6 relative">
              <Quote className="absolute top-4 left-4 w-8 h-8 text-primary-200" />
              
              <div className="flex flex-col items-center text-center mb-4">
                <div className="text-6xl mb-3">{testimonial.image}</div>
                <h3 className="font-bold text-lg text-gray-900">{testimonial.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{testimonial.role}</p>
                
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed relative z-10">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
