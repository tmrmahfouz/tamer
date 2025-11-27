import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPointsTransaction extends Document {
  user: mongoose.Types.ObjectId
  points: number
  type: 'earn' | 'spend' | 'bonus'
  reason: string
  reference?: {
    model: string
    id: mongoose.Types.ObjectId
  }
  createdAt: Date
}

export interface IUserPoints extends Document {
  user: mongoose.Types.ObjectId
  totalPoints: number
  availablePoints: number
  level: number
  streak: number
  lastActivityDate: Date
  createdAt: Date
  updatedAt: Date
}

const PointsTransactionSchema = new Schema<IPointsTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['earn', 'spend', 'bonus'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    reference: {
      model: String,
      id: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
)

const UserPointsSchema = new Schema<IUserPoints>(
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
    availablePoints: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    streak: {
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

// Index for faster queries
PointsTransactionSchema.index({ user: 1, createdAt: -1 })
UserPointsSchema.index({ totalPoints: -1 })

const PointsTransaction: Model<IPointsTransaction> =
  mongoose.models.PointsTransaction || mongoose.model<IPointsTransaction>('PointsTransaction', PointsTransactionSchema)

const UserPoints: Model<IUserPoints> =
  mongoose.models.UserPoints || mongoose.model<IUserPoints>('UserPoints', UserPointsSchema)

export { PointsTransaction, UserPoints }
export default UserPoints
