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
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
}, { timestamps: true })

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema)

async function checkLessons() {
  try {
    console.log('\n🔍 جاري البحث عن الدورة التجريبية...\n')

    const course = await Course.findOne({ title: /Python.*تجريبية/ })
    
    if (!course) {
      console.log('❌ لم يتم العثور على الدورة التجريبية')
      process.exit(1)
    }

    console.log('✅ تم العثور على الدورة:')
    console.log('   العنوان:', course.title)
    console.log('   المعرف:', course._id)
    console.log('')

    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 })
    
    console.log(`📚 عدد الدروس: ${lessons.length}`)
    console.log('')

    if (lessons.length === 0) {
      console.log('⚠️  لا توجد دروس مرتبطة بهذه الدورة!')
      console.log('')
      console.log('💡 الحل: قم بتشغيل السكريبت التالي لإضافة الدروس:')
      console.log('   node scripts/add-test-course.js')
    } else {
      console.log('✅ الدروس الموجودة:')
      lessons.forEach((lesson, index) => {
        console.log(`   ${index + 1}. ${lesson.title}`)
        console.log(`      المعرف: ${lesson._id}`)
      })
      console.log('')
      console.log('🔗 رابط الدرس الأول:')
      console.log(`   http://localhost:3001/learn/${course._id}/${lessons[0]._id}`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

checkLessons()
