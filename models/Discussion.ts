import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReply {
  _id?: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  content: string
  likes: mongoose.Types.ObjectId[]
  isInstructorReply: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IDiscussion extends Document {
  course: mongoose.Types.ObjectId
  lesson?: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  title: string
  content: string
  type: 'question' | 'discussion' | 'announcement'
  tags: string[]
  likes: mongoose.Types.ObjectId[]
  replies: IReply[]
  views: number
  isPinned: boolean
  isResolved: boolean
  resolvedBy?: mongoose.Types.ObjectId
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReplySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isInstructorReply: { type: Boolean, default: false },
}, { timestamps: true })

const DiscussionSchema = new Schema<IDiscussion>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    type: { type: String, enum: ['question', 'discussion', 'announcement'], default: 'question' },
    tags: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replies: [ReplySchema],
    views: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
)

DiscussionSchema.index({ course: 1, createdAt: -1 })
DiscussionSchema.index({ course: 1, lesson: 1 })
DiscussionSchema.index({ course: 1, isPinned: -1, createdAt: -1 })

const Discussion: Model<IDiscussion> =
  mongoose.models.Discussion || mongoose.model<IDiscussion>('Discussion', DiscussionSchema)

export default Discussion
