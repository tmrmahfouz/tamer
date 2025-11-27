import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVideoProgress extends Document {
  user: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  currentTime: number // الوقت الحالي بالثواني
  duration: number // مدة الفيديو الكاملة
  watchedSeconds: number // إجمالي الثواني المشاهدة
  watchedPercentage: number // نسبة المشاهدة
  playbackSpeed: number // سرعة التشغيل المفضلة
  lastPosition: number // آخر موضع للاستئناف
  completedSegments: number[][] // الأجزاء المشاهدة [[start, end], ...]
  isCompleted: boolean // هل شاهد 90% على الأقل
  lastWatchedAt: Date
  createdAt: Date
  updatedAt: Date
}

const VideoProgressSchema = new Schema<IVideoProgress>(
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
    currentTime: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    watchedSeconds: {
      type: Number,
      default: 0,
    },
    watchedPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    playbackSpeed: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 2,
    },
    lastPosition: {
      type: Number,
      default: 0,
    },
    completedSegments: {
      type: [[Number]],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
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

// Index فريد لكل مستخدم + درس
VideoProgressSchema.index({ user: 1, lesson: 1 }, { unique: true })
VideoProgressSchema.index({ user: 1, course: 1 })

const VideoProgress: Model<IVideoProgress> =
  mongoose.models.VideoProgress || mongoose.model<IVideoProgress>('VideoProgress', VideoProgressSchema)

export default VideoProgress
