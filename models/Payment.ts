import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId
  course?: mongoose.Types.ObjectId
  bundle?: mongoose.Types.ObjectId
  type: 'course' | 'bundle'
  enrollment?: mongoose.Types.ObjectId
  amount: number
  originalAmount?: number
  discount?: number
  couponCode?: string
  currency: string
  method: 'vodafone-cash' | 'instapay' | 'fawry' | 'card' | 'manual' | 'bank_transfer' | 'vodafone_cash' | 'cash'
  paymentMethod?: 'card' | 'bank' | 'cash' | 'manual' | 'vodafone_cash' | 'instapay' | 'fawry' | 'bank_transfer'
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'verified' | 'rejected'
  transactionId?: string
  phoneNumber?: string
  referenceNumber?: string
  paymentProof?: string
  paymentDetails?: any
  verifiedAt?: Date
  verifiedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    bundle: {
      type: Schema.Types.ObjectId,
      ref: 'CourseBundle',
    },
    type: {
      type: String,
      enum: ['course', 'bundle'],
      default: 'course',
    },
    enrollment: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
    },
    amount: {
      type: Number,
      required: true,
    },
    originalAmount: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
    },
    currency: {
      type: String,
      default: 'EGP',
    },
    method: {
      type: String,
      enum: ['vodafone-cash', 'instapay', 'fawry', 'card', 'manual', 'bank_transfer', 'vodafone_cash', 'cash'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank', 'cash', 'manual', 'vodafone_cash', 'instapay', 'fawry', 'bank_transfer'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'verified', 'rejected'],
      default: 'pending',
    },
    transactionId: String,
    phoneNumber: String,
    referenceNumber: String,
    paymentProof: String,
    paymentDetails: Schema.Types.Mixed,
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)

export default Payment
