import mongoose from 'mongoose'
import User from '../models/User'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

async function updateLastLogin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✓ متصل بقاعدة البيانات')

    // تحديث جميع المستخدمين الذين ليس لديهم lastLogin
    const result = await User.updateMany(
      { 
        lastLogin: { $exists: false }
      },
      {
        $set: {
          lastLogin: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // قبل 15 يوم
        }
      }
    )

    console.log(`✓ تم تحديث ${result.modifiedCount} مستخدم`)

    // عرض إحصائيات
    const totalStudents = await User.countDocuments({ role: 'student' })
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activeStudents = await User.countDocuments({
      role: 'student',
      lastLogin: { $gte: thirtyDaysAgo }
    })

    console.log('\n📊 الإحصائيات:')
    console.log(`- إجمالي الطلاب: ${totalStudents}`)
    console.log(`- الطلاب النشطون (آخر 30 يوم): ${activeStudents}`)

    await mongoose.disconnect()
    console.log('\n✓ تم إغلاق الاتصال بقاعدة البيانات')
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

updateLastLogin()
