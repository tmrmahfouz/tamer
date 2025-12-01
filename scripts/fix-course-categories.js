/**
 * سكريبت لإصلاح فئات الدورات في قاعدة البيانات
 * 
 * المشكلة: بعض الدورات محفوظة بالفئة الرئيسية بدلاً من الفئة الفرعية
 * الحل: تحديث الدورات التي لها subcategory لتستخدم الفئة الفرعية كـ category
 * 
 * الاستخدام:
 * 1. تأكد من وجود ملف .env.local مع MONGODB_URI
 * 2. شغّل: node scripts/fix-course-categories.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// قراءة ملف .env.local يدوياً
const envPath = path.join(__dirname, '..', '.env.local');
let MONGODB_URI = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');

  for (const line of envLines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('MONGODB_URI=')) {
      MONGODB_URI = trimmedLine.substring('MONGODB_URI='.length).trim();
      // إزالة علامات الاقتباس إن وجدت
      if (MONGODB_URI.startsWith('"') && MONGODB_URI.endsWith('"')) {
        MONGODB_URI = MONGODB_URI.slice(1, -1);
      }
      if (MONGODB_URI.startsWith("'") && MONGODB_URI.endsWith("'")) {
        MONGODB_URI = MONGODB_URI.slice(1, -1);
      }
      break;
    }
  }
} catch (err) {
  console.error('❌ خطأ في قراءة ملف .env.local:', err.message);
  process.exit(1);
}

console.log('🔗 MONGODB_URI:', MONGODB_URI ? 'موجود' : 'غير موجود');

if (!MONGODB_URI) {
  console.error('❌ خطأ: MONGODB_URI غير موجود في ملف .env.local');
  process.exit(1);
}

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

async function fixCourseCategories() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح');

    // جلب جميع الفئات
    const categories = await Category.find({});
    console.log(`📂 عدد الفئات: ${categories.length}`);

    // إنشاء خريطة للفئات
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat;
    });

    // جلب جميع الدورات
    const courses = await Course.find({});
    console.log(`📚 عدد الدورات: ${courses.length}`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;

    for (const course of courses) {
      try {
        const currentCategory = categoryMap[course.category];
        
        if (!currentCategory) {
          console.log(`⚠️ الدورة "${course.title}" لها فئة غير موجودة: ${course.category}`);
          errorCount++;
          continue;
        }

        // إذا كانت الفئة الحالية هي فئة فرعية، فهي صحيحة
        if (currentCategory.parentCategory) {
          console.log(`✅ الدورة "${course.title}" صحيحة (فئة فرعية: ${currentCategory.name})`);
          alreadyCorrectCount++;
          continue;
        }

        // إذا كانت الفئة الحالية هي فئة رئيسية، نتحقق من وجود subcategory
        if (course.subcategory && course.subcategory !== '') {
          const subcategory = categoryMap[course.subcategory];
          if (subcategory) {
            // تحديث الدورة لاستخدام الفئة الفرعية
            await Course.updateOne(
              { _id: course._id },
              { $set: { category: course.subcategory } }
            );
            console.log(`🔧 تم إصلاح الدورة "${course.title}": ${currentCategory.name} → ${subcategory.name}`);
            fixedCount++;
          } else {
            console.log(`⚠️ الدورة "${course.title}" لها subcategory غير موجود: ${course.subcategory}`);
            errorCount++;
          }
        } else {
          // الدورة في فئة رئيسية بدون فئة فرعية - هذا مقبول
          console.log(`ℹ️ الدورة "${course.title}" في فئة رئيسية بدون فئة فرعية: ${currentCategory.name}`);
          alreadyCorrectCount++;
        }
      } catch (err) {
        console.error(`❌ خطأ في معالجة الدورة "${course.title}":`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 ملخص:');
    console.log(`   ✅ دورات صحيحة: ${alreadyCorrectCount}`);
    console.log(`   🔧 دورات تم إصلاحها: ${fixedCount}`);
    console.log(`   ❌ أخطاء: ${errorCount}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

fixCourseCategories();
