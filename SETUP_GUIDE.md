# 🚀 دليل الإعداد والتشغيل المحلي

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:
- ✅ Node.js 18+ ([تحميل](https://nodejs.org/))
- ✅ MongoDB ([تحميل](https://www.mongodb.com/try/download/community))
- ✅ Git (اختياري)

---

## 🔧 خطوات الإعداد

### 1️⃣ تثبيت MongoDB

#### الخيار الأول: MongoDB محلي (Windows)

1. **تحميل MongoDB:**
   - اذهب إلى: https://www.mongodb.com/try/download/community
   - اختر Windows
   - حمّل وثبّت البرنامج

2. **تشغيل MongoDB:**
   ```powershell
   # افتح PowerShell كمسؤول
   net start MongoDB
   ```

3. **التحقق من التشغيل:**
   ```powershell
   mongosh
   # إذا اتصل بنجاح، اكتب:
   exit
   ```

#### الخيار الثاني: MongoDB Atlas (سحابي - موصى به)

1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. أنشئ حساب مجاني
3. أنشئ Cluster جديد (اختر Free Tier)
4. انتظر حتى يتم إنشاء الـ Cluster (5-10 دقائق)
5. اضغط على "Connect"
6. اختر "Connect your application"
7. انسخ الـ Connection String

**مثال:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tamer-platform
```

8. عدّل ملف `.env.local` واستبدل `MONGODB_URI`

---

### 2️⃣ تثبيت الحزم

```bash
cd C:\Users\Mr.Tamer\CascadeProjects\tamer-mahfouz-platform
npm install
```

---

### 3️⃣ إعداد ملف البيئة

ملف `.env.local` موجود بالفعل مع الإعدادات الافتراضية:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/tamer-platform

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tamer-mahfouz-secret-key-2024-change-in-production

# JWT Secret
JWT_SECRET=tamer-mahfouz-jwt-secret-2024-change-in-production
```

**⚠️ ملاحظة:** إذا كنت تستخدم MongoDB Atlas، عدّل `MONGODB_URI`

---

### 4️⃣ إنشاء البيانات التجريبية

```bash
# تشغيل سكريبت إنشاء البيانات
npm run seed
```

سيتم إنشاء:
- ✅ 3 مستخدمين (مدير، مدرس، طالب)
- ✅ 6 دورات تدريبية
- ✅ بيانات كاملة للتجربة

**بيانات تسجيل الدخول:**

| الدور | البريد الإلكتروني | كلمة المرور |
|------|-------------------|-------------|
| مدير | admin@tamermahfouz.com | 123456 |
| مدرس | instructor@tamermahfouz.com | 123456 |
| طالب | student1@example.com | 123456 |

---

### 5️⃣ تشغيل المشروع

```bash
npm run dev
```

سيعمل المشروع على: **http://localhost:3000**

---

## 🧪 اختبار المنصة

### 1. الصفحة الرئيسية
- افتح: http://localhost:3000
- يجب أن تظهر الصفحة الرئيسية مع جميع الأقسام

### 2. تسجيل الدخول كمدير
1. اذهب إلى: http://localhost:3000/login
2. أدخل:
   - البريد: `admin@tamermahfouz.com`
   - كلمة المرور: `123456`
3. سجل دخولك
4. يجب أن تنتقل إلى: http://localhost:3000/dashboard

### 3. لوحة التحكم
- يجب أن تظهر الإحصائيات:
  - 6 دورات
  - 575 طالب (مجموع)
  - الإيرادات
  - متوسط التقييم

### 4. إدارة الدورات
- اذهب إلى: http://localhost:3000/dashboard/courses
- يجب أن تظهر جميع الدورات (6 دورات)
- جرب تعديل أو حذف دورة

### 5. صفحة الدورات العامة
- اذهب إلى: http://localhost:3000/courses
- يجب أن تظهر جميع الدورات للزوار

---

## 🔧 حل المشاكل الشائعة

### المشكلة: MongoDB لا يعمل
**الحل:**
```powershell
# تشغيل MongoDB
net start MongoDB

# إذا لم يعمل، جرب:
mongod --dbpath C:\data\db
```

### المشكلة: خطأ في الاتصال بقاعدة البيانات
**الحل:**
1. تأكد من تشغيل MongoDB
2. تحقق من `MONGODB_URI` في `.env.local`
3. جرب إعادة تشغيل المشروع

### المشكلة: npm run seed لا يعمل
**الحل:**
```bash
# أضف السكريبت إلى package.json يدوياً
# ثم شغل:
npx tsx scripts/seed.ts
```

### المشكلة: لا تظهر البيانات
**الحل:**
1. تأكد من تشغيل `npm run seed`
2. تحقق من الاتصال بقاعدة البيانات
3. افتح MongoDB Compass وتحقق من البيانات

---

## 📦 أوامر مفيدة

```bash
# تشغيل المشروع
npm run dev

# بناء المشروع
npm run build

# تشغيل النسخة الإنتاجية
npm start

# إنشاء بيانات تجريبية
npm run seed

# تنظيف المشروع
rm -rf .next node_modules
npm install
```

---

## 🌐 الصفحات المتاحة

### للزوار
- `/` - الصفحة الرئيسية
- `/courses` - جميع الدورات
- `/about` - من نحن
- `/contact` - تواصل معنا
- `/login` - تسجيل الدخول
- `/register` - إنشاء حساب

### للمدير/المدرس
- `/dashboard` - لوحة التحكم
- `/dashboard/courses` - إدارة الدورات
- `/dashboard/courses/new` - إضافة دورة جديدة
- `/dashboard/students` - الطلاب
- `/dashboard/settings` - الإعدادات

### للطالب
- `/student/dashboard` - لوحة تحكم الطالب
- `/student/courses` - دوراتي
- `/student/profile` - الملف الشخصي

---

## 🔍 أدوات مفيدة

### MongoDB Compass
- تحميل: https://www.mongodb.com/try/download/compass
- استخدمه لعرض وإدارة البيانات بصرياً

### Postman
- تحميل: https://www.postman.com/downloads/
- استخدمه لاختبار الـ APIs

---

## 📊 البيانات التجريبية

بعد تشغيل `npm run seed`، ستحصل على:

### المستخدمين (5)
- 1 مدير
- 1 مدرس
- 3 طلاب

### الدورات (6)
1. أساسيات البرمجة بلغة Python
2. تطوير الويب بـ JavaScript
3. مقدمة في الذكاء الاصطناعي
4. تحليل البيانات مع Python
5. تطوير تطبيقات الموبايل
6. الأمن السيبراني والاختراق الأخلاقي

---

## 🎯 الخطوات التالية

بعد التأكد من عمل كل شيء:

1. ✅ جرب جميع الصفحات
2. ✅ سجل دخول بحسابات مختلفة
3. ✅ أضف دورة جديدة
4. ✅ عدّل دورة موجودة
5. ✅ اختبر نظام المصادقة

---

## 🚀 الرفع على الاستضافة

عندما تكون جاهزاً للنشر، راجع:
- `DEPLOYMENT_GUIDE.md` - دليل النشر الكامل

---

## 💡 نصائح

- 🔐 غيّر المفاتيح السرية في الإنتاج
- 📝 احتفظ بنسخة احتياطية من قاعدة البيانات
- 🧪 اختبر كل شيء قبل النشر
- 📊 راقب الأداء والأخطاء

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع هذا الدليل
2. تحقق من Console للأخطاء
3. راجع ملف `BACKEND_GUIDE.md`

---

**المنصة جاهزة للتجربة المحلية! 🎉**
