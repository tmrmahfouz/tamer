import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  timestamp: number // بالثواني
  title: string
  note?: string
  color: 'yellow' | 'green' | 'blue' | 'red' | 'purple'
  createdAt: Date
  updatedAt: Date
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      min: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    color: {
      type: String,
      enum: ['yellow', 'green', 'blue', 'red', 'purple'],
      default: 'yellow',
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
BookmarkSchema.index({ user: 1, lesson: 1 })
BookmarkSchema.index({ user: 1, course: 1 })

const Bookmark: Model<IBookmark> =
  mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema)

export default Bookmark
