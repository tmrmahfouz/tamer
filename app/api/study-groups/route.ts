import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import StudyGroup from '@/models/StudyGroup'
import mongoose from 'mongoose'

// توليد كود دعوة فريد
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// GET - جلب مجموعات الدراسة
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const myGroups = searchParams.get('myGroups')

    const token = request.cookies.get('token')?.value
    let decoded: any = null
    if (token) {
      try {
        decoded = verifyToken(token) as any
      } catch (e) {}
    }

    let query: any = { isActive: true }
    
    if (courseId) {
      query.course = courseId
    }

    if (myGroups === 'true' && decoded) {
      query.$or = [
        { creator: decoded.userId },
        { members: decoded.userId }
      ]
    }

    const groups = await StudyGroup.find(query)
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar')
      .populate('course', 'title')
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, groups })
  } catch (error) {
    console.error('Error fetching study groups:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - إنشاء مجموعة دراسة
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, courseId, maxMembers, isPrivate, meetingSchedule, meetingLink, tags } = body

    if (!name || !courseId) {
      return NextResponse.json({ success: false, message: 'الاسم والدورة مطلوبان' }, { status: 400 })
    }

    const userObjectId = new mongoose.Types.ObjectId(decoded.userId)
    const courseObjectId = new mongoose.Types.ObjectId(courseId)

    const group = await StudyGroup.create({
      name,
      description: description || '',
      course: courseObjectId,
      creator: userObjectId,
      members: [userObjectId],
      maxMembers: maxMembers || 10,
      isPrivate: isPrivate || false,
      inviteCode: isPrivate ? generateInviteCode() : undefined,
      meetingSchedule,
      meetingLink,
      tags: tags || [],
    } as any)

    const populated = await StudyGroup.findById((group as any)._id)
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar')
      .populate('course', 'title')

    return NextResponse.json({ success: true, group: populated })
  } catch (error) {
    console.error('Error creating study group:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
