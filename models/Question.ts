import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IQuestion extends Document {
  user: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  title: string
  content: string
  upvotes: number
  downvotes: number
  votedBy: { user: mongoose.Types.ObjectId; vote: 'up' | 'down' }[]
  solved: boolean
  answers: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const QuestionSchema = new Schema<IQuestion>(
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
    title: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 2000,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    votedBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        vote: {
          type: String,
          enum: ['up', 'down'],
        },
      },
    ],
    solved: {
      type: Boolean,
      default: false,
    },
    answers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Answer',
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Index للبحث السريع
QuestionSchema.index({ course: 1, lesson: 1, createdAt: -1 })
QuestionSchema.index({ solved: 1, upvotes: -1 })

const Question: Model<IQuestion> =
  mongoose.models.Question ||
  mongoose.model<IQuestion>('Question', QuestionSchema)

export default Question
