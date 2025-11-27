import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Discussion from '@/models/Discussion'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// GET - جلب مناقشة واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const discussion = await Discussion.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar')
      .populate('resolvedBy', 'name')

    if (!discussion) {
      return NextResponse.json({ success: false, message: 'المناقشة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ success: true, discussion })
  } catch (error) {
    console.error('Error fetching discussion:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// POST - إضافة رد
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ success: false, message: 'محتوى الرد مطلوب' }, { status: 400 })
    }

    const discussion = await Discussion.findById(params.id)
    if (!discussion) {
      return NextResponse.json({ success: false, message: 'المناقشة غير موجودة' }, { status: 404 })
    }

    const isInstructor = decoded.role === 'instructor' || decoded.role === 'admin'

    discussion.replies.push({
      user: decoded.userId,
      content,
      likes: [],
      isInstructorReply: isInstructor,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    await discussion.save()

    const updated = await Discussion.findById(params.id)
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar')

    return NextResponse.json({ success: true, discussion: updated })
  } catch (error) {
    console.error('Error adding reply:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// PUT - تحديث المناقشة (إعجاب، حل، تثبيت)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const body = await request.json()
    const { action, replyId } = body

    const discussion = await Discussion.findById(params.id)
    if (!discussion) {
      return NextResponse.json({ success: false, message: 'المناقشة غير موجودة' }, { status: 404 })
    }

    switch (action) {
      case 'like':
        const likeIndex = discussion.likes.indexOf(decoded.userId)
        if (likeIndex > -1) {
          discussion.likes.splice(likeIndex, 1)
        } else {
          discussion.likes.push(decoded.userId)
        }
        break

      case 'likeReply':
        if (replyId) {
          const reply = (discussion.replies as any).id(replyId)
          if (reply) {
            const replyLikeIndex = reply.likes.indexOf(decoded.userId)
            if (replyLikeIndex > -1) {
              reply.likes.splice(replyLikeIndex, 1)
            } else {
              reply.likes.push(decoded.userId)
            }
          }
        }
        break

      case 'resolve':
        discussion.isResolved = !discussion.isResolved
        if (discussion.isResolved) {
          discussion.resolvedBy = decoded.userId
          discussion.resolvedAt = new Date()
        } else {
          discussion.resolvedBy = undefined
          discussion.resolvedAt = undefined
        }
        break

      case 'pin':
        if (decoded.role === 'instructor' || decoded.role === 'admin') {
          discussion.isPinned = !discussion.isPinned
        }
        break
    }

    await discussion.save()

    const updated = await Discussion.findById(params.id)
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar')

    return NextResponse.json({ success: true, discussion: updated })
  } catch (error) {
    console.error('Error updating discussion:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - حذف المناقشة
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const discussion = await Discussion.findById(params.id)
    if (!discussion) {
      return NextResponse.json({ success: false, message: 'المناقشة غير موجودة' }, { status: 404 })
    }

    // فقط صاحب المناقشة أو الأدمن يمكنه الحذف
    if (discussion.user.toString() !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح بالحذف' }, { status: 403 })
    }

    await Discussion.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true, message: 'تم حذف المناقشة' })
  } catch (error) {
    console.error('Error deleting discussion:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
