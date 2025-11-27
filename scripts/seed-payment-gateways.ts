import mongoose from 'mongoose'
import PaymentGateway from '../models/PaymentGateway'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

const defaultGateways = [
  {
    name: 'فودافون كاش',
    type: 'vodafone_cash' as const,
    isActive: true,
    config: {
      accountNumber: '01012345678',
      accountName: 'تامر محفوظ',
      instructions: 'قم بتحويل المبلغ على رقم فودافون كاش: 01012345678 ثم أرسل صورة الإيصال',
    },
    fees: {
      type: 'percentage' as const,
      value: 0,
    },
  },
  {
    name: 'انستاباي',
    type: 'instapay' as const,
    isActive: true,
    config: {
      accountName: '@tamermahfouz',
      instructions: 'استخدم اسم المستخدم: @tamermahfouz على انستاباي وأرسل رقم المرجع',
    },
    fees: {
      type: 'percentage' as const,
      value: 0,
    },
  },
  {
    name: 'فوري',
    type: 'fawry' as const,
    isActive: true,
    config: {
      merchantCode: '12345',
      instructions: 'ادفع من خلال فوري باستخدام كود التاجر: 12345 وأرسل رقم المرجع',
    },
    fees: {
      type: 'percentage' as const,
      value: 0,
    },
  },
  {
    name: 'تحويل بنكي',
    type: 'bank_transfer' as const,
    isActive: true,
    config: {
      bankName: 'البنك الأهلي المصري',
      accountName: 'تامر محفوظ',
      accountNumber: '1234567890',
      iban: 'EG380002000156789012345180002',
      instructions: 'قم بالتحويل على الحساب البنكي وأرسل صورة الإيصال',
    },
    fees: {
      type: 'percentage' as const,
      value: 0,
    },
  },
]

async function seedPaymentGateways() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if gateways already exist
    const existingCount = await PaymentGateway.countDocuments()
    
    if (existingCount > 0) {
      console.log(`ℹ️  Found ${existingCount} existing payment gateways`)
      console.log('⚠️  Skipping seed to avoid duplicates')
      console.log('💡 To reset, delete all gateways first')
    } else {
      console.log('📝 Creating default payment gateways...')
      
      for (const gateway of defaultGateways) {
        await PaymentGateway.create(gateway)
        console.log(`✅ Created: ${gateway.name}`)
      }
      
      console.log('🎉 Successfully seeded payment gateways!')
    }

    await mongoose.connection.close()
    console.log('👋 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error seeding payment gateways:', error)
    process.exit(1)
  }
}

seedPaymentGateways()
