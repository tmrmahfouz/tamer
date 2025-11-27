import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAnswer extends Document {
  user: mongoose.Types.ObjectId
  question: mongoose.Types.ObjectId
  content: string
  upvotes: number
  downvotes: number
  votedBy: { user: mongoose.Types.ObjectId; vote: 'up' | 'down' }[]
  isAccepted: boolean
  createdAt: Date
  updatedAt: Date
}

const AnswerSchema = new Schema<IAnswer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
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
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index للبحث السريع
AnswerSchema.index({ question: 1, createdAt: 1 })

const Answer: Model<IAnswer> =
  mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema)

export default Answer
