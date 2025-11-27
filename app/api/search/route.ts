import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET search
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, courses, instructors, students
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'relevance' // relevance, newest, popular, price

    const results: any = {
      courses: [],
      instructors: [],
      students: [],
      total: 0
    }

    // Search Courses
    if (type === 'all' || type === 'courses') {
      const courseQuery: any = {
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }

      if (category) courseQuery.category = category
      if (level) courseQuery.level = level
      if (minPrice) courseQuery.price = { ...courseQuery.price, $gte: parseFloat(minPrice) }
      if (maxPrice) courseQuery.price = { ...courseQuery.price, $lte: parseFloat(maxPrice) }

      let coursesQuery = Course.find(courseQuery).populate('instructor', 'name email')

      // Sorting
      switch (sortBy) {
        case 'newest':
          coursesQuery = coursesQuery.sort({ createdAt: -1 })
          break
        case 'popular':
          coursesQuery = coursesQuery.sort({ studentsCount: -1 })
          break
        case 'price':
          coursesQuery = coursesQuery.sort({ price: 1 })
          break
        default:
          coursesQuery = coursesQuery.sort({ rating: -1 })
      }

      results.courses = await coursesQuery.limit(20).lean()
    }

    // Search Instructors (admin only)
    const token = request.cookies.get('token')?.value
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        
        if (decoded.role === 'admin' && (type === 'all' || type === 'instructors')) {
          results.instructors = await User.find({
            role: 'instructor',
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } }
            ]
          })
            .select('-password')
            .limit(10)
            .lean()
        }

        if (decoded.role === 'admin' && (type === 'all' || type === 'students')) {
          results.students = await User.find({
            role: 'student',
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } }
            ]
          })
            .select('-password')
            .limit(10)
            .lean()
        }
      } catch (error) {
        // Token invalid, continue without user-specific results
      }
    }

    results.total = results.courses.length + results.instructors.length + results.students.length

    return NextResponse.json(
      {
        success: true,
        results,
        query,
        filters: { type, category, level, minPrice, maxPrice, sortBy }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في البحث' },
      { status: 500 }
    )
  }
}
