import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAnswer {
  questionIndex: number
  answer: string | number
  isCorrect: boolean
  points: number
}

export interface IQuizAttempt extends Document {
  quiz: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  answers: IAnswer[]
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  timeSpent: number
  startedAt: Date
  completedAt: Date
  createdAt: Date
}

const AnswerSchema = new Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  answer: Schema.Types.Mixed,
  isCorrect: {
    type: Boolean,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
})

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    answers: [AnswerSchema],
    score: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
QuizAttemptSchema.index({ quiz: 1, student: 1 })
QuizAttemptSchema.index({ student: 1, createdAt: -1 })

const QuizAttempt: Model<IQuizAttempt> =
  mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema)

export default QuizAttempt
