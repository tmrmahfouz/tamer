# 📚 دليل أنواع الدروس المتعددة

## 🎯 الأنواع المدعومة:

### 1. **فيديو (Video)** 🎬
- YouTube
- Vimeo
- Google Drive
- OneDrive
- HTML5 (رفع مباشر)

### 2. **PDF** 📄
- رفع ملف PDF
- رابط خارجي لـ PDF

### 3. **عرض تقديمي (Presentation)** 📊
- Google Slides
- PowerPoint Online
- رفع ملف

### 4. **نص (Text)** 📝
- محتوى نصي

### 5. **HTML5** 🌐
- محتوى HTML مخصص

---

## 📁 الملفات الجديدة:

### Models:
- ✅ `models/Lesson.ts` - تم تحديثه

### Components:
- ✅ `components/lesson-viewers/UniversalVideoPlayer.tsx`
- ✅ `components/lesson-viewers/PDFViewer.tsx`
- ✅ `components/lesson-viewers/PresentationViewer.tsx`
- ✅ `components/lesson-viewers/HTML5Viewer.tsx`

### Pages:
- ✅ `app/learn/[courseId]/[lessonId]/page.tsx` - تم تحديثه

---

## 🎬 1. فيديو (Video)

### YouTube:
```json
{
  "type": "video",
  "content": {
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
    "videoProvider": "youtube"
  }
}
```

### Google Drive:
```json
{
  "type": "video",
  "content": {
    "videoUrl": "https://drive.google.com/file/d/FILE_ID/view",
    "videoProvider": "google-drive"
  }
}
```

### OneDrive:
```json
{
  "type": "video",
  "content": {
    "videoUrl": "https://onedrive.live.com/embed?...",
    "videoProvider": "onedrive"
  }
}
```

### رفع مباشر (HTML5):
```json
{
  "type": "video",
  "content": {
    "videoUrl": "/uploads/videos/video.mp4",
    "videoProvider": "upload",
    "fileName": "video.mp4",
    "fileSize": 52428800
  }
}
```

---

## 📄 2. PDF

```json
{
  "type": "pdf",
  "content": {
    "pdfUrl": "/uploads/pdfs/document.pdf",
    "fileName": "document.pdf",
    "fileSize": 1048576
  }
}
```

---

## 📊 3. عرض تقديمي (Presentation)

### Google Slides:
```json
{
  "type": "presentation",
  "content": {
    "presentationUrl": "https://docs.google.com/presentation/d/ID/edit",
    "presentationType": "google-slides"
  }
}
```

### رفع ملف:
```json
{
  "type": "presentation",
  "content": {
    "presentationUrl": "/uploads/presentations/slides.pptx",
    "presentationType": "upload",
    "fileName": "slides.pptx"
  }
}
```

---

## 📝 4. نص (Text)

```json
{
  "type": "text",
  "content": {
    "textContent": "محتوى الدرس النصي هنا..."
  }
}
```

---

## 🌐 5. HTML5

```json
{
  "type": "html5",
  "content": {
    "html5Content": "<h1>عنوان</h1><p>محتوى HTML...</p>"
  }
}
```

---

## 🔒 الحماية:

### جميع الأنواع محمية بـ:
- ✅ علامات مائية (اسم الطالب)
- ✅ منع النقر بالزر الأيمن
- ✅ منع التحديد والنسخ
- ✅ تحذيرات قانونية

### حماية إضافية للفيديو:
- ✅ منع F12 وأدوات المطور
- ✅ إخفاء عناصر المشغل
- ✅ منع التحميل (controlsList="nodownload")

---

## 📤 رفع الملفات:

### المجلدات المطلوبة:
```
public/
  uploads/
    videos/
    pdfs/
    presentations/
```

### API لرفع الملفات:
سيتم إنشاؤها في الخطوة التالية:
- `/api/upload/video`
- `/api/upload/pdf`
- `/api/upload/presentation`

---

## 🎯 الخطوات التالية:

### 1. إنشاء API لرفع الملفات ✅
### 2. تحديث لوحة Admin لدعم جميع الأنواع ✅
### 3. إضافة معاينة للملفات قبل الرفع ✅
### 4. إضافة progress bar للرفع ✅

---

## 💡 أمثلة الاستخدام:

### إضافة درس فيديو YouTube:
```typescript
const lesson = {
  title: "مقدمة في البرمجة",
  type: "video",
  content: {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoProvider: "youtube",
    duration: 15
  }
}
```

### إضافة درس PDF:
```typescript
const lesson = {
  title: "ملخص الدرس",
  type: "pdf",
  content: {
    pdfUrl: "/uploads/pdfs/summary.pdf",
    fileName: "summary.pdf"
  }
}
```

### إضافة عرض تقديمي:
```typescript
const lesson = {
  title: "شرح مفصل",
  type: "presentation",
  content: {
    presentationUrl: "https://docs.google.com/presentation/d/ABC123/edit",
    presentationType: "google-slides"
  }
}
```

---

تم إنشاء هذا الدليل في: 24 نوفمبر 2025
