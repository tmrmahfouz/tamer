'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, Lightbulb, BookOpen, 
  Brain, Target, MessageSquare, Zap,
  ArrowRight
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConceptExplainer from '@/components/ConceptExplainer';
import AIRecommendations from '@/components/AIRecommendations';
import AIChatAssistant from '@/components/AIChatAssistant';

export default function AIToolsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'explainer' | 'recommendations' | 'chat'>('explainer');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success) setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: 'مساعد التعلم الذكي',
      description: 'تحدث مع المساعد الذكي للحصول على إجابات فورية',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Lightbulb,
      title: 'شرح المفاهيم',
      description: 'احصل على شرح مبسط لأي مفهوم برمجي',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Target,
      title: 'توصيات مخصصة',
      description: 'اقتراحات ذكية بناءً على تقدمك واهتماماتك',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: BookOpen,
      title: 'ملخصات تلقائية',
      description: 'ملخصات ذكية للدروس والدورات',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span>مدعوم بالذكاء الاصطناعي</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              أدوات التعلم الذكية
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              استخدم قوة الذكاء الاصطناعي لتسريع تعلمك وفهم المفاهيم بشكل أعمق
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('explainer')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'explainer'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            شرح المفاهيم
          </button>
          
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Target className="w-5 h-5" />
            التوصيات الذكية
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            المساعد الذكي
          </button>
        </div>

        {/* Tab Content */}
        <div className="mb-16">
          {activeTab === 'explainer' && (
            <div className="max-w-3xl mx-auto">
              <ConceptExplainer showSearch={true} />
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="max-w-3xl mx-auto">
              <AIRecommendations limit={10} showTitle={true} />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">المساعد الذكي</h3>
              <p className="text-gray-600 mb-6">
                المساعد الذكي متاح في جميع صفحات الدورات والدروس.
                <br />
                انقر على أيقونة الروبوت في الزاوية السفلية للبدء.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  تصفح الدورات
                </a>
                {user && (
                  <a
                    href="/student/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                    لوحة التحكم
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">كيف يعمل؟</h2>
            <p className="text-gray-600">خطوات بسيطة للاستفادة من أدوات الذكاء الاصطناعي</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2">اختر الأداة</h3>
              <p className="text-gray-600">حدد الأداة المناسبة لاحتياجك: شرح، ملخص، أو توصيات</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2">اطرح سؤالك</h3>
              <p className="text-gray-600">اكتب سؤالك أو المفهوم الذي تريد فهمه</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2">احصل على الإجابة</h3>
              <p className="text-gray-600">استلم إجابة مفصلة ومخصصة لمستواك</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* AI Chat Assistant - Always visible */}
      <AIChatAssistant />
    </div>
  );
}
