const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch((err) => {
    console.error('❌ خطأ في الاتصال:', err)
    process.exit(1)
  })

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function resetPasswords() {
  try {
    console.log('\n🔧 جاري إعادة تعيين كلمات المرور...\n')

    // Admin
    const admin = await User.findOne({ email: 'admin@tamermahfouz.com' })
    if (admin) {
      admin.password = await bcrypt.hash('admin123', 10)
      await admin.save()
      console.log('✅ Admin:')
      console.log('   Email: admin@tamermahfouz.com')
      console.log('   Password: admin123')
      console.log('')
    } else {
      console.log('⚠️  Admin غير موجود')
      console.log('')
    }

    // Instructor
    const instructor = await User.findOne({ email: 'instructor@tamermahfouz.com' })
    if (instructor) {
      instructor.password = await bcrypt.hash('instructor123', 10)
      await instructor.save()
      console.log('✅ Instructor:')
      console.log('   Email: instructor@tamermahfouz.com')
      console.log('   Password: instructor123')
      console.log('')
    } else {
      console.log('⚠️  Instructor غير موجود')
      console.log('')
    }

    // Student (if exists)
    const student = await User.findOne({ email: 'student@test.com' })
    if (student) {
      student.password = await bcrypt.hash('student123', 10)
      await student.save()
      console.log('✅ Student:')
      console.log('   Email: student@test.com')
      console.log('   Password: student123')
      console.log('')
    }

    console.log('🎉 تم إعادة تعيين كلمات المرور بنجاح!')
    console.log('')
    console.log('🔗 صفحة تسجيل الدخول:')
    console.log('   http://localhost:3000/login')

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

resetPasswords()
