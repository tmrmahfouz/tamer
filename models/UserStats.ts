import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserStats extends Document {
  user: mongoose.Types.ObjectId
  totalPoints: number
  lessonsCompleted: number
  coursesCompleted: number
  quizzesTaken: number
  questionsAsked: number
  answersGiven: number
  acceptedAnswers: number
  notesCreated: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date
  createdAt: Date
  updatedAt: Date
}

const UserStatsSchema = new Schema<IUserStats>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    lessonsCompleted: {
      type: Number,
      default: 0,
    },
    coursesCompleted: {
      type: Number,
      default: 0,
    },
    quizzesTaken: {
      type: Number,
      default: 0,
    },
    questionsAsked: {
      type: Number,
      default: 0,
    },
    answersGiven: {
      type: Number,
      default: 0,
    },
    acceptedAnswers: {
      type: Number,
      default: 0,
    },
    notesCreated: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const UserStats: Model<IUserStats> =
  mongoose.models.UserStats ||
  mongoose.model<IUserStats>('UserStats', UserStatsSchema)

export default UserStats
