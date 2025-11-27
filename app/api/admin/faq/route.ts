import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// FAQ Schema
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

// GET all FAQs
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 }).lean()
    return NextResponse.json({ success: true, faqs })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// POST create FAQ
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    const faq = await FAQ.create(body)
    return NextResponse.json({ success: true, faq })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
