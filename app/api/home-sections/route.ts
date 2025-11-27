import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import HomeSection from '@/models/HomeSection'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET - Fetch all home sections
export async function GET() {
  try {
    await connectDB()
    
    const sections = await HomeSection.find().sort({ order: 1 })
    
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching home sections:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الأقسام' },
      { status: 500 }
    )
  }
}

// POST - Create new section (Admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Get user
    const user = await User.findById(decoded.userId)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'غير مصرح لك بإضافة أقسام' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    
    // Get the highest order number
    const lastSection = await HomeSection.findOne().sort({ order: -1 })
    const newOrder = lastSection ? lastSection.order + 1 : 0
    
    const section = new HomeSection({
      ...data,
      order: data.order !== undefined ? data.order : newOrder,
    })
    
    await section.save()
    
    return NextResponse.json({
      message: 'تم إضافة القسم بنجاح',
      section
    })
  } catch (error) {
    console.error('Error creating section:', error)
    return NextResponse.json(
      { error: 'فشل في إضافة القسم' },
      { status: 500 }
    )
  }
}

// PUT - Update all sections (for reordering and bulk updates)
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Get user
    const user = await User.findById(decoded.userId)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل الأقسام' },
        { status: 403 }
      )
    }
    
    const { sections } = await request.json()
    
    // Update all sections
    const updatePromises = sections.map((section: any) =>
      HomeSection.findByIdAndUpdate(section._id, section, { new: true })
    )
    
    await Promise.all(updatePromises)
    
    return NextResponse.json({
      message: 'تم تحديث الأقسام بنجاح',
    })
  } catch (error) {
    console.error('Error updating sections:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث الأقسام' },
      { status: 500 }
    )
  }
}
