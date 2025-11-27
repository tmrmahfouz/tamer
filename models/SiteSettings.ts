import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISiteSettings extends Document {
  // Site Identity
  siteName: string
  siteSlogan: string
  siteLogo: string
  siteDescription: string
  
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  
  // Contact Information
  contactEmail: string
  contactPhone: string
  contactAddress: string
  
  // Social Media Links
  facebookUrl: string
  youtubeUrl: string
  instagramUrl: string
  twitterUrl: string
  linkedinUrl: string
  
  // Page Contents
  homeHeroTitle: string
  homeHeroSubtitle: string
  homeAboutSection: string
  
  // Home Stats
  statsStudents: string
  statsCourses: string
  statsSatisfaction: string
  
  aboutPageContent: string
  
  privacyPolicyContent: string
  termsAndConditionsContent: string
  
  // Contact Page
  contactPageTitle: string
  contactPageDescription: string
  
  // Footer
  footerAboutText: string
  footerCopyright: string
  
  // Certificate Settings
  certificateTitle: string
  certificateSubtitle: string
  certificateIntroText: string
  certificateBodyText: string
  certificateFooterText: string
  certificateDirectorName: string
  certificateDirectorTitle: string
  certificateSignature: string
  certificateSealText: string
  certificateVerifyText: string
  
  // External Quiz Platform
  externalQuizPlatformEnabled: boolean
  externalQuizPlatformName: string
  externalQuizPlatformUrl: string
  
  createdAt: Date
  updatedAt: Date
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    // Site Identity
    siteName: {
      type: String,
      default: 'مستر تامر محفوظ',
    },
    siteSlogan: {
      type: String,
      default: 'البرمجة والذكاء الاصطناعي',
    },
    siteLogo: {
      type: String,
      default: '🎓',
    },
    siteDescription: {
      type: String,
      default: 'منصة تعليمية متخصصة في تعليم البرمجة والذكاء الاصطناعي',
    },
    
    // Colors
    primaryColor: {
      type: String,
      default: '#3B82F6', // blue-500
    },
    secondaryColor: {
      type: String,
      default: '#8B5CF6', // violet-500
    },
    accentColor: {
      type: String,
      default: '#10B981', // green-500
    },
    
    // Contact Information
    contactEmail: {
      type: String,
      default: 'info@tamermahfouz.com',
    },
    contactPhone: {
      type: String,
      default: '+20 123 456 7890',
    },
    contactAddress: {
      type: String,
      default: 'القاهرة، مصر',
    },
    
    // Social Media
    facebookUrl: {
      type: String,
      default: '#',
    },
    youtubeUrl: {
      type: String,
      default: '#',
    },
    instagramUrl: {
      type: String,
      default: '#',
    },
    twitterUrl: {
      type: String,
      default: '#',
    },
    linkedinUrl: {
      type: String,
      default: '#',
    },
    
    // Page Contents
    homeHeroTitle: {
      type: String,
      default: 'تعلم البرمجة والذكاء الاصطناعي',
    },
    homeHeroSubtitle: {
      type: String,
      default: 'ابدأ رحلتك في عالم التكنولوجيا مع أفضل الدورات التعليمية',
    },
    homeAboutSection: {
      type: String,
      default: 'نقدم دورات تعليمية احترافية في البرمجة والذكاء الاصطناعي بأسلوب عصري ومبسط',
    },
    
    // Home Stats
    statsStudents: {
      type: String,
      default: '500+',
    },
    statsCourses: {
      type: String,
      default: '15+',
    },
    statsSatisfaction: {
      type: String,
      default: '98%',
    },
    
    aboutPageContent: {
      type: String,
      default: `مرحباً! أنا **تامر محفوظ**، مهندس برمجيات ومتخصص في الذكاء الاصطناعي مع خبرة تزيد عن 5 سنوات في مجال تطوير البرمجيات والتعلم الآلي.

بدأت رحلتي في عالم البرمجة منذ سنوات، وتطورت مهاراتي لتشمل تطوير تطبيقات الويب والموبايل، وبناء نماذج الذكاء الاصطناعي، وتحليل البيانات.

شغفي الحقيقي هو **التعليم**. أؤمن بأن البرمجة والذكاء الاصطناعي يجب أن تكون متاحة للجميع، ولذلك أسعى لتبسيط المفاهيم المعقدة وتقديمها بطريقة سهلة ومفهومة.

من خلال هذه المنصة، أهدف إلى مساعدة الطلاب والمهتمين على تعلم البرمجة والذكاء الاصطناعي من الصفر حتى الاحتراف، مع التركيز على المشاريع العملية والتطبيقات الواقعية.

**رؤيتي**
أن أكون جزءاً من رحلة تعليمية تحويلية تمكّن الطلاب من تحقيق أحلامهم في عالم التكنولوجيا، وأن أساهم في بناء جيل من المبرمجين والمتخصصين في الذكاء الاصطناعي القادرين على صنع الفرق.`,
    },
    
    privacyPolicyContent: {
      type: String,
      default: `# سياسة الخصوصية

آخر تحديث: نوفمبر 2024

نحن في منصة مستر تامر محفوظ نلتزم بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك الشخصية واستخدامها وحمايتها.

## المعلومات التي نجمعها

### المعلومات الشخصية
- الاسم الكامل
- عنوان البريد الإلكتروني
- رقم الهاتف
- معلومات الدفع (تتم معالجتها بشكل آمن عبر بوابات دفع معتمدة)

### معلومات الاستخدام
- سجل الدورات والدروس المشاهدة
- تقدمك في الدورات
- نتائج الاختبارات والتقييمات
- معلومات تفاعلك مع المنصة

## كيف نستخدم معلوماتك

نستخدم المعلومات التي نجمعها من أجل:
- توفير وتحسين خدماتنا التعليمية
- التواصل معك بشأن الدورات والتحديثات
- معالجة المدفوعات والاشتراكات
- إرسال شهادات الإتمام
- تحسين تجربة المستخدم وتخصيص المحتوى
- ضمان أمان المنصة ومنع الاحتيال

## حماية معلوماتك

نتخذ إجراءات أمنية متقدمة لحماية معلوماتك الشخصية:
- تشفير SSL/TLS لجميع البيانات المنقولة
- تخزين آمن للبيانات في خوادم محمية
- وصول محدود للبيانات الشخصية
- مراقبة أمنية مستمرة

## مشاركة المعلومات

لن نقوم ببيع أو تأجير معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:
- مع موافقتك الصريحة
- لمعالجة الدفعات عبر بوابات الدفع الآمنة
- للامتثال للقوانين واللوائح
- لحماية حقوقنا وأمان مستخدمينا

## حقوقك

لديك الحق في:
- الوصول إلى معلوماتك الشخصية
- تعديل أو تحديث معلوماتك
- طلب حذف حسابك وبياناتك
- إلغاء الاشتراك في الرسائل التسويقية
- تقديم شكوى بخصوص معالجة بياناتك

## ملفات تعريف الارتباط (Cookies)

نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.

## التغييرات على سياسة الخصوصية

قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.

## الاتصال بنا

إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا عبر:
- البريد الإلكتروني: info@tamermahfouz.com
- الهاتف: +20 123 456 7890`,
    },
    
    termsAndConditionsContent: {
      type: String,
      default: `# الشروط والأحكام

آخر تحديث: نوفمبر 2024

مرحباً بك في منصة مستر تامر محفوظ التعليمية. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بالشروط والأحكام التالية.

## 1. قبول الشروط

باستخدام منصتنا، فإنك توافق على:
- الالتزام بجميع الشروط والأحكام المذكورة هنا
- احترام حقوق الملكية الفكرية
- استخدام المنصة للأغراض التعليمية فقط
- عدم إساءة استخدام المحتوى أو الخدمات

## 2. التسجيل والحساب

### إنشاء الحساب
- يجب أن تكون 13 عاماً على الأقل لإنشاء حساب
- يجب تقديم معلومات دقيقة وحديثة
- أنت مسؤول عن الحفاظ على سرية كلمة المرور
- يجب إخطارنا فوراً بأي استخدام غير مصرح به لحسابك

### مسؤوليات المستخدم
- عدم مشاركة بيانات الدخول مع الآخرين
- عدم إنشاء أكثر من حساب واحد
- تحديث معلوماتك الشخصية عند الحاجة

## 3. الدورات والمحتوى

### الوصول إلى المحتوى
- الوصول إلى الدورات المدفوعة يتطلب الدفع الكامل
- المحتوى متاح للاستخدام الشخصي فقط
- لا يجوز تحميل أو توزيع المحتوى دون إذن

### حقوق الملكية الفكرية
- جميع المحتويات محمية بحقوق الطبع والنشر
- لا يجوز نسخ أو توزيع أو بيع المحتوى
- المحتوى للاستخدام الشخصي غير التجاري فقط

## 4. الدفع والفوترة

### الأسعار
- جميع الأسعار معروضة بالجنيه المصري
- نحتفظ بالحق في تغيير الأسعار في أي وقت
- العروض الترويجية محدودة المدة

### المدفوعات
- الدفع مطلوب قبل الوصول إلى الدورة
- نقبل الدفع عبر بطاقات الائتمان والتحويل البنكي
- جميع المدفوعات نهائية وغير قابلة للاسترداد إلا في حالات محددة

### استرداد الأموال
- يمكن طلب استرداد الأموال خلال 7 أيام من الشراء
- الاسترداد متاح فقط إذا لم يتم مشاهدة أكثر من 20% من الدورة
- قد تستغرق عملية الاسترداد 7-14 يوم عمل

## 5. الشهادات

- الشهادات تصدر عند إتمام الدورة بنجاح
- يجب اجتياز جميع الاختبارات المطلوبة
- الشهادات معتمدة من منصتنا فقط

## 6. السلوك المقبول

يجب على المستخدمين:
- احترام المدرسين والطلاب الآخرين
- عدم نشر محتوى مسيء أو غير لائق
- عدم التحرش أو التنمر على الآخرين
- استخدام المنصة للأغراض التعليمية فقط

## 7. إنهاء الحساب

نحتفظ بالحق في:
- تعليق أو إنهاء حسابك لانتهاك الشروط
- إزالة المحتوى المخالف
- رفض الخدمة لأي شخص

## 8. إخلاء المسؤولية

- المحتوى التعليمي مقدم "كما هو"
- لا نضمن نتائج معينة من استخدام منصتنا
- لسنا مسؤولين عن أي أضرار غير مباشرة

## 9. التغييرات على الشروط

- نحتفظ بالحق في تعديل هذه الشروط في أي وقت
- سيتم إشعارك بالتغييرات الجوهرية
- استمرار استخدامك للمنصة يعني قبولك للشروط المحدثة

## 10. القانون المطبق

تخضع هذه الشروط لقوانين جمهورية مصر العربية.

## الاتصال بنا

لأي استفسارات حول الشروط والأحكام:
- البريد الإلكتروني: info@tamermahfouz.com
- الهاتف: +20 123 456 7890`,
    },
    
    contactPageTitle: {
      type: String,
      default: 'تواصل معنا',
    },
    contactPageDescription: {
      type: String,
      default: 'نحن هنا للإجابة على استفساراتك',
    },
    
    footerAboutText: {
      type: String,
      default: 'منصة تعليمية متخصصة في تعليم البرمجة والذكاء الاصطناعي بأسلوب عصري ومبسط',
    },
    footerCopyright: {
      type: String,
      default: 'مستر تامر محفوظ. جميع الحقوق محفوظة.',
    },
    
    // Certificate Settings
    certificateTitle: {
      type: String,
      default: 'شهادة إتمام',
    },
    certificateSubtitle: {
      type: String,
      default: 'Certificate of Completion',
    },
    certificateIntroText: {
      type: String,
      default: 'تشهد {platformName} بأن',
    },
    certificateBodyText: {
      type: String,
      default: 'قد أتمّ بنجاح جميع متطلبات الدورة التدريبية',
    },
    certificateFooterText: {
      type: String,
      default: 'وقد أظهر التزاماً واجتهاداً ملحوظاً في التعلم واستيعاب المحتوى التعليمي',
    },
    certificateDirectorName: {
      type: String,
      default: 'تامر محفوظ',
    },
    certificateDirectorTitle: {
      type: String,
      default: 'المدير التنفيذي',
    },
    certificateSignature: {
      type: String,
      default: '',
    },
    certificateSealText: {
      type: String,
      default: 'معتمد رسمياً',
    },
    certificateVerifyText: {
      type: String,
      default: 'للتحقق من صحة الشهادة',
    },
    
    // External Quiz Platform
    externalQuizPlatformEnabled: {
      type: Boolean,
      default: false,
    },
    externalQuizPlatformName: {
      type: String,
      default: 'منصة الاختبارات الخارجية',
    },
    externalQuizPlatformUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema)

export default SiteSettings
