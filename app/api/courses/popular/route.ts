import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'

export async function GET() {
  try {
    await connectDB()
    
    const courses = await Course.find({ published: true })
      .sort({ students: -1 }) // Sort by number of students (most popular first)
      .limit(4)
      .select('_id title')
      .lean()
    
    const popularCourses = courses.map(course => ({
      _id: course._id.toString(),
      title: course.title
    }))
    
    return NextResponse.json(popularCourses)
  } catch (error) {
    console.error('Error fetching popular courses:', error)
    return NextResponse.json([], { status: 200 }) // Return empty array on error
  }
}
