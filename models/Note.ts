import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INoteAttachment {
  type: 'file' | 'link'
  name: string
  url: string
  fileType?: string // pdf, image, doc, etc.
}

export interface INote extends Document {
  user: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  content: string
  timestamp?: number // للفيديو
  attachments?: INoteAttachment[] // الملفات والروابط المرفقة
  isSharedWithInstructor: boolean // مشاركة مع المدرب
  instructorReply?: string // رد المدرب
  instructorRepliedAt?: Date
  status: 'private' | 'shared' | 'replied' // حالة الملاحظة
  createdAt: Date
  updatedAt: Date
}

const NoteAttachmentSchema = new Schema({
  type: {
    type: String,
    enum: ['file', 'link'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  fileType: String,
})

const NoteSchema = new Schema<INote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 2000,
    },
    timestamp: {
      type: Number, // بالثواني
    },
    attachments: [NoteAttachmentSchema],
    isSharedWithInstructor: {
      type: Boolean,
      default: false,
    },
    instructorReply: String,
    instructorRepliedAt: Date,
    status: {
      type: String,
      enum: ['private', 'shared', 'replied'],
      default: 'private',
    },
  },
  {
    timestamps: true,
  }
)

// Index للبحث السريع
NoteSchema.index({ user: 1, course: 1, lesson: 1 })
NoteSchema.index({ course: 1, isSharedWithInstructor: 1 }) // للمدرب

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema)

export default Note
