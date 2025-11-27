import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import CourseBundle from '@/models/CourseBundle'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET - Fetch user's purchased bundles
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      )
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId
    
    // Find all verified payments for bundles by this user
    const bundlePayments = await Payment.find({
      user: userId,
      bundle: { $exists: true, $ne: null },
      status: 'verified'
    }).select('bundle')
    
    const bundleIds = bundlePayments.map(p => p.bundle).filter(Boolean)
    
    // Get bundle details
    const bundles = await CourseBundle.find({
      _id: { $in: bundleIds as any[] },
      isActive: true
    }).populate('courses', 'title image')
    
    return NextResponse.json({
      success: true,
      bundles
    })
  } catch (error) {
    console.error('Error fetching purchased bundles:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الحزم' },
      { status: 500 }
    )
  }
}
