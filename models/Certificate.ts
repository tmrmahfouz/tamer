import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICertificate extends Document {
  student: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  enrollment: mongoose.Types.ObjectId
  certificateNumber: string
  issuedAt: Date
  completionDate: Date
  grade: number
  verificationCode: string
  createdAt: Date
  updatedAt: Date
}

const CertificateSchema = new Schema<ICertificate>(
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
    enrollment: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
CertificateSchema.index({ student: 1, course: 1 }, { unique: true })

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema)

export default Certificate
