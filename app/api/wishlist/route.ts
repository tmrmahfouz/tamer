import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Wishlist from '@/models/Wishlist'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET user wishlist
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    let wishlist = await Wishlist.findOne({ user: decoded.userId }).populate(
      'courses',
      'title description image price level category'
    )

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: decoded.userId, courses: [] })
    }

    return NextResponse.json(
      {
        success: true,
        wishlist,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get wishlist error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب المفضلة' },
      { status: 500 }
    )
  }
}

// POST add to wishlist
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { courseId } = body

    let wishlist = await Wishlist.findOne({ user: decoded.userId })

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: decoded.userId,
        courses: [courseId],
      })
    } else {
      if (wishlist.courses.includes(courseId)) {
        return NextResponse.json(
          { success: false, message: 'الدورة موجودة بالفعل في المفضلة' },
          { status: 400 }
        )
      }
      wishlist.courses.push(courseId)
      await wishlist.save()
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تمت الإضافة للمفضلة',
        wishlist,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Add to wishlist error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء الإضافة للمفضلة' },
      { status: 500 }
    )
  }
}

// DELETE remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const wishlist = await Wishlist.findOne({ user: decoded.userId })

    if (!wishlist) {
      return NextResponse.json(
        { success: false, message: 'المفضلة غير موجودة' },
        { status: 404 }
      )
    }

    wishlist.courses = wishlist.courses.filter(
      (id) => id.toString() !== courseId
    )
    await wishlist.save()

    return NextResponse.json(
      {
        success: true,
        message: 'تم الحذف من المفضلة',
        wishlist,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء الحذف من المفضلة' },
      { status: 500 }
    )
  }
}
