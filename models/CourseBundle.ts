import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICourseBundle extends Document {
  name: string
  description: string
  image: string
  courses: mongoose.Types.ObjectId[]
  originalPrice: number
  discountPercentage: number
  finalPrice: number
  isActive: boolean
  validFrom?: Date
  validUntil?: Date
  maxPurchases?: number
  currentPurchases: number
  createdAt: Date
  updatedAt: Date
}

const CourseBundleSchema = new Schema<ICourseBundle>(
  {
    name: {
      type: String,
      required: [true, 'اسم الحزمة مطلوب'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    originalPrice: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
    },
    validUntil: {
      type: Date,
    },
    maxPurchases: {
      type: Number,
    },
    currentPurchases: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const CourseBundle: Model<ICourseBundle> =
  mongoose.models.CourseBundle || mongoose.model<ICourseBundle>('CourseBundle', CourseBundleSchema)

export default CourseBundle
