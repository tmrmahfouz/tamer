'use client';

import { useState } from 'react';
import { 
  FileText, Loader2, RefreshCw, Copy, Check,
  BookOpen, List, Clock, Sparkles
} from 'lucide-react';

interface SummaryResult {
  summary: string;
  keyPoints?: string[];
  concepts?: string[];
  duration?: string;
}

interface AISummaryProps {
  lessonId?: string;
  courseId?: string;
  type: 'lesson' | 'course';
  title?: string;
  autoLoad?: boolean;
}

export default function AISummary({
  lessonId,
  courseId,
  type,
  title,
  autoLoad = false
}: AISummaryProps) {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          courseId,
          type
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
        setExpanded(true);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!expanded && !result) {
    return (
      <button
        onClick={generateSummary}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? 'جاري التوليد...' : `ملخص ${type === 'lesson' ? 'الدرس' : 'الدورة'} بالذكاء الاصطناعي`}
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">
            ملخص {type === 'lesson' ? 'الدرس' : 'الدورة'} بالذكاء الاصطناعي
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateSummary}
            disabled={loading}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="إعادة التوليد"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="نسخ"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-gray-600">جاري توليد الملخص...</p>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Summary Text */}
            <div className="prose prose-sm max-w-none">
              {result.summary.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h3 key={i} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line.slice(3)}</h3>;
                }
                if (line.startsWith('### ')) {
                  return <h4 key={i} className="font-semibold text-gray-800 mt-3 mb-1">{line.slice(4)}</h4>;
                }
                if (line.startsWith('• ') || line.startsWith('- ')) {
                  return <li key={i} className="text-gray-700 mr-4">{line.slice(2)}</li>;
                }
                if (/^\d+\.\s/.test(line)) {
                  return <li key={i} className="text-gray-700 mr-4 list-decimal">{line.slice(line.indexOf(' ') + 1)}</li>;
                }
                if (!line.trim()) return <br key={i} />;
                return <p key={i} className="text-gray-700 mb-2">{line}</p>;
              })}
            </div>

            {/* Key Points */}
            {result.keyPoints && result.keyPoints.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <List className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-gray-800">النقاط الرئيسية</span>
                </div>
                <ul className="space-y-1">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-indigo-500 mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concepts */}
            {result.concepts && result.concepts.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-gray-800">المفاهيم المغطاة</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.concepts.map((concept, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            {result.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{result.duration}</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
