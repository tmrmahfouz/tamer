import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CourseBundle from '@/models/CourseBundle'
import '@/models/Course'

// GET - جلب الحزم النشطة للعرض العام
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    console.log('Fetching bundles...')
    
    const now = new Date()
    
    // جلب جميع الحزم النشطة أولاً
    const allBundles = await CourseBundle.find({ isActive: true })
      .populate('courses', 'title price thumbnail description instructor')
      .sort({ createdAt: -1 })
    
    console.log('All active bundles:', allBundles.length)
    
    // فلترة حسب التواريخ
    const bundles = allBundles.filter(bundle => {
      // التحقق من تاريخ البداية
      if (bundle.validFrom && new Date(bundle.validFrom) > now) {
        return false
      }
      // التحقق من تاريخ النهاية
      if (bundle.validUntil && new Date(bundle.validUntil) < now) {
        return false
      }
      return true
    })
    
    console.log('Found bundles:', bundles.length)
    
    // فلترة الحزم التي وصلت للحد الأقصى من المشتريات
    const availableBundles = bundles.filter(bundle => {
      if (!bundle.maxPurchases) return true
      return bundle.currentPurchases < bundle.maxPurchases
    })
    
    console.log('Available bundles:', availableBundles.length)
    
    return NextResponse.json({ success: true, bundles: availableBundles })
  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الحزم' },
      { status: 500 }
    )
  }
}
