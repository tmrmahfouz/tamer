import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReminder extends Document {
  user: mongoose.Types.ObjectId
  type: 'assignment' | 'course_completion' | 'streak' | 'lesson' | 'subscription' | 'live_session'
  title: string
  message: string
  relatedId?: mongoose.Types.ObjectId
  relatedModel?: string
  scheduledFor: Date
  sent: boolean
  sentAt?: Date
  createdAt: Date
}

const ReminderSchema = new Schema<IReminder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['assignment', 'course_completion', 'streak', 'lesson', 'subscription', 'live_session'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    relatedModel: {
      type: String,
      enum: ['Assignment', 'Course', 'Lesson', 'Subscription'],
    },
    scheduledFor: {
      type: Date,
      required: true,
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Index للبحث السريع
ReminderSchema.index({ user: 1, scheduledFor: 1, sent: 1 })
ReminderSchema.index({ scheduledFor: 1, sent: 1 })

const Reminder: Model<IReminder> =
  mongoose.models.Reminder ||
  mongoose.model<IReminder>('Reminder', ReminderSchema)

export default Reminder
