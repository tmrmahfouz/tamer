import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICourse extends Document {
  title: string
  description: string
  instructor: mongoose.Types.ObjectId
  category: string
  subcategory?: string
  level: 'مبتدئ' | 'متوسط' | 'متقدم'
  price: number
  duration: string
  image: string
  thumbnail: string
  lessons: number
  students: number
  rating: number
  topics: string[]
  published: boolean
  // Drip Content Settings
  dripEnabled: boolean
  dripType: 'days' | 'lessons' | 'date'
  dripInterval: number // عدد الأيام أو الدروس
  dripStartDate?: Date // تاريخ بدء التنقيط
  // Sequential Lessons (إجبار الترتيب)
  enforceSequentialLessons: boolean // إجبار إنهاء الدرس الحالي قبل الانتقال للتالي
  // Certificate Settings
  certificateEnabled: boolean // تفعيل الشهادة عند إكمال الدورة
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'عنوان الدورة مطلوب'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'وصف الدورة مطلوب'],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'التصنيف مطلوب'],
    },
    subcategory: {
      type: String,
      default: '',
    },
    level: {
      type: String,
      enum: ['مبتدئ', 'متوسط', 'متقدم'],
      default: 'مبتدئ',
    },
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      min: 0,
    },
    duration: {
      type: String,
      required: [true, 'المدة مطلوبة'],
    },
    image: {
      type: String,
      default: '🎓',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    lessons: {
      type: Number,
      default: 0,
    },
    students: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    topics: [
      {
        type: String,
      },
    ],
    published: {
      type: Boolean,
      default: false,
    },
    // Drip Content Settings
    dripEnabled: {
      type: Boolean,
      default: false,
    },
    dripType: {
      type: String,
      enum: ['days', 'lessons', 'date'],
      default: 'days',
    },
    dripInterval: {
      type: Number,
      default: 7, // افتراضي: 7 أيام بين كل درس
    },
    dripStartDate: {
      type: Date,
      default: null,
    },
    // Sequential Lessons
    enforceSequentialLessons: {
      type: Boolean,
      default: false,
    },
    // Certificate Settings
    certificateEnabled: {
      type: Boolean,
      default: true, // مفعّل افتراضياً
    },
  },
  {
    timestamps: true,
  }
)

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)

export default Course
