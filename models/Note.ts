import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INote extends Document {
  user: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  content: string
  timestamp?: number // للفيديو
  createdAt: Date
  updatedAt: Date
}

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
      maxlength: 1000,
    },
    timestamp: {
      type: Number, // بالثواني
    },
  },
  {
    timestamps: true,
  }
)

// Index للبحث السريع
NoteSchema.index({ user: 1, course: 1, lesson: 1 })

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema)

export default Note
