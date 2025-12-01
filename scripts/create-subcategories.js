/**
 * سكريبت لإنشاء الفئات الفرعية وإصلاح الدورات
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
      break;
    }
  }
} catch (err) {
  console.error('❌ خطأ في قراءة ملف .env.local:', err.message);
  process.exit(1);
}

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: String,
  nameEn: String,
  description: String,
  icon: String,
  color: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  published: { type: Boolean, default: true },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Course Schema
const CourseSchema = new mongoose.Schema({
  title: String,
  category: String,
  subcategory: String,
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function createSubcategoriesAndFix() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح\n');

    // جلب الفئات الرئيسية
    const mainCategories = await Category.find({ parentCategory: null });
    console.log('📂 الفئات الرئيسية:');
    mainCategories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat._id})`);
    });

    // إنشاء فئات فرعية لكل فئة رئيسية
    const subcategoryNames = ['الفصل الدراسي الأول 2025', 'الفصل الدراسي الثاني 2025'];
    
    console.log('\n🔧 إنشاء الفئات الفرعية...');
    
    for (const mainCat of mainCategories) {
      for (const subName of subcategoryNames) {
        // التحقق من عدم وجود الفئة الفرعية مسبقاً
        const existing = await Category.findOne({ 
          name: subName, 
          parentCategory: mainCat._id 
        });
        
        if (!existing) {
          try {
            // استخدام اسم فريد يتضمن اسم الفئة الرئيسية
            const uniqueName = `${subName} - ${mainCat.name}`;
            const newSub = await Category.create({
              name: uniqueName,
              nameEn: subName.includes('الأول') ? 'First Semester 2025' : 'Second Semester 2025',
              description: `${subName} - ${mainCat.name}`,
              icon: subName.includes('الأول') ? '📘' : '📗',
              color: subName.includes('الأول') ? '#3B82F6' : '#10B981',
              parentCategory: mainCat._id,
              published: true,
            });
            console.log(`   ✅ تم إنشاء: ${uniqueName} (ID: ${newSub._id})`);
          } catch (err) {
            if (err.code === 11000) {
              console.log(`   ⚠️ الفئة موجودة مسبقاً: ${subName}`);
            } else {
              throw err;
            }
          }
        } else {
          console.log(`   ℹ️ موجودة مسبقاً: ${subName} تحت ${mainCat.name} (ID: ${existing._id})`);
        }
      }
    }

    // إعادة جلب جميع الفئات بعد الإنشاء
    const allCategories = await Category.find({});
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat;
      categoryMap[cat.name] = cat; // للبحث بالاسم أيضاً
    });

    // إصلاح الدورات
    console.log('\n🔧 إصلاح الدورات...');
    const courses = await Course.find({});
    
    for (const course of courses) {
      let needsUpdate = false;
      let newCategory = course.category;
      
      // إذا كانت الفئة نصية (ليست ObjectId)
      if (course.category && !mongoose.Types.ObjectId.isValid(course.category)) {
        console.log(`   ⚠️ الدورة "${course.title}" لها فئة نصية: "${course.category}"`);
        // لا نستطيع إصلاحها تلقائياً - تحتاج تدخل يدوي
        continue;
      }
      
      // إذا كانت الفئة الفرعية نصية
      if (course.subcategory && !mongoose.Types.ObjectId.isValid(course.subcategory)) {
        // البحث عن الفئة الفرعية بالاسم تحت الفئة الرئيسية
        const subCat = await Category.findOne({
          name: course.subcategory,
          parentCategory: course.category
        });
        
        if (subCat) {
          // تحديث الدورة لاستخدام ID الفئة الفرعية
          await Course.updateOne(
            { _id: course._id },
            { $set: { category: subCat._id.toString(), subcategory: '' } }
          );
          console.log(`   ✅ تم إصلاح "${course.title}": category = ${subCat._id}`);
        } else {
          console.log(`   ⚠️ لم يتم العثور على فئة فرعية "${course.subcategory}" للدورة "${course.title}"`);
        }
      }
    }

    // عرض النتيجة النهائية
    console.log('\n📊 الفئات بعد الإصلاح:');
    const finalCategories = await Category.find({}).sort({ parentCategory: 1, name: 1 });
    for (const cat of finalCategories) {
      if (!cat.parentCategory) {
        console.log(`📁 ${cat.name} (${cat._id})`);
        const subs = finalCategories.filter(c => c.parentCategory?.toString() === cat._id.toString());
        for (const sub of subs) {
          console.log(`   └─ ${sub.name} (${sub._id})`);
        }
      }
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

createSubcategoriesAndFix();
