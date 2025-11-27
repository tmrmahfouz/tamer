# 🎓 منصة مستر تامر محفوظ التعليمية

منصة تعليمية متكاملة ومتخصصة في تعليم البرمجة والذكاء الاصطناعي

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38bdf8)](https://tailwindcss.com/)

---

## ⚡ البدء السريع

```bash
# 1. تثبيت الحزم
npm install

# 2. إعداد MongoDB (راجع MONGODB_SETUP.md)
# ثم أنشئ ملف .env.local

# 3. إنشاء بيانات تجريبية
npm run seed

# 4. تشغيل المشروع
npm run dev
```

**🌐 افتح:** http://localhost:3000

**🔐 بيانات الدخول:**
- المدير: `admin@tamermahfouz.com` / `123456`
- المدرس: `instructor@tamermahfouz.com` / `123456`
- الطالب: `student1@example.com` / `123456`

📖 **للتفاصيل الكاملة:** راجع [QUICK_START.md](QUICK_START.md)

---

## 🚀 المميزات

### Frontend
- ✨ تصميم عصري وجذاب باستخدام Next.js 14 و TailwindCSS
- 📱 متجاوب مع جميع الأجهزة (Mobile-First Design)
- 🎨 واجهة مستخدم احترافية مع تأثيرات حركية
- 🌐 دعم كامل للغة العربية (RTL)
- ⚡ أداء عالي وسرعة تحميل

### Backend
- 🔐 نظام مصادقة كامل (JWT + Cookies)
- 🗄️ قاعدة بيانات MongoDB
- 🔒 تشفير كلمات المرور (bcrypt)
- 🛡️ حماية APIs والصفحات
- 👥 3 أنواع مستخدمين (Admin/Instructor/Student)

### الصفحات
- 🏠 صفحة رئيسية جذابة
- 📚 عرض الدورات التدريبية
- 👨‍🏫 صفحة تعريفية للمدرس
- 💬 آراء الطلاب
- 📊 إحصائيات المنصة
- 📧 نموذج تواصل
- 🎛️ لوحة تحكم متقدمة
- 🔐 صفحات تسجيل ودخول

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 14** - إطار عمل React
- **TypeScript** - للكتابة الآمنة
- **TailwindCSS** - للتصميم
- **Lucide React** - الأيقونات
- **Cairo Font** - خط عربي احترافي

### Backend
- **MongoDB** - قاعدة البيانات
- **Mongoose** - ODM
- **NextAuth.js** - المصادقة
- **bcryptjs** - تشفير كلمات المرور
- **jsonwebtoken** - JWT tokens

---

## 📦 التثبيت والإعداد

### المتطلبات
- ✅ Node.js 18+
- ✅ MongoDB (محلي أو Atlas)
- ✅ npm أو yarn

### خطوات التثبيت

#### 1. تثبيت الحزم
```bash
npm install
```

#### 2. إعداد MongoDB
راجع [MONGODB_SETUP.md](MONGODB_SETUP.md) للحصول على دليل تفصيلي.

**الخيار السهل: MongoDB Atlas (مجاني)**
- سجل في: https://www.mongodb.com/cloud/atlas
- أنشئ Cluster مجاني
- احصل على Connection String

#### 3. إنشاء ملف البيئة
ملف `.env.local` موجود بالفعل، عدّل `MONGODB_URI` فقط:
```env
MONGODB_URI=your-mongodb-connection-string
```

#### 4. إنشاء البيانات التجريبية
```bash
npm run seed
```

#### 5. تشغيل المشروع
```bash
npm run dev
```

## 📁 هيكل المشروع

```
tamer-mahfouz-platform/
├── app/                    # صفحات التطبيق
│   ├── layout.tsx         # التخطيط الرئيسي
│   ├── page.tsx           # الصفحة الرئيسية
│   └── globals.css        # الأنماط العامة
├── components/            # المكونات القابلة لإعادة الاستخدام
│   ├── Header.tsx        # شريط التنقل
│   ├── Hero.tsx          # قسم البطل
│   ├── Features.tsx      # المميزات
│   ├── Courses.tsx       # الدورات
│   ├── Stats.tsx         # الإحصائيات
│   ├── Testimonials.tsx  # آراء الطلاب
│   ├── CTA.tsx           # دعوة للعمل
│   └── Footer.tsx        # التذييل
├── public/               # الملفات الثابتة
└── package.json          # تبعيات المشروع
```

## 🎨 التخصيص

### الألوان
يمكنك تخصيص الألوان من ملف `tailwind.config.ts`:
```typescript
colors: {
  primary: { ... },
  secondary: { ... }
}
```

### المحتوى
- عدّل محتوى الدورات في `components/Courses.tsx`
- عدّل آراء الطلاب في `components/Testimonials.tsx`
- عدّل المعلومات في `components/Footer.tsx`

## 📝 البناء للإنتاج

```bash
npm run build
npm start
```

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى فتح Issue أو Pull Request.

## 📄 الترخيص

جميع الحقوق محفوظة © 2024 مستر تامر محفوظ

## 📞 التواصل

- البريد الإلكتروني: info@tamermahfouz.com
- الهاتف: +20 123 456 7890

---

صُنع بـ ❤️ لتعليم البرمجة والذكاء الاصطناعي
