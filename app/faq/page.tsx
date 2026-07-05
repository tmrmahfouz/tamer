'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'كيف يمكنني التسجيل في المنصة؟',
      answer: 'يمكنك التسجيل بسهولة من خلال الضغط على زر "إنشاء حساب" في الصفحة الرئيسية، ثم إدخال بياناتك الأساسية (الاسم، البريد الإلكتروني، وكلمة المرور).'
    },
    {
      question: 'كيف أشترك في دورة؟',
      answer: 'بعد تسجيل الدخول، اختر الدورة المطلوبة، اضغط على "اشترك الآن"، ثم اختر طريقة الدفع المناسبة وأكمل عملية الدفع.'
    },
    {
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نوفر عدة طرق للدفع: فودافون كاش، إنستاباي، فوري، والتحويل البنكي. يمكنك اختيار الطريقة الأنسب لك عند الاشتراك.'
    },
    {
      question: 'متى سيتم تفعيل اشتراكي؟',
      answer: 'بعد إرسال إثبات الدفع، سيتم مراجعته من قبل الإدارة خلال 24 ساعة. ستحصل على إشعار فور التفعيل.'
    },
    {
      question: 'هل يمكنني الوصول للدورات من الهاتف؟',
      answer: 'نعم! المنصة متوافقة تماماً مع الهواتف الذكية والأجهزة اللوحية، يمكنك الدراسة من أي مكان وفي أي وقت.'
    },
    {
      question: 'هل أحصل على شهادة بعد إتمام الدورة؟',
      answer: 'نعم، بعد إنهاء جميع دروس الدورة واجتياز الاختبارات، ستحصل على شهادة إتمام يمكنك تحميلها ومشاركتها.'
    },
    {
      question: 'ماذا لو واجهت مشكلة تقنية؟',
      answer: 'يمكنك التواصل مع الدعم الفني من خلال صفحة "تواصل معنا" أو من خلال لوحة التحكم. فريقنا جاهز لمساعدتك.'
    },
    {
      question: 'هل يمكنني استرجاع أموالي؟',
      answer: 'نعم، يمكنك طلب استرجاع المبلغ خلال 7 أيام من الاشتراك إذا لم تبدأ في مشاهدة الدروس.'
    },
    {
      question: 'كم مدة الوصول للدورة؟',
      answer: 'بمجرد الاشتراك في الدورة، يمكنك الوصول إليها بشكل دائم ومدى الحياة، دون أي قيود زمنية.'
    },
    {
      question: 'هل المحتوى باللغة العربية؟',
      answer: 'نعم، جميع الدورات والمحتوى التعليمي متوفر باللغة العربية بشرح واضح ومبسط.'
    }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            الأسئلة الشائعة
          </h1>
          <p className="text-lg text-gray-600">
            إجابات سريعة للأسئلة الأكثر شيوعاً
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-right hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-gray-900 flex-1">
                  {faq.question}
                </h3>
                <div className="mr-4 flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-primary-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">
            لم تجد إجابة لسؤالك؟
          </h2>
          <p className="mb-6 text-primary-100">
            تواصل معنا وسنكون سعداء بمساعدتك
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-primary-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            تواصل معنا
          </a>
        </div>
      </div>
      </div>
      <Footer />
    </>
  )
}
