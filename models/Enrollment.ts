import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProgress {
  lesson: mongoose.Types.ObjectId
  completed: boolean
  completedAt?: Date
  watchTime?: number
}

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  enrolledAt: Date
  progress: IProgress[]
  completionPercentage: number
  status: 'pending' | 'active' | 'rejected' | 'completed'
  certificateIssued: boolean
  certificateIssuedAt?: Date
  paymentStatus: 'pending' | 'completed' | 'failed'
  paymentMethod?: string
  paymentAmount: number
  createdAt: Date
  updatedAt: Date
}

const ProgressSchema = new Schema({
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  watchTime: Number,
})

const EnrollmentSchema = new Schema<IEnrollment>(
  {
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
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    progress: [ProgressSchema],
    completionPercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'completed'],
      default: 'active',
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: String,
    paymentAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)

export default Enrollment
