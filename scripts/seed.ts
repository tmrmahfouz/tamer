import mongoose from 'mongoose'
import User from '../models/User'
import Course from '../models/Course'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-platform'

async function seed() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ تم الاتصال بنجاح')

    // Clear existing data
    console.log('🗑️  جاري حذف البيانات القديمة...')
    await User.deleteMany({})
    await Course.deleteMany({})
    console.log('✅ تم حذف البيانات القديمة')

    // Create Admin User
    console.log('👤 جاري إنشاء المستخدمين...')
    const admin = await User.create({
      name: 'تامر محفوظ',
      email: 'admin@tamermahfouz.com',
      password: '123456',
      role: 'admin',
      bio: 'مهندس برمجيات ومتخصص في الذكاء الاصطناعي مع خبرة تزيد عن 5 سنوات',
      phone: '+20 123 456 7890',
    })

    // Create Instructor User
    const instructor = await User.create({
      name: 'محمد أحمد',
      email: 'instructor@tamermahfouz.com',
      password: '123456',
      role: 'instructor',
      bio: 'مدرس برمجة متخصص في Python و JavaScript',
    })

    // Create Student Users
    const students = await User.create([
      {
        name: 'أحمد محمد',
        email: 'student1@example.com',
        password: '123456',
        role: 'student',
      },
      {
        name: 'سارة أحمد',
        email: 'student2@example.com',
        password: '123456',
        role: 'student',
      },
      {
        name: 'محمود علي',
        email: 'student3@example.com',
        password: '123456',
        role: 'student',
      },
    ])

    console.log('✅ تم إنشاء المستخدمين بنجاح')

    // Create Courses
    console.log('📚 جاري إنشاء الدورات...')
    const courses = await Course.create([
      {
        title: 'أساسيات البرمجة بلغة Python',
        description: 'ابدأ رحلتك في عالم البرمجة مع Python من الصفر حتى الاحتراف. تعلم المفاهيم الأساسية وابنِ مشاريع حقيقية.',
        instructor: admin._id,
        category: 'البرمجة',
        level: 'مبتدئ',
        price: 499,
        duration: '40 ساعة',
        image: '🐍',
        lessons: 45,
        students: 150,
        rating: 4.9,
        topics: ['المتغيرات والأنواع', 'الحلقات والشروط', 'الدوال', 'OOP', 'المشاريع العملية'],
        published: true,
      },
      {
        title: 'تطوير الويب بـ JavaScript',
        description: 'تعلم تطوير تطبيقات الويب التفاعلية باستخدام JavaScript الحديثة وأطر العمل الشهيرة.',
        instructor: admin._id,
        category: 'البرمجة',
        level: 'متوسط',
        price: 599,
        duration: '50 ساعة',
        image: '🌐',
        lessons: 52,
        students: 120,
        rating: 4.8,
        topics: ['ES6+', 'DOM Manipulation', 'React', 'Node.js', 'APIs'],
        published: true,
      },
      {
        title: 'مقدمة في الذكاء الاصطناعي',
        description: 'اكتشف عالم الذكاء الاصطناعي وتعلم بناء نماذج التعلم الآلي وتطبيقها على مشاكل حقيقية.',
        instructor: admin._id,
        category: 'الذكاء الاصطناعي',
        level: 'متقدم',
        price: 799,
        duration: '60 ساعة',
        image: '🤖',
        lessons: 58,
        students: 80,
        rating: 5.0,
        topics: ['Machine Learning', 'Neural Networks', 'TensorFlow', 'Computer Vision', 'NLP'],
        published: true,
      },
      {
        title: 'تحليل البيانات مع Python',
        description: 'تعلم تحليل وتصور البيانات باستخدام Pandas و NumPy و Matplotlib وأدوات أخرى.',
        instructor: instructor._id,
        category: 'تحليل البيانات',
        level: 'متوسط',
        price: 549,
        duration: '45 ساعة',
        image: '📊',
        lessons: 48,
        students: 95,
        rating: 4.9,
        topics: ['Pandas', 'NumPy', 'Matplotlib', 'Data Cleaning', 'Statistical Analysis'],
        published: true,
      },
      {
        title: 'تطوير تطبيقات الموبايل',
        description: 'ابنِ تطبيقات موبايل احترافية باستخدام React Native لنظامي iOS و Android.',
        instructor: instructor._id,
        category: 'تطوير التطبيقات',
        level: 'متقدم',
        price: 699,
        duration: '55 ساعة',
        image: '📱',
        lessons: 50,
        students: 70,
        rating: 4.7,
        topics: ['React Native', 'APIs', 'State Management', 'Navigation', 'Publishing'],
        published: true,
      },
      {
        title: 'الأمن السيبراني والاختراق الأخلاقي',
        description: 'تعلم أساسيات الأمن السيبراني وكيفية حماية الأنظمة من الهجمات الإلكترونية.',
        instructor: admin._id,
        category: 'البرمجة',
        level: 'متقدم',
        price: 749,
        duration: '50 ساعة',
        image: '🔒',
        lessons: 46,
        students: 60,
        rating: 4.8,
        topics: ['Network Security', 'Penetration Testing', 'Cryptography', 'Security Tools', 'Best Practices'],
        published: true,
      },
    ])

    console.log('✅ تم إنشاء الدورات بنجاح')

    console.log('\n🎉 تم إنشاء البيانات التجريبية بنجاح!')
    console.log('\n📋 بيانات تسجيل الدخول:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('👑 المدير (Admin):')
    console.log('   البريد: admin@tamermahfouz.com')
    console.log('   كلمة المرور: 123456')
    console.log('\n👨‍🏫 المدرس (Instructor):')
    console.log('   البريد: instructor@tamermahfouz.com')
    console.log('   كلمة المرور: 123456')
    console.log('\n👨‍🎓 الطالب (Student):')
    console.log('   البريد: student1@example.com')
    console.log('   كلمة المرور: 123456')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n✅ تم إنشاء ${courses.length} دورات`)
    console.log(`✅ تم إنشاء ${students.length + 2} مستخدمين`)

    await mongoose.disconnect()
    console.log('\n✅ تم قطع الاتصال بقاعدة البيانات')
    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

seed()
