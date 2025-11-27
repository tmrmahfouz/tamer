import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId
  courses: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema)

export default Wishlist
