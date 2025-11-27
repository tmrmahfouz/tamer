import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId
  action: string
  type: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'download' | 'other'
  entity: string
  entityId?: mongoose.Types.ObjectId
  details?: any
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['create', 'update', 'delete', 'login', 'logout', 'view', 'download', 'other'],
      required: true,
    },
    entity: {
      type: String,
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
ActivityLogSchema.index({ user: 1, createdAt: -1 })
ActivityLogSchema.index({ entity: 1, createdAt: -1 })
ActivityLogSchema.index({ type: 1, createdAt: -1 })

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)

export default ActivityLog
