import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'عام' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema)

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') return null
    return decoded
  } catch {
    return null
  }
}

// PATCH update FAQ
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    const faq = await FAQ.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    )

    if (!faq) {
      return NextResponse.json({ success: false, message: 'السؤال غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, faq })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const faq = await FAQ.findByIdAndDelete(params.id)

    if (!faq) {
      return NextResponse.json({ success: false, message: 'السؤال غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
