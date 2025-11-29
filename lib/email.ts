import nodemailer from 'nodemailer'

// Create transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in environment variables.')
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.log('Email would be sent to:', options.to)
    console.log('Subject:', options.subject)
    return false
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  siteName: string = 'المنصة التعليمية'
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎓 ${siteName}</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">إعادة تعيين كلمة المرور</h2>
          <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
            مرحباً،
            <br><br>
            لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.8;">
            إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.
            <br><br>
            هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            إذا لم يعمل الزر، انسخ الرابط التالي والصقه في المتصفح:
            <br>
            <a href="${resetUrl}" style="color: #3B82F6; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} ${siteName}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `إعادة تعيين كلمة المرور - ${siteName}`,
    html,
  })
}
