import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

interface ExplanationLevel {
  level: 'beginner' | 'intermediate' | 'advanced';
  explanation: string;
  examples: string[];
  relatedConcepts: string[];
}

// قاموس المفاهيم البرمجية الشائعة
const conceptsDatabase: Record<string, {
  title: string;
  levels: ExplanationLevel[];
  category: string;
}> = {
  'variable': {
    title: 'المتغيرات (Variables)',
    category: 'أساسيات البرمجة',
    levels: [
      {
        level: 'beginner',
        explanation: 'المتغير هو مثل صندوق تخزين في الكمبيوتر. يمكنك وضع قيمة فيه (مثل رقم أو نص) واستخدامها لاحقاً. تخيل أن لديك صندوقاً مكتوب عليه "العمر" وتضع فيه الرقم 25.',
        examples: [
          'let age = 25; // متغير يحتوي على العمر',
          'let name = "أحمد"; // متغير يحتوي على الاسم',
          'let isStudent = true; // متغير منطقي'
        ],
        relatedConcepts: ['أنواع البيانات', 'الثوابت', 'النطاق']
      },
      {
        level: 'intermediate',
        explanation: 'المتغيرات هي مواقع في الذاكرة تُستخدم لتخزين البيانات. في JavaScript، لدينا let للمتغيرات القابلة للتغيير، const للثوابت، و var (قديم). كل متغير له نطاق (scope) يحدد أين يمكن الوصول إليه.',
        examples: [
          'let count = 0; count++; // يمكن تغيير القيمة',
          'const PI = 3.14159; // لا يمكن تغيير القيمة',
          '{ let x = 10; } // x متاح فقط داخل الأقواس'
        ],
        relatedConcepts: ['Hoisting', 'Block Scope', 'Closure']
      },
      {
        level: 'advanced',
        explanation: 'المتغيرات في JavaScript تُخزن في الذاكرة بطرق مختلفة حسب نوعها. الأنواع البدائية (primitive) تُخزن في Stack، بينما الكائنات تُخزن في Heap مع مرجع في Stack. فهم هذا مهم لتجنب مشاكل الذاكرة والمراجع.',
        examples: [
          '// Pass by value vs Pass by reference',
          'let a = [1,2,3]; let b = a; b.push(4); // a يتأثر أيضاً!',
          'let c = [...a]; // نسخة مستقلة باستخدام spread'
        ],
        relatedConcepts: ['Memory Management', 'Garbage Collection', 'Immutability']
      }
    ]
  },
  'function': {
    title: 'الدوال (Functions)',
    category: 'أساسيات البرمجة',
    levels: [
      {
        level: 'beginner',
        explanation: 'الدالة هي مجموعة من الأوامر المجمعة معاً لتنفيذ مهمة محددة. مثل وصفة الطبخ - تكتبها مرة واحدة وتستخدمها كلما أردت.',
        examples: [
          'function sayHello() {\n  console.log("مرحباً!");\n}',
          'sayHello(); // استدعاء الدالة',
          'function add(a, b) {\n  return a + b;\n}'
        ],
        relatedConcepts: ['المعاملات', 'القيمة المُرجعة', 'استدعاء الدالة']
      },
      {
        level: 'intermediate',
        explanation: 'الدوال في JavaScript هي كائنات من الدرجة الأولى (First-class objects)، يمكن تمريرها كمعاملات وإرجاعها من دوال أخرى. لدينا أنواع مختلفة: Function Declaration, Function Expression, Arrow Functions.',
        examples: [
          'const greet = (name) => `مرحباً ${name}`;',
          'const numbers = [1,2,3].map(n => n * 2);',
          'function outer() {\n  return function inner() { };\n}'
        ],
        relatedConcepts: ['Callbacks', 'Higher-order Functions', 'Closures']
      },
      {
        level: 'advanced',
        explanation: 'فهم سياق التنفيذ (Execution Context) و this binding ضروري للتعامل مع الدوال المتقدمة. Arrow functions لا تملك this خاص بها، بينما الدوال العادية تعتمد على طريقة الاستدعاء.',
        examples: [
          'const obj = {\n  name: "أحمد",\n  greet: function() { return this.name; },\n  greetArrow: () => this.name // undefined!\n};',
          'function.call(context, arg1, arg2)',
          'const bound = func.bind(context);'
        ],
        relatedConcepts: ['this binding', 'call/apply/bind', 'Execution Context']
      }
    ]
  },
  'array': {
    title: 'المصفوفات (Arrays)',
    category: 'هياكل البيانات',
    levels: [
      {
        level: 'beginner',
        explanation: 'المصفوفة هي قائمة مرتبة من العناصر. تخيل صف من الصناديق، كل صندوق له رقم (index) يبدأ من 0.',
        examples: [
          'let fruits = ["تفاح", "موز", "برتقال"];',
          'console.log(fruits[0]); // "تفاح"',
          'fruits.push("عنب"); // إضافة عنصر'
        ],
        relatedConcepts: ['Index', 'Length', 'Push/Pop']
      },
      {
        level: 'intermediate',
        explanation: 'المصفوفات في JavaScript ديناميكية ويمكن أن تحتوي على أنواع مختلفة. الدوال مثل map, filter, reduce تجعل التعامل معها أسهل وأكثر قوة.',
        examples: [
          'const doubled = [1,2,3].map(n => n * 2);',
          'const evens = [1,2,3,4].filter(n => n % 2 === 0);',
          'const sum = [1,2,3].reduce((acc, n) => acc + n, 0);'
        ],
        relatedConcepts: ['map', 'filter', 'reduce', 'forEach']
      },
      {
        level: 'advanced',
        explanation: 'فهم الفرق بين الطرق المُغيّرة (mutating) وغير المُغيّرة مهم. أيضاً، Typed Arrays توفر أداءً أفضل للبيانات الثنائية.',
        examples: [
          '// Immutable operations',
          'const newArr = [...arr, newItem];',
          'const filtered = arr.filter(x => x !== item);',
          '// Typed Arrays for performance',
          'const buffer = new ArrayBuffer(16);'
        ],
        relatedConcepts: ['Spread Operator', 'Destructuring', 'Typed Arrays']
      }
    ]
  },
  'loop': {
    title: 'الحلقات التكرارية (Loops)',
    category: 'أساسيات البرمجة',
    levels: [
      {
        level: 'beginner',
        explanation: 'الحلقة تسمح لك بتكرار كود معين عدة مرات. مثل قول "كرر هذا 10 مرات" أو "كرر حتى ينتهي الشرط".',
        examples: [
          'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
          'let count = 0;\nwhile (count < 5) {\n  count++;\n}',
          'for (let fruit of fruits) {\n  console.log(fruit);\n}'
        ],
        relatedConcepts: ['for', 'while', 'do-while']
      },
      {
        level: 'intermediate',
        explanation: 'هناك عدة أنواع من الحلقات: for التقليدية، for...of للمصفوفات، for...in للكائنات. اختيار النوع المناسب يحسن قراءة الكود.',
        examples: [
          '// for...of للقيم',
          'for (const item of array) { }',
          '// for...in للمفاتيح',
          'for (const key in object) { }',
          '// forEach للمصفوفات',
          'array.forEach((item, index) => { });'
        ],
        relatedConcepts: ['break', 'continue', 'Iterator Protocol']
      },
      {
        level: 'advanced',
        explanation: 'فهم Iterator Protocol و Generators يفتح إمكانيات متقدمة. يمكنك إنشاء iterators مخصصة وتحكم دقيق في التكرار.',
        examples: [
          'function* generator() {\n  yield 1;\n  yield 2;\n}',
          'const iterator = generator();',
          'iterator.next(); // { value: 1, done: false }',
          '// Custom Iterator',
          'obj[Symbol.iterator] = function* () { }'
        ],
        relatedConcepts: ['Generators', 'Iterators', 'Symbol.iterator']
      }
    ]
  }
};

// البحث عن مفهوم
function findConcept(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  // البحث المباشر
  if (conceptsDatabase[normalizedQuery]) {
    return normalizedQuery;
  }
  
  // البحث بالكلمات المفتاحية
  const keywords: Record<string, string> = {
    'متغير': 'variable',
    'متغيرات': 'variable',
    'var': 'variable',
    'let': 'variable',
    'const': 'variable',
    'دالة': 'function',
    'دوال': 'function',
    'فنكشن': 'function',
    'مصفوفة': 'array',
    'مصفوفات': 'array',
    'اراي': 'array',
    'حلقة': 'loop',
    'حلقات': 'loop',
    'تكرار': 'loop',
    'for': 'loop',
    'while': 'loop'
  };
  
  for (const [keyword, concept] of Object.entries(keywords)) {
    if (normalizedQuery.includes(keyword)) {
      return concept;
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { concept, level = 'beginner' } = body;
    
    if (!concept) {
      return NextResponse.json(
        { error: 'يرجى تحديد المفهوم المراد شرحه' },
        { status: 400 }
      );
    }
    
    const foundConcept = findConcept(concept);
    
    if (!foundConcept || !conceptsDatabase[foundConcept]) {
      // Return a generic explanation
      return NextResponse.json({
        success: true,
        found: false,
        title: concept,
        explanation: `لم أجد شرحاً محدداً لـ "${concept}" في قاعدة البيانات.\n\nيمكنك:\n• البحث في Google عن "${concept}"\n• سؤال المدرس في منتدى الدورة\n• طرح السؤال في مجتمع المتعلمين`,
        examples: [],
        relatedConcepts: [],
        availableConcepts: Object.keys(conceptsDatabase).map(k => conceptsDatabase[k].title)
      });
    }
    
    const conceptData = conceptsDatabase[foundConcept];
    const levelData = conceptData.levels.find(l => l.level === level) || conceptData.levels[0];
    
    return NextResponse.json({
      success: true,
      found: true,
      title: conceptData.title,
      category: conceptData.category,
      level: levelData.level,
      explanation: levelData.explanation,
      examples: levelData.examples,
      relatedConcepts: levelData.relatedConcepts,
      availableLevels: conceptData.levels.map(l => l.level)
    });
  } catch (error) {
    console.error('Explain error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في شرح المفهوم' },
      { status: 500 }
    );
  }
}

// GET - جلب قائمة المفاهيم المتاحة
export async function GET() {
  const concepts = Object.entries(conceptsDatabase).map(([key, value]) => ({
    id: key,
    title: value.title,
    category: value.category
  }));
  
  return NextResponse.json({
    success: true,
    concepts,
    categories: [...new Set(concepts.map(c => c.category))]
  });
}
