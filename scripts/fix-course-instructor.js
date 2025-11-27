const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch((err) => {
    console.error('❌ خطأ في الاتصال:', err)
    process.exit(1)
  })

const courseSchema = new mongoose.Schema({
  title: String,
  instructor: mongoose.Schema.Types.ObjectId,
  published: Boolean,
}, { timestamps: true })

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
}, { timestamps: true })

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)
const User = mongoose.models.User || mongoose.model('User', userSchema)

async function fixCourseInstructor() {
  try {
    console.log('\n🔧 جاري إصلاح instructor الدورة...\n')

    // البحث عن الدورة التجريبية
    const course = await Course.findOne({ title: /Python.*تجريبية/ })
    
    if (!course) {
      console.log('❌ الدورة غير موجودة!')
      process.exit(1)
    }

    console.log('✅ تم العثور على الدورة:')
    console.log('   العنوان:', course.title)
    console.log('   المعرف:', course._id)
    console.log('   Instructor الحالي:', course.instructor)
    console.log('')

    // البحث عن Admin الذي سجلت دخول به
    const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 })
    
    if (!admin) {
      console.log('❌ لا يوجد admin!')
      process.exit(1)
    }

    console.log('✅ تم العثور على Admin:')
    console.log('   الاسم:', admin.name)
    console.log('   البريد:', admin.email)
    console.log('   المعرف:', admin._id)
    console.log('')

    // تحديث instructor الدورة
    course.instructor = admin._id
    await course.save()

    console.log('✅ تم تحديث instructor الدورة!')
    console.log('')
    console.log('🔗 الروابط:')
    console.log(`   Admin Dashboard: http://localhost:3000/dashboard/admin/courses`)
    console.log(`   الدورة: http://localhost:3000/courses/${course._id}`)
    console.log('')
    console.log('💡 الآن:')
    console.log('   1. أعد تحميل صفحة Admin')
    console.log('   2. يجب أن ترى الدورة!')

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

fixCourseInstructor()
