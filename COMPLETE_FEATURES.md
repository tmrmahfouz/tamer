# 🎯 الميزات المكتملة والمطلوبة

## ✅ تم إنجازه حتى الآن

### Models (قاعدة البيانات)
- ✅ User - المستخدمين
- ✅ Course - الدورات
- ✅ Lesson - الدروس (فيديو، PDF، نص، اختبار)
- ✅ Quiz - الاختبارات
- ✅ Enrollment - الاشتراكات
- ✅ Payment - المدفوعات

### الصفحات الأساسية
- ✅ الصفحة الرئيسية
- ✅ صفحة الدورات
- ✅ صفحة من نحن
- ✅ صفحة التواصل
- ✅ صفحة تسجيل الدخول
- ✅ صفحة التسجيل
- ✅ صفحة تفاصيل الدورة
- ✅ صفحة الدفع (فودافون كاش، انستا باي، فوري)

### لوحة التحكم
- ✅ لوحة التحكم الرئيسية
- ✅ إدارة الدورات (عرض)

---

## 📋 الصفحات والميزات المطلوبة

### 1. صفحة إنشاء/تعديل الدورة
**المسار:** `/dashboard/courses/new` و `/dashboard/courses/[id]/edit`

**الميزات:**
- نموذج شامل لإنشاء دورة
- رفع صورة الدورة
- إضافة المواضيع
- تحديد السعر والمستوى
- حفظ كمسودة أو نشر

### 2. صفحة إدارة الدروس
**المسار:** `/dashboard/courses/[id]/lessons`

**الميزات:**
- عرض جميع دروس الدورة
- إضافة درس جديد
- ترتيب الدروس (Drag & Drop)
- تعديل/حذف درس

### 3. صفحة إضافة درس
**المسار:** `/dashboard/courses/[id]/lessons/new`

**أنواع الدروس:**
- **فيديو:**
  - رفع فيديو مباشر
  - رابط YouTube
  - رابط Vimeo
  - Google Drive
- **PDF:**
  - رفع ملف PDF
  - رابط خارجي
- **نص:**
  - محرر نصوص غني (Rich Text Editor)
  - Markdown support
- **اختبار:**
  - إضافة أسئلة متعددة
  - أنواع الأسئلة (اختيار متعدد، صح/خطأ، إجابة قصيرة)

### 4. صفحة عرض الدرس (للطالب)
**المسار:** `/learn/[courseId]/[lessonId]`

**الميزات:**
- مشغل فيديو متقدم
- عرض PDF
- عرض المحتوى النصي
- تتبع التقدم
- زر التالي/السابق
- ملاحظات الطالب

### 5. صفحة الاختبار
**المسار:** `/learn/[courseId]/quiz/[quizId]`

**الميزات:**
- عرض الأسئلة واحداً تلو الآخر
- مؤقت للاختبار
- حفظ الإجابات
- عرض النتيجة
- مراجعة الإجابات

### 6. صفحة دوراتي (للطالب)
**المسار:** `/student/my-courses`

**الميزات:**
- عرض الدورات المسجل فيها
- نسبة الإنجاز
- آخر درس تم مشاهدته
- الشهادات المكتسبة

### 7. صفحة الملف الشخصي
**المسار:** `/profile`

**الميزات:**
- تعديل المعلومات الشخصية
- تغيير كلمة المرور
- رفع صورة شخصية
- عرض الإحصائيات

### 8. صفحة الشهادات
**المسار:** `/certificates`

**الميزات:**
- عرض جميع الشهادات
- تحميل الشهادة (PDF)
- مشاركة الشهادة
- التحقق من الشهادة

### 9. صفحة نجاح الدفع
**المسار:** `/payment/success`

**الميزات:**
- تأكيد الدفع
- تفاصيل العملية
- زر بدء الدورة

### 10. صفحة فشل الدفع
**المسار:** `/payment/failed`

**الميزات:**
- رسالة خطأ
- إعادة المحاولة
- التواصل مع الدعم

---

## 🔧 APIs المطلوبة

### Lessons APIs
- `GET /api/courses/[id]/lessons` - جلب دروس الدورة
- `POST /api/courses/[id]/lessons` - إضافة درس
- `PUT /api/lessons/[id]` - تعديل درس
- `DELETE /api/lessons/[id]` - حذف درس
- `POST /api/lessons/[id]/complete` - تحديد درس كمكتمل

### Quiz APIs
- `GET /api/courses/[id]/quizzes` - جلب اختبارات الدورة
- `POST /api/courses/[id]/quizzes` - إضافة اختبار
- `GET /api/quizzes/[id]` - جلب اختبار
- `POST /api/quizzes/[id]/submit` - إرسال إجابات
- `GET /api/quizzes/[id]/results` - جلب النتائج

### Enrollment APIs
- `POST /api/enrollments` - الاشتراك في دورة
- `GET /api/enrollments/my-courses` - دوراتي
- `GET /api/enrollments/check` - التحقق من الاشتراك
- `PUT /api/enrollments/[id]/progress` - تحديث التقدم

### Payment APIs
- `POST /api/payments/create` - إنشاء عملية دفع
- `POST /api/payments/verify` - التحقق من الدفع
- `GET /api/payments/[id]` - جلب تفاصيل الدفع
- `POST /api/payments/vodafone-callback` - Webhook لفودافون كاش
- `POST /api/payments/instapay-callback` - Webhook لانستا باي
- `POST /api/payments/fawry-callback` - Webhook لفوري

### Certificate APIs
- `GET /api/certificates/my-certificates` - شهاداتي
- `GET /api/certificates/[id]` - جلب شهادة
- `POST /api/certificates/generate` - إنشاء شهادة
- `GET /api/certificates/verify/[code]` - التحقق من شهادة

### Upload APIs
- `POST /api/upload/video` - رفع فيديو
- `POST /api/upload/pdf` - رفع PDF
- `POST /api/upload/image` - رفع صورة

---

## 📦 الحزم الإضافية المطلوبة

```bash
# محرر نصوص غني
npm install react-quill

# رفع الملفات
npm install multer

# معالجة الصور
npm install sharp

# إنشاء PDF (للشهادات)
npm install pdfkit

# مشغل فيديو
npm install react-player

# Drag and Drop
npm install @dnd-kit/core @dnd-kit/sortable

# Charts للإحصائيات
npm install recharts
```

---

## 🎨 مكونات إضافية مطلوبة

### VideoPlayer Component
```tsx
// components/VideoPlayer.tsx
- دعم YouTube, Vimeo, MP4
- تتبع وقت المشاهدة
- حفظ التقدم تلقائياً
- جودة متعددة
```

### PDFViewer Component
```tsx
// components/PDFViewer.tsx
- عرض PDF في المتصفح
- تكبير/تصغير
- تحميل
```

### QuizComponent
```tsx
// components/QuizComponent.tsx
- عرض الأسئلة
- مؤقت
- حفظ الإجابات
- عرض النتيجة
```

### ProgressBar Component
```tsx
// components/ProgressBar.tsx
- شريط التقدم
- نسبة الإنجاز
```

### CertificateTemplate Component
```tsx
// components/CertificateTemplate.tsx
- قالب الشهادة
- معلومات الطالب
- QR Code للتحقق
```

---

## 🔐 الأمان والحماية

### حماية الفيديوهات
- استخدام Signed URLs
- منع التحميل المباشر
- Watermark على الفيديوهات

### حماية المحتوى
- التحقق من الاشتراك قبل العرض
- تشفير روابط الملفات
- Rate limiting للـ APIs

---

## 📊 التقارير والإحصائيات

### للمدير/المدرس
- عدد الطلاب المسجلين
- الإيرادات اليومية/الشهرية
- معدل إتمام الدورات
- تقييمات الطلاب
- أكثر الدورات مبيعاً

### للطالب
- الدورات المكتملة
- الوقت المستغرق
- النقاط المكتسبة
- الشهادات

---

## 🚀 الخطوات التالية

### المرحلة 1: الأساسيات (أولوية عالية)
1. ✅ إنشاء Models
2. ✅ صفحة تفاصيل الدورة
3. ✅ صفحة الدفع
4. ⏳ صفحة إنشاء/تعديل الدورة
5. ⏳ صفحة إضافة الدروس
6. ⏳ صفحة عرض الدرس

### المرحلة 2: الميزات المتقدمة
7. ⏳ نظام الاختبارات
8. ⏳ نظام الشهادات
9. ⏳ صفحة دوراتي
10. ⏳ الملف الشخصي

### المرحلة 3: التحسينات
11. ⏳ رفع الملفات
12. ⏳ معالجة الدفع الفعلي
13. ⏳ الإشعارات
14. ⏳ التقارير والإحصائيات

---

## 💡 ملاحظات مهمة

### رفع الملفات
- استخدم خدمة سحابية (AWS S3, Cloudinary)
- لا ترفع ملفات كبيرة على السيرفر مباشرة

### الدفع
- فودافون كاش: يحتاج API من فودافون
- انستا باي: يحتاج تكامل مع البنك
- فوري: يحتاج حساب تاجر

### الفيديوهات
- استخدم YouTube/Vimeo للاستضافة
- أو خدمة متخصصة مثل Vimeo Pro
- أو AWS S3 + CloudFront

---

## 📝 الملفات المطلوب إنشاؤها

### الصفحات (15 صفحة)
1. `/dashboard/courses/new/page.tsx`
2. `/dashboard/courses/[id]/edit/page.tsx`
3. `/dashboard/courses/[id]/lessons/page.tsx`
4. `/dashboard/courses/[id]/lessons/new/page.tsx`
5. `/dashboard/courses/[id]/lessons/[lessonId]/edit/page.tsx`
6. `/learn/[courseId]/page.tsx`
7. `/learn/[courseId]/[lessonId]/page.tsx`
8. `/learn/[courseId]/quiz/[quizId]/page.tsx`
9. `/student/my-courses/page.tsx`
10. `/student/dashboard/page.tsx`
11. `/profile/page.tsx`
12. `/certificates/page.tsx`
13. `/certificates/[id]/page.tsx`
14. `/payment/success/page.tsx`
15. `/payment/failed/page.tsx`

### APIs (20+ endpoint)
- Lessons CRUD
- Quizzes CRUD
- Enrollments
- Payments
- Certificates
- Upload
- Progress tracking

### Components (10+ مكون)
- VideoPlayer
- PDFViewer
- QuizComponent
- ProgressBar
- CertificateTemplate
- FileUploader
- RichTextEditor
- CourseCard
- LessonCard
- StatsCard

---

**الحجم الكلي للعمل المتبقي: كبير جداً (100+ ساعة عمل)**

**التوصية:** 
1. ابدأ بالميزات الأساسية أولاً
2. اختبر كل ميزة قبل الانتقال للتالية
3. استخدم خدمات جاهزة للرفع والدفع
4. ركز على تجربة المستخدم

---

سأقوم الآن بإنشاء أهم الصفحات المطلوبة...
