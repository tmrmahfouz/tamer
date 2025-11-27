const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

const courseSchema = new mongoose.Schema({}, { strict: false })
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)

async function debugCourses() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ متصل بقاعدة البيانات')
    
    console.log('\n🔍 جميع الدورات في قاعدة البيانات:\n')
    
    const courses = await Course.find({}).lean()
    
    console.log(`📊 عدد الدورات: ${courses.length}\n`)
    
    if (courses.length === 0) {
      console.log('❌ لا توجد دورات في قاعدة البيانات!')
      console.log('')
      console.log('💡 الحل: شغل السكريبت لإنشاء دورة جديدة:')
      console.log('   node scripts/reset-and-create-test-course.js')
    } else {
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`)
        console.log(`   _id: ${course._id}`)
        console.log(`   instructor: ${course.instructor}`)
        console.log(`   published: ${course.published}`)
        console.log(`   createdAt: ${course.createdAt}`)
        console.log('')
      })
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

debugCourses()
