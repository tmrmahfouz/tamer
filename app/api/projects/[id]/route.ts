import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@/lib/jwt'

// GET - جلب مشروع واحد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const project = await Project.findById(params.id)
      .populate('student', 'name image email')
      .populate('course', 'title thumbnail instructor')
      .populate('comments.user', 'name image')
      .populate('feedback.reviewedBy', 'name image')
    
    if (!project) {
      return NextResponse.json({ success: false, error: 'المشروع غير موجود' }, { status: 404 })
    }
    
    // Increment views
    await Project.findByIdAndUpdate(params.id, { $inc: { views: 1 } })
    
    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المشروع' },
      { status: 500 }
    )
  }
}

// PUT - تحديث المشروع
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })
    }
    
    const project = await Project.findById(params.id).populate('course')
    if (!project) {
      return NextResponse.json({ success: false, error: 'المشروع غير موجود' }, { status: 404 })
    }
    
    const isOwner = project.student.toString() === user._id.toString()
    const isInstructor = project.course?.instructor?.toString() === user._id.toString()
    const isAdmin = user.role === 'admin'
    
    if (!isOwner && !isInstructor && !isAdmin) {
      return NextResponse.json({ success: false, error: 'غير مصرح بالتعديل' }, { status: 403 })
    }
    
    const data = await request.json()
    const { action } = data
    
    // Handle different actions
    if (action === 'submit') {
      project.status = 'submitted'
      project.submittedAt = new Date()
      await project.save()
      
    } else if (action === 'review' && (isInstructor || isAdmin)) {
      const { feedback, status } = data
      project.feedback = {
        description: feedback.description,
        rating: feedback.rating,
        strengths: feedback.strengths || [],
        improvements: feedback.improvements || [],
        reviewedBy: user._id,
        reviewedAt: new Date()
      }
      project.status = status
      if (status === 'needs_revision') {
        project.revisionNotes = feedback.revisionNotes
        project.revisionCount += 1
      }
      await project.save()
      
    } else if (action === 'like') {
      const likeIndex = project.likes.indexOf(user._id)
      if (likeIndex > -1) {
        project.likes.splice(likeIndex, 1)
      } else {
        project.likes.push(user._id)
      }
      await project.save()
      
    } else if (action === 'comment') {
      project.comments.push({
        user: user._id,
        content: data.content,
        createdAt: new Date()
      })
      await project.save()
      
    } else if (action === 'togglePublic' && isOwner) {
      project.isPublic = !project.isPublic
      await project.save()
      
    } else if (isOwner) {
      const { title, description, files, liveUrl, repoUrl, technologies } = data
      if (title) project.title = title
      if (description) project.description = description
      if (files) project.files = files
      if (liveUrl !== undefined) project.liveUrl = liveUrl
      if (repoUrl !== undefined) project.repoUrl = repoUrl
      if (technologies) project.technologies = technologies
      await project.save()
    }
    
    await project.populate('student', 'name image')
    await project.populate('course', 'title thumbnail')
    await project.populate('comments.user', 'name image')
    
    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث المشروع' },
      { status: 500 }
    )
  }
}

// DELETE - حذف المشروع
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 })
    }
    
    const project = await Project.findById(params.id)
    if (!project) {
      return NextResponse.json({ success: false, error: 'المشروع غير موجود' }, { status: 404 })
    }
    
    const isOwner = project.student.toString() === user._id.toString()
    const isAdmin = user.role === 'admin'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: 'غير مصرح بالحذف' }, { status: 403 })
    }
    
    await Project.findByIdAndDelete(params.id)
    
    return NextResponse.json({ success: true, message: 'تم حذف المشروع بنجاح' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المشروع' },
      { status: 500 }
    )
  }
}
