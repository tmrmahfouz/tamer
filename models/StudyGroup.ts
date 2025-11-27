import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IStudyGroup extends Document {
  name: string
  description: string
  course: mongoose.Types.ObjectId
  creator: mongoose.Types.ObjectId
  members: mongoose.Types.ObjectId[]
  maxMembers: number
  isPrivate: boolean
  inviteCode?: string
  meetingSchedule?: string
  meetingLink?: string
  tags: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const StudyGroupSchema = new Schema<IStudyGroup>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    maxMembers: { type: Number, default: 10, min: 2, max: 50 },
    isPrivate: { type: Boolean, default: false },
    inviteCode: { type: String, unique: true, sparse: true },
    meetingSchedule: { type: String },
    meetingLink: { type: String },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

StudyGroupSchema.index({ course: 1, isActive: 1 })
StudyGroupSchema.index({ inviteCode: 1 })

const StudyGroup: Model<IStudyGroup> =
  mongoose.models.StudyGroup || mongoose.model<IStudyGroup>('StudyGroup', StudyGroupSchema)

export default StudyGroup
