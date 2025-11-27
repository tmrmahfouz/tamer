import mongoose from 'mongoose'

const SectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'عنوان الموضوع مطلوب'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'الدورة مطلوبة'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
SectionSchema.index({ course: 1, order: 1 })

const Section = mongoose.models.Section || mongoose.model('Section', SectionSchema)

export default Section
