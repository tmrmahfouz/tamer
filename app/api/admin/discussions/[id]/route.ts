import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Discussion from '@/models/Discussion'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') return null
    return decoded
  } catch {
    return null
  }
}

// PATCH update discussion
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    const discussion = await Discussion.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    )

    if (!discussion) {
      return NextResponse.json({ success: false, message: 'النقاش غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, discussion })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE discussion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const discussion = await Discussion.findByIdAndDelete(params.id)

    if (!discussion) {
      return NextResponse.json({ success: false, message: 'النقاش غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
