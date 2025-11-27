import mongoose, { Document, Schema } from 'mongoose'

export interface IModule extends Document {
  title: string
  description: string
  course: mongoose.Types.ObjectId
  order: number
  duration: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

const ModuleSchema = new Schema<IModule>(
  {
    title: {
      type: String,
      required: [true, 'عنوان الوحدة مطلوب'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: '',
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Create index for course and order
ModuleSchema.index({ course: 1, order: 1 })

export default mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema)
