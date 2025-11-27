# 📚 دليل نظام الموضوعات (Sections)

## 🎯 نظرة عامة

نظام هرمي منظم لتنظيم محتوى الدورات:

```
دورة (Course)
  └── موضوع 1 (Section)
      ├── درس 1
      ├── درس 2
      └── اختبار 1
  └── موضوع 2 (Section)
      ├── درس 3
      ├── درس 4
      └── اختبار 2
  └── دروس بدون موضوع (Optional)
      ├── مقدمة
      └── خاتمة
```

---

## 🗂️ الهيكل الجديد

### **قبل:**
```
Course
  ├── Lesson 1
  ├── Lesson 2
  ├── Lesson 3
  └── Lesson 4
```

### **بعد:**
```
Course
  ├── Section 1: "المقدمة"
  │   ├── Lesson 1: "ما هو البرمجة؟"
  │   └── Lesson 2: "تثبيت الأدوات"
  ├── Section 2: "الأساسيات"
  │   ├── Lesson 3: "المتغيرات"
  │   ├── Lesson 4: "الحلقات"
  │   └── Quiz 1: "اختبار الأساسيات"
  └── Lessons without section
      └── Lesson 5: "الخاتمة"
```

---

## 📊 Models

### **Section Model** (`models/Section.ts`)

```typescript
{
  title: String,          // عنوان الموضوع
  description: String,    // وصف الموضوع
  course: ObjectId,       // الدورة
  order: Number,          // الترتيب
  isPublished: Boolean,   // منشور؟
}
```

### **Lesson Model** (محدّث)

```typescript
{
  title: String,
  description: String,
  course: ObjectId,
  section: ObjectId,      // ← جديد! (اختياري)
  order: Number,
  type: String,
  // ... باقي الحقول
}
```

---

## 🔌 APIs

### **1. Get Sections**
```
GET /api/courses/[courseId]/sections

Response:
{
  success: true,
  sections: [
    {
      _id: "...",
      title: "المقدمة",
      description: "...",
      order: 0,
      lessons: [...]  // الدروس في هذا الموضوع
    }
  ],
  lessonsWithoutSection: [...]  // دروس بدون موضوع
}
```

### **2. Create Section**
```
POST /api/courses/[courseId]/sections

Body:
{
  title: "الموضوع الأول",
  description: "وصف الموضوع",
  order: 0,
  isPublished: true
}

Response:
{
  success: true,
  message: "تم إضافة الموضوع بنجاح",
  section: {...}
}
```

### **3. Update Section**
```
PUT /api/sections/[sectionId]

Body:
{
  title: "عنوان محدث",
  description: "وصف محدث",
  order: 1,
  isPublished: true
}
```

### **4. Delete Section**
```
DELETE /api/sections/[sectionId]

Note: عند حذف موضوع، الدروس داخله تصبح بدون موضوع (لا يتم حذفها)
```

---

## 🎨 واجهة المستخدم

### **صفحة إدارة الدروس المحسّنة:**

```
┌──────────────────────────────────────────────────┐
│  ← العودة للدورة                                 │
│  إدارة دروس: اسم الدورة                         │
│  [+ إضافة موضوع]  [+ إضافة درس]                 │
├──────────────────────────────────────────────────┤
│  📚 الموضوع الأول: المقدمة                      │
│  [تعديل] [حذف] [▲] [▼]                          │
│  ┌────────────────────────────────────────┐      │
│  │ 1. ما هو البرمجة؟ [فيديو]             │      │
│  │    [تعديل] [حذف]                       │      │
│  │ 2. تثبيت الأدوات [فيديو]              │      │
│  │    [تعديل] [حذف]                       │      │
│  │ [+ إضافة درس لهذا الموضوع]            │      │
│  └────────────────────────────────────────┘      │
│                                                   │
│  📚 الموضوع الثاني: الأساسيات                   │
│  [تعديل] [حذف] [▲] [▼]                          │
│  ┌────────────────────────────────────────┐      │
│  │ 1. المتغيرات [فيديو]                  │      │
│  │    [تعديل] [حذف]                       │      │
│  │ 2. الحلقات [فيديو]                    │      │
│  │    [تعديل] [حذف]                       │      │
│  │ 3. اختبار الأساسيات [اختبار]          │      │
│  │    [تعديل] [حذف]                       │      │
│  │ [+ إضافة درس لهذا الموضوع]            │      │
│  └────────────────────────────────────────┘      │
│                                                   │
│  📝 دروس بدون موضوع                             │
│  ┌────────────────────────────────────────┐      │
│  │ • الخاتمة [نص]                         │      │
│  │    [تعديل] [حذف] [نقل لموضوع]        │      │
│  └────────────────────────────────────────┘      │
└──────────────────────────────────────────────────┘
```

---

## 🔄 سير العمل

### **إنشاء دورة منظمة:**

#### **الخطوة 1: إنشاء الموضوعات**
```
1. اذهب إلى إدارة دروس الدورة
2. اضغط "+ إضافة موضوع"
3. أدخل:
   - العنوان: "المقدمة"
   - الوصف: "مقدمة عن البرمجة"
4. احفظ
5. كرر للموضوعات الأخرى
```

#### **الخطوة 2: إضافة الدروس**
```
1. اضغط "+ إضافة درس لهذا الموضوع" داخل الموضوع
2. أو اضغط "+ إضافة درس" واختر الموضوع من القائمة
3. املأ بيانات الدرس
4. احفظ
```

#### **الخطوة 3: الترتيب**
```
1. استخدم أزرار ▲ ▼ لترتيب الموضوعات
2. اسحب الدروس داخل الموضوع لإعادة ترتيبها
```

---

## 💡 حالات الاستخدام

### **1. دورة برمجة منظمة:**
```
Course: "تعلم Python"
  ├── Section: "المقدمة"
  │   ├── ما هو Python؟
  │   └── تثبيت Python
  ├── Section: "الأساسيات"
  │   ├── المتغيرات
  │   ├── الحلقات
  │   └── اختبار الأساسيات
  ├── Section: "المتقدم"
  │   ├── الدوال
  │   ├── الكلاسات
  │   └── اختبار المتقدم
  └── Lesson: "الخاتمة"
```

### **2. دورة بدون موضوعات (كما كان سابقاً):**
```
Course: "دورة قصيرة"
  ├── Lesson 1
  ├── Lesson 2
  └── Lesson 3
```

---

## 🎯 المميزات

### ✅ **للمدرس:**
- تنظيم أفضل للمحتوى
- سهولة إدارة الدروس
- إمكانية نقل الدروس بين الموضوعات
- ترتيب مرن

### ✅ **للطالب:**
- تصفح أسهل
- فهم أفضل لهيكل الدورة
- تتبع التقدم حسب الموضوع

### ✅ **مرونة:**
- يمكن استخدام الموضوعات أو تجاهلها
- الدروس بدون موضوع مدعومة
- سهولة التحويل من النظام القديم

---

## 🔧 التطبيق في الكود

### **في صفحة إدارة الدروس:**

```typescript
// Load sections and lessons
const loadSections = async () => {
  const response = await fetch(`/api/courses/${courseId}/sections`)
  const data = await response.json()
  
  setSections(data.sections)
  setLessonsWithoutSection(data.lessonsWithoutSection)
}

// Create section
const createSection = async (title, description) => {
  await fetch(`/api/courses/${courseId}/sections`, {
    method: 'POST',
    body: JSON.stringify({ title, description })
  })
}

// Create lesson in section
const createLesson = async (lessonData, sectionId) => {
  await fetch(`/api/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify({
      ...lessonData,
      section: sectionId  // ← ربط الدرس بالموضوع
    })
  })
}
```

---

## 📱 عرض الدورة للطالب

```typescript
// في صفحة الدورة
sections.map(section => (
  <div key={section._id}>
    <h3>{section.title}</h3>
    <p>{section.description}</p>
    
    {section.lessons.map(lesson => (
      <LessonCard key={lesson._id} lesson={lesson} />
    ))}
  </div>
))
```

---

## 🎉 الخلاصة

**نظام موضوعات متكامل ومرن!** 🚀

### **المميزات الرئيسية:**
- ✅ تنظيم هرمي للمحتوى
- ✅ سهولة الإدارة
- ✅ مرونة كاملة
- ✅ متوافق مع النظام القديم
- ✅ تجربة أفضل للطالب

---

**الآن يمكنك إنشاء دورات منظمة بشكل احترافي!** 🎊

---

**آخر تحديث:** 24 نوفمبر 2025  
**الإصدار:** 18.0.0  
**الحالة:** Ready to Use! ✅
