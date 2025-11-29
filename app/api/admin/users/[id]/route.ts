import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/jwt'
import bcrypt from 'bcryptjs'

// GET single user
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    await connectDB()
    const user = await User.findById(params.id).select('-password')

    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// PUT update user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    await connectDB()

    const body = await req.json()
    const { name, email, password, role, phone, bio } = body

    // Check if email is taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: params.id } })
      if (existingUser) {
        return NextResponse.json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (phone !== undefined) updateData.phone = phone
    if (bio !== undefined) updateData.bio = bio

    // Hash password if provided
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    const user = await User.findByIdAndUpdate(params.id, updateData, { new: true }).select('-password')

    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم تحديث المستخدم بنجاح', user })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
    }

    // Prevent deleting self
    if (decoded.userId === params.id) {
      return NextResponse.json({ success: false, message: 'لا يمكنك حذف حسابك الخاص' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findByIdAndDelete(params.id)

    if (!user) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
