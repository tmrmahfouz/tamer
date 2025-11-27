import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import HomeSection from '@/models/HomeSection'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET - Fetch single section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const section = await HomeSection.findById(params.id)
    
    if (!section) {
      return NextResponse.json(
        { error: 'القسم غير موجود' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(section)
  } catch (error) {
    console.error('Error fetching section:', error)
    return NextResponse.json(
      { error: 'فشل في جلب القسم' },
      { status: 500 }
    )
  }
}

// PATCH - Update single section (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const data = await request.json()
    
    const section = await HomeSection.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    )
    
    if (!section) {
      return NextResponse.json(
        { error: 'القسم غير موجود' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'تم تحديث القسم بنجاح',
      section
    })
  } catch (error) {
    console.error('Error updating section:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث القسم' },
      { status: 500 }
    )
  }
}

// DELETE - Delete section (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'غير مصرح لك بحذف الأقسام' },
        { status: 403 }
      )
    }
    
    const section = await HomeSection.findByIdAndDelete(params.id)
    
    if (!section) {
      return NextResponse.json(
        { error: 'القسم غير موجود' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'تم حذف القسم بنجاح'
    })
  } catch (error) {
    console.error('Error deleting section:', error)
    return NextResponse.json(
      { error: 'فشل في حذف القسم' },
      { status: 500 }
    )
  }
}
