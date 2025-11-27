import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import Enrollment from '@/models/Enrollment';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface Recommendation {
  type: 'course' | 'lesson' | 'action' | 'tip';
  title: string;
  description: string;
  link?: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  icon: string;
}

async function generateRecommendations(userId: string): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  
  // Get user's enrollments
  const enrollments = await Enrollment.find({ user: userId })
    .populate('course', 'title category level');
  
  // Get user's progress
  const progress = await Progress.find({ user: userId });
  
  // Get all courses for recommendations
  const allCourses = await Course.find({ status: 'published' })
    .select('title category level students rating')
    .limit(20);
  
  const enrolledCourseIds = enrollments.map(e => e.course?._id?.toString());
  
  // 1. Continue learning recommendations
  for (const enrollment of enrollments) {
    const courseProgress = progress.filter(
      p => p.course?.toString() === enrollment.course?._id?.toString()
    );
    
    const completedLessons = courseProgress.filter(p => p.completed).length;
    const totalProgress = typeof enrollment.progress === 'number' ? enrollment.progress : 0;
    
    if (totalProgress > 0 && totalProgress < 100) {
      const course = enrollment.course as any;
      recommendations.push({
        type: 'course',
        title: `أكمل دورة "${course?.title || 'الدورة'}"`,
        description: `لقد أنجزت ${totalProgress}% من الدورة. استمر في التعلم!`,
        link: `/courses/${course?._id}`,
        priority: totalProgress > 50 ? 'high' : 'medium',
        reason: 'بناءً على تقدمك الحالي',
        icon: '📚'
      });
    }
  }
  
  // 2. New course recommendations based on interests
  const userCategories = enrollments
    .map(e => (e.course as any)?.category)
    .filter(Boolean);
  
  const uniqueCategories = [...new Set(userCategories)];
  
  for (const course of allCourses) {
    if (!enrolledCourseIds.includes(course._id.toString())) {
      if (uniqueCategories.includes(course.category)) {
        recommendations.push({
          type: 'course',
          title: `دورة جديدة: ${course.title}`,
          description: `دورة في مجال ${course.category} قد تهمك`,
          link: `/courses/${course._id}`,
          priority: 'medium',
          reason: 'بناءً على اهتماماتك',
          icon: '🎯'
        });
      }
    }
  }
  
  // 3. Popular courses
  const popularCourses = allCourses
    .filter(c => !enrolledCourseIds.includes(c._id.toString()))
    .sort((a, b) => (b.students || 0) - (a.students || 0))
    .slice(0, 3);
  
  for (const course of popularCourses) {
    if (!recommendations.find(r => r.link === `/courses/${course._id}`)) {
      recommendations.push({
        type: 'course',
        title: course.title,
        description: `${course.students || 0} طالب مسجل`,
        link: `/courses/${course._id}`,
        priority: 'low',
        reason: 'دورة شائعة',
        icon: '⭐'
      });
    }
  }
  
  // 4. Learning tips
  const tips: Recommendation[] = [
    {
      type: 'tip',
      title: 'حدد وقتاً يومياً للتعلم',
      description: 'خصص 30 دقيقة يومياً للتعلم المستمر',
      priority: 'medium',
      reason: 'نصيحة للتعلم الفعال',
      icon: '💡'
    },
    {
      type: 'tip',
      title: 'طبق ما تتعلمه',
      description: 'أنشئ مشروعاً صغيراً لتطبيق المفاهيم الجديدة',
      priority: 'medium',
      reason: 'التعلم بالممارسة',
      icon: '🛠️'
    },
    {
      type: 'action',
      title: 'انضم لمجموعة دراسية',
      description: 'التعلم مع الآخرين يزيد من الفهم والتحفيز',
      link: '/community',
      priority: 'low',
      reason: 'التعلم التعاوني',
      icon: '👥'
    }
  ];
  
  // Add some tips
  recommendations.push(...tips.slice(0, 2));
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return recommendations.slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Return generic recommendations for non-logged users
      const popularCourses = await Course.find({ status: 'published' })
        .select('title category level students')
        .sort({ students: -1 })
        .limit(5);
      
      const recommendations: Recommendation[] = popularCourses.map(course => ({
        type: 'course' as const,
        title: course.title,
        description: `${course.students || 0} طالب • ${course.level || 'مبتدئ'}`,
        link: `/courses/${course._id}`,
        priority: 'medium' as const,
        reason: 'دورة شائعة',
        icon: '⭐'
      }));
      
      return NextResponse.json({
        success: true,
        recommendations,
        personalized: false
      });
    }
    
    // Verify token and get user
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const recommendations = await generateRecommendations(decoded.userId);
    
    return NextResponse.json({
      success: true,
      recommendations,
      personalized: true
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب التوصيات' },
      { status: 500 }
    );
  }
}
