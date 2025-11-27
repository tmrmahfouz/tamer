'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, X, Minimize2, Maximize2, 
  Sparkles, Loader2, User, Copy, Check,
  BookOpen, Lightbulb, HelpCircle, MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  courseId?: string;
  lessonId?: string;
  courseTitle?: string;
  lessonTitle?: string;
}

export default function AIChatAssistant({
  courseId,
  lessonId,
  courseTitle,
  lessonTitle
}: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    { icon: BookOpen, label: 'لخص الدرس', prompt: 'لخص لي هذا الدرس' },
    { icon: Lightbulb, label: 'اشرح المفهوم', prompt: 'اشرح لي المفهوم الرئيسي' },
    { icon: HelpCircle, label: 'اختبرني', prompt: 'اختبرني في هذا الدرس' },
    { icon: MessageSquare, label: 'نصائح', prompt: 'أعطني نصائح للتعلم' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && messages.length === 0) {
      // Send initial greeting
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `مرحباً! 👋 أنا مساعدك الذكي للتعلم.\n\n${courseTitle ? `أنت في دورة "${courseTitle}"` : ''}${lessonTitle ? ` - درس "${lessonTitle}"` : ''}\n\nكيف يمكنني مساعدتك اليوم؟`,
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [isOpen, isMinimized, courseTitle, lessonTitle]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          courseId,
          lessonId,
          conversationHistory: messages.slice(-10)
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'عذراً، حدث خطأ. حاول مرة أخرى.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('## ')) {
          return <h3 key={i} className="font-bold text-lg mt-2 mb-1">{line.slice(3)}</h3>;
        }
        if (line.startsWith('### ')) {
          return <h4 key={i} className="font-semibold mt-2 mb-1">{line.slice(4)}</h4>;
        }
        // Bold
        if (line.includes('**')) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i} className="mb-1">
              {parts.map((part, j) => 
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </p>
          );
        }
        // List items
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <li key={i} className="mr-4">{line.slice(2)}</li>;
        }
        // Numbered list
        if (/^\d+\.\s/.test(line)) {
          return <li key={i} className="mr-4 list-decimal">{line.slice(line.indexOf(' ') + 1)}</li>;
        }
        // Empty line
        if (!line.trim()) {
          return <br key={i} />;
        }
        // Regular text
        return <p key={i} className="mb-1">{line}</p>;
      });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group z-50"
      >
        <Bot className="w-7 h-7" />
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          المساعد الذكي
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed left-6 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${
        isMinimized 
          ? 'bottom-6 w-72 h-14' 
          : 'bottom-6 w-96 h-[600px] max-h-[80vh]'
      }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">المساعد الذكي</h3>
            {!isMinimized && (
              <p className="text-xs text-white/70">مدعوم بالذكاء الاصطناعي</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'text-left' : 'text-right'}`}>
                  <div className={`p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {formatMessage(message.content)}
                    </div>
                  </div>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="mt-1 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                    >
                      {copied === message.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          نسخ
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">اختصارات سريعة:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                  >
                    <action.icon className="w-3 h-3" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
