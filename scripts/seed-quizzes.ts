import mongoose from 'mongoose'
import Quiz from '../models/Quiz'
import Course from '../models/Course'
import Lesson from '../models/Lesson'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

async function seedQuizzes() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get first course
    const course = await Course.findOne()
    if (!course) {
      console.log('❌ لا توجد دورات في قاعدة البيانات')
      process.exit(1)
    }

    // Get first lesson
    const lesson = await Lesson.findOne({ course: course._id })

    // Check if quizzes already exist
    const existingQuizzes = await Quiz.countDocuments()
    if (existingQuizzes > 0) {
      console.log(`✅ يوجد ${existingQuizzes} اختبار في قاعدة البيانات`)
      process.exit(0)
    }

    // Create sample quizzes
    const quizzes = [
      {
        title: 'اختبار أساسيات البرمجة',
        description: 'اختبار شامل لأساسيات البرمجة',
        course: course._id,
        lesson: lesson?._id,
        questions: [
          {
            question: 'ما هي لغة البرمجة الأكثر شيوعاً؟',
            type: 'multiple-choice',
            options: ['Python', 'JavaScript', 'Java', 'C++'],
            correctAnswer: 1,
            points: 10,
            explanation: 'JavaScript هي اللغة الأكثر استخداماً في تطوير الويب'
          },
          {
            question: 'HTML تعني HyperText Markup Language',
            type: 'true-false',
            options: ['صح', 'خطأ'],
            correctAnswer: 0,
            points: 5,
          },
          {
            question: 'ما معنى CSS؟',
            type: 'short-answer',
            correctAnswer: 'Cascading Style Sheets',
            points: 10,
          }
        ],
        passingScore: 70,
        timeLimit: 30,
        maxAttempts: 3,
        isPublished: true,
      },
      {
        title: 'اختبار JavaScript المتقدم',
        description: 'اختبار لقياس مهاراتك المتقدمة في JavaScript',
        course: course._id,
        questions: [
          {
            question: 'ما هو الفرق بين var و let؟',
            type: 'multiple-choice',
            options: [
              'لا يوجد فرق',
              'let له block scope و var له function scope',
              'var أسرع من let',
              'let قديمة و var حديثة'
            ],
            correctAnswer: 1,
            points: 15,
          },
          {
            question: 'Promises في JavaScript تُستخدم للتعامل مع العمليات غير المتزامنة',
            type: 'true-false',
            options: ['صح', 'خطأ'],
            correctAnswer: 0,
            points: 10,
          }
        ],
        passingScore: 75,
        timeLimit: 20,
        maxAttempts: 2,
        isPublished: true,
      },
      {
        title: 'اختبار React.js',
        description: 'اختبار لمكتبة React',
        course: course._id,
        questions: [
          {
            question: 'ما هو Hook useState في React؟',
            type: 'multiple-choice',
            options: [
              'لإدارة الحالة في المكونات الوظيفية',
              'لإنشاء مكونات جديدة',
              'لتصميم المكونات',
              'لتوجيه الصفحات'
            ],
            correctAnswer: 0,
            points: 20,
          }
        ],
        passingScore: 80,
        timeLimit: 15,
        maxAttempts: 3,
        isPublished: false,
      }
    ]

    await Quiz.insertMany(quizzes)
    console.log(`✅ تم إنشاء ${quizzes.length} اختبارات تجريبية`)
    
    const totalQuizzes = await Quiz.countDocuments()
    console.log(`✅ إجمالي الاختبارات في قاعدة البيانات: ${totalQuizzes}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

seedQuizzes()
