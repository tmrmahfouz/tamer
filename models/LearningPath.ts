import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPathCourse {
  course: mongoose.Types.ObjectId
  order: number
  isRequired: boolean
}

export interface ILearningPath extends Document {
  title: string
  description: string
  thumbnail: string
  instructor: mongoose.Types.ObjectId
  courses: IPathCourse[]
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  price: number
  discount: number
  enrolledStudents: number
  rating: number
  reviews: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const PathCourseSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
})

const LearningPathSchema = new Schema<ILearningPath>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courses: [PathCourseSchema],
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    duration: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
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

// Index for faster queries
LearningPathSchema.index({ category: 1, isPublished: 1 })
LearningPathSchema.index({ instructor: 1 })

const LearningPath: Model<ILearningPath> =
  mongoose.models.LearningPath || mongoose.model<ILearningPath>('LearningPath', LearningPathSchema)

export default LearningPath
