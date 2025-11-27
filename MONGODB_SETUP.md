# 🗄️ دليل إعداد MongoDB

## الخيار 1: MongoDB Atlas (موصى به - سهل وسريع)

### المميزات:
- ✅ مجاني تماماً (512 MB)
- ✅ لا يحتاج تثبيت
- ✅ يعمل من أي مكان
- ✅ نسخ احتياطي تلقائي

### الخطوات:

#### 1. إنشاء حساب
1. اذهب إلى: https://www.mongodb.com/cloud/atlas/register
2. سجل بالبريد الإلكتروني أو Google
3. اختر "Free" Plan

#### 2. إنشاء Cluster
1. اضغط "Build a Database"
2. اختر "M0 Free"
3. اختر Region قريب (مثل: Frankfurt أو London)
4. اضغط "Create Cluster"
5. انتظر 5-10 دقائق

#### 3. إعداد الوصول
1. **إنشاء مستخدم:**
   - Username: `tamer`
   - Password: `tamer123` (أو أي كلمة مرور)
   - اضغط "Create User"

2. **السماح بالوصول:**
   - اختر "Add My Current IP Address"
   - أو اختر "Allow Access from Anywhere" (0.0.0.0/0)
   - اضغط "Finish and Close"

#### 4. الحصول على Connection String
1. اضغط "Connect"
2. اختر "Connect your application"
3. اختر "Driver: Node.js"
4. انسخ Connection String

**مثال:**
```
mongodb+srv://tamer:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. استبدل `<password>` بكلمة المرور الحقيقية
6. أضف اسم قاعدة البيانات:
```
mongodb+srv://tamer:tamer123@cluster0.xxxxx.mongodb.net/tamer-platform?retryWrites=true&w=majority
```

#### 5. تحديث ملف البيئة
افتح `.env.local` وعدّل:
```env
MONGODB_URI=mongodb+srv://tamer:tamer123@cluster0.xxxxx.mongodb.net/tamer-platform?retryWrites=true&w=majority
```

✅ **جاهز! الآن شغّل `npm run seed`**

---

## الخيار 2: MongoDB محلي (Windows)

### الخطوات:

#### 1. تحميل MongoDB
1. اذهب إلى: https://www.mongodb.com/try/download/community
2. اختر:
   - Version: Latest
   - Platform: Windows
   - Package: MSI
3. اضغط "Download"

#### 2. التثبيت
1. شغّل الملف المحمّل
2. اختر "Complete" Installation
3. اختر "Install MongoDB as a Service"
4. اضغط "Next" حتى النهاية
5. انتظر حتى ينتهي التثبيت

#### 3. التحقق من التثبيت
```powershell
# افتح PowerShell كمسؤول
mongod --version
```

يجب أن يظهر رقم الإصدار.

#### 4. تشغيل MongoDB
```powershell
# تشغيل الخدمة
net start MongoDB

# التحقق من التشغيل
mongosh
# إذا اتصل، اكتب:
exit
```

#### 5. إنشاء مجلد البيانات (إذا لزم الأمر)
```powershell
# إنشاء المجلد
mkdir C:\data\db

# تشغيل MongoDB يدوياً
mongod --dbpath C:\data\db
```

#### 6. ملف البيئة
`.env.local` جاهز بالفعل:
```env
MONGODB_URI=mongodb://localhost:27017/tamer-platform
```

✅ **جاهز! الآن شغّل `npm run seed`**

---

## 🧪 اختبار الاتصال

### باستخدام mongosh:
```bash
mongosh "your-connection-string"

# أو للمحلي:
mongosh

# اختبار:
show dbs
use tamer-platform
show collections
```

### باستخدام MongoDB Compass (GUI):
1. حمّل من: https://www.mongodb.com/try/download/compass
2. ثبّت البرنامج
3. افتحه
4. الصق Connection String
5. اضغط "Connect"

---

## ❌ حل المشاكل

### MongoDB لا يعمل محلياً؟
```powershell
# تحقق من الخدمة
Get-Service MongoDB

# إذا لم تكن موجودة، شغّل يدوياً:
mongod --dbpath C:\data\db
```

### خطأ في الاتصال بـ Atlas؟
1. تحقق من Username/Password
2. تأكد من إضافة IP Address في Whitelist
3. تأكد من استبدال `<password>` بكلمة المرور الحقيقية
4. تأكد من إضافة اسم قاعدة البيانات في النهاية

### Connection String غير صحيح؟
**الصيغة الصحيحة:**
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority
```

---

## 💡 نصائح

### لـ MongoDB Atlas:
- ✅ استخدم كلمة مرور قوية
- ✅ احفظ Connection String في مكان آمن
- ✅ لا تشارك بيانات الاتصال
- ✅ راقب الاستخدام (512 MB مجاناً)

### لـ MongoDB المحلي:
- ✅ شغّل MongoDB كخدمة (Service)
- ✅ احتفظ بنسخ احتياطية
- ✅ لا تنسَ تشغيل MongoDB قبل المشروع

---

## 🎯 الخطوة التالية

بعد إعداد MongoDB:
```bash
# إنشاء البيانات التجريبية
npm run seed

# تشغيل المشروع
npm run dev
```

---

**MongoDB جاهز! 🎉**
