import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBadge extends Document {
  name: string
  description: string
  icon: string
  color: string
  criteria: {
    type: 'courses_completed' | 'points_earned' | 'streak_days' | 'certificates' | 'custom'
    value: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IUserBadge extends Document {
  user: mongoose.Types.ObjectId
  badge: mongoose.Types.ObjectId
  earnedAt: Date
  progress: number
}

const BadgeSchema = new Schema<IBadge>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
    color: {
      type: String,
      default: '#FFD700',
    },
    criteria: {
      type: {
        type: String,
        enum: ['courses_completed', 'points_earned', 'streak_days', 'certificates', 'custom'],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const UserBadgeSchema = new Schema<IUserBadge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  }
)

// Index for faster queries
UserBadgeSchema.index({ user: 1, badge: 1 }, { unique: true })

const Badge: Model<IBadge> =
  mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema)

const UserBadge: Model<IUserBadge> =
  mongoose.models.UserBadge || mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema)

export { Badge, UserBadge }
export default Badge
