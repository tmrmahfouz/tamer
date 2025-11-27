const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch((err) => console.error('❌ خطأ في الاتصال:', err))

const courseSchema = new mongoose.Schema({
  title: String,
  published: Boolean,
}, { timestamps: true })

const lessonSchema = new mongoose.Schema({
  course: mongoose.Schema.Types.ObjectId,
}, { timestamps: true })

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema)

async function listAllCourses() {
  try {
    console.log('\n📚 جميع الدورات الموجودة:\n')

    const courses = await Course.find()
    
    if (courses.length === 0) {
      console.log('❌ لا توجد دورات!')
      process.exit(1)
    }

    for (const course of courses) {
      const lessonsCount = await Lesson.countDocuments({ course: course._id })
      
      console.log(`${lessonsCount > 0 ? '✅' : '⚠️ '} ${course.title}`)
      console.log(`   المعرف: ${course._id}`)
      console.log(`   منشورة: ${course.published ? 'نعم' : 'لا'}`)
      console.log(`   عدد الدروس: ${lessonsCount}`)
      console.log(`   الرابط: http://localhost:3000/courses/${course._id}`)
      console.log('')
    }

    const testCourse = courses.find(c => c.title.includes('Python') && c.title.includes('تجريبية'))
    if (testCourse) {
      console.log('🎯 الدورة التجريبية الموصى بها:')
      console.log(`   ${testCourse.title}`)
      console.log(`   http://localhost:3000/courses/${testCourse._id}`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

listAllCourses()
