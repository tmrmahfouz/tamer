/**
 * سكريبت لإضافة فئات فرعية للصف الثانى الثانوى
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

async function addSubcategories() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح\n');

    // جلب الصف الثانى الثانوى
    const secondYear = await Category.findOne({ name: 'الصف الثانى الثانوى' });
    
    if (!secondYear) {
      console.log('❌ لم يتم العثور على الصف الثانى الثانوى');
      return;
    }

    console.log(`📁 الصف الثانى الثانوى (ID: ${secondYear._id})`);

    // إنشاء فئات فرعية
    const subcategories = [
      { name: 'الفصل الدراسي الأول 2025 - ثانى ثانوى', icon: '📘', color: '#8B5CF6' },
      { name: 'الفصل الدراسي الثاني 2025 - ثانى ثانوى', icon: '📗', color: '#EC4899' },
    ];

    for (const sub of subcategories) {
      const existing = await Category.findOne({ name: sub.name });
      if (!existing) {
        const newSub = await Category.create({
          name: sub.name,
          nameEn: sub.name.includes('الأول') ? 'First Semester 2025 - 2nd Year' : 'Second Semester 2025 - 2nd Year',
          description: sub.name,
          icon: sub.icon,
          color: sub.color,
          parentCategory: secondYear._id,
          published: true,
        });
        console.log(`   ✅ تم إنشاء: ${sub.name} (ID: ${newSub._id})`);
      } else {
        console.log(`   ℹ️ موجودة مسبقاً: ${sub.name} (ID: ${existing._id})`);
      }
    }

    // عرض النتيجة النهائية
    console.log('\n📊 جميع الفئات:');
    const allCategories = await Category.find({}).sort({ parentCategory: 1, name: 1 });
    for (const cat of allCategories) {
      if (!cat.parentCategory) {
        console.log(`📁 ${cat.name} (${cat._id})`);
        const subs = allCategories.filter(c => c.parentCategory?.toString() === cat._id.toString());
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

addSubcategories();
