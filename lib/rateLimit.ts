// Rate Limiting للحماية من الهجمات

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export const rateLimit = (
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } => {
  const now = Date.now()
  const record = store[identifier]

  // إذا لم يكن هناك سجل أو انتهت المدة
  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return { allowed: true, remaining: maxRequests - 1 }
  }

  // إذا تجاوز الحد
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  // زيادة العداد
  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

// تنظيف السجلات القديمة كل 5 دقائق
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)
