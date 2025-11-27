# 📤 دليل APIs رفع الملفات

## 🎯 APIs المتاحة:

### 1. رفع فيديو
- **Endpoint:** `POST /api/upload/video`
- **الحد الأقصى:** 500MB
- **الأنواع المدعومة:** MP4, WebM, OGG, QuickTime

### 2. رفع PDF
- **Endpoint:** `POST /api/upload/pdf`
- **الحد الأقصى:** 50MB
- **الأنواع المدعومة:** PDF

### 3. رفع عرض تقديمي
- **Endpoint:** `POST /api/upload/presentation`
- **الحد الأقصى:** 100MB
- **الأنواع المدعومة:** PPT, PPTX, ODP

---

## 🔒 المصادقة:

جميع APIs تتطلب:
- ✅ Cookie: `token` (JWT)
- ✅ Role: `admin` أو `instructor`

---

## 📤 كيفية الاستخدام:

### مثال - رفع فيديو:

```typescript
const formData = new FormData()
formData.append('file', videoFile)

const response = await fetch('/api/upload/video', {
  method: 'POST',
  body: formData,
})

const data = await response.json()

if (data.success) {
  console.log('File URL:', data.data.url)
  console.log('Filename:', data.data.filename)
  console.log('Size:', data.data.size)
}
```

---

## 📊 Response Format:

### Success (200):
```json
{
  "success": true,
  "message": "تم رفع الفيديو بنجاح",
  "data": {
    "url": "/uploads/videos/video_1234567890_abc123.mp4",
    "filename": "my-video.mp4",
    "size": 52428800,
    "type": "video/mp4"
  }
}
```

### Error (400/401/403/500):
```json
{
  "success": false,
  "message": "حجم الملف كبير جداً. الحد الأقصى 500MB"
}
```

---

## 🎨 استخدام مكون FileUploader:

```tsx
import FileUploader from '@/components/FileUploader'

<FileUploader
  type="video"
  onUploadComplete={(url, filename, size) => {
    console.log('Uploaded:', url)
    // حفظ الرابط في الدرس
  }}
  maxSize={500} // optional
/>
```

---

## 📁 هيكل المجلدات:

```
public/
  uploads/
    videos/
      video_1234567890_abc123.mp4
    pdfs/
      pdf_1234567890_abc123.pdf
    presentations/
      presentation_1234567890_abc123.pptx
```

---

## ⚠️ ملاحظات مهمة:

### 1. الأمان:
- ✅ يتم التحقق من نوع الملف
- ✅ يتم التحقق من حجم الملف
- ✅ يتم التحقق من صلاحيات المستخدم
- ✅ أسماء ملفات فريدة (timestamp + random)

### 2. الأداء:
- ⚠️ الملفات الكبيرة قد تستغرق وقتاً
- ⚠️ تأكد من إعدادات السيرفر للملفات الكبيرة

### 3. التخزين:
- 📁 الملفات تُحفظ في `public/uploads/`
- 🌐 يمكن الوصول إليها مباشرة عبر URL

---

## 🚀 الخطوات التالية:

### 1. تحديث لوحة Admin ✅
إضافة خيار رفع الملفات عند إنشاء درس جديد

### 2. إضافة معاينة ✅
عرض معاينة للملف قبل الرفع

### 3. إدارة الملفات ⏭️
صفحة لإدارة الملفات المرفوعة (حذف، تعديل)

### 4. CDN (اختياري) ⏭️
استخدام CDN لتحسين سرعة التحميل

---

## 💡 أمثلة الاستخدام:

### إضافة درس بفيديو مرفوع:

```typescript
// 1. رفع الفيديو
const formData = new FormData()
formData.append('file', videoFile)

const uploadResponse = await fetch('/api/upload/video', {
  method: 'POST',
  body: formData,
})

const uploadData = await uploadResponse.json()

// 2. إنشاء الدرس
const lessonData = {
  title: "درس جديد",
  type: "video",
  content: {
    videoUrl: uploadData.data.url,
    videoProvider: "upload",
    fileName: uploadData.data.filename,
    fileSize: uploadData.data.size
  }
}

const lessonResponse = await fetch('/api/courses/COURSE_ID/lessons', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(lessonData),
})
```

---

تم إنشاء هذا الدليل في: 24 نوفمبر 2025
