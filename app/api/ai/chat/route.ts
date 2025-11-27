import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
import Lesson from '@/models/Lesson'

interface LessonContext {
  courseTitle?: string
  lessonTitle?: string
  lessonContent?: string
  lessonType?: string
}

// استدعاء Google Gemini API
async function callGeminiAPI(prompt: string, context: LessonContext): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    console.log('No GEMINI_API_KEY found')
    return generateFallbackResponse(prompt, context)
  }

  const systemPrompt = `أنت مساعد تعليمي ذكي متخصص في البرمجة والتكنولوجيا باللغة العربية.
${context.courseTitle ? `الدورة: ${context.courseTitle}` : ''}
${context.lessonTitle ? `الدرس: ${context.lessonTitle}` : ''}
أجب بالعربية بشكل واضح ومفصل مع أمثلة كود عند الحاجة.`

  try {
    // جرب النماذج المختلفة
    const models = [
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash-8b',
      'text-bison-001'
    ]
    
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`)
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemPrompt}\n\nسؤال الطالب: ${prompt}`
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              }
            })
          }
        )

        if (response.ok) {
          const data = await response.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            console.log(`✅ Gemini API success with model: ${model}`)
            return text
          }
        } else {
          console.log(`❌ Model ${model} failed: ${response.status}`)
        }
      } catch (modelError) {
        console.log(`❌ Model ${model} error`)
      }
    }

    return generateFallbackResponse(prompt, context)
  } catch (error) {
    console.error('Gemini API error:', error)
    return generateFallbackResponse(prompt, context)
  }
}

// استدعاء OpenAI API كبديل
async function callOpenAI(prompt: string, context: LessonContext): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return generateFallbackResponse(prompt, context)
  }

  const systemPrompt = `أنت مساعد تعليمي ذكي متخصص في البرمجة والتكنولوجيا.
${context.courseTitle ? `الدورة: ${context.courseTitle}` : ''}
${context.lessonTitle ? `الدرس: ${context.lessonTitle}` : ''}
أجب باللغة العربية بشكل واضح ومفصل مع أمثلة عملية.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2048,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      return generateFallbackResponse(prompt, context)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || generateFallbackResponse(prompt, context)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return generateFallbackResponse(prompt, context)
  }
}

// رد احتياطي ذكي عند عدم توفر API
function generateFallbackResponse(message: string, context: LessonContext): string {
  const lower = message.toLowerCase()
  const { courseTitle, lessonTitle } = context

  // تحليل نوع السؤال
  const isGreeting = /مرحبا|السلام|أهلا|هاي|صباح|مساء/.test(lower)
  const isThanks = /شكرا|شكراً|ممتن/.test(lower)
  const isHelp = /مساعدة|ماذا تستطيع|ماذا يمكنك/.test(lower)
  const isHowTo = /كيف|خطوات|طريقة/.test(lower)
  const isWhat = /ما هو|ما هي|ماذا|عرف/.test(lower)
  const isExplain = /اشرح|وضح|فسر/.test(lower)
  const isExample = /مثال|أمثلة|كود/.test(lower)
  const isProblem = /مشكلة|خطأ|error|لا يعمل|لماذا/.test(lower)

  if (isGreeting) {
    return `مرحباً! 👋 أنا مساعدك الذكي للتعلم.

${courseTitle ? `📖 أنت في دورة: **${courseTitle}**` : ''}
${lessonTitle ? `📝 الدرس: **${lessonTitle}**` : ''}

أنا هنا لمساعدتك في:
• 💡 شرح أي مفهوم برمجي
• 🔧 حل المشاكل التقنية
• 📝 إعطاء أمثلة عملية
• 🎯 الإجابة على أسئلتك

اسألني أي سؤال! 🚀`
  }

  if (isThanks) {
    return `على الرحب والسعة! 😊

سعيد بمساعدتك. إذا كان لديك أي أسئلة أخرى، أنا هنا دائماً!

💡 **نصيحة:** أفضل طريقة للتعلم هي التطبيق العملي. جرب ما تعلمته الآن!`
  }

  if (isHelp) {
    return `🤖 **مرحباً! أنا مساعدك الذكي**

يمكنني مساعدتك في:

**📚 الشرح والتعلم:**
• شرح أي مفهوم برمجي بالتفصيل
• توضيح الفروقات بين التقنيات
• تبسيط المواضيع المعقدة

**💻 البرمجة العملية:**
• كتابة وشرح الأكواد
• حل المشاكل البرمجية
• مراجعة الكود وتحسينه

**🛠️ الأدوات والتقنيات:**
• خطوات التثبيت والإعداد
• أفضل الممارسات
• نصائح وحيل

**جرب أن تسألني:**
- "اشرح لي React hooks"
- "كيف أحل مشكلة CORS؟"
- "ما الفرق بين let و const؟"

ما الذي تريد معرفته؟ 🎯`
  }

  if (isProblem) {
    return `🔧 **أفهم أنك تواجه مشكلة!**

لمساعدتك بشكل أفضل، أحتاج منك:

1️⃣ **وصف المشكلة بالتفصيل**
   - ماذا تحاول أن تفعل؟
   - ما الذي يحدث بدلاً من ذلك؟

2️⃣ **رسالة الخطأ (إن وجدت)**
   - انسخ رسالة الخطأ كاملة

3️⃣ **الكود المسبب للمشكلة**
   - شارك الجزء المتعلق بالمشكلة

**نصائح سريعة للمشاكل الشائعة:**
• تأكد من حفظ الملفات
• أعد تشغيل السيرفر
• تحقق من الأخطاء الإملائية
• راجع الـ Console للأخطاء

شارك التفاصيل وسأساعدك! 💪`
  }

  if (isHowTo || isExplain || isWhat) {
    const topic = message
      .replace(/كيف|خطوات|طريقة|اشرح|وضح|فسر|ما هو|ما هي|ماذا|عرف/g, '')
      .replace(/[؟?]/g, '')
      .trim()

    return `📚 **${topic || 'الموضوع'}**

${courseTitle ? `في سياق دورة "${courseTitle}":` : ''}

هذا موضوع مهم! للحصول على إجابة شاملة ودقيقة:

**🔑 لتفعيل المساعد الذكي الكامل:**
أضف مفتاح API في ملف \`.env.local\`:
\`\`\`
GEMINI_API_KEY=your_api_key_here
\`\`\`

**📖 للحصول على مفتاح مجاني:**
1. اذهب إلى: makersuite.google.com/app/apikey
2. أنشئ مفتاح API جديد
3. أضفه للمشروع

**🌐 مصادر مفيدة الآن:**
• MDN Web Docs (للويب)
• Python.org (لـ Python)
• React.dev (لـ React)
• Stack Overflow (للمشاكل)

هل تريد مساعدة في شيء آخر؟`
  }

  if (isExample) {
    return `💻 **أمثلة عملية**

${lessonTitle ? `لدرس "${lessonTitle}":` : ''}

للحصول على أمثلة كود مخصصة لسؤالك:

**🔑 فعّل المساعد الذكي:**
أضف \`GEMINI_API_KEY\` في \`.env.local\`

**📝 مثال عام:**
\`\`\`javascript
// مثال بسيط
function greet(name) {
  return \`مرحباً \${name}!\`;
}

console.log(greet("أحمد"));
\`\`\`

حدد الموضوع الذي تريد أمثلة عنه! 🎯`
  }

  // رد افتراضي
  return `🤔 **سؤال جيد!**

${courseTitle ? `في دورة "${courseTitle}"` : ''}${lessonTitle ? ` - درس "${lessonTitle}"` : ''}

للحصول على إجابات شاملة ودقيقة لأي سؤال:

**🔑 فعّل المساعد الذكي الكامل:**

1. احصل على مفتاح Gemini API مجاناً من:
   makersuite.google.com/app/apikey

2. أضفه في ملف \`.env.local\`:
   \`GEMINI_API_KEY=your_key\`

3. أعد تشغيل السيرفر

**💡 بدون API، يمكنني مساعدتك في:**
• الأسئلة العامة عن البرمجة
• توجيهك للمصادر المناسبة
• نصائح التعلم

ما الذي تريد معرفته؟ 🎯`
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { message, courseId, lessonId } = body
    
    if (!message) {
      return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 })
    }
    
    // جمع السياق
    const context: LessonContext = {}
    
    if (courseId) {
      const course = await Course.findById(courseId).select('title category')
      if (course) context.courseTitle = course.title
    }
    
    if (lessonId) {
      const lesson = await Lesson.findById(lessonId).select('title description type')
      if (lesson) {
        context.lessonTitle = lesson.title
        context.lessonContent = lesson.description || ''
        context.lessonType = lesson.type
      }
    }
    
    let response: string

    // محاولة استخدام Gemini أولاً
    if (process.env.GEMINI_API_KEY) {
      response = await callGeminiAPI(message, context)
    }
    // ثم OpenAI
    else if (process.env.OPENAI_API_KEY) {
      response = await callOpenAI(message, context)
    }
    // الرد الاحتياطي
    else {
      response = generateFallbackResponse(message, context)
    }
    
    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في المساعد الذكي' },
      { status: 500 }
    )
  }
}
