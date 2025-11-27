import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAchievement extends Document {
  user: mongoose.Types.ObjectId
  type: string
  title: string
  description: string
  icon: string
  points: number
  unlockedAt: Date
  createdAt: Date
}

const AchievementSchema = new Schema<IAchievement>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'first_lesson',
        'first_course',
        'streak_7',
        'streak_30',
        'lessons_10',
        'lessons_50',
        'courses_5',
        'courses_10',
        'perfect_quiz',
        'helper_10',
        'helper_50',
        'notes_50',
        'notes_100',
        'speed_demon',
        'five_stars',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Index فريد لكل مستخدم + نوع
AchievementSchema.index({ user: 1, type: 1 }, { unique: true })

const Achievement: Model<IAchievement> =
  mongoose.models.Achievement ||
  mongoose.model<IAchievement>('Achievement', AchievementSchema)

export default Achievement
