# ⚡ دليل البدء السريع

## 🚀 تشغيل المنصة في 3 خطوات

### الخطوة 1️⃣: تثبيت MongoDB

**الخيار السهل: MongoDB Atlas (سحابي - مجاني)**

1. اذهب إلى: https://www.mongodb.com/cloud/atlas/register
2. أنشئ حساب مجاني
3. أنشئ Cluster (اختر FREE)
4. انتظر 5-10 دقائق
5. اضغط "Connect" → "Connect your application"
6. انسخ Connection String
7. افتح `.env.local` وعدّل `MONGODB_URI`

**أو: MongoDB محلي**
```powershell
# تحميل من: https://www.mongodb.com/try/download/community
# بعد التثبيت:
net start MongoDB
```

---

### الخطوة 2️⃣: إنشاء البيانات التجريبية

```bash
npm run seed
```

ستحصل على:
- ✅ 5 مستخدمين (مدير + مدرس + 3 طلاب)
- ✅ 6 دورات تدريبية كاملة

**بيانات الدخول:**
```
المدير:
  البريد: admin@tamermahfouz.com
  كلمة المرور: 123456

المدرس:
  البريد: instructor@tamermahfouz.com
  كلمة المرور: 123456

الطالب:
  البريد: student1@example.com
  كلمة المرور: 123456
```

---

### الخطوة 3️⃣: تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح: **http://localhost:3000**

---

## 🧪 اختبار سريع

1. **الصفحة الرئيسية**: http://localhost:3000
   - يجب أن تظهر جميع الأقسام

2. **تسجيل الدخول**: http://localhost:3000/login
   - استخدم: `admin@tamermahfouz.com` / `123456`

3. **لوحة التحكم**: http://localhost:3000/dashboard
   - يجب أن تظهر الإحصائيات والدورات

4. **الدورات**: http://localhost:3000/courses
   - يجب أن تظهر 6 دورات

---

## ❌ حل المشاكل

### MongoDB لا يعمل؟
```bash
# تأكد من تشغيله:
net start MongoDB

# أو استخدم MongoDB Atlas (أسهل)
```

### البيانات لا تظهر؟
```bash
# أعد تشغيل seed:
npm run seed
```

### خطأ في الاتصال؟
- تحقق من `.env.local`
- تأكد من `MONGODB_URI` صحيح

---

## 📚 المزيد من التفاصيل

راجع `SETUP_GUIDE.md` للحصول على دليل شامل.

---

**جاهز للانطلاق! 🎉**
