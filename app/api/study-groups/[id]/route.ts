import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import connectDB from '@/lib/mongodb'
import StudyGroup from '@/models/StudyGroup'
import mongoose from 'mongoose'

// GET - جلب مجموعة واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const group = await StudyGroup.findById(params.id)
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar')
      .populate('course', 'title')

    if (!group) {
      return NextResponse.json({ success: false, message: 'المجموعة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ success: true, group })
  } catch (error) {
    console.error('Error fetching study group:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// PUT - تحديث المجموعة (انضمام، مغادرة، تعديل)
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const body = await request.json()
    const { action, inviteCode, ...updateData } = body

    const group = await StudyGroup.findById(params.id)
    if (!group) {
      return NextResponse.json({ success: false, message: 'المجموعة غير موجودة' }, { status: 404 })
    }

    const userObjectId = new mongoose.Types.ObjectId(decoded.userId)

    switch (action) {
      case 'join':
        // التحقق من كود الدعوة للمجموعات الخاصة
        if (group.isPrivate && group.inviteCode !== inviteCode) {
          return NextResponse.json({ success: false, message: 'كود الدعوة غير صحيح' }, { status: 400 })
        }
        
        // التحقق من الحد الأقصى
        if (group.members.length >= group.maxMembers) {
          return NextResponse.json({ success: false, message: 'المجموعة ممتلئة' }, { status: 400 })
        }
        
        // التحقق من عدم الانضمام مسبقاً
        const isMember = group.members.some((id: any) => id.toString() === decoded.userId)
        if (isMember) {
          return NextResponse.json({ success: false, message: 'أنت عضو بالفعل' }, { status: 400 })
        }
        
        group.members.push(userObjectId as any)
        break

      case 'leave':
        const memberIndex = group.members.findIndex((id: any) => id.toString() === decoded.userId)
        if (memberIndex > -1) {
          group.members.splice(memberIndex, 1)
        }
        
        // إذا غادر المنشئ، نقل الملكية أو حذف المجموعة
        if (group.creator.toString() === decoded.userId) {
          if (group.members.length > 0) {
            group.creator = group.members[0]
          } else {
            group.isActive = false
          }
        }
        break

      case 'update':
        // فقط المنشئ يمكنه التعديل
        if (group.creator.toString() !== decoded.userId) {
          return NextResponse.json({ success: false, message: 'غير مصرح بالتعديل' }, { status: 403 })
        }
        
        Object.assign(group, updateData)
        break

      case 'removeMember':
        // فقط المنشئ يمكنه إزالة الأعضاء
        if (group.creator.toString() !== decoded.userId) {
          return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 })
        }
        
        const { memberId } = body
        const idx = group.members.findIndex((id: any) => id.toString() === memberId)
        if (idx > -1) {
          group.members.splice(idx, 1)
        }
        break
    }

    await group.save()

    const updated = await StudyGroup.findById(params.id)
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar')
      .populate('course', 'title')

    return NextResponse.json({ success: true, group: updated })
  } catch (error) {
    console.error('Error updating study group:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}

// DELETE - حذف المجموعة
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

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'توكن غير صالح' }, { status: 401 })
    }

    const group = await StudyGroup.findById(params.id)
    if (!group) {
      return NextResponse.json({ success: false, message: 'المجموعة غير موجودة' }, { status: 404 })
    }

    if (group.creator.toString() !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'غير مصرح بالحذف' }, { status: 403 })
    }

    await StudyGroup.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true, message: 'تم حذف المجموعة' })
  } catch (error) {
    console.error('Error deleting study group:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
