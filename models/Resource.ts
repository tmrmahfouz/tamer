import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IResource extends Document {
  course: mongoose.Types.ObjectId
  lesson?: mongoose.Types.ObjectId
  title: string
  description: string
  type: 'pdf' | 'video' | 'audio' | 'document' | 'image' | 'archive' | 'link'
  fileUrl: string
  fileName: string
  fileSize: number
  downloads: number
  isPublic: boolean
  uploadedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ResourceSchema = new Schema<IResource>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'audio', 'document', 'image', 'archive', 'link'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
ResourceSchema.index({ course: 1, lesson: 1 })
ResourceSchema.index({ type: 1 })

const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema)

export default Resource
