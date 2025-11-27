# 🗄️ إعداد MongoDB Atlas (مجاني)

## الخطوات (5 دقائق فقط):

### 1. التسجيل
1. اذهب إلى: https://www.mongodb.com/cloud/atlas/register
2. سجل حساب جديد (مجاني)

### 2. إنشاء Cluster
1. اختر **FREE** (M0 Sandbox)
2. اختر أقرب منطقة (مثل Frankfurt أو Paris)
3. اضغط **Create Cluster**

### 3. إعداد الأمان

#### Database Access:
1. اذهب إلى **Database Access**
2. اضغط **Add New Database User**
3. اختر اسم مستخدم وكلمة مرور
4. اختر **Read and write to any database**
5. احفظ البيانات!

#### Network Access:
1. اذهب إلى **Network Access**
2. اضغط **Add IP Address**
3. اختر **Allow Access from Anywhere** (0.0.0.0/0)
4. اضغط **Confirm**

### 4. الحصول على Connection String
1. اذهب إلى **Database**
2. اضغط **Connect** على الـ Cluster
3. اختر **Connect your application**
4. انسخ الـ Connection String

سيكون شكله:
```
mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 5. تعديل `.env.local`
1. افتح ملف `.env.local`
2. استبدل `MONGODB_URI` بالـ Connection String
3. استبدل `<password>` بكلمة المرور الحقيقية
4. أضف اسم قاعدة البيانات في النهاية

**مثال:**
```env
MONGODB_URI=mongodb+srv://tamer:MyPassword123@cluster0.xxxxx.mongodb.net/tamer-platform?retryWrites=true&w=majority
```

### 6. إعادة تشغيل المشروع
```bash
# أوقف السيرفر (Ctrl+C)
npm run dev
```

### 7. إنشاء بيانات تجريبية
```bash
npm run seed
```

---

## ✅ بعد الإعداد:

ستتمكن من:
- ✅ التسجيل وتسجيل الدخول
- ✅ إنشاء ومشاهدة الدورات
- ✅ جميع الميزات الـ17

---

## 🆘 مشاكل شائعة:

### المشكلة: Connection timeout
**الحل:** تأكد من إضافة IP Address في Network Access

### المشكلة: Authentication failed
**الحل:** تأكد من استبدال `<password>` بكلمة المرور الصحيحة

### المشكلة: Database not found
**الحل:** أضف `/tamer-platform` في نهاية الـ Connection String

---

**⏱️ الوقت الكلي: 5-10 دقائق فقط!**
