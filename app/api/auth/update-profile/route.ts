import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/jwt'

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { name, email, phone, bio } = body

    // Check if email is taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: decoded.userId } })
      if (existingUser) {
        return NextResponse.json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (bio !== undefined) updateData.bio = bio

    const user = await User.findByIdAndUpdate(decoded.userId, updateData, { new: true }).select('-password')

    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم تحديث البيانات بنجاح', user })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
