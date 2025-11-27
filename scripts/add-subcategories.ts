import mongoose from 'mongoose'
import Category from '../models/Category'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

const subcategoriesData: { [key: string]: string[] } = {
  'البرمجة وتطوير الويب': [
    'تطوير الويب الأمامي (Frontend)',
    'تطوير الويب الخلفي (Backend)',
    'تطوير Full Stack',
    'تطوير تطبيقات الموبايل',
    'برمجة قواعد البيانات',
  ],
  'التصميم الجرافيكي': [
    'تصميم الشعارات',
    'تصميم الهوية البصرية',
    'تصميم الإعلانات',
    'تصميم واجهات المستخدم (UI)',
    'تصميم تجربة المستخدم (UX)',
  ],
  'التسويق الرقمي': [
    'التسويق عبر وسائل التواصل الاجتماعي',
    'تحسين محركات البحث (SEO)',
    'التسويق بالمحتوى',
    'الإعلانات المدفوعة',
    'التسويق بالبريد الإلكتروني',
  ],
  'الذكاء الاصطناعي': [
    'التعلم الآلي (Machine Learning)',
    'التعلم العميق (Deep Learning)',
    'معالجة اللغات الطبيعية (NLP)',
    'رؤية الحاسوب (Computer Vision)',
    'الروبوتات والأتمتة',
  ],
  'إدارة الأعمال': [
    'إدارة المشاريع',
    'ريادة الأعمال',
    'إدارة الموارد البشرية',
    'التخطيط الاستراتيجي',
    'إدارة المبيعات',
  ],
  'اللغات': [
    'اللغة الإنجليزية',
    'اللغة الفرنسية',
    'اللغة الألمانية',
    'اللغة الإسبانية',
    'اللغة الصينية',
  ],
  'التصوير الفوتوغرافي': [
    'تصوير البورتريه',
    'تصوير المناظر الطبيعية',
    'التصوير الفوتوغرافي للمنتجات',
    'تصوير الأحداث',
    'معالجة الصور',
  ],
  'المونتاج وصناعة المحتوى': [
    'مونتاج الفيديو',
    'صناعة المحتوى على يوتيوب',
    'الموشن جرافيك',
    'المؤثرات البصرية',
    'تحرير الصوت',
  ],
}

async function addSubcategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get all categories
    const categories = await Category.find()

    for (const category of categories) {
      const subcategories = subcategoriesData[category.name]
      
      if (subcategories) {
        await Category.findByIdAndUpdate(category._id, {
          subcategories: subcategories,
        })
        console.log(`✅ Added ${subcategories.length} subcategories to: ${category.name}`)
      }
    }

    console.log('\n✨ Subcategories added successfully!')
    
    // Display summary
    const updatedCategories = await Category.find()
    console.log('\n📚 Categories with Subcategories:')
    updatedCategories.forEach((cat) => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        console.log(`\n${cat.icon} ${cat.name}:`)
        cat.subcategories.forEach((sub: string) => {
          console.log(`  - ${sub}`)
        })
      }
    })

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

addSubcategories()
