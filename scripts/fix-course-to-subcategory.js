/**
 * سكريبت لإصلاح الدورات - نقل subcategory إلى category
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://ali2000:Ali2000Academy@tameredu.aclndou.mongodb.net/academy?retryWrites=true&w=majority';

// Course Schema
const CourseSchema = new mongoose.Schema({
  title: String,
  category: String,
  subcategory: String,
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function fixCourses() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح\n');

    // جلب جميع الدورات
    const courses = await Course.find({});
    console.log(`📚 عدد الدورات: ${courses.length}\n`);

    for (const course of courses) {
      console.log(`📖 الدورة: ${course.title}`);
      console.log(`   category: ${course.category}`);
      console.log(`   subcategory: ${course.subcategory || 'لا يوجد'}`);

      // إذا كان هناك subcategory وهو ObjectId صالح
      if (course.subcategory && mongoose.Types.ObjectId.isValid(course.subcategory)) {
        // التحقق من أن subcategory هو فعلاً فئة فرعية
        const subCat = await Category.findById(course.subcategory);
        if (subCat && subCat.parentCategory) {
          // نقل subcategory إلى category
          await Course.updateOne(
            { _id: course._id },
            { 
              $set: { 
                category: course.subcategory,
                subcategory: '' 
              } 
            }
          );
          console.log(`   ✅ تم الإصلاح: category = ${course.subcategory} (${subCat.name})`);
        } else {
          console.log(`   ⚠️ subcategory ليس فئة فرعية`);
        }
      } else {
        // التحقق من أن category هو فئة فرعية
        if (mongoose.Types.ObjectId.isValid(course.category)) {
          const cat = await Category.findById(course.category);
          if (cat) {
            if (cat.parentCategory) {
              console.log(`   ✅ صحيح: الدورة في فئة فرعية (${cat.name})`);
            } else {
              console.log(`   ⚠️ الدورة في فئة رئيسية (${cat.name}) - تحتاج اختيار فئة فرعية`);
            }
          }
        }
      }
      console.log('');
    }

    // عرض النتيجة النهائية
    console.log('='.repeat(50));
    console.log('📊 الدورات بعد الإصلاح:');
    const finalCourses = await Course.find({});
    for (const course of finalCourses) {
      let catName = course.category;
      if (mongoose.Types.ObjectId.isValid(course.category)) {
        const cat = await Category.findById(course.category);
        if (cat) catName = cat.name;
      }
      console.log(`   - ${course.title} → ${catName}`);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

fixCourses();
