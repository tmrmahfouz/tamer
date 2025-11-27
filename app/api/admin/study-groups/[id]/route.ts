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

// GET single study group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const group = await StudyGroup.findById(params.id)
      .populate('creator', 'name email')
      .populate('course', 'title')
      .populate('members', 'name email')

    if (!group) {
      return NextResponse.json({ success: false, message: 'المجموعة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ success: true, group })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// PATCH update study group
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

    const group = await StudyGroup.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    )

    if (!group) {
      return NextResponse.json({ success: false, message: 'المجموعة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ success: true, group })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE study group
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

    const group = await StudyGroup.findByIdAndDelete(params.id)

    if (!group) {
      return NextResponse.json({ success: false, message: 'المجموعة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
