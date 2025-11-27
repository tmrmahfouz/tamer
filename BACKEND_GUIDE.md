# 🔧 دليل Backend - منصة مستر تامر محفوظ

## 📋 نظرة عامة

تم إنشاء Backend متكامل للمنصة يتضمن:
- ✅ نظام مصادقة كامل (تسجيل/دخول/خروج)
- ✅ قاعدة بيانات MongoDB
- ✅ API Routes لإدارة الدورات
- ✅ لوحة تحكم للمدير/المدرس
- ✅ صفحات تسجيل ودخول احترافية
- ✅ حماية الصفحات والـ APIs

---

## 🗄️ قاعدة البيانات

### MongoDB Setup

#### الخيار 1: MongoDB محلي
```bash
# تثبيت MongoDB على Windows
# قم بتحميله من: https://www.mongodb.com/try/download/community

# تشغيل MongoDB
mongod
```

#### الخيار 2: MongoDB Atlas (موصى به)
1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ حساب مجاني
3. أنشئ Cluster جديد
4. احصل على Connection String

### إعداد ملف البيئة

أنشئ ملف `.env.local` في جذر المشروع:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/tamer-platform
# أو MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tamer-platform

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=قم-بتغيير-هذا-المفتاح-السري

# JWT Secret
JWT_SECRET=قم-بتغيير-هذا-المفتاح-السري-أيضاً
```

**⚠️ مهم:** غيّر المفاتيح السرية في الإنتاج!

---

## 🔐 نظام المصادقة

### API Endpoints

#### 1. التسجيل
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "اسم المستخدم",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "student"
  }
}
```

#### 2. تسجيل الدخول
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "user": { ... },
  "token": "jwt-token-here"
}
```

#### 3. تسجيل الخروج
```http
POST /api/auth/logout
```

#### 4. الحصول على بيانات المستخدم الحالي
```http
GET /api/auth/me
Cookie: token=jwt-token-here
```

---

## 📚 إدارة الدورات

### API Endpoints

#### 1. الحصول على جميع الدورات
```http
GET /api/courses
GET /api/courses?category=البرمجة
GET /api/courses?level=مبتدئ
GET /api/courses?published=true
```

#### 2. الحصول على دورة واحدة
```http
GET /api/courses/[id]
```

#### 3. إنشاء دورة جديدة (Admin/Instructor فقط)
```http
POST /api/courses
Cookie: token=jwt-token-here
Content-Type: application/json

{
  "title": "عنوان الدورة",
  "description": "وصف الدورة",
  "category": "البرمجة",
  "level": "مبتدئ",
  "price": 499,
  "duration": "40 ساعة",
  "image": "🐍",
  "lessons": 45,
  "topics": ["Python", "OOP"],
  "published": true
}
```

#### 4. تحديث دورة
```http
PUT /api/courses/[id]
Cookie: token=jwt-token-here
Content-Type: application/json

{
  "title": "عنوان جديد",
  "price": 599
}
```

#### 5. حذف دورة
```http
DELETE /api/courses/[id]
Cookie: token=jwt-token-here
```

---

## 👥 أنواع المستخدمين

### 1. Student (طالب)
- التسجيل في الدورات
- عرض المحتوى
- متابعة التقدم

### 2. Instructor (مدرس)
- إنشاء وإدارة الدورات الخاصة به
- عرض الطلاب المسجلين
- تعديل المحتوى

### 3. Admin (مدير)
- صلاحيات كاملة
- إدارة جميع الدورات
- إدارة المستخدمين
- عرض الإحصائيات

---

## 🎨 الصفحات

### صفحات المصادقة
- `/login` - تسجيل الدخول
- `/register` - إنشاء حساب جديد

### لوحة التحكم
- `/dashboard` - الصفحة الرئيسية (Admin/Instructor)
- `/dashboard/courses` - إدارة الدورات
- `/dashboard/courses/new` - إضافة دورة جديدة
- `/dashboard/courses/[id]/edit` - تعديل دورة
- `/dashboard/students` - عرض الطلاب
- `/dashboard/settings` - الإعدادات

### لوحة الطالب
- `/student/dashboard` - لوحة تحكم الطالب
- `/student/courses` - الدورات المسجل فيها
- `/student/profile` - الملف الشخصي

---

## 🔒 الحماية والأمان

### تشفير كلمات المرور
- استخدام `bcryptjs` لتشفير كلمات المرور
- Salt rounds: 10

### JWT Tokens
- مدة الصلاحية: 7 أيام
- يتم تخزينها في Cookies (httpOnly)

### حماية الـ APIs
```typescript
// مثال على حماية API
const token = request.cookies.get('token')?.value
if (!token) {
  return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
}

const decoded = jwt.verify(token, JWT_SECRET)
// التحقق من الصلاحيات...
```

---

## 📊 Models (النماذج)

### User Model
```typescript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'instructor' | 'admin',
  avatar: String,
  phone: String,
  bio: String,
  enrolledCourses: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Course Model
```typescript
{
  title: String,
  description: String,
  instructor: ObjectId (ref: User),
  category: String,
  level: 'مبتدئ' | 'متوسط' | 'متقدم',
  price: Number,
  duration: String,
  image: String,
  thumbnail: String,
  lessons: Number,
  students: Number,
  rating: Number,
  topics: [String],
  published: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 الاختبار

### اختبار التسجيل
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'
```

### اختبار تسجيل الدخول
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

---

## 🚀 الخطوات التالية

### 1. إضافة ميزات متقدمة
- [ ] نظام الدفع (Stripe/PayPal/Paymob)
- [ ] رفع الفيديوهات والملفات
- [ ] نظام الإشعارات
- [ ] نظام التقييمات والمراجعات
- [ ] نظام الشهادات

### 2. تحسينات الأمان
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Input validation
- [ ] XSS protection

### 3. الأداء
- [ ] Caching (Redis)
- [ ] CDN للملفات الثابتة
- [ ] Database indexing
- [ ] Image optimization

---

## 🐛 حل المشاكل الشائعة

### المشكلة: لا يمكن الاتصال بـ MongoDB
**الحل:**
1. تأكد من تشغيل MongoDB
2. تحقق من `MONGODB_URI` في `.env.local`
3. تأكد من صحة بيانات الاتصال

### المشكلة: JWT Token غير صالح
**الحل:**
1. تأكد من تطابق `JWT_SECRET` في `.env.local`
2. امسح الـ cookies وسجل دخول مرة أخرى
3. تحقق من انتهاء صلاحية الـ token

### المشكلة: خطأ في التسجيل
**الحل:**
1. تحقق من صحة البيانات المدخلة
2. تأكد من عدم وجود البريد الإلكتروني مسبقاً
3. تحقق من طول كلمة المرور (6 أحرف على الأقل)

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع هذا الدليل
2. تحقق من Console للأخطاء
3. راجع ملفات الـ logs

---

## ✅ Checklist

- [x] إعداد MongoDB
- [x] إنشاء Models
- [x] إنشاء API Routes للمصادقة
- [x] إنشاء API Routes للدورات
- [x] إنشاء صفحات التسجيل والدخول
- [x] إنشاء لوحة التحكم
- [x] حماية الصفحات والـ APIs
- [ ] إضافة نظام الدفع
- [ ] إضافة رفع الملفات
- [ ] إضافة نظام الإشعارات

---

**تم إنشاء Backend متكامل وجاهز للاستخدام! 🎉**
