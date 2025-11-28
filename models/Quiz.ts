import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMatchingPair {
  left: string
  right: string
}

export interface IQuestion {
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'ordering'
  options?: string[]
  correctAnswer: string | number | number[] // number[] للترتيب
  matchingPairs?: IMatchingPair[] // للتوصيل
  orderItems?: string[] // عناصر الترتيب بالترتيب الصحيح
  points: number
  explanation?: string
}

export interface IQuiz extends Document {
  title: string
  description: string
  lesson: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  questions: IQuestion[]
  passingScore: number
  timeLimit?: number
  maxAttempts: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const MatchingPairSchema = new Schema({
  left: { type: String, required: true },
  right: { type: String, required: true },
})

const QuestionSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'matching', 'ordering'],
    required: true,
  },
  options: {
    type: [String],
    default: undefined,
  },
  correctAnswer: {
    type: Schema.Types.Mixed, // string | number | number[]
    default: undefined,
  },
  matchingPairs: {
    type: [MatchingPairSchema], // للتوصيل
    default: undefined,
  },
  orderItems: {
    type: [String], // للترتيب
    default: undefined,
  },
  points: {
    type: Number,
    default: 1,
  },
  explanation: String,
})

const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, 'عنوان الاختبار مطلوب'],
    },
    description: {
      type: String,
      default: '',
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    questions: [QuestionSchema],
    passingScore: {
      type: Number,
      default: 70,
    },
    timeLimit: Number,
    maxAttempts: {
      type: Number,
      default: 3,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const Quiz: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema)

export default Quiz
