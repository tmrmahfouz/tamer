import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import HomeSection from '@/models/HomeSection'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// POST - Import default sections from current homepage
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting import default sections...')
    await connectDB()
    console.log('✅ Database connected')
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      console.log('❌ No token found')
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('✅ Token verified for user:', decoded.userId)
    
    // Get user
    const user = await User.findById(decoded.userId)
    
    if (!user || user.role !== 'admin') {
      console.log('❌ User not admin:', user?.role)
      return NextResponse.json(
        { error: 'غير مصرح لك بهذا الإجراء' },
        { status: 403 }
      )
    }

    // Delete all existing sections first (if any)
    console.log('🗑️ Deleting existing sections...')
    const deleteResult = await HomeSection.deleteMany({})
    console.log(`✅ Deleted ${deleteResult.deletedCount} sections`)

    // Default sections based on current homepage
    const defaultSections = [
      // 1. Hero Section (كامل مع كل التفاصيل)
      {
        type: 'hero',
        title: 'تعلم البرمجة والذكاء الاصطناعي',
        subtitle: 'مع مستر تامر محفوظ',
        content: 'انطلق في رحلة تعلم مميزة مع دورات احترافية في البرمجة والذكاء الاصطناعي',
        isActive: true,
        order: 0,
        settings: {
          backgroundColor: '#F9FAFB',
          textColor: '#111827',
          showButton: true,
          buttonText: 'استكشف الدورات',
          buttonLink: '/courses',
          items: [
            {
              title: 'Badge',
              description: 'منصة تعليمية متخصصة',
              icon: 'Sparkles',
              value: 'badge',
            },
            {
              title: 'Python & JavaScript',
              description: 'لغات البرمجة',
              icon: 'Code2',
              value: 'feature1',
            },
            {
              title: 'Machine Learning & AI',
              description: 'الذكاء الاصطناعي',
              icon: 'Brain',
              value: 'feature2',
            },
            {
              title: 'استكشف الدورات',
              description: 'زر أساسي',
              icon: 'ArrowLeft',
              value: '/courses',
            },
            {
              title: 'تعرف على المدرس',
              description: 'زر ثانوي',
              icon: 'ArrowLeft',
              value: '/about',
            },
          ],
        },
      },
      
      // 2. Features Section
      {
        type: 'features',
        title: 'لماذا تختار منصتنا؟',
        subtitle: 'نوفر لك كل ما تحتاجه لتصبح محترفاً في البرمجة والذكاء الاصطناعي',
        content: '',
        isActive: true,
        order: 1,
        settings: {
          backgroundColor: '#F9FAFB',
          textColor: '#111827',
          showButton: false,
          buttonText: '',
          buttonLink: '',
          items: [
            {
              title: 'محاضرات فيديو عالية الجودة',
              description: 'شروحات مفصلة ومبسطة بجودة عالية لضمان فهم أفضل',
              icon: 'Video',
              value: 'from-blue-500 to-blue-600',
            },
            {
              title: 'ملفات ومراجع شاملة',
              description: 'مذكرات وملفات PDF وأكواد جاهزة لكل محاضرة',
              icon: 'FileText',
              value: 'from-green-500 to-green-600',
            },
            {
              title: 'شهادات معتمدة',
              description: 'احصل على شهادة إتمام معتمدة بعد إنهاء كل دورة',
              icon: 'Award',
              value: 'from-yellow-500 to-yellow-600',
            },
            {
              title: 'مجتمع تفاعلي',
              description: 'انضم لمجتمع الطلاب وشارك الخبرات والمشاريع',
              icon: 'Users',
              value: 'from-purple-500 to-purple-600',
            },
            {
              title: 'تعلم بالوتيرة المناسبة',
              description: 'وصول مدى الحياة للمحتوى، تعلم في أي وقت ومن أي مكان',
              icon: 'Clock',
              value: 'from-pink-500 to-pink-600',
            },
            {
              title: 'دعم فني مستمر',
              description: 'فريق دعم متاح للإجابة على استفساراتك ومساعدتك',
              icon: 'Headphones',
              value: 'from-indigo-500 to-indigo-600',
            },
          ],
        },
      },

      // 3. Categories Section (المراحل الدراسية)
      {
        type: 'categories',
        title: 'المراحل الدراسية',
        subtitle: 'اختر المرحلة الدراسية المناسبة لك وابدأ رحلتك التعليمية',
        content: '',
        isActive: true,
        order: 2,
        settings: {
          backgroundColor: '#F9FAFB',
          textColor: '#111827',
          showButton: false,
          buttonText: '',
          buttonLink: '',
          items: [
            {
              title: 'يتم تحميل الفئات من قاعدة البيانات',
              description: 'سيتم عرض الفئات المنشورة تلقائياً',
              icon: '📚',
            },
          ],
        },
      },

      // 4. Courses Section (الدورات التدريبية)
      {
        type: 'courses',
        title: 'الدورات التدريبية',
        subtitle: 'اختر من بين مجموعة متنوعة من الدورات المصممة خصيصاً لتطوير مهاراتك',
        content: '',
        isActive: true,
        order: 3,
        settings: {
          backgroundColor: '#F9FAFB',
          textColor: '#111827',
          showButton: true,
          buttonText: 'عرض جميع الدورات',
          buttonLink: '/courses',
          items: [
            {
              title: 'عدد الدورات المعروضة',
              description: 'يتم عرض أول 6 دورات من قاعدة البيانات',
              icon: '📚',
              value: '6',
            },
          ],
        },
      },

      // 5. Stats Section
      {
        type: 'stats',
        title: 'أرقام تتحدث عن نفسها',
        subtitle: 'انضم إلى مجتمع متنامٍ من المتعلمين المتميزين',
        content: '',
        isActive: true,
        order: 4,
        settings: {
          backgroundColor: '#F9FAFB',
          textColor: '#111827',
          showButton: false,
          buttonText: '',
          buttonLink: '',
          items: [
            {
              title: 'طالب نشط',
              value: '500+',
              icon: 'Users',
            },
            {
              title: 'دورة تدريبية',
              value: '15+',
              icon: 'BookOpen',
            },
            {
              title: 'شهادة صادرة',
              value: '450+',
              icon: 'Award',
            },
            {
              title: 'معدل رضا الطلاب',
              value: '98%',
              icon: 'TrendingUp',
            },
          ],
        },
      },

      // 6. Testimonials Section
      {
        type: 'testimonials',
        title: 'آراء طلابنا',
        subtitle: 'اكتشف تجارب طلابنا الناجحة ورحلتهم في تعلم البرمجة والذكاء الاصطناعي',
        content: '',
        isActive: true,
        order: 5,
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          showButton: false,
          buttonText: '',
          buttonLink: '',
          items: [
            {
              title: 'أحمد محمد',
              description: 'أفضل منصة تعليمية جربتها! الشرح واضح ومبسط والمدرس متمكن جداً. استفدت كثيراً من دورة Python.',
              icon: '👨‍💻',
              value: 'طالب - دورة Python|5',
            },
            {
              title: 'سارة أحمد',
              description: 'دورة الذكاء الاصطناعي كانت رائعة! تعلمت الكثير وأصبحت قادرة على بناء مشاريع حقيقية.',
              icon: '👩‍💻',
              value: 'طالبة - دورة الذكاء الاصطناعي|5',
            },
            {
              title: 'محمود علي',
              description: 'المحتوى احترافي والأمثلة العملية ساعدتني كثيراً في تطوير مهاراتي في JavaScript.',
              icon: '🧑‍💻',
              value: 'مطور ويب - دورة JavaScript|5',
            },
            {
              title: 'فاطمة حسن',
              description: 'تعلمت تحليل البيانات من الصفر وأصبحت قادرة على العمل في مجال Data Science بفضل هذه الدورة.',
              icon: '👩‍🔬',
              value: 'محللة بيانات - دورة تحليل البيانات|5',
            },
          ],
        },
      },

      // 7. CTA Section
      {
        type: 'cta',
        title: 'جاهز لتطوير مهاراتك؟',
        subtitle: 'ابدأ رحلتك التعليمية الآن',
        content: 'انضم إلى مئات الطلاب الذين حققوا أهدافهم في تعلم البرمجة والذكاء الاصطناعي. ابدأ اليوم واحصل على خصم خاص للمشتركين الجدد!',
        isActive: true,
        order: 6,
        settings: {
          backgroundColor: '#F9FAFB',
          textColor: '#111827',
          showButton: true,
          buttonText: 'سجل الآن مجاناً',
          buttonLink: '/register',
          items: [],
        },
      },
    ]

    // Insert all sections
    console.log(`📥 Inserting ${defaultSections.length} sections...`)
    const createdSections = await HomeSection.insertMany(defaultSections)
    console.log(`✅ Successfully created ${createdSections.length} sections`)
    
    return NextResponse.json({
      message: 'تم استيراد الأقسام الافتراضية بنجاح',
      count: createdSections.length,
      sections: createdSections,
    })
  } catch (error: any) {
    console.error('❌ Error importing default sections:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'فشل في استيراد الأقسام',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
