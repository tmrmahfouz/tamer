const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch((err) => console.error('❌ خطأ في الاتصال:', err))

const courseSchema = new mongoose.Schema({
  title: String,
}, { timestamps: true })

const lessonSchema = new mongoose.Schema({
  title: String,
  course: mongoose.Schema.Types.ObjectId,
}, { timestamps: true })

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema)

async function checkCourseLessons() {
  try {
    const courseId = process.argv[2] || '692325a3a2b768ff5c5773b0'
    
    console.log(`\n🔍 جاري البحث عن الدورة: ${courseId}...\n`)

    const course = await Course.findById(courseId)
    
    if (!course) {
      console.log('❌ الدورة غير موجودة!')
      process.exit(1)
    }

    console.log('✅ تم العثور على الدورة:')
    console.log('   العنوان:', course.title)
    console.log('   المعرف:', course._id)
    console.log('')

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 })
    
    console.log(`📚 عدد الدروس: ${lessons.length}\n`)

    if (lessons.length === 0) {
      console.log('⚠️  لا توجد دروس لهذه الدورة!')
      console.log('')
      console.log('💡 الحل:')
      console.log('   1. استخدم الدورة التجريبية: 692361f9f02a5ebb5dbb840a')
      console.log('   2. أو أضف دروس لهذه الدورة')
      console.log('')
      console.log('🔗 رابط الدورة التجريبية:')
      console.log('   http://localhost:3000/courses/692361f9f02a5ebb5dbb840a')
    } else {
      console.log('✅ الدروس الموجودة:')
      lessons.forEach((lesson, index) => {
        console.log(`   ${index + 1}. ${lesson.title}`)
        console.log(`      المعرف: ${lesson._id}`)
      })
      console.log('')
      console.log('🔗 رابط الدرس الأول:')
      console.log(`   http://localhost:3000/learn/${courseId}/${lessons[0]._id}`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

checkCourseLessons()
