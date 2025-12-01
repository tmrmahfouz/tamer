/**
 * سكريبت لحذف الفئات المكررة
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://ali2000:Ali2000Academy@tameredu.aclndou.mongodb.net/academy?retryWrites=true&w=majority';

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Course Schema
const CourseSchema = new mongoose.Schema({
  title: String,
  category: String,
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function cleanup() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح\n');

    // عرض جميع الفئات
    console.log('📂 جميع الفئات:');
    const allCategories = await Category.find({}).sort({ name: 1 });
    allCategories.forEach(cat => {
      const type = cat.parentCategory ? '[فرعية]' : '[رئيسية]';
      console.log(`   ${cat._id} - ${cat.name} ${type}`);
    });

    // البحث عن الفئات الجديدة التي أنشأناها (بدون دورات)
    console.log('\n🔍 البحث عن فئات بدون دورات...');
    
    // الفئات التي تحتوي على "الصف الأول الثانوى" (بالياء) - الجديدة
    const newMainCat = await Category.findOne({ name: 'الصف الأول الثانوى' });
    if (newMainCat) {
      // التحقق من وجود دورات
      const coursesCount = await Course.countDocuments({ category: newMainCat._id.toString() });
      const subsCount = await Category.countDocuments({ parentCategory: newMainCat._id });
      
      console.log(`   الصف الأول الثانوى (${newMainCat._id}): ${coursesCount} دورة, ${subsCount} فئة فرعية`);
      
      if (coursesCount === 0) {
        // حذف الفئات الفرعية أولاً
        const subs = await Category.find({ parentCategory: newMainCat._id });
        for (const sub of subs) {
          const subCoursesCount = await Course.countDocuments({ category: sub._id.toString() });
          if (subCoursesCount === 0) {
            await Category.deleteOne({ _id: sub._id });
            console.log(`   🗑️ تم حذف الفئة الفرعية: ${sub.name}`);
          }
        }
        
        // حذف الفئة الرئيسية
        await Category.deleteOne({ _id: newMainCat._id });
        console.log(`   🗑️ تم حذف الفئة الرئيسية: الصف الأول الثانوى`);
      }
    }

    // عرض النتيجة النهائية
    console.log('\n📊 الفئات بعد التنظيف:');
    const finalCategories = await Category.find({}).sort({ parentCategory: 1, name: 1 });
    for (const cat of finalCategories) {
      if (!cat.parentCategory) {
        const coursesInMain = await Course.countDocuments({ category: cat._id.toString() });
        console.log(`📁 ${cat.name} (${cat._id}) - ${coursesInMain} دورة مباشرة`);
        
        const subs = finalCategories.filter(c => c.parentCategory?.toString() === cat._id.toString());
        for (const sub of subs) {
          const coursesInSub = await Course.countDocuments({ category: sub._id.toString() });
          console.log(`   └─ ${sub.name} - ${coursesInSub} دورة`);
        }
      }
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

cleanup();
