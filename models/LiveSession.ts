import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ILiveSession extends Document {
  course: mongoose.Types.ObjectId
  instructor: mongoose.Types.ObjectId
  title: string
  description: string
  scheduledAt: Date
  duration: number
  meetingLink: string
  meetingId: string
  password?: string
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
  attendees: mongoose.Types.ObjectId[]
  recording?: {
    url: string
    duration: number
    uploadedAt: Date
  }
  maxAttendees?: number
  isRecorded: boolean
  createdAt: Date
  updatedAt: Date
}

const LiveSessionSchema = new Schema<ILiveSession>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
    },
    meetingLink: {
      type: String,
      required: true,
    },
    meetingId: {
      type: String,
      required: true,
    },
    password: String,
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    attendees: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    recording: {
      url: String,
      duration: Number,
      uploadedAt: Date,
    },
    maxAttendees: Number,
    isRecorded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
LiveSessionSchema.index({ course: 1, scheduledAt: 1 })
LiveSessionSchema.index({ instructor: 1, scheduledAt: 1 })

const LiveSession: Model<ILiveSession> =
  mongoose.models.LiveSession || mongoose.model<ILiveSession>('LiveSession', LiveSessionSchema)

export default LiveSession
