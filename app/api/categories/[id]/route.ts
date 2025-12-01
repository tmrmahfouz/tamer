import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Course from '@/models/Course'
import { verifyToken } from '@/lib/jwt'

// GET single category
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const category = await Category.findById(params.id)

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'الفئة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'حدث خطأ أثناء جلب الفئة',
      },
      { status: 500 }
    )
  }
}

// PUT update category
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    await connectDB()

    // Get user from database to check role
    const User = (await import('@/models/User')).default
    const user = await User.findById(decoded.userId)
    
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, nameEn, description, icon, color, order, published, subcategories, parentCategory } = body

    const category = await Category.findByIdAndUpdate(
      params.id,
      {
        name,
        nameEn,
        description,
        icon,
        color,
        order,
        published,
        subcategories: subcategories || [],
        parentCategory: parentCategory || null,
      },
      { new: true, runValidators: true }
    )

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'الفئة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      category,
      message: 'تم تحديث الفئة بنجاح',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'حدث خطأ أثناء تحديث الفئة',
      },
      { status: 500 }
    )
  }
}

// DELETE category
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }

    await connectDB()

    // Get user from database to check role
    const User = (await import('@/models/User')).default
    const user = await User.findById(decoded.userId)
    
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parentCategory: params.id })
    if (subcategoriesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `لا يمكن حذف الفئة. يوجد ${subcategoriesCount} فئة فرعية مرتبطة بها`,
        },
        { status: 400 }
      )
    }

    // Check if category has courses
    const coursesCount = await Course.countDocuments({ category: params.id })
    if (coursesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `لا يمكن حذف الفئة. يوجد ${coursesCount} دورة مرتبطة بها`,
        },
        { status: 400 }
      )
    }

    const category = await Category.findByIdAndDelete(params.id)

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'الفئة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الفئة بنجاح',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'حدث خطأ أثناء حذف الفئة',
      },
      { status: 500 }
    )
  }
}
