const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch((err) => console.error('❌ خطأ في الاتصال:', err))

const courseSchema = new mongoose.Schema({
  title: String,
  published: Boolean,
}, { timestamps: true })

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)

async function fixCourse() {
  try {
    console.log('\n🔧 جاري إصلاح الدورة التجريبية...\n')

    const course = await Course.findOne({ title: /Python.*تجريبية/ })
    
    if (!course) {
      console.log('❌ لم يتم العثور على الدورة')
      process.exit(1)
    }

    console.log('✅ تم العثور على الدورة:')
    console.log('   العنوان:', course.title)
    console.log('   المعرف:', course._id)
    console.log('   منشورة:', course.published)
    console.log('')

    if (!course.published) {
      course.published = true
      await course.save()
      console.log('✅ تم تفعيل نشر الدورة!')
    } else {
      console.log('✅ الدورة منشورة بالفعل')
    }

    console.log('')
    console.log('🔗 الروابط:')
    console.log(`   صفحة الدورات: http://localhost:3001/courses`)
    console.log(`   صفحة الدورة: http://localhost:3001/courses/${course._id}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

fixCourse()
