import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteSettings from '@/models/SiteSettings'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'
import mongoose from 'mongoose'

// GET - Fetch site settings
export async function GET() {
  try {
    await connectDB()
    
    // قراءة مباشرة من MongoDB collection
    const collection = mongoose.connection.collection('sitesettings')
    let settingsDoc = await collection.findOne({})
    
    if (!settingsDoc) {
      // Create default settings if none exist
      const settings = new SiteSettings({})
      await settings.save()
      settingsDoc = await collection.findOne({})
    }
    
    console.log('GET /api/settings - Raw MongoDB doc:', {
      enabled: settingsDoc?.externalQuizPlatformEnabled,
      name: settingsDoc?.externalQuizPlatformName,
      url: settingsDoc?.externalQuizPlatformUrl,
    })
    
    // إضافة القيم الافتراضية للحقول الجديدة إذا لم تكن موجودة
    const settingsObj = {
      ...settingsDoc,
      externalQuizPlatformEnabled: settingsDoc?.externalQuizPlatformEnabled === true,
      externalQuizPlatformName: settingsDoc?.externalQuizPlatformName || 'منصة الاختبارات الخارجية',
      externalQuizPlatformUrl: settingsDoc?.externalQuizPlatformUrl || '',
    }
    
    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الإعدادات' },
      { status: 500 }
    )
  }
}

// PUT - Update site settings (Admin only)
export async function PUT(request: NextRequest) {
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
        { error: 'غير مصرح لك بتعديل الإعدادات' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    console.log('Received data to save:', data)
    console.log('External Quiz Platform in received data:', {
      enabled: data.externalQuizPlatformEnabled,
      name: data.externalQuizPlatformName,
      url: data.externalQuizPlatformUrl
    })
    
    // تحديث مباشر في MongoDB collection
    const collection = mongoose.connection.collection('sitesettings')
    
    // حذف _id من البيانات لتجنب خطأ التحديث
    const { _id, __v, createdAt, ...cleanData } = data
    
    const updateData = {
      ...cleanData,
      externalQuizPlatformEnabled: data.externalQuizPlatformEnabled === true,
      externalQuizPlatformName: data.externalQuizPlatformName || 'منصة الاختبارات الخارجية',
      externalQuizPlatformUrl: data.externalQuizPlatformUrl || '',
      updatedAt: new Date(),
    }
    
    const result = await collection.updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    )
    
    console.log('MongoDB update result:', result)
    
    // جلب الإعدادات المحدثة
    const settings = await collection.findOne({})
    
    console.log('Settings saved successfully')
    console.log('External Quiz Platform after save:', {
      enabled: settings?.externalQuizPlatformEnabled,
      name: settings?.externalQuizPlatformName,
      url: settings?.externalQuizPlatformUrl
    })
    
    return NextResponse.json({
      message: 'تم تحديث الإعدادات بنجاح',
      settings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث الإعدادات' },
      { status: 500 }
    )
  }
}

// DELETE - Reset settings to defaults (Admin only)
export async function DELETE(request: NextRequest) {
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
        { error: 'غير مصرح لك بإعادة تعيين الإعدادات' },
        { status: 403 }
      )
    }
    
    // Delete existing settings
    const deleteResult = await SiteSettings.deleteMany({})
    console.log('Deleted all existing settings:', deleteResult.deletedCount, 'documents deleted')
    
    // Create new settings with defaults
    const newSettings = new SiteSettings({})
    await newSettings.save()
    console.log('Created new default settings with ID:', newSettings._id)
    console.log('aboutPageContent length:', newSettings.aboutPageContent?.length || 0)
    console.log('privacyPolicyContent length:', newSettings.privacyPolicyContent?.length || 0)
    console.log('termsAndConditionsContent length:', newSettings.termsAndConditionsContent?.length || 0)
    
    return NextResponse.json({
      message: 'تمت إعادة تعيين الإعدادات إلى القيم الافتراضية بنجاح',
      settings: newSettings
    })
  } catch (error) {
    console.error('Error resetting settings:', error)
    return NextResponse.json(
      { error: 'فشل في إعادة تعيين الإعدادات' },
      { status: 500 }
    )
  }
}
