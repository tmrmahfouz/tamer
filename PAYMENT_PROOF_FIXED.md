# ✅ إصلاح رفع إيصال الدفع

## 🔧 المشكلة:
كان الكود لا يحفظ صورة إيصال الدفع فعلياً، فقط يطبع اسم الملف في console.

---

## ✅ الحل المطبق:

### 1. **تحديث Payment Model**
أضفنا حقل `paymentProof` في:
- `models/Payment.ts`

```typescript
export interface IPayment extends Document {
  // ... الحقول الأخرى
  paymentProof?: string  // ✅ جديد
  // ...
}

const PaymentSchema = new Schema<IPayment>({
  // ... الحقول الأخرى
  paymentProof: String,  // ✅ جديد
  // ...
})
```

---

### 2. **تحديث API رفع الدفع**
في `app/api/payments/submit/route.ts`:

#### إضافة imports:
```typescript
import { writeFile } from 'fs/promises'
import path from 'path'
```

#### حفظ الصورة:
```typescript
// Handle payment proof upload
let paymentProofPath = ''
if (paymentProof && paymentProof.size > 0) {
  try {
    const bytes = await paymentProof.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create unique filename
    const timestamp = Date.now()
    const ext = path.extname(paymentProof.name)
    const filename = `payment-${decoded.userId}-${timestamp}${ext}`
    
    // Save to public/uploads/payments
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'payments')
    const filePath = path.join(uploadsDir, filename)
    
    // Create directory if it doesn't exist
    const fs = require('fs')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    await writeFile(filePath, buffer)
    paymentProofPath = `/uploads/payments/${filename}`
    
    console.log('✅ Payment proof saved:', paymentProofPath)
  } catch (uploadError) {
    console.error('❌ Error uploading payment proof:', uploadError)
  }
}

// Create payment record
const payment = await Payment.create({
  // ... الحقول الأخرى
  paymentProof: paymentProofPath,  // ✅ حفظ المسار
  // ...
})
```

---

### 3. **إنشاء مجلد التخزين**
```
public/
  └── uploads/
      └── payments/
          └── .gitkeep
```

---

## 📋 كيف يعمل النظام الآن:

### 1. **الطالب يرفع الإيصال:**
- يذهب لصفحة الدفع `/courses/[id]/checkout`
- يختار طريقة الدفع
- يرفع صورة الإيصال
- يضغط "إرسال طلب الدفع"

### 2. **النظام يحفظ الصورة:**
- يتم حفظ الصورة في `public/uploads/payments/`
- اسم الملف: `payment-{userId}-{timestamp}.{ext}`
- مثال: `payment-123abc-1700000000000.jpg`
- يتم حفظ المسار في قاعدة البيانات: `/uploads/payments/payment-123abc-1700000000000.jpg`

### 3. **Admin يشاهد الإيصال:**
- يذهب لـ `/dashboard/admin/payments`
- يضغط على أيقونة العين 👁️ لعرض التفاصيل
- يظهر modal به:
  - معلومات الطالب
  - معلومات الدورة
  - تفاصيل الدفع
  - **صورة الإيصال** ✅
  - زر تحميل الإيصال

### 4. **إذا لم يتم رفع إيصال:**
- يظهر رسالة: "لم يتم رفع إيصال الدفع" ⚠️

---

## 🔗 المسارات:

### صفحة الدفع:
```
/courses/[courseId]/checkout
```

### لوحة Admin:
```
/dashboard/admin/payments
```

### مجلد الصور:
```
public/uploads/payments/
```

---

## 🧪 اختبار النظام:

### 1. سجل دخول كطالب
### 2. اذهب لدورة
### 3. اضغط "اشترك الآن"
### 4. املأ بيانات الدفع
### 5. **ارفع صورة إيصال** ✅
### 6. اضغط "إرسال طلب الدفع"
### 7. سجل دخول كـ Admin
### 8. اذهب لـ Payments
### 9. اضغط على أيقونة العين 👁️
### 10. **ستظهر صورة الإيصال!** 🎉

---

## ⚠️ ملاحظات مهمة:

### 1. **الصور تُحفظ محلياً:**
- في بيئة الإنتاج، يُفضل استخدام:
  - AWS S3
  - Cloudinary
  - Google Cloud Storage

### 2. **أنواع الملفات المقبولة:**
- حالياً: `image/*` (جميع أنواع الصور)
- يمكن تحديدها: `image/jpeg, image/png, image/jpg`

### 3. **حجم الملف:**
- لا يوجد حد حالياً
- يُفضل إضافة حد (مثلاً 5MB)

### 4. **الأمان:**
- يتم التحقق من تسجيل الدخول
- اسم الملف يحتوي على userId و timestamp لتجنب التكرار
- الملفات في مجلد `public` يمكن الوصول إليها مباشرة

---

## 📊 الملفات المعدلة:

1. ✅ `models/Payment.ts` - إضافة حقل paymentProof
2. ✅ `app/api/payments/submit/route.ts` - حفظ الصورة
3. ✅ `public/uploads/payments/` - مجلد التخزين
4. ✅ `app/dashboard/admin/payments/page.tsx` - عرض الصورة (كان موجود)

---

## 🎉 النتيجة:

**الآن عند رفع إيصال الدفع:**
- ✅ يتم حفظ الصورة في السيرفر
- ✅ يتم حفظ المسار في قاعدة البيانات
- ✅ Admin يشاهد الصورة في لوحة التحكم
- ✅ يمكن تحميل الصورة

---

**آخر تحديث:** 23 نوفمبر 2025  
**الحالة:** ✅ تم الإصلاح بنجاح
