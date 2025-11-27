import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

interface CTAProps {
  title?: string
  subtitle?: string
  content?: string
  buttonText?: string
  buttonLink?: string
}

export default function CTA({ title, subtitle, content, buttonText, buttonLink }: CTAProps = {}) {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg mb-6">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">
              {subtitle || 'ابدأ رحلتك التعليمية الآن'}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">جاهز لتطوير </span>
            <span className="text-gradient">مهاراتك؟</span>
          </h2>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            {content || (
              <>
                انضم إلى مئات الطلاب الذين حققوا أهدافهم في تعلم البرمجة والذكاء الاصطناعي
                <br />
                ابدأ اليوم واحصل على خصم خاص للمشتركين الجدد!
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={buttonLink || '/register'} className="btn-primary flex items-center gap-2 text-lg">
              <span>{buttonText || 'سجل الآن مجاناً'}</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/courses" className="btn-secondary text-lg">
              تصفح الدورات
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>بدون بطاقة ائتمان</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>إلغاء في أي وقت</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>دعم فني 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
