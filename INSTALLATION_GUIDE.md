# 📚 دليل تثبيت منصة التعليم الإلكتروني - خطوة بخطوة

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من توفر التالي:

### البرامج المطلوبة على جهازك:
1. **Node.js** (الإصدار 18 أو أحدث)
   - تحميل من: https://nodejs.org
   - للتحقق: `node --version`

2. **Git**
   - تحميل من: https://git-scm.com
   - للتحقق: `git --version`

3. **محرر أكواد** (اختياري لكن مُوصى به)
   - VS Code: https://code.visualstudio.com

### الحسابات المطلوبة (مجانية):
1. **GitHub** - لاستضافة الكود
2. **Vercel** - لاستضافة الموقع
3. **MongoDB Atlas** - لقاعدة البيانات

---

## 🚀 الخطوة 1: إنشاء حساب GitHub ورفع الكود

### 1.1 إنشاء حساب GitHub (إذا لم يكن لديك)
1. اذهب إلى https://github.com
2. اضغط "Sign up"
3. أدخل بريدك الإلكتروني وكلمة المرور
4. أكمل التسجيل

### 1.2 إنشاء Repository جديد
1. سجل دخول إلى GitHub
2. اضغط على زر "+" في الأعلى ← "New repository"
3. أدخل اسم المشروع (مثال: `my-academy`)
4. اختر "Private" للخصوصية
5. اضغط "Create repository"

### 1.3 رفع الكود إلى GitHub
افتح Terminal/Command Prompt في مجلد المشروع واكتب:

```bash
# إذا كان المشروع جديد (لم يتم ربطه بـ Git من قبل)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main

# إذا كنت تنسخ من مشروع موجود
git clone https://github.com/USERNAME/ORIGINAL-REPO.git new-project-name
cd new-project-name
git remote remove origin
git remote add origin https://github.com/USERNAME/NEW-REPO.git
git push -u origin main
```

> ⚠️ استبدل `USERNAME` باسم حسابك و `REPO-NAME` باسم المشروع

---

## 🗄️ الخطوة 2: إعداد قاعدة البيانات MongoDB Atlas

### 2.1 إنشاء حساب MongoDB Atlas
1. اذهب إلى https://www.mongodb.com/cloud/atlas
2. اضغط "Try Free"
3. سجل بحساب Google أو أنشئ حساب جديد

### 2.2 إنشاء Cluster جديد
1. بعد تسجيل الدخول، اضغط "Build a Database"
2. اختر **M0 FREE** (مجاني)
3. اختر المنطقة الأقرب لك (مثال: AWS - Frankfurt)
4. اضغط "Create"

### 2.3 إعداد الوصول للقاعدة
1. **إنشاء مستخدم قاعدة البيانات:**
   - اذهب إلى "Database Access" من القائمة الجانبية
   - اضغط "Add New Database User"
   - اختر "Password" كطريقة المصادقة
   - أدخل اسم المستخدم (مثال: `admin`)
   - أدخل كلمة مرور قوية (احفظها!)
   - في "Database User Privileges" اختر "Read and write to any database"
   - اضغط "Add User"

2. **السماح بالاتصال من أي مكان:**
   - اذهب إلى "Network Access"
   - اضغط "Add IP Address"
   - اضغط "Allow Access from Anywhere" (يضيف 0.0.0.0/0)
   - اضغط "Confirm"

### 2.4 الحصول على رابط الاتصال
1. اذهب إلى "Database" من القائمة الجانبية
2. اضغط "Connect" بجانب الـ Cluster
3. اختر "Connect your application"
4. انسخ الرابط الذي يظهر، سيكون بهذا الشكل:
```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. استبدل `<password>` بكلمة المرور التي أنشأتها
6. أضف اسم قاعدة البيانات قبل `?`:
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/academy?retryWrites=true&w=majority
```

> 📝 احفظ هذا الرابط، ستحتاجه لاحقاً

---

## ☁️ الخطوة 3: النشر على Vercel

### 3.1 إنشاء حساب Vercel
1. اذهب إلى https://vercel.com
2. اضغط "Sign Up"
3. اختر "Continue with GitHub" (الأسهل)
4. اسمح لـ Vercel بالوصول لحسابك

### 3.2 استيراد المشروع
1. من لوحة تحكم Vercel، اضغط "Add New..." ← "Project"
2. ابحث عن اسم الـ Repository الخاص بك
3. اضغط "Import"

### 3.3 إعداد متغيرات البيئة (Environment Variables)
قبل النشر، أضف المتغيرات التالية:

| الاسم | القيمة | الوصف |
|-------|--------|-------|
| `MONGODB_URI` | رابط MongoDB الذي حصلت عليه | الاتصال بقاعدة البيانات |
| `JWT_SECRET` | نص عشوائي طويل (32 حرف على الأقل) | تشفير الجلسات |
| `NEXTAUTH_SECRET` | نص عشوائي طويل آخر | أمان المصادقة |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | رابط الموقع |

**لإنشاء JWT_SECRET عشوائي:**
```bash
# في Terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

أو استخدم هذا الموقع: https://generate-secret.vercel.app/32

### 3.4 النشر
1. بعد إضافة المتغيرات، اضغط "Deploy"
2. انتظر حتى يكتمل النشر (2-5 دقائق)
3. ستحصل على رابط مثل: `https://your-project.vercel.app`

---

## 👤 الخطوة 4: إنشاء حساب الأدمن الأول

### 4.1 التسجيل كمستخدم عادي
1. افتح الموقع
2. اضغط "إنشاء حساب"
3. أدخل بياناتك (الاسم، البريد، كلمة المرور)
4. سجل الدخول

### 4.2 ترقية الحساب إلى أدمن
هناك طريقتان:

**الطريقة 1: عبر MongoDB Atlas (مُوصى بها)**
1. اذهب إلى MongoDB Atlas
2. اضغط "Browse Collections" على الـ Cluster
3. اختر قاعدة البيانات `academy`
4. اختر collection `users`
5. ابحث عن المستخدم بالبريد الإلكتروني
6. اضغط "Edit"
7. غيّر `"role": "student"` إلى `"role": "admin"`
8. اضغط "Update"

**الطريقة 2: عبر سكريبت**
أنشئ ملف `scripts/make-admin.js`:
```javascript
const mongoose = require('mongoose');

const MONGODB_URI = 'YOUR_MONGODB_URI';
const ADMIN_EMAIL = 'your-email@example.com';

async function makeAdmin() {
  await mongoose.connect(MONGODB_URI);
  
  const result = await mongoose.connection.db
    .collection('users')
    .updateOne(
      { email: ADMIN_EMAIL },
      { $set: { role: 'admin' } }
    );
  
  console.log('تم ترقية المستخدم إلى أدمن:', result.modifiedCount);
  process.exit(0);
}

makeAdmin();
```

شغّله:
```bash
node scripts/make-admin.js
```

---

## 🌐 الخطوة 5: ربط دومين مخصص (اختياري)

### 5.1 شراء دومين
يمكنك شراء دومين من:
- Namecheap: https://namecheap.com
- GoDaddy: https://godaddy.com
- Google Domains: https://domains.google

### 5.2 ربط الدومين بـ Vercel
1. في Vercel، اذهب إلى مشروعك
2. اضغط "Settings" ← "Domains"
3. أدخل الدومين واضغط "Add"
4. ستظهر لك سجلات DNS المطلوبة

### 5.3 إعداد DNS
في لوحة تحكم الدومين، أضف:

**للدومين الرئيسي (example.com):**
| النوع | الاسم | القيمة |
|-------|-------|--------|
| A | @ | 76.76.21.21 |

**للدومين الفرعي (www.example.com):**
| النوع | الاسم | القيمة |
|-------|-------|--------|
| CNAME | www | cname.vercel-dns.com |

> ⏰ قد يستغرق تفعيل DNS من 5 دقائق إلى 48 ساعة

### 5.4 تحديث متغيرات البيئة
بعد ربط الدومين، حدّث في Vercel:
```
NEXTAUTH_URL=https://your-domain.com
```

---

## ⚙️ الخطوة 6: الإعدادات الأولية للمنصة

### 6.1 تسجيل الدخول كأدمن
1. افتح الموقع
2. سجل دخول بحساب الأدمن
3. اذهب إلى `/dashboard/admin`

### 6.2 إعداد هوية الموقع
1. اذهب إلى "الإعدادات"
2. في تبويب "هوية الموقع":
   - أدخل اسم المنصة
   - أدخل الشعار والوصف
3. في تبويب "الألوان":
   - اختر الألوان المناسبة
4. في تبويب "التواصل":
   - أدخل بيانات التواصل
5. اضغط "حفظ"

### 6.3 إنشاء التصنيفات
1. اذهب إلى "التصنيفات"
2. أضف التصنيفات الرئيسية (مثال: برمجة، تصميم، تسويق)
3. أضف التصنيفات الفرعية لكل تصنيف

### 6.4 إعداد بوابات الدفع
1. اذهب إلى "بوابات الدفع"
2. أضف طرق الدفع المتاحة:
   - التحويل البنكي (أدخل بيانات الحساب)
   - فودافون كاش / محافظ إلكترونية
   - أي طريقة أخرى

---

## 📧 الخطوة 7: إعداد البريد الإلكتروني (اختياري)

لتفعيل إرسال الإيميلات (استعادة كلمة المرور، إشعارات):

### 7.1 إعداد Gmail SMTP
1. فعّل "التحقق بخطوتين" في حساب Google
2. أنشئ "App Password":
   - اذهب إلى https://myaccount.google.com/apppasswords
   - اختر "Mail" و "Other"
   - انسخ كلمة المرور المُنشأة

### 7.2 إضافة متغيرات البيئة
في Vercel، أضف:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

---

## 🔧 الخطوة 8: الصيانة والتحديثات

### 8.1 تحديث الكود
```bash
# سحب آخر التحديثات
git pull origin main

# إضافة تعديلاتك
git add .
git commit -m "وصف التعديل"
git push origin main
```

Vercel سينشر التحديثات تلقائياً.

### 8.2 النسخ الاحتياطي لقاعدة البيانات
1. في MongoDB Atlas، اذهب إلى الـ Cluster
2. اضغط "..." ← "Command Line Tools"
3. انسخ أمر `mongodump` واستخدمه

### 8.3 مراقبة الأداء
- **Vercel Analytics**: من لوحة تحكم Vercel
- **MongoDB Metrics**: من لوحة تحكم Atlas

---

## ❓ حل المشاكل الشائعة

### المشكلة: خطأ في الاتصال بقاعدة البيانات
**الحل:**
1. تأكد من صحة `MONGODB_URI`
2. تأكد من إضافة IP `0.0.0.0/0` في Network Access
3. تأكد من صحة اسم المستخدم وكلمة المرور

### المشكلة: الموقع لا يعمل بعد النشر
**الحل:**
1. تحقق من Vercel Logs
2. تأكد من إضافة جميع متغيرات البيئة
3. أعد النشر: `git commit --allow-empty -m "redeploy" && git push`

### المشكلة: لا أستطيع تسجيل الدخول كأدمن
**الحل:**
1. تأكد من تغيير `role` إلى `admin` في قاعدة البيانات
2. امسح cookies المتصفح وأعد تسجيل الدخول

### المشكلة: الصور لا تظهر
**الحل:**
1. تأكد من رفع الصور بصيغ مدعومة (jpg, png, webp)
2. تأكد من حجم الصورة (أقل من 4MB)

---

## 📞 الدعم الفني

إذا واجهت أي مشكلة:
1. راجع هذا الدليل مرة أخرى
2. ابحث في Google عن رسالة الخطأ
3. تواصل مع المطور

---

## ✅ قائمة التحقق النهائية

- [ ] تم إنشاء حساب GitHub
- [ ] تم رفع الكود إلى Repository
- [ ] تم إنشاء قاعدة بيانات MongoDB Atlas
- [ ] تم إعداد Network Access (0.0.0.0/0)
- [ ] تم إنشاء مستخدم قاعدة البيانات
- [ ] تم الحصول على MONGODB_URI
- [ ] تم إنشاء حساب Vercel
- [ ] تم استيراد المشروع في Vercel
- [ ] تم إضافة متغيرات البيئة
- [ ] تم النشر بنجاح
- [ ] تم إنشاء حساب أدمن
- [ ] تم إعداد هوية الموقع
- [ ] تم إنشاء التصنيفات
- [ ] تم إعداد بوابات الدفع
- [ ] (اختياري) تم ربط دومين مخصص
- [ ] (اختياري) تم إعداد البريد الإلكتروني

---

**🎉 مبروك! منصتك جاهزة للعمل!**
