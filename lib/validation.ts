// مكتبة التحقق من البيانات

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف واحد على الأقل' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل' }
  }
  return { valid: true }
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/
  return phoneRegex.test(phone)
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

export const validateCourseData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 3) {
    errors.push('عنوان الدورة يجب أن يكون 3 أحرف على الأقل')
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('وصف الدورة يجب أن يكون 10 أحرف على الأقل')
  }

  if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
    errors.push('السعر يجب أن يكون رقم صحيح')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const validateLessonData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 3) {
    errors.push('عنوان الدرس يجب أن يكون 3 أحرف على الأقل')
  }

  if (!['video', 'pdf', 'text', 'quiz'].includes(data.type)) {
    errors.push('نوع الدرس غير صحيح')
  }

  if (data.type === 'video' && !data.content?.videoUrl) {
    errors.push('رابط الفيديو مطلوب')
  }

  if (data.type === 'pdf' && !data.content?.pdfUrl) {
    errors.push('رابط PDF مطلوب')
  }

  if (data.type === 'text' && !data.content?.textContent) {
    errors.push('المحتوى النصي مطلوب')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
