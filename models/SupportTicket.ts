import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessage {
  sender: mongoose.Types.ObjectId
  senderRole: 'student' | 'instructor' | 'admin'
  message: string
  attachments?: string[]
  createdAt: Date
}

export interface ISupportTicket extends Document {
  user: mongoose.Types.ObjectId
  subject: string
  category: 'technical' | 'payment' | 'course' | 'account' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  messages: IMessage[]
  assignedTo?: mongoose.Types.ObjectId
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  attachments: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['technical', 'payment', 'course', 'account', 'other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    messages: [MessageSchema],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
SupportTicketSchema.index({ user: 1, status: 1 })
SupportTicketSchema.index({ assignedTo: 1, status: 1 })

const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema)

export default SupportTicket
