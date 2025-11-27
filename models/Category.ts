import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICategory extends Document {
  name: string
  nameEn: string
  description: string
  icon: string
  color: string
  order: number
  published: boolean
  coursesCount: number
  parentCategory?: mongoose.Types.ObjectId | null
  subcategories?: string[]
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'اسم الفئة مطلوب'],
      unique: true,
      trim: true,
    },
    nameEn: {
      type: String,
      required: [true, 'الاسم بالإنجليزية مطلوب'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '📚',
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    order: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
    coursesCount: {
      type: Number,
      default: 0,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    subcategories: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)

export default Category
