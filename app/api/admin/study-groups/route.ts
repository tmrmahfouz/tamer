import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import StudyGroup from '@/models/StudyGroup'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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

// GET all study groups (admin)
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const groups = await StudyGroup.find()
      .populate('creator', 'name email')
      .populate('course', 'title')
      .populate('members', 'name')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, groups })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// POST bulk delete
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()
    const { ids } = await request.json()

    await StudyGroup.deleteMany({ _id: { $in: ids } })

    return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
