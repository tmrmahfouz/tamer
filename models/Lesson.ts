import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAttachment {
  name: string
  url: string
  type: string
  size?: number
}

export interface ILesson extends Document {
  title: string
  description: string
  course: mongoose.Types.ObjectId
  module?: mongoose.Types.ObjectId
  section?: mongoose.Types.ObjectId
  order: number
  type: 'video' | 'pdf' | 'text' | 'presentation' | 'html5'
  content: {
    // Video
    videoUrl?: string
    videoProvider?: 'youtube' | 'vimeo' | 'upload' | 'google-drive' | 'onedrive' | 'html5'
    // PDF
    pdfUrl?: string
    // Presentation
    presentationUrl?: string
    presentationType?: 'google-slides' | 'powerpoint' | 'upload'
    // Text
    textContent?: string
    // HTML5
    html5Content?: string
    // Common
    duration?: number
    fileSize?: number
    fileName?: string
  }
  attachments: IAttachment[]
  isFree: boolean
  isPublished: boolean
  // Learning Experience Features
  summary?: string
  keyPoints?: string[]
  estimatedTime?: number // الوقت المقدر بالدقائق
  createdAt: Date
  updatedAt: Date
}

const LessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'عنوان الدرس مطلوب'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      default: null,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      enum: ['video', 'pdf', 'text', 'presentation', 'html5'],
      required: true,
    },
    content: {
      // Video
      videoUrl: String,
      videoProvider: {
        type: String,
        enum: ['youtube', 'vimeo', 'upload', 'google-drive', 'onedrive', 'html5'],
      },
      // PDF
      pdfUrl: String,
      // Presentation
      presentationUrl: String,
      presentationType: {
        type: String,
        enum: ['google-slides', 'powerpoint', 'upload'],
      },
      // Text
      textContent: String,
      // HTML5
      html5Content: String,
      // Common
      duration: Number,
      fileSize: Number,
      fileName: String,
    },
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number },
      },
    ],
    isFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    // Learning Experience Features
    summary: {
      type: String,
      default: '',
    },
    keyPoints: [{
      type: String,
    }],
    estimatedTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema)

export default Lesson
