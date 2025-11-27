import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IHomeSection extends Document {
  type: 'hero' | 'features' | 'categories' | 'courses' | 'stats' | 'testimonials' | 'cta' | 'custom'
  title: string
  subtitle?: string
  content?: string
  isActive: boolean
  order: number
  settings: {
    backgroundColor?: string
    textColor?: string
    showButton?: boolean
    buttonText?: string
    buttonLink?: string
    imageUrl?: string
    items?: Array<{
      title?: string
      description?: string
      icon?: string
      value?: string
    }>
  }
  createdAt?: Date
  updatedAt?: Date
}

const HomeSectionSchema = new Schema<IHomeSection>(
  {
    type: {
      type: String,
      enum: ['hero', 'features', 'categories', 'courses', 'stats', 'testimonials', 'cta', 'custom'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: true,
    },
    settings: {
      backgroundColor: { type: String, default: '#ffffff' },
      textColor: { type: String, default: '#000000' },
      showButton: { type: Boolean, default: false },
      buttonText: { type: String, default: '' },
      buttonLink: { type: String, default: '' },
      imageUrl: { type: String, default: '' },
      items: [
        {
          title: String,
          description: String,
          icon: String,
          value: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
)

const HomeSection: Model<IHomeSection> =
  mongoose.models.HomeSection || mongoose.model<IHomeSection>('HomeSection', HomeSectionSchema)

export default HomeSection
