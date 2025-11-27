const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch((err) => console.error('❌ خطأ في الاتصال:', err))

const courseSchema = new mongoose.Schema({
  title: String,
  instructor: mongoose.Schema.Types.ObjectId,
  published: Boolean,
}, { timestamps: true })

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
}, { timestamps: true })

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)
const User = mongoose.models.User || mongoose.model('User', userSchema)

async function checkTestCourse() {
  try {
    console.log('\n🔍 جاري البحث عن الدورة التجريبية...\n')

    const course = await Course.findOne({ title: /Python.*تجريبية/ })
    
    if (!course) {
      console.log('❌ الدورة غير موجودة!')
      process.exit(1)
    }

    console.log('✅ تم العثور على الدورة:')
    console.log('   العنوان:', course.title)
    console.log('   المعرف:', course._id)
    console.log('   منشورة:', course.published)
    console.log('   Instructor ID:', course.instructor)
    console.log('')

    if (course.instructor) {
      const instructor = await User.findById(course.instructor)
      if (instructor) {
        console.log('✅ المدرب موجود:')
        console.log('   الاسم:', instructor.name)
        console.log('   البريد:', instructor.email)
      } else {
        console.log('❌ المدرب غير موجود!')
        console.log('')
        console.log('💡 الحل: تحديث الدورة بمدرب موجود')
        
        const admin = await User.findOne({ role: 'admin' })
        if (admin) {
          course.instructor = admin._id
          await course.save()
          console.log('✅ تم تحديث المدرب إلى:', admin.name)
        }
      }
    } else {
      console.log('⚠️  الدورة ليس لها مدرب!')
      
      const admin = await User.findOne({ role: 'admin' })
      if (admin) {
        course.instructor = admin._id
        await course.save()
        console.log('✅ تم تعيين المدرب:', admin.name)
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

checkTestCourse()
