# دليل نشر المشروع لعميل جديد

## نظرة عامة
هذا الدليل يشرح كيفية إنشاء نسخة جديدة من منصة التعلم لعميل آخر.

---

## الخطوة 1: نسخ المشروع

### الطريقة الأولى: نسخ المجلد مباشرة
```bash
# انسخ مجلد المشروع بالكامل
cp -r tamer-mahfouz-platform client-academy

# أو على Windows
xcopy tamer-mahfouz-platform client-academy /E /I
```

### الطريقة الثانية: من GitHub
```bash
# استنسخ المشروع من GitHub
git clone https://github.com/tmrmahfouz/my-academy.git client-academy
cd client-academy

# احذف ارتباط Git القديم
rm -rf .git

# أنشئ repository جديد
git init
```

---

## الخطوة 2: إنشاء قاعدة بيانات جديدة

### على MongoDB Atlas (مجاني):

1. اذهب إلى: https://cloud.mongodb.com
2. سجل دخول أو أنشئ حساب جديد
3. اضغط "Create" لإنشاء Cluster جديد
4. اختر "M0 FREE" (مجاني)
5. اختر المنطقة الأقرب (مثل: Frankfurt أو Paris)
6. اضغط "Create Cluster"

### إعداد الوصول:
1. من القائمة الجانبية: Database Access
2. اضغط "Add New Database User"
3. أدخل:
   - Username: admin
   - Password: (كلمة مرور قوية)
4. اضغط "Add User"

### السماح بالاتصال:
1. من القائمة: Network Access
2. اضغط "Add IP Address"
3. اضغط "Allow Access from Anywhere" (للتطوير)
4. اضغط "Confirm"

### الحصول على رابط الاتصال:
1. من Clusters، اضغط "Connect"
2. اختر "Connect your application"
3. انسخ الرابط (سيكون مثل):
```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/academy?retryWrites=true&w=majority
```
4. استبدل `<password>` بكلمة المرور

---

## الخطوة 3: إعداد ملف البيئة

أنشئ ملف `.env.local` في المشروع الجديد:

```env
# قاعدة البيانات - استبدل بالرابط الجديد
MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/client-academy?retryWrites=true&w=majority

# مفتاح JWT - غيّره لكل عميل (أي نص عشوائي طويل)
JWT_SECRET=client-name-super-secret-jwt-key-2024-unique-random-string

# رابط الموقع
NEXT_PUBLIC_API_URL=https://client-academy.vercel.app

# مفتاح Gemini AI (اختياري)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### ⚠️ مهم جداً:
- كل عميل يجب أن يكون له قاعدة بيانات منفصلة
- كل عميل يجب أن يكون له JWT_SECRET مختلف
- لا تشارك هذه المعلومات مع أحد

---

## الخطوة 4: رفع المشروع على GitHub

### إنشاء Repository جديد:
1. اذهب إلى: https://github.com/new
2. أدخل اسم المشروع: `client-academy`
3. اجعله Private (خاص)
4. اضغط "Create repository"

### رفع الكود:
```bash
cd client-academy
git init
git add .
git commit -m "Initial commit for client academy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/client-academy.git
git push -u origin main
```

---

## الخطوة 5: النشر على Vercel

### ربط المشروع:
1. اذهب إلى: https://vercel.com
2. سجل دخول بحساب GitHub
3. اضغط "Add New" → "Project"
4. اختر Repository الجديد `client-academy`
5. اضغط "Import"

### إضافة Environment Variables:
في صفحة الإعداد، أضف المتغيرات:

| Name | Value |
|------|-------|
| MONGODB_URI | رابط MongoDB الجديد |
| JWT_SECRET | مفتاح JWT الجديد |
| NEXT_PUBLIC_API_URL | https://client-academy.vercel.app |
| GEMINI_API_KEY | مفتاح Gemini (اختياري) |

### النشر:
1. اضغط "Deploy"
2. انتظر حتى ينتهي البناء (2-5 دقائق)
3. ستحصل على رابط مثل: `client-academy.vercel.app`

---

## الخطوة 6: إعداد الدومين المخصص (اختياري)

### إذا كان للعميل دومين خاص:
1. في Vercel، اذهب للمشروع → Settings → Domains
2. أضف الدومين: `www.client-domain.com`
3. ستحصل على DNS Records لإضافتها

### إعدادات DNS عند مزود الدومين:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.19
```

---

## الخطوة 7: إنشاء حساب الأدمن

### الطريقة الأولى: من الموقع
1. اذهب إلى: `https://client-academy.vercel.app/register`
2. سجل حساب جديد
3. غيّر الـ role في قاعدة البيانات إلى "admin"

### الطريقة الثانية: من MongoDB Atlas
1. اذهب إلى Collections في MongoDB Atlas
2. اختر collection "users"
3. عدّل المستخدم وغيّر `role` إلى `"admin"`

---

## الخطوة 8: تخصيص المنصة للعميل

### من لوحة التحكم:
1. سجل دخول كأدمن
2. اذهب إلى: الإعدادات
3. غيّر:
   - اسم المنصة
   - الشعار
   - الألوان
   - معلومات التواصل
   - طرق الدفع

### من محرر الصفحة الرئيسية:
1. اذهب إلى: /admin/home-editor
2. عدّل:
   - النصوص
   - الصور
   - الأقسام

---

## ملخص التكاليف

| الخدمة | التكلفة |
|--------|---------|
| Vercel (Hobby) | مجاني |
| MongoDB Atlas (M0) | مجاني |
| GitHub (Private) | مجاني |
| Gemini API | مجاني |
| **الإجمالي** | **$0/شهر** |

### متى تحتاج للدفع؟
- Vercel Pro ($20/شهر): إذا تجاوزت 100GB bandwidth
- MongoDB (M10): إذا تجاوزت 512MB بيانات
- دومين مخصص: $10-15/سنة

---

## قائمة التحقق النهائية

- [ ] قاعدة بيانات MongoDB جديدة
- [ ] ملف .env.local معد بشكل صحيح
- [ ] Repository على GitHub
- [ ] مشروع على Vercel
- [ ] Environment Variables مضافة
- [ ] الموقع يعمل
- [ ] حساب أدمن منشأ
- [ ] إعدادات المنصة مخصصة
- [ ] دومين مخصص (اختياري)

---

## الدعم والمساعدة

إذا واجهت أي مشكلة:
1. تحقق من Vercel Logs
2. تحقق من MongoDB Connection
3. تأكد من Environment Variables

---

تم إعداد هذا الدليل بواسطة Kiro AI
