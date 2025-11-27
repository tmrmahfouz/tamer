import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Certificate from '@/models/Certificate'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  
  try {
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    if (decoded.role !== 'admin') return null
    return decoded
  } catch {
    return null
  }
}

// GET all certificates (admin)
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const certificates = await Certificate.find()
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ issuedAt: -1 })
      .lean()

    return NextResponse.json({ success: true, certificates })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// POST create certificate manually
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    // Generate unique ID
    const uniqueId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const certificate = await Certificate.create({
      ...body,
      uniqueId,
      issuedAt: new Date(),
      status: 'active'
    })

    return NextResponse.json({ success: true, certificate })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
