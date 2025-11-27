const mongoose = require('mongoose')

// الاتصال بقاعدة البيانات
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات'))
  .catch((err) => console.error('❌ خطأ في الاتصال:', err))

// تعريف الـ Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
})

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: Number,
  image: String,
  category: String,
  level: String,
  duration: String,
  topics: [String],
  students: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  published: { type: Boolean, default: true },
}, { timestamps: true })

const lessonSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  videoUrl: String,
  duration: String,
  order: Number,
  isFree: { type: Boolean, default: false },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema)

async function addTestCourse() {
  try {
    console.log('🚀 بدء إضافة الدورة التجريبية...')

    // البحث عن Admin أو أي مستخدم admin
    let admin = await User.findOne({ email: 'admin@tamermahfouz.com' })
    
    if (!admin) {
      // البحث عن أي مستخدم بدور admin
      admin = await User.findOne({ role: 'admin' })
    }
    
    if (!admin) {
      console.error('❌ لم يتم العثور على أي مستخدم Admin')
      console.log('💡 جاري إنشاء مستخدم admin تجريبي...')
      
      // إنشاء admin تجريبي
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('123456', 10)
      
      admin = await User.create({
        name: 'Admin',
        email: 'admin@tamermahfouz.com',
        password: hashedPassword,
        role: 'admin',
      })
      
      console.log('✅ تم إنشاء مستخدم Admin')
    }

    console.log('✅ تم العثور على Admin:', admin.name)

    // إنشاء الدورة التجريبية
    const course = await Course.create({
      title: 'دورة Python للمبتدئين - تجريبية',
      description: 'دورة شاملة لتعلم لغة Python من الصفر حتى الاحتراف. تشمل الأساسيات، البرمجة الكائنية، والمشاريع العملية.',
      instructor: admin._id,
      price: 299,
      image: '🐍',
      category: 'البرمجة',
      level: 'مبتدئ',
      duration: '40 ساعة',
      topics: [
        'أساسيات Python',
        'المتغيرات وأنواع البيانات',
        'الشروط والحلقات',
        'الدوال والوحدات',
        'البرمجة الكائنية',
        'التعامل مع الملفات',
        'مشاريع عملية',
      ],
      students: 0,
      rating: 5,
      published: true,
    })

    console.log('✅ تم إنشاء الدورة:', course.title)
    console.log('📝 معرف الدورة:', course._id)

    // إضافة الدروس
    const lessons = [
      {
        title: 'مقدمة في Python',
        description: 'تعرف على لغة Python وأهميتها في عالم البرمجة',
        content: 'في هذا الدرس سنتعرف على لغة Python، تاريخها، واستخداماتها المختلفة في تطوير الويب، الذكاء الاصطناعي، وتحليل البيانات.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        duration: '15 دقيقة',
        order: 1,
        isFree: true,
      },
      {
        title: 'تثبيت Python وإعداد البيئة',
        description: 'كيفية تثبيت Python وإعداد بيئة العمل',
        content: 'سنتعلم في هذا الدرس كيفية تحميل وتثبيت Python على أنظمة Windows و Mac و Linux، وكيفية إعداد محرر الأكواد.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        duration: '20 دقيقة',
        order: 2,
        isFree: true,
      },
      {
        title: 'المتغيرات وأنواع البيانات',
        description: 'تعلم كيفية التعامل مع المتغيرات وأنواع البيانات المختلفة',
        content: 'في هذا الدرس سنتعرف على المتغيرات، أنواع البيانات الأساسية (int, float, string, boolean)، وكيفية التحويل بينها.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        duration: '25 دقيقة',
        order: 3,
        isFree: false,
      },
      {
        title: 'العمليات الحسابية والمنطقية',
        description: 'تعلم العمليات الحسابية والمنطقية في Python',
        content: 'سنتعلم العمليات الحسابية (+, -, *, /, //, %, **)، العمليات المنطقية (and, or, not)، وعمليات المقارنة.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example4',
        duration: '20 دقيقة',
        order: 4,
        isFree: false,
      },
      {
        title: 'الشروط (if, elif, else)',
        description: 'كيفية استخدام الشروط للتحكم في سير البرنامج',
        content: 'في هذا الدرس سنتعلم كيفية استخدام الشروط لاتخاذ القرارات في البرنامج، وكيفية كتابة شروط متداخلة.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example5',
        duration: '30 دقيقة',
        order: 5,
        isFree: false,
      },
      {
        title: 'الحلقات (for و while)',
        description: 'تعلم كيفية تكرار العمليات باستخدام الحلقات',
        content: 'سنتعرف على حلقة for وحلقة while، وكيفية استخدام break و continue للتحكم في الحلقات.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example6',
        duration: '35 دقيقة',
        order: 6,
        isFree: false,
      },
      {
        title: 'القوائم (Lists)',
        description: 'التعامل مع القوائم وعملياتها المختلفة',
        content: 'في هذا الدرس سنتعلم كيفية إنشاء القوائم، الوصول للعناصر، الإضافة والحذف، والعمليات المختلفة على القوائم.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example7',
        duration: '30 دقيقة',
        order: 7,
        isFree: false,
      },
      {
        title: 'القواميس (Dictionaries)',
        description: 'تعلم التعامل مع القواميس وتخزين البيانات',
        content: 'سنتعرف على القواميس، كيفية إنشائها، الوصول للقيم، الإضافة والحذف، والتكرار على القواميس.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example8',
        duration: '25 دقيقة',
        order: 8,
        isFree: false,
      },
      {
        title: 'الدوال (Functions)',
        description: 'كيفية إنشاء واستخدام الدوال',
        content: 'في هذا الدرس سنتعلم كيفية تعريف الدوال، تمرير المعاملات، القيم الافتراضية، وإرجاع القيم.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example9',
        duration: '40 دقيقة',
        order: 9,
        isFree: false,
      },
      {
        title: 'مشروع عملي: آلة حاسبة',
        description: 'بناء آلة حاسبة بسيطة باستخدام Python',
        content: 'سنطبق ما تعلمناه في بناء مشروع عملي: آلة حاسبة تقوم بالعمليات الحسابية الأساسية.',
        course: course._id,
        videoUrl: 'https://www.youtube.com/watch?v=example10',
        duration: '45 دقيقة',
        order: 10,
        isFree: false,
      },
    ]

    for (const lessonData of lessons) {
      const lesson = await Lesson.create(lessonData)
      console.log(`✅ تم إضافة الدرس: ${lesson.title}`)
    }

    console.log('\n🎉 تم إضافة الدورة التجريبية بنجاح!')
    console.log('\n📋 معلومات الدورة:')
    console.log('العنوان:', course.title)
    console.log('السعر:', course.price, 'جنيه')
    console.log('عدد الدروس:', lessons.length)
    console.log('الدروس المجانية:', lessons.filter(l => l.isFree).length)
    console.log('\n🔗 رابط الدورة:')
    console.log(`http://localhost:3001/courses/${course._id}`)
    console.log('\n💳 رابط الدفع:')
    console.log(`http://localhost:3001/courses/${course._id}/checkout`)

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

// تشغيل السكريبت
addTestCourse()
