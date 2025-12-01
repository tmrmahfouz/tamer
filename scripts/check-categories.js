/**
 * سكريبت لفحص الفئات والدورات في قاعدة البيانات
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

async function checkData() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح\n');

    // جلب جميع الفئات
    const categories = await Category.find({});
    console.log('📂 الفئات الموجودة:');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat._id}) ${cat.parentCategory ? `[فرعية من: ${cat.parentCategory}]` : '[رئيسية]'}`);
    });

    console.log('\n📚 الدورات الموجودة:');
    const courses = await Course.find({});
    courses.forEach(course => {
      console.log(`   - ${course.title}`);
      console.log(`     category: "${course.category}"`);
      console.log(`     subcategory: "${course.subcategory || 'لا يوجد'}"`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

checkData();
