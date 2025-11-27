import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAssignment extends Document {
  course: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  title: string
  description: string
  instructions: string
  dueDate: Date
  maxScore: number
  allowedFileTypes: string[]
  maxFileSize: number // بالميجابايت
  allowResubmission: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const AssignmentSchema = new Schema<IAssignment>(
  {
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
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 2000,
    },
    instructions: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 100,
    },
    allowedFileTypes: [
      {
        type: String,
        enum: ['pdf', 'zip', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'txt', 'js', 'py', 'java', 'cpp'],
      },
    ],
    maxFileSize: {
      type: Number,
      default: 10, // 10 MB
    },
    allowResubmission: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index للبحث السريع
AssignmentSchema.index({ course: 1, lesson: 1 })
AssignmentSchema.index({ dueDate: 1 })

const Assignment: Model<IAssignment> =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>('Assignment', AssignmentSchema)

export default Assignment
