import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Course from '@/models/Course';

// توليد ملخص تلقائي للدرس
async function generateSummary(content: string, title: string): Promise<{
  summary: string;
  keyPoints: string[];
  concepts: string[];
  duration: string;
}> {
  // في الإنتاج، يمكن استخدام OpenAI أو أي API للذكاء الاصطناعي
  // هذا تنفيذ محاكاة للعرض
  
  const keyPoints = [
    'فهم المفاهيم الأساسية للموضوع',
    'التعرف على أفضل الممارسات',
    'تطبيق المعرفة في مشاريع عملية',
    'حل المشكلات الشائعة'
  ];
  
  const concepts = [
    'المفهوم الأساسي',
    'التطبيق العملي',
    'أفضل الممارسات',
    'الأخطاء الشائعة'
  ];
  
  const summary = `## ملخص درس "${title}"

هذا الدرس يقدم شرحاً شاملاً للموضوع مع التركيز على الجوانب العملية والتطبيقية.

### النقاط الرئيسية:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

### المفاهيم المغطاة:
${concepts.map(c => `• ${c}`).join('\n')}

### نصيحة للتعلم:
حاول تطبيق ما تعلمته مباشرة من خلال مشروع صغير أو تمرين عملي.`;

  return {
    summary,
    keyPoints,
    concepts,
    duration: '5 دقائق قراءة'
  };
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { lessonId, courseId, type } = body;
    
    if (type === 'lesson' && lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
      }
      
      const result = await generateSummary(
        lesson.content?.text || lesson.description || '',
        lesson.title
      );
      
      return NextResponse.json({
        success: true,
        ...result
      });
    }
    
    if (type === 'course' && courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
      }
      
      const lessons = await Lesson.find({ course: courseId }).select('title');
      
      const courseSummary = `## ملخص دورة "${course.title}"

${course.description || 'دورة شاملة لتعلم المهارات المطلوبة.'}

### محتوى الدورة:
${lessons.map((l, i) => `${i + 1}. ${l.title}`).join('\n')}

### ما ستتعلمه:
• المفاهيم الأساسية والمتقدمة
• التطبيق العملي من خلال مشاريع
• أفضل الممارسات في المجال
• حل المشكلات الشائعة

### المستوى: ${course.level || 'مبتدئ'}
### المدة: ${course.duration || 'غير محدد'}`;

      return NextResponse.json({
        success: true,
        summary: courseSummary,
        lessonsCount: lessons.length,
        level: course.level,
        duration: course.duration
      });
    }
    
    return NextResponse.json(
      { error: 'يرجى تحديد نوع الملخص (lesson أو course)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Summarize error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في توليد الملخص' },
      { status: 500 }
    );
  }
}
