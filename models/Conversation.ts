import mongoose from 'mongoose'

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ['direct', 'group', 'support'],
      default: 'direct',
    },
    title: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
ConversationSchema.index({ participants: 1 })
ConversationSchema.index({ lastMessageAt: -1 })
ConversationSchema.index({ course: 1 })

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)

export default Conversation
