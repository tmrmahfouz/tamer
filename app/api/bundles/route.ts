import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CourseBundle from '@/models/CourseBundle'

// GET - جلب الحزم النشطة للعرض العام
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const now = new Date()
    
    const bundles = await CourseBundle.find({
      isActive: true,
      $or: [
        { validFrom: { $exists: false } },
        { validFrom: null },
        { validFrom: { $lte: now } }
      ],
      $and: [
        {
          $or: [
            { validUntil: { $exists: false } },
            { validUntil: null },
            { validUntil: { $gte: now } }
          ]
        }
      ]
    })
      .populate('courses', 'title price thumbnail description instructor')
      .sort({ createdAt: -1 })
    
    // فلترة الحزم التي وصلت للحد الأقصى من المشتريات
    const availableBundles = bundles.filter(bundle => {
      if (!bundle.maxPurchases) return true
      return bundle.currentPurchases < bundle.maxPurchases
    })
    
    return NextResponse.json({ success: true, bundles: availableBundles })
  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الحزم' },
      { status: 500 }
    )
  }
}
