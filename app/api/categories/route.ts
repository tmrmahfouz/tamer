import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { verifyToken } from '@/lib/jwt'

// GET all categories
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const published = searchParams.get('published')

    let query: any = {}
    if (published === 'true') {
      query = { published: true }
    }

    console.log('Fetching categories with query:', query)
    const categories = await Category.find(query).sort({ order: 1, name: 1 }).lean()
    console.log('Found categories:', categories.length)

    // Update courses count for each category (including subcategories for parent categories)
    const Course = (await import('@/models/Course')).default
    
    // First, get direct course counts for all categories
    const directCounts = new Map<string, number>()
    for (const category of categories) {
      const count = await Course.countDocuments({ 
        category: category._id as any,
        published: true 
      })
      directCounts.set(String(category._id), count)
    }
    
    // Calculate total counts (including subcategories) for parent categories
    const categoriesWithCount = categories.map((category) => {
      let totalCount = directCounts.get(String(category._id)) || 0
      
      // If this is a parent category, add counts from all subcategories
      if (!category.parentCategory) {
        const subcategories = categories.filter(c => 
          c.parentCategory && String(c.parentCategory) === String(category._id)
        )
        for (const sub of subcategories) {
          totalCount += directCounts.get(String(sub._id)) || 0
        }
      }
      
      return {
        ...category,
        coursesCount: totalCount,
      }
    })

    console.log('Returning categories:', categoriesWithCount.length)

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount,
    })
  } catch (error: any) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'حدث خطأ أثناء جلب الفئات',
      },
      { status: 500 }
    )
  }
}

// POST create new category
export async function POST(req: NextRequest) {
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
        { success: false, message: 'غير مصرح - للمدراء والمعلمين فقط' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, nameEn, description, icon, color, order, published, subcategories, parentCategory } = body

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { nameEn }],
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'الفئة موجودة بالفعل' },
        { status: 400 }
      )
    }

    const category = await Category.create({
      name,
      nameEn,
      description,
      icon: icon || '📚',
      color: color || '#3B82F6',
      order: order || 0,
      published: published !== undefined ? published : true,
      subcategories: subcategories || [],
      parentCategory: parentCategory || null,
    })

    return NextResponse.json({
      success: true,
      category,
      message: 'تم إنشاء الفئة بنجاح',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'حدث خطأ أثناء إنشاء الفئة',
      },
      { status: 500 }
    )
  }
}
