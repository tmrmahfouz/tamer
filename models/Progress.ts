import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  completed: boolean
  watchTime: number // بالثواني
  lastWatchedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ProgressSchema = new Schema<IProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    watchTime: {
      type: Number,
      default: 0,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Index فريد لكل مستخدم + دورة + درس
ProgressSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true })

const Progress: Model<IProgress> =
  mongoose.models.Progress ||
  mongoose.model<IProgress>('Progress', ProgressSchema)

export default Progress
