import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUserDevice {
  deviceId: string
  deviceName: string
  browser: string
  os: string
  ip: string
  lastUsed: Date
  createdAt: Date
}

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'student' | 'instructor' | 'admin'
  avatar?: string
  phone?: string
  bio?: string
  enrolledCourses: mongoose.Types.ObjectId[]
  devices: IUserDevice[]
  maxDevices?: number // تجاوز الحد الأقصى للمستخدم (اختياري)
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'البريد الإلكتروني غير صالح'],
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    enrolledCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    devices: [
      {
        deviceId: { type: String, required: true },
        deviceName: { type: String, default: 'جهاز غير معروف' },
        browser: { type: String, default: '' },
        os: { type: String, default: '' },
        ip: { type: String, default: '' },
        lastUsed: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    maxDevices: {
      type: Number,
      default: null, // null يعني استخدام الإعداد العام
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    return false
  }
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
