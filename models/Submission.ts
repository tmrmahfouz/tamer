import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISubmission extends Document {
  assignment: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  files: {
    name: string
    url: string
    size: number
    type: string
  }[]
  notes: string
  status: 'pending' | 'graded' | 'resubmitted'
  score?: number
  feedback?: string
  gradedBy?: mongoose.Types.ObjectId
  gradedAt?: Date
  submittedAt: Date
  createdAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    files: [
      {
        name: String,
        url: String,
        size: Number,
        type: String,
      },
    ],
    notes: {
      type: String,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'graded', 'resubmitted'],
      default: 'pending',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
      maxlength: 2000,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Index فريد لكل طالب + واجب (مع السماح بإعادة التسليم)
SubmissionSchema.index({ assignment: 1, student: 1 })

const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>('Submission', SubmissionSchema)

export default Submission
