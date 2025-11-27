import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISession extends Document {
  user: mongoose.Types.ObjectId
  token: string
  deviceInfo: {
    browser: string
    os: string
    device: string
    deviceType: 'desktop' | 'mobile' | 'tablet'
  }
  ipAddress: string
  location?: {
    country: string
    city: string
    region: string
  }
  isActive: boolean
  lastActivity: Date
  createdAt: Date
  expiresAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deviceInfo: {
      browser: String,
      os: String,
      device: String,
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
      },
    },
    ipAddress: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      city: String,
      region: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index للبحث السريع
SessionSchema.index({ user: 1, isActive: 1 })
SessionSchema.index({ token: 1 })
SessionSchema.index({ expiresAt: 1 })

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)

export default Session
