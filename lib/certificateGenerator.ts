// مولد الشهادات الاحترافي
// في الإنتاج، يمكن استخدام مكتبات مثل pdfkit أو puppeteer لتوليد PDF

export interface CertificateData {
  studentName: string
  courseName: string
  completionDate: Date
  certificateId: string
  instructorName: string
  grade?: number
}

// توليد QR Code للتحقق
export function generateQRCode(certificateId: string): string {
  // في الإنتاج، استخدم مكتبة مثل qrcode
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/certificates/verify/${certificateId}`
  return verificationUrl
}

// توليد محتوى الشهادة بصيغة HTML (للطباعة أو التحويل لـ PDF)
export function generateCertificateHTML(data: CertificateData): string {
  const qrCodeUrl = generateQRCode(data.certificateId)
  
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>شهادة إتمام</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .certificate {
      background: white;
      width: 1000px;
      padding: 60px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 10px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: white;
    }
    
    .title {
      font-size: 48px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 20px;
      color: #666;
      font-weight: 600;
    }
    
    .content {
      text-align: center;
      margin: 50px 0;
    }
    
    .awarded-to {
      font-size: 18px;
      color: #888;
      margin-bottom: 15px;
    }
    
    .student-name {
      font-size: 42px;
      font-weight: 700;
      color: #333;
      margin-bottom: 30px;
      border-bottom: 3px solid #667eea;
      display: inline-block;
      padding-bottom: 10px;
    }
    
    .description {
      font-size: 18px;
      color: #666;
      line-height: 1.8;
      max-width: 700px;
      margin: 0 auto 30px;
    }
    
    .course-name {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
      margin: 20px 0;
    }
    
    .grade {
      display: inline-block;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 15px 30px;
      border-radius: 50px;
      font-size: 24px;
      font-weight: 700;
      margin: 20px 0;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #eee;
    }
    
    .signature {
      text-align: center;
    }
    
    .signature-line {
      width: 200px;
      height: 2px;
      background: #333;
      margin: 20px auto 10px;
    }
    
    .signature-name {
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }
    
    .signature-title {
      font-size: 14px;
      color: #888;
    }
    
    .details {
      text-align: center;
    }
    
    .date {
      font-size: 16px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .certificate-id {
      font-size: 12px;
      color: #999;
      font-family: monospace;
    }
    
    .qr-code {
      text-align: center;
    }
    
    .qr-code img {
      width: 100px;
      height: 100px;
      border: 2px solid #eee;
      border-radius: 10px;
      padding: 5px;
    }
    
    .qr-text {
      font-size: 10px;
      color: #999;
      margin-top: 5px;
    }
    
    @media print {
      body {
        background: white;
      }
      
      .certificate {
        box-shadow: none;
        border: 2px solid #eee;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">🎓</div>
      <h1 class="title">شهادة إتمام</h1>
      <p class="subtitle">Certificate of Completion</p>
    </div>
    
    <div class="content">
      <p class="awarded-to">تُمنح هذه الشهادة إلى</p>
      <h2 class="student-name">${data.studentName}</h2>
      
      <p class="description">
        تقديراً لإتمامه بنجاح دورة
      </p>
      
      <h3 class="course-name">${data.courseName}</h3>
      
      ${data.grade ? `<div class="grade">التقدير: ${data.grade}%</div>` : ''}
      
      <p class="description">
        نشهد بأن الطالب قد أكمل جميع متطلبات الدورة بنجاح
        وأظهر التزاماً وتفانياً في التعلم
      </p>
    </div>
    
    <div class="footer">
      <div class="signature">
        <div class="signature-line"></div>
        <p class="signature-name">${data.instructorName}</p>
        <p class="signature-title">المدرب المعتمد</p>
      </div>
      
      <div class="details">
        <p class="date">
          تاريخ الإصدار: ${new Date(data.completionDate).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p class="certificate-id">ID: ${data.certificateId}</p>
      </div>
      
      <div class="qr-code">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrCodeUrl)}" alt="QR Code">
        <p class="qr-text">تحقق من الشهادة</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

// مشاركة على LinkedIn
export function getLinkedInShareUrl(certificateData: CertificateData): string {
  const certUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/certificates/${certificateData.certificateId}`
  const text = `أنا سعيد بإعلان إتمامي دورة "${certificateData.courseName}" من منصة مستر تامر محفوظ التعليمية! 🎓`
  
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}&title=${encodeURIComponent(text)}`
}

// مشاركة على Twitter
export function getTwitterShareUrl(certificateData: CertificateData): string {
  const certUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/certificates/${certificateData.certificateId}`
  const text = `أتممت للتو دورة "${certificateData.courseName}" 🎓 من @TamerMahfouz\n\n`
  
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(certUrl)}`
}

// مشاركة على Facebook
export function getFacebookShareUrl(certificateData: CertificateData): string {
  const certUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/certificates/${certificateData.certificateId}`
  
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certUrl)}`
}
