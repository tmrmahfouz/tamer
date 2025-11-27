const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamer-mahfouz-platform'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch((err) => {
    console.error('❌ خطأ في الاتصال:', err)
    process.exit(1)
  })

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: mongoose.Schema.Types.ObjectId,
  category: String,
  level: String,
  price: Number,
  duration: String,
  image: String,
  thumbnail: String,
  lessons: Number,
  students: Number,
  rating: Number,
  topics: [String],
  published: Boolean,
}, { timestamps: true })

const lessonSchema = new mongoose.Schema({
  title: String,
  description: String,
  course: mongoose.Schema.Types.ObjectId,
  order: Number,
  duration: String,
  videoUrl: String,
  content: String,
  isFree: Boolean,
  resources: [String],
}, { timestamps: true })

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
}, { timestamps: true })

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema)
const User = mongoose.models.User || mongoose.model('User', userSchema)

async function resetAndCreateTestCourse() {
  try {
    console.log('\n🗑️  جاري حذف جميع الدورات والدروس...\n')

    // حذف جميع الدروس
    const deletedLessons = await Lesson.deleteMany({})
    console.log(`✅ تم حذف ${deletedLessons.deletedCount} درس`)

    // حذف جميع الدورات
    const deletedCourses = await Course.deleteMany({})
    console.log(`✅ تم حذف ${deletedCourses.deletedCount} دورة`)

    console.log('\n📚 جاري إنشاء الدورة التجريبية...\n')

    // البحث عن Admin
    let admin = await User.findOne({ role: 'admin' })
    
    if (!admin) {
      console.log('⚠️  لا يوجد admin، جاري الإنشاء...')
      admin = await User.create({
        name: 'Admin',
        email: 'admin@tamermahfouz.com',
        password: '$2a$10$YourHashedPasswordHere',
        role: 'admin',
        isVerified: true,
      })
      console.log('✅ تم إنشاء Admin')
    }

    // إنشاء الدورة التجريبية
    const course = await Course.create({
      title: 'دورة Python للمبتدئين - تجريبية',
      description: 'دورة شاملة لتعلم لغة Python من الصفر حتى الاحتراف. تشمل أساسيات البرمجة، هياكل البيانات، البرمجة الكائنية، والمشاريع العملية.',
      instructor: admin._id,
      category: 'البرمجة',
      level: 'مبتدئ',
      price: 299,
      duration: '30 ساعة',
      image: '🐍',
      thumbnail: '',
      lessons: 10,
      students: 0,
      rating: 5.0,
      topics: [
        'أساسيات Python',
        'المتغيرات والأنواع',
        'الشروط والحلقات',
        'القوائم والقواميس',
        'الدوال',
        'مشاريع عملية'
      ],
      published: true,
    })

    console.log('✅ تم إنشاء الدورة:')
    console.log('   العنوان:', course.title)
    console.log('   المعرف:', course._id)
    console.log('')

    // إنشاء الدروس
    const lessons = [
      {
        title: 'مقدمة في Python',
        description: 'تعرف على لغة Python وما يمكنك فعله بها',
        order: 1,
        duration: '15 دقيقة',
        content: `# مرحباً بك في دورة Python! 🐍

## ما هي Python؟

Python هي لغة برمجة قوية وسهلة التعلم. تُستخدم في:
- تطوير المواقع
- تحليل البيانات
- الذكاء الاصطناعي
- التطبيقات المكتبية
- وأكثر!

## لماذا Python؟

✅ سهلة التعلم
✅ مجتمع كبير
✅ مكتبات ضخمة
✅ فرص عمل كثيرة

## أول برنامج لك:

\`\`\`python
print("Hello, Python!")
\`\`\`

مبروك! أنت الآن مبرمج Python! 🎉`,
        isFree: true,
      },
      {
        title: 'تثبيت Python وإعداد البيئة',
        description: 'تعلم كيفية تثبيت Python وإعداد بيئة العمل',
        order: 2,
        duration: '20 دقيقة',
        content: `# تثبيت Python 💻

## خطوات التثبيت:

### 1. تحميل Python
- اذهب إلى python.org
- حمّل آخر إصدار
- شغّل الملف

### 2. التحقق من التثبيت
\`\`\`bash
python --version
\`\`\`

### 3. تثبيت محرر الأكواد
ننصح بـ:
- VS Code
- PyCharm
- Jupyter Notebook

## أول كود لك:

\`\`\`python
name = input("ما اسمك؟ ")
print(f"مرحباً {name}!")
\`\`\``,
        isFree: true,
      },
      {
        title: 'المتغيرات وأنواع البيانات',
        description: 'فهم المتغيرات والأنواع المختلفة للبيانات في Python',
        order: 3,
        duration: '25 دقيقة',
        content: `# المتغيرات وأنواع البيانات 📦

## ما هو المتغير؟

المتغير هو صندوق نحفظ فيه البيانات.

\`\`\`python
name = "أحمد"
age = 25
height = 1.75
is_student = True
\`\`\`

## أنواع البيانات:

### 1. النصوص (String)
\`\`\`python
message = "مرحباً بك"
\`\`\`

### 2. الأرقام (Integer & Float)
\`\`\`python
count = 10
price = 99.99
\`\`\`

### 3. المنطقية (Boolean)
\`\`\`python
is_active = True
is_admin = False
\`\`\`

## تمرين:
أنشئ متغيرات لاسمك وعمرك ومدينتك!`,
        isFree: false,
      },
      {
        title: 'العمليات الحسابية والمنطقية',
        description: 'تعلم كيفية إجراء العمليات الحسابية والمنطقية',
        order: 4,
        duration: '20 دقيقة',
        content: `# العمليات الحسابية والمنطقية ➕➖

## العمليات الحسابية:

\`\`\`python
a = 10
b = 3

print(a + b)  # الجمع: 13
print(a - b)  # الطرح: 7
print(a * b)  # الضرب: 30
print(a / b)  # القسمة: 3.333
print(a // b) # القسمة الصحيحة: 3
print(a % b)  # الباقي: 1
print(a ** b) # الأس: 1000
\`\`\`

## العمليات المنطقية:

\`\`\`python
x = 5
y = 10

print(x > y)   # False
print(x < y)   # True
print(x == y)  # False
print(x != y)  # True
\`\`\`

## تمرين:
احسب مساحة مستطيل طوله 5 وعرضه 3!`,
        isFree: false,
      },
      {
        title: 'الشروط (if, elif, else)',
        description: 'استخدام الشروط للتحكم في تدفق البرنامج',
        order: 5,
        duration: '30 دقيقة',
        content: `# الشروط 🔀

## if Statement:

\`\`\`python
age = 18

if age >= 18:
    print("أنت بالغ")
\`\`\`

## if-else:

\`\`\`python
score = 85

if score >= 50:
    print("ناجح")
else:
    print("راسب")
\`\`\`

## if-elif-else:

\`\`\`python
grade = 85

if grade >= 90:
    print("ممتاز")
elif grade >= 80:
    print("جيد جداً")
elif grade >= 70:
    print("جيد")
else:
    print("مقبول")
\`\`\`

## تمرين:
اكتب برنامج يحدد إذا كان الرقم موجب أو سالب أو صفر!`,
        isFree: false,
      },
      {
        title: 'الحلقات (for و while)',
        description: 'تكرار الأوامر باستخدام الحلقات',
        order: 6,
        duration: '35 دقيقة',
        content: `# الحلقات 🔄

## حلقة for:

\`\`\`python
# طباعة الأرقام من 1 إلى 5
for i in range(1, 6):
    print(i)
\`\`\`

## حلقة while:

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

## break و continue:

\`\`\`python
for i in range(10):
    if i == 5:
        break  # توقف عند 5
    print(i)

for i in range(10):
    if i % 2 == 0:
        continue  # تخطى الأرقام الزوجية
    print(i)
\`\`\`

## تمرين:
اطبع جدول الضرب للرقم 5!`,
        isFree: false,
      },
      {
        title: 'القوائم (Lists)',
        description: 'العمل مع القوائم وعملياتها المختلفة',
        order: 7,
        duration: '30 دقيقة',
        content: `# القوائم 📝

## إنشاء قائمة:

\`\`\`python
fruits = ["تفاح", "موز", "برتقال"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "نص", True, 3.14]
\`\`\`

## الوصول للعناصر:

\`\`\`python
print(fruits[0])   # تفاح
print(fruits[-1])  # برتقال (آخر عنصر)
\`\`\`

## عمليات القوائم:

\`\`\`python
fruits.append("عنب")      # إضافة
fruits.remove("موز")      # حذف
fruits.insert(1, "كيوي")  # إدراج
print(len(fruits))        # الطول
\`\`\`

## التكرار على القائمة:

\`\`\`python
for fruit in fruits:
    print(fruit)
\`\`\`

## تمرين:
أنشئ قائمة بأسماء 5 أصدقاء واطبعها!`,
        isFree: false,
      },
      {
        title: 'القواميس (Dictionaries)',
        description: 'استخدام القواميس لتخزين البيانات المفتاحية',
        order: 8,
        duration: '30 دقيقة',
        content: `# القواميس 📚

## إنشاء قاموس:

\`\`\`python
student = {
    "name": "أحمد",
    "age": 20,
    "grade": "A"
}
\`\`\`

## الوصول للقيم:

\`\`\`python
print(student["name"])      # أحمد
print(student.get("age"))   # 20
\`\`\`

## تعديل القاموس:

\`\`\`python
student["age"] = 21           # تعديل
student["city"] = "القاهرة"   # إضافة
del student["grade"]          # حذف
\`\`\`

## التكرار على القاموس:

\`\`\`python
for key, value in student.items():
    print(f"{key}: {value}")
\`\`\`

## تمرين:
أنشئ قاموس لمعلوماتك الشخصية!`,
        isFree: false,
      },
      {
        title: 'الدوال (Functions)',
        description: 'إنشاء واستخدام الدوال في Python',
        order: 9,
        duration: '35 دقيقة',
        content: `# الدوال 🔧

## إنشاء دالة:

\`\`\`python
def greet():
    print("مرحباً!")

greet()  # استدعاء الدالة
\`\`\`

## دالة مع معاملات:

\`\`\`python
def greet_user(name):
    print(f"مرحباً {name}!")

greet_user("أحمد")
\`\`\`

## دالة ترجع قيمة:

\`\`\`python
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # 8
\`\`\`

## معاملات افتراضية:

\`\`\`python
def power(base, exp=2):
    return base ** exp

print(power(5))      # 25
print(power(5, 3))   # 125
\`\`\`

## تمرين:
اكتب دالة تحسب مساحة المستطيل!`,
        isFree: false,
      },
      {
        title: 'مشروع عملي: آلة حاسبة',
        description: 'بناء آلة حاسبة كاملة باستخدام كل ما تعلمته',
        order: 10,
        duration: '45 دقيقة',
        content: `# مشروع: آلة حاسبة 🧮

## المشروع النهائي!

سنبني آلة حاسبة كاملة تستخدم كل ما تعلمناه.

\`\`\`python
def add(x, y):
    return x + y

def subtract(x, y):
    return x - y

def multiply(x, y):
    return x * y

def divide(x, y):
    if y == 0:
        return "خطأ: لا يمكن القسمة على صفر"
    return x / y

def calculator():
    print("=== آلة حاسبة ===")
    print("1. جمع")
    print("2. طرح")
    print("3. ضرب")
    print("4. قسمة")
    
    choice = input("اختر العملية (1-4): ")
    
    num1 = float(input("أدخل الرقم الأول: "))
    num2 = float(input("أدخل الرقم الثاني: "))
    
    if choice == '1':
        print(f"النتيجة: {add(num1, num2)}")
    elif choice == '2':
        print(f"النتيجة: {subtract(num1, num2)}")
    elif choice == '3':
        print(f"النتيجة: {multiply(num1, num2)}")
    elif choice == '4':
        print(f"النتيجة: {divide(num1, num2)}")
    else:
        print("اختيار خاطئ!")

# تشغيل الآلة الحاسبة
calculator()
\`\`\`

## تحدي:
أضف عمليات أخرى مثل الأس والجذر التربيعي!

## مبروك! 🎉
أنت الآن مبرمج Python!`,
        isFree: false,
      },
    ]

    console.log('📝 جاري إنشاء الدروس...\n')

    for (const lessonData of lessons) {
      const lesson = await Lesson.create({
        ...lessonData,
        course: course._id,
      })
      console.log(`✅ ${lesson.order}. ${lesson.title}`)
    }

    console.log('\n🎉 تم بنجاح!\n')
    console.log('📊 الملخص:')
    console.log(`   الدورات: 1`)
    console.log(`   الدروس: ${lessons.length}`)
    console.log('')
    console.log('🔗 الروابط:')
    console.log(`   الدورات: http://localhost:3000/courses`)
    console.log(`   الدورة: http://localhost:3000/courses/${course._id}`)
    console.log(`   الدرس الأول: http://localhost:3000/learn/${course._id}/${lessons[0]._id || 'LESSON_ID'}`)
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ خطأ:', error)
    process.exit(1)
  }
}

resetAndCreateTestCourse()
