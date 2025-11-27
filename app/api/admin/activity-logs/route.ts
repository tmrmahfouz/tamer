import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ActivityLog from '@/models/ActivityLog'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET activity logs
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

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح - Admin فقط' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')
    const entity = searchParams.get('entity')
    const userId = searchParams.get('userId')

    const query: any = {}
    if (type) query.type = type
    if (entity) query.entity = entity
    if (userId) query.user = userId

    const skip = (page - 1) * limit

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await ActivityLog.countDocuments(query)

    return NextResponse.json(
      {
        success: true,
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Get activity logs error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}

// POST create activity log
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

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const body = await request.json()
    const { action, type, entity, entityId, details } = body

    const logData: any = {
      user: decoded.userId,
      action,
      type,
      entity,
      details,
    }
    
    if (entityId) logData.entityId = entityId
    if (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')) {
      logData.ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    }
    if (request.headers.get('user-agent')) {
      logData.userAgent = request.headers.get('user-agent')
    }

    const log = await ActivityLog.create(logData)

    return NextResponse.json(
      {
        success: true,
        log,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create activity log error:', error)
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
