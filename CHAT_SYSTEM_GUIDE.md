# 💬 دليل نظام المحادثة المباشرة

## 🎯 نظرة عامة

نظام محادثة مباشرة متكامل بين المعلم والأدمن والطلاب مع دعم:
- محادثات فردية (1:1)
- محادثات جماعية
- محادثات الدعم الفني
- إشعارات فورية
- تتبع الرسائل المقروءة

---

## 🗂️ الهيكل

```
المحادثات
  ├── محادثات فردية (Direct)
  │   ├── طالب ↔ معلم
  │   ├── طالب ↔ أدمن
  │   └── معلم ↔ أدمن
  │
  ├── محادثات جماعية (Group)
  │   ├── مجموعة دورة
  │   └── مجموعة مشروع
  │
  └── محادثات الدعم (Support)
      └── طالب ↔ فريق الدعم
```

---

## 📊 Models

### **1. Conversation Model**

```typescript
{
  participants: [ObjectId],    // المشاركون
  type: String,                 // 'direct' | 'group' | 'support'
  title: String,                // عنوان المحادثة (للمجموعات)
  course: ObjectId,             // الدورة (اختياري)
  lastMessage: ObjectId,        // آخر رسالة
  lastMessageAt: Date,          // وقت آخر رسالة
  unreadCount: Map,             // عدد الرسائل غير المقروءة لكل مستخدم
}
```

### **2. Message Model**

```typescript
{
  conversation: ObjectId,       // المحادثة
  sender: ObjectId,             // المرسل
  content: String,              // المحتوى
  type: String,                 // 'text' | 'image' | 'file' | 'video'
  fileUrl: String,              // رابط الملف (اختياري)
  fileName: String,             // اسم الملف
  fileSize: Number,             // حجم الملف
  readBy: [{                    // قُرئت بواسطة
    user: ObjectId,
    readAt: Date
  }],
  isEdited: Boolean,            // معدلة؟
  isDeleted: Boolean,           // محذوفة؟
}
```

---

## 🔌 APIs

### **1. Get Conversations**
```
GET /api/conversations

Response:
{
  success: true,
  conversations: [
    {
      _id: "...",
      participants: [...],
      type: "direct",
      lastMessage: {...},
      lastMessageAt: "...",
      unreadCount: 3
    }
  ]
}
```

### **2. Create Conversation**
```
POST /api/conversations

Body:
{
  participantIds: ["userId1", "userId2"],
  type: "direct",
  title: "مجموعة الدورة",  // للمجموعات
  courseId: "..."             // اختياري
}

Response:
{
  success: true,
  conversation: {...},
  isExisting: false  // true إذا كانت موجودة مسبقاً
}
```

### **3. Get Messages**
```
GET /api/conversations/[id]/messages?page=1&limit=50

Response:
{
  success: true,
  messages: [...],
  pagination: {
    page: 1,
    limit: 50,
    total: 150,
    pages: 3
  }
}
```

### **4. Send Message**
```
POST /api/conversations/[id]/messages

Body:
{
  content: "مرحباً!",
  type: "text",
  fileUrl: "...",     // للملفات
  fileName: "...",
  fileSize: 1024
}

Response:
{
  success: true,
  message: "تم إرسال الرسالة بنجاح",
  data: {...}
}
```

---

## 🎨 واجهة المستخدم

### **صفحة المحادثات:**

```
┌──────────────────────────────────────────────────┐
│  💬 المحادثات                    [+ محادثة جديدة]│
├──────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────────────┐ │
│  │ 📋 القائمة     │  │ 💬 المحادثة           │ │
│  ├────────────────┤  ├────────────────────────┤ │
│  │ 👤 أحمد محمد   │  │ 👤 أحمد محمد          │ │
│  │ مرحباً! كيف... │  │ ┌──────────────────┐  │ │
│  │ 🔵 3  • 10:30  │  │ │ مرحباً!          │  │ │
│  │                │  │ │ 10:25            │  │ │
│  │ 👤 سارة علي    │  │ └──────────────────┘  │ │
│  │ شكراً لك       │  │                        │ │
│  │ ✓✓  • 09:15    │  │ ┌──────────────────┐  │ │
│  │                │  │ │ كيف يمكنني       │  │ │
│  │ 👥 مجموعة...  │  │ │ مساعدتك؟        │  │ │
│  │ تم إضافة...   │  │ │ 10:26            │  │ │
│  │ • أمس          │  │ └──────────────────┘  │ │
│  └────────────────┘  │                        │ │
│                      │ ┌──────────────────────┐│
│                      │ │ [اكتب رسالة...]  📎││
│                      │ └──────────────────────┘│
│                      └────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 🔔 الإشعارات

### **1. إشعار رسالة جديدة:**
```javascript
{
  type: 'new_message',
  title: 'رسالة جديدة من أحمد',
  body: 'مرحباً! كيف يمكنني...',
  conversationId: '...',
  senderId: '...'
}
```

### **2. Badge عدد الرسائل:**
```javascript
// في الـ Header
<MessageIcon />
<Badge>5</Badge>  // إجمالي الرسائل غير المقروءة
```

---

## 💡 حالات الاستخدام

### **1. طالب يسأل المعلم:**
```
1. الطالب يفتح صفحة المحادثات
2. يضغط "+ محادثة جديدة"
3. يختار المعلم من القائمة
4. يكتب السؤال ويرسل
5. المعلم يتلقى إشعار
6. المعلم يرد على السؤال
```

### **2. مجموعة دورة:**
```
1. المعلم ينشئ مجموعة للدورة
2. يضيف جميع الطلاب المسجلين
3. الطلاب يتواصلون مع بعض
4. المعلم يشارك الإعلانات
```

### **3. دعم فني:**
```
1. الطالب يفتح "الدعم الفني"
2. يكتب المشكلة
3. فريق الدعم يتلقى الطلب
4. يتم الرد خلال 24 ساعة
```

---

## 🎯 المميزات

### ✅ **للطالب:**
- التواصل المباشر مع المعلم
- طرح الأسئلة بسهولة
- الحصول على إجابات سريعة
- التواصل مع زملاء الدورة

### ✅ **للمعلم:**
- الرد على استفسارات الطلاب
- إنشاء مجموعات للدورات
- مشاركة الإعلانات
- متابعة تقدم الطلاب

### ✅ **للأدمن:**
- إدارة جميع المحادثات
- الدعم الفني
- حل المشاكل
- الإشراف على المحتوى

---

## 🔧 التطبيق

### **1. إنشاء صفحة المحادثات:**

```typescript
// app/chat/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send } from 'lucide-react'

export default function ChatPage() {
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const res = await fetch('/api/conversations')
    const data = await res.json()
    setConversations(data.conversations)
  }

  const loadMessages = async (convId) => {
    const res = await fetch(`/api/conversations/${convId}/messages`)
    const data = await res.json()
    setMessages(data.messages)
  }

  const sendMessage = async () => {
    await fetch(`/api/conversations/${selectedConv}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: newMessage })
    })
    setNewMessage('')
    loadMessages(selectedConv)
  }

  return (
    <div className="flex h-screen">
      {/* Conversations List */}
      <div className="w-1/3 border-r">
        {conversations.map(conv => (
          <div
            key={conv._id}
            onClick={() => {
              setSelectedConv(conv._id)
              loadMessages(conv._id)
            }}
            className="p-4 border-b cursor-pointer hover:bg-gray-50"
          >
            <div className="font-bold">{conv.participants[0].name}</div>
            <div className="text-sm text-gray-600">
              {conv.lastMessage?.content}
            </div>
            {conv.unreadCount > 0 && (
              <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs">
                {conv.unreadCount}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(msg => (
            <div
              key={msg._id}
              className={`mb-4 ${
                msg.sender._id === userId ? 'text-left' : 'text-right'
              }`}
            >
              <div className="inline-block bg-gray-100 rounded-lg p-3">
                <div className="text-sm font-bold">{msg.sender.name}</div>
                <div>{msg.content}</div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="اكتب رسالة..."
          />
          <button
            onClick={sendMessage}
            className="btn-primary"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 🚀 التحسينات المستقبلية

### **1. Real-time Updates:**
- استخدام WebSockets أو Socket.io
- تحديث فوري للرسائل
- إشعارات فورية

### **2. مميزات إضافية:**
- إرسال الصور والملفات
- الرموز التعبيرية
- الرد على رسالة محددة
- تثبيت المحادثات
- أرشفة المحادثات

### **3. البحث:**
- البحث في المحادثات
- البحث في الرسائل
- فلترة حسب النوع

---

## 🎉 الخلاصة

**نظام محادثة متكامل وسهل الاستخدام!** 💬

### **تم إنشاء:**
- ✅ نماذج Conversation و Message
- ✅ APIs كاملة
- ✅ نظام الإشعارات
- ✅ تتبع الرسائل المقروءة

### **الآن يمكنك:**
- ✅ إنشاء محادثات فردية وجماعية
- ✅ إرسال واستقبال الرسائل
- ✅ تتبع الرسائل غير المقروءة
- ✅ التواصل الفعال بين الجميع

---

**آخر تحديث:** 24 نوفمبر 2025  
**الإصدار:** 19.0.0  
**الحالة:** Ready to Use! ✅
