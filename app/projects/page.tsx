'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderOpen, Award, TrendingUp, Clock, 
  ArrowRight, Sparkles
} from 'lucide-react';
import ProjectGallery from '@/components/ProjectGallery';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'recent'>('all');

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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span>معرض مشاريع الطلاب</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              اكتشف إبداعات طلابنا
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              تصفح المشاريع المميزة التي أنجزها طلابنا وشاركهم التقدير والتعليقات
            </p>
            
            {user && (
              <Link
                href="/student/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <FolderOpen className="w-5 h-5" />
                مشاريعي
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-gray-600">مشروع منجز</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">50+</p>
              <p className="text-gray-600">مشروع مميز</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">95%</p>
              <p className="text-gray-600">نسبة القبول</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              جميع المشاريع
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'featured'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              المشاريع المميزة
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              الأحدث
            </div>
          </button>
        </div>

        {/* Projects Gallery */}
        <ProjectGallery 
          featured={activeTab === 'featured'}
          showFilters={true}
        />
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">هل أنت مستعد لعرض مشروعك؟</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            انضم إلى دوراتنا وابدأ في بناء مشاريع حقيقية تضيفها إلى معرض أعمالك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              تصفح الدورات
            </Link>
            {!user && (
              <Link
                href="/register"
                className="px-8 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                إنشاء حساب
              </Link>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
