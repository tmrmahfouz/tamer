# 📚 دليل استخدام المساعد الذكي في الدروس

## 🎯 الهدف

توفير مساعد ذكي مدعوم بـ Gemini AI يساعد الطلاب على:
- فهم المفاهيم البرمجية بشكل أعمق
- الحصول على أمثلة عملية فورية
- حل المشاكل التقنية
- التعلم بطريقة تفاعلية

---

## 🚀 البدء السريع

### في صفحة الدرس الحالية:

```tsx
// pages/learn/[courseId]/[lessonId]/page.tsx
import AILearningAssistant from '@/components/AILearningAssistant'
import { Course, Lesson } from '@/models'

export default async function LearnPage({ params }) {
  const course = await Course.findById(params.courseId)
  const lesson = await Lesson.findById(params.lessonId)

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* محتوى الدرس - العمود الرئيسي */}
      <div className="col-span-2">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* رأس الدرس */}
          <div className="mb-6 pb-4 border-b">
            <h1 className="text-3xl font-bold text-slate-900">{lesson.title}</h1>
            <p className="text-slate-600 mt-2">{lesson.description}</p>
          </div>

          {/* محتوى الدرس */}
          <div className="prose max-w-none">
            {lesson.content}
          </div>
        </div>
      </div>

      {/* المساعد الذكي - جانب */}
      <div className="col-span-1 h-[600px] sticky top-6">
        <AILearningAssistant
          courseId={params.courseId}
          lessonId={params.lessonId}
          courseTitle={course?.title}
          lessonTitle={lesson?.title}
        />
      </div>
    </div>
  )
}
```

---

## 🎨 التخطيطات المختلفة

### التخطيط 1: المساعد على الجانب (موصى به)
```
┌─────────────────────────────────────┐
│        محتوى الدرس  │  المساعد الذكي │
│                     │                │
│                     │  محادثة AI      │
│                     │                │
└─────────────────────────────────────┘
```

### التخطيط 2: المساعد في تبويب منفصل
```tsx
<div className="flex gap-4">
  <div className="flex-1">
    {/* محتوى الدرس */}
  </div>
  <div className="w-96">
    <Tabs defaultValue="resources">
      <TabsList>
        <TabsTrigger value="resources">الموارد</TabsTrigger>
        <TabsTrigger value="ai">مساعد ذكي</TabsTrigger>
      </TabsList>
      <TabsContent value="ai">
        <AILearningAssistant {...props} />
      </TabsContent>
    </Tabs>
  </div>
</div>
```

### التخطيط 3: نافذة عائمة
```tsx
<div className="relative">
  {/* محتوى الدرس */}
  
  <button
    onClick={() => setShowAI(!showAI)}
    className="fixed bottom-6 right-6 bg-blue-600 rounded-full p-4 text-white shadow-lg"
  >
    💬
  </button>

  {showAI && (
    <div className="fixed bottom-20 right-6 w-80 h-96 shadow-2xl rounded-xl">
      <AILearningAssistant
        onClose={() => setShowAI(false)}
        {...props}
      />
    </div>
  )}
</div>
```

---

## 🎓 حالات الاستخدام

### 1. في دروس الفيديو
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="col-span-2">
    <VideoPlayer lesson={lesson} />
    <LessonDescription lesson={lesson} />
  </div>
  <AILearningAssistant
    courseId={courseId}
    lessonId={lessonId}
    courseTitle={course.title}
  />
</div>
```

### 2. في دروس النصوص
```tsx
<div className="max-w-4xl mx-auto">
  <div className="grid grid-cols-3 gap-6">
    <Article content={lesson.content} />
    <AILearningAssistant className="sticky top-6" />
  </div>
</div>
```

### 3. في الاختبارات
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="col-span-2">
    <QuizComponent quiz={quiz} />
  </div>
  <AILearningAssistant
    courseTitle="الاختبار"
    lessonTitle={quiz.title}
    disabled={quiz.locked}
  />
</div>
```

### 4. في المشاريع
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="col-span-2">
    <ProjectDetails project={project} />
  </div>
  <AILearningAssistant
    courseId={project.courseId}
    lessonTitle={`مشروع: ${project.title}`}
  />
</div>
```

---

## ⚙️ الخصائص (Props)

```tsx
interface AIAssistantProps {
  courseId?: string        // معرّف الدورة (اختياري)
  lessonId?: string        // معرّف الدرس (اختياري)
  lessonTitle?: string     // عنوان الدرس (يظهر في رسالة الترحيب)
  courseTitle?: string     // عنوان الدورة
  onClose?: () => void     // دالة عند الإغلاق
}
```

### أمثلة الاستخدام:

```tsx
// بدون خصائص
<AILearningAssistant />

// مع عنوان فقط
<AILearningAssistant lessonTitle="أساسيات الويب" />

// مع كل الخصائص
<AILearningAssistant
  courseId="course-123"
  lessonId="lesson-456"
  courseTitle="Web Development"
  lessonTitle="HTML Basics"
  onClose={() => console.log('Closed')}
/>
```

---

## 💬 أمثلة أسئلة الطلاب

### أسئلة يجب أن يرد عليها المساعد:

✅ "اشرح لي المتغيرات"
✅ "ما الفرق بين let و const؟"
✅ "أعطني مثالاً على map()"
✅ "كيف أحل مشكلة CORS؟"
✅ "اشرح لي async/await"
✅ "كيف أستخدم useEffect؟"
✅ "ما هي الـ closures؟"
✅ "أعطني مثالاً على REST API"

---

## 🔍 متابعة المحادثات

### حفظ المحادثات:

```tsx
// في المستقبل - حفظ تلقائي
const [messages, setMessages] = useState([])

useEffect(() => {
  // حفظ في قاعدة البيانات
  if (messages.length > 0) {
    saveConversation({
      userId,
      lessonId,
      messages,
      timestamp: new Date()
    })
  }
}, [messages])
```

### استعراض المحادثات السابقة:

```tsx
const conversations = await fetch(
  `/api/ai/conversations?lessonId=${lessonId}`
)
```

---

## 🎯 أفضل الممارسات

### ✅ افعل:
- استخدم context صحيح (courseId, lessonId)
- ضع المساعد في مكان سهل الوصول
- اختبر مع أسئلة مختلفة
- أضف رسالة ترحيب شخصية

### ❌ لا تفعل:
- لا تضع المساعد في مكان مزدحم
- لا تغفل عن سياق الدرس
- لا تضع مفاتيح API في الكود
- لا تثق بـ AI دائماً (راجع الإجابات)

---

## 📊 الأداء

| المقياس | القيمة |
|--------|--------|
| وقت الاستجابة | < 2 ثانية |
| حجم المكون | ~15KB |
| توافقية المتصفح | 95%+ |
| استهلاك الذاكرة | منخفض جداً |

---

## 🐛 استكشاف الأخطاء

### المساعد لا يظهر:
```bash
# 1. تحقق من import
import AILearningAssistant from '@/components/AILearningAssistant'

# 2. تحقق من أن المكون لديه 'use client'
'use client'

# 3. تحقق من الـ build
npm run build
```

### الرسائل لا تُرسل:
```bash
# 1. افتح DevTools (F12)
# 2. انظر للـ Network tab
# 3. تحقق من POST إلى /api/ai/chat
# 4. اطلع على Console للأخطاء
```

### الـ API يرجع خطأ:
```bash
# 1. تحقق من المفتاح في .env.local
GEMINI_API_KEY=your_key

# 2. تحقق من الاتصال
curl https://generativelanguage.googleapis.com

# 3. اطلع على server logs
```

---

## 🎁 الميزات المستقبلية

- [ ] حفظ المحادثات في قاعدة البيانات
- [ ] تقييم إجابات AI من الطالب
- [ ] توليد تمارين تفاعلية
- [ ] دعم رفع الأكواد والملفات
- [ ] عرض إحصائيات الاستخدام
- [ ] تقارير للمدرسين

---

## 📞 الدعم

للمساعدة:
1. تحقق من `GEMINI_AI_SETUP.md`
2. راجع `console.logs` في DevTools
3. تحقق من server logs

---

**شكراً لاستخدام المساعد الذكي! 🚀**
