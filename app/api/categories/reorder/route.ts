import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { verifyToken } from '@/lib/jwt'

// PUT - Update categories order
export async function PUT(req: NextRequest) {
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
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - للمدراء فقط' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { categories } = body

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, message: 'بيانات غير صالحة' },
        { status: 400 }
      )
    }

    // Update each category's order
    const updatePromises = categories.map(({ id, order }) =>
      Category.findByIdAndUpdate(id, { order }, { new: true })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الترتيب بنجاح',
    })
  } catch (error: any) {
    console.error('Reorder categories error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'حدث خطأ أثناء تحديث الترتيب',
      },
      { status: 500 }
    )
  }
}
