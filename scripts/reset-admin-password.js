// سكريبت إعادة تعيين كلمة مرور الأدمن
// استخدم: node scripts/reset-admin-password.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// كلمة المرور الجديدة - غيرها حسب رغبتك
const NEW_PASSWORD = 'Admin@123456';

// رابط قاعدة البيانات MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://ali2000:Ali2000Academy@tameredu.aclndou.mongodb.net/academy?retryWrites=true&w=majority';

async function resetAdminPassword() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح');

    // الحصول على collection المستخدمين
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // البحث عن حساب الأدمن
    const admin = await usersCollection.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ لم يتم العثور على حساب أدمن');
      console.log('📝 جاري إنشاء حساب أدمن جديد...');
      
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);
      await usersCollection.insertOne({
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ تم إنشاء حساب أدمن جديد');
      console.log('📧 البريد: admin@admin.com');
      console.log('🔑 كلمة المرور:', NEW_PASSWORD);
    } else {
      console.log('✅ تم العثور على حساب الأدمن:', admin.email);
      
      // تشفير كلمة المرور الجديدة
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);
      
      // تحديث كلمة المرور
      await usersCollection.updateOne(
        { _id: admin._id },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('✅ تم تحديث كلمة المرور بنجاح!');
      console.log('📧 البريد:', admin.email);
      console.log('🔑 كلمة المرور الجديدة:', NEW_PASSWORD);
    }

    // عرض جميع حسابات الأدمن
    const allAdmins = await usersCollection.find({ role: 'admin' }).toArray();
    console.log('\n📋 جميع حسابات الأدمن:');
    allAdmins.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.email} (${a.name})`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
    process.exit(0);
  }
}

resetAdminPassword();
