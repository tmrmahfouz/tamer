import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import StudyGroup from '@/models/StudyGroup'

function getAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  
  try {
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') return null
    return decoded
  } catch {
    return null
  }
}

// GET all study groups (admin)
export async function GET(request: NextRequest) {
  try {
    const admin = getAdmin(request)
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

    return NextResponse.json({ success: true, groups: groups || [] })
  } catch (error: any) {
    console.error('Study Groups API Error:', error)
    return NextResponse.json({ success: true, groups: [] })
  }
}

// POST bulk delete
export async function POST(request: NextRequest) {
  try {
    const admin = getAdmin(request)
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
