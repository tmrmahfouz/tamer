/**
 * سكريبت لإصلاح الفئات والدورات على قاعدة بيانات الإنتاج (MongoDB Atlas)
 * 
 * الاستخدام: node scripts/fix-production-categories.js
 */

const mongoose = require('mongoose');

// رابط قاعدة البيانات MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://ali2000:Ali2000Academy@tameredu.aclndou.mongodb.net/academy?retryWrites=true&w=majority';

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

async function fixProductionData() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح\n');

    // ========== الخطوة 1: عرض الفئات الحالية ==========
    console.log('📂 الفئات الحالية:');
    const existingCategories = await Category.find({});
    if (existingCategories.length === 0) {
      console.log('   لا توجد فئات');
    } else {
      existingCategories.forEach(cat => {
        const type = cat.parentCategory ? `[فرعية من: ${cat.parentCategory}]` : '[رئيسية]';
        console.log(`   - ${cat.name} (${cat._id}) ${type}`);
      });
    }

    // ========== الخطوة 2: عرض الدورات الحالية ==========
    console.log('\n📚 الدورات الحالية:');
    const existingCourses = await Course.find({});
    if (existingCourses.length === 0) {
      console.log('   لا توجد دورات');
    } else {
      existingCourses.forEach(course => {
        console.log(`   - ${course.title}`);
        console.log(`     category: "${course.category}"`);
        console.log(`     subcategory: "${course.subcategory || 'لا يوجد'}"\n`);
      });
    }

    // ========== الخطوة 3: إنشاء الفئات الرئيسية إذا لم تكن موجودة ==========
    console.log('🔧 التحقق من الفئات الرئيسية...');
    
    const mainCategoriesData = [
      { name: 'الصف الأول الثانوى', nameEn: 'First Year Secondary', icon: '📘', color: '#3B82F6' },
      { name: 'الصف الثانى الثانوى', nameEn: 'Second Year Secondary', icon: '📗', color: '#10B981' },
      { name: 'الصف الثالث الثانوى', nameEn: 'Third Year Secondary', icon: '📕', color: '#EF4444' },
    ];

    const mainCategories = [];
    for (const catData of mainCategoriesData) {
      let cat = await Category.findOne({ name: catData.name, parentCategory: null });
      if (!cat) {
        cat = await Category.create({
          ...catData,
          parentCategory: null,
          published: true,
        });
        console.log(`   ✅ تم إنشاء: ${catData.name}`);
      } else {
        console.log(`   ℹ️ موجودة: ${catData.name}`);
      }
      mainCategories.push(cat);
    }

    // ========== الخطوة 4: إنشاء الفئات الفرعية ==========
    console.log('\n🔧 إنشاء الفئات الفرعية...');
    
    const subcategoriesData = [
      { name: 'الفصل الدراسي الأول 2025', icon: '📖', color: '#6366F1' },
      { name: 'الفصل الدراسي الثاني 2025', icon: '📚', color: '#8B5CF6' },
    ];

    for (const mainCat of mainCategories) {
      for (const subData of subcategoriesData) {
        // اسم فريد يتضمن اسم الفئة الرئيسية
        const uniqueName = `${subData.name} - ${mainCat.name}`;
        
        let sub = await Category.findOne({ 
          $or: [
            { name: uniqueName },
            { name: subData.name, parentCategory: mainCat._id }
          ]
        });
        
        if (!sub) {
          try {
            sub = await Category.create({
              name: uniqueName,
              nameEn: subData.name.includes('الأول') ? 'First Semester 2025' : 'Second Semester 2025',
              description: `${subData.name} - ${mainCat.name}`,
              icon: subData.icon,
              color: subData.color,
              parentCategory: mainCat._id,
              published: true,
            });
            console.log(`   ✅ تم إنشاء: ${uniqueName}`);
          } catch (err) {
            if (err.code === 11000) {
              console.log(`   ⚠️ موجودة مسبقاً: ${uniqueName}`);
            } else {
              console.error(`   ❌ خطأ: ${err.message}`);
            }
          }
        } else {
          console.log(`   ℹ️ موجودة: ${sub.name}`);
        }
      }
    }

    // ========== الخطوة 5: إصلاح الدورات ==========
    console.log('\n🔧 إصلاح الدورات...');
    
    // إعادة جلب جميع الفئات
    const allCategories = await Category.find({});
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat;
      categoryMap[cat.name] = cat;
    });

    const courses = await Course.find({});
    let fixedCount = 0;
    
    for (const course of courses) {
      // إذا كانت الفئة نصية (ليست ObjectId صالح)
      if (course.category && !mongoose.Types.ObjectId.isValid(course.category)) {
        console.log(`   ⚠️ "${course.title}" لها فئة نصية: "${course.category}" - تحتاج إصلاح يدوي`);
        continue;
      }
      
      // إذا كانت الفئة الفرعية نصية
      if (course.subcategory && course.subcategory !== '' && !mongoose.Types.ObjectId.isValid(course.subcategory)) {
        // البحث عن الفئة الفرعية بالاسم
        const subCat = await Category.findOne({
          $or: [
            { name: course.subcategory, parentCategory: course.category },
            { name: { $regex: course.subcategory, $options: 'i' }, parentCategory: course.category }
          ]
        });
        
        if (subCat) {
          await Course.updateOne(
            { _id: course._id },
            { $set: { category: subCat._id.toString(), subcategory: '' } }
          );
          console.log(`   ✅ تم إصلاح "${course.title}": category = ${subCat._id}`);
          fixedCount++;
        } else {
          // البحث عن أي فئة فرعية تحت الفئة الرئيسية
          const anySub = await Category.findOne({ parentCategory: course.category });
          if (anySub) {
            await Course.updateOne(
              { _id: course._id },
              { $set: { category: anySub._id.toString(), subcategory: '' } }
            );
            console.log(`   ✅ تم إصلاح "${course.title}" (استخدام أول فئة فرعية): category = ${anySub._id}`);
            fixedCount++;
          } else {
            console.log(`   ⚠️ "${course.title}" - لم يتم العثور على فئة فرعية مناسبة`);
          }
        }
      }
    }

    // ========== الخطوة 6: عرض النتيجة النهائية ==========
    console.log('\n' + '='.repeat(50));
    console.log('📊 النتيجة النهائية:');
    console.log('='.repeat(50));
    
    const finalCategories = await Category.find({}).sort({ parentCategory: 1, name: 1 });
    console.log('\n📂 الفئات:');
    for (const cat of finalCategories) {
      if (!cat.parentCategory) {
        console.log(`📁 ${cat.name} (${cat._id})`);
        const subs = finalCategories.filter(c => c.parentCategory?.toString() === cat._id.toString());
        for (const sub of subs) {
          const coursesCount = await Course.countDocuments({ category: sub._id.toString() });
          console.log(`   └─ ${sub.name} (${sub._id}) - ${coursesCount} دورة`);
        }
      }
    }

    console.log('\n📚 الدورات بعد الإصلاح:');
    const finalCourses = await Course.find({});
    for (const course of finalCourses) {
      const cat = categoryMap[course.category];
      const catName = cat ? cat.name : course.category;
      console.log(`   - ${course.title} → ${catName}`);
    }

    console.log(`\n✅ تم إصلاح ${fixedCount} دورة`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

fixProductionData();
