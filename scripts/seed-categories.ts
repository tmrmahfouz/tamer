import mongoose from 'mongoose'
import Category from '../models/Category'

const categories = [
  {
    name: 'البرمجة وتطوير الويب',
    nameEn: 'Programming & Web Development',
    description: 'تعلم البرمجة وتطوير المواقع والتطبيقات',
    icon: '💻',
    color: '#3B82F6',
    order: 1,
    published: true,
  },
  {
    name: 'التصميم الجرافيكي',
    nameEn: 'Graphic Design',
    description: 'تعلم التصميم والإبداع البصري',
    icon: '🎨',
    color: '#EC4899',
    order: 2,
    published: true,
  },
  {
    name: 'التسويق الرقمي',
    nameEn: 'Digital Marketing',
    description: 'استراتيجيات التسويق الإلكتروني والسوشيال ميديا',
    icon: '📊',
    color: '#10B981',
    order: 3,
    published: true,
  },
  {
    name: 'الذكاء الاصطناعي',
    nameEn: 'Artificial Intelligence',
    description: 'تعلم الذكاء الاصطناعي والتعلم الآلي',
    icon: '🤖',
    color: '#8B5CF6',
    order: 4,
    published: true,
  },
  {
    name: 'إدارة الأعمال',
    nameEn: 'Business Management',
    description: 'مهارات القيادة وإدارة المشاريع',
    icon: '💼',
    color: '#F59E0B',
    order: 5,
    published: true,
  },
  {
    name: 'اللغات',
    nameEn: 'Languages',
    description: 'تعلم اللغات المختلفة',
    icon: '🌐',
    color: '#06B6D4',
    order: 6,
    published: true,
  },
  {
    name: 'التصوير الفوتوغرافي',
    nameEn: 'Photography',
    description: 'فن التصوير والإضاءة',
    icon: '📷',
    color: '#EF4444',
    order: 7,
    published: true,
  },
  {
    name: 'المونتاج وصناعة المحتوى',
    nameEn: 'Video Editing & Content Creation',
    description: 'تعلم المونتاج وإنتاج المحتوى',
    icon: '🎬',
    color: '#14B8A6',
    order: 8,
    published: true,
  },
  {
    name: 'الموسيقى والصوتيات',
    nameEn: 'Music & Audio',
    description: 'تعلم الموسيقى والهندسة الصوتية',
    icon: '🎵',
    color: '#A855F7',
    order: 9,
    published: true,
  },
  {
    name: 'العلوم والرياضيات',
    nameEn: 'Science & Mathematics',
    description: 'المواد العلمية والرياضية',
    icon: '🔬',
    color: '#0EA5E9',
    order: 10,
    published: true,
  },
  {
    name: 'التطوير الشخصي',
    nameEn: 'Personal Development',
    description: 'تطوير الذات والمهارات الحياتية',
    icon: '🎯',
    color: '#F97316',
    order: 11,
    published: true,
  },
  {
    name: 'الأمن السيبراني',
    nameEn: 'Cybersecurity',
    description: 'أمن المعلومات والحماية الإلكترونية',
    icon: '🔒',
    color: '#DC2626',
    order: 12,
    published: true,
  },
]

async function seedCategories() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-platform'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing categories
    await Category.deleteMany({})
    console.log('🗑️  Cleared existing categories')

    // Insert new categories
    const result = await Category.insertMany(categories)
    console.log(`✅ Created ${result.length} categories`)

    // Display categories
    console.log('\n📚 Categories:')
    result.forEach((cat) => {
      console.log(`  ${cat.icon} ${cat.name} (${cat.nameEn})`)
    })

    console.log('\n✨ Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    process.exit(1)
  }
}

seedCategories()
