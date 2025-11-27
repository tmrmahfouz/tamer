import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, TokenPayload } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

function verifyAdmin(request: NextRequest): TokenPayload | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null
  
  try {
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') return null
    return decoded
  } catch {
    return null
  }
}

// POST review project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()
    const { status, feedback, revisionNotes } = await request.json()

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy: admin.userId
    }

    if (feedback) {
      updateData.feedback = {
        ...feedback,
        reviewedAt: new Date(),
        reviewedBy: admin.userId
      }
    }

    if (revisionNotes) {
      updateData.revisionNotes = revisionNotes
    }

    const project = await Project.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    ).populate('student', 'name email')

    if (!project) {
      return NextResponse.json({ success: false, message: 'المشروع غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'تم حفظ المراجعة بنجاح',
      project 
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
