import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITwoFactorAuth extends Document {
  user: mongoose.Types.ObjectId
  enabled: boolean
  secret?: string
  backupCodes: string[]
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
}

const TwoFactorAuthSchema = new Schema<ITwoFactorAuth>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    secret: {
      type: String,
    },
    backupCodes: [
      {
        type: String,
      },
    ],
    lastUsed: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

const TwoFactorAuth: Model<ITwoFactorAuth> =
  mongoose.models.TwoFactorAuth ||
  mongoose.model<ITwoFactorAuth>('TwoFactorAuth', TwoFactorAuthSchema)

export default TwoFactorAuth
