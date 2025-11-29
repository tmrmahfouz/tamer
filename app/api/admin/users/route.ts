import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/jwt'

// GET all users
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح - للأدمن فقط' }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    let query: any = {}
    if (role && role !== 'all') query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })

    return NextResponse.json({ success: true, users })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// POST create new user
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح - للأدمن فقط' }, { status: 403 })
    }

    await connectDB()

    const body = await req.json()
    const { name, email, password, role } = body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
    }

    const user = await User.create({ name, email, password, role: role || 'student' })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المستخدم بنجاح',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
