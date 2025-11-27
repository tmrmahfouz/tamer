import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReview extends Document {
  user: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  rating: number
  comment: string
  helpful: number
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// منع تقييم واحد فقط لكل مستخدم لكل دورة
ReviewSchema.index({ user: 1, course: 1 }, { unique: true })

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)

export default Review
