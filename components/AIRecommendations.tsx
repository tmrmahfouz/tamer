'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, BookOpen, Target, Lightbulb, 
  Users, ChevronLeft, Loader2, RefreshCw,
  Star, TrendingUp, Clock
} from 'lucide-react';

interface Recommendation {
  type: 'course' | 'lesson' | 'action' | 'tip';
  title: string;
  description: string;
  link?: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  icon: string;
}

interface AIRecommendationsProps {
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export default function AIRecommendations({
  limit = 5,
  showTitle = true,
  compact = false
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [personalized, setPersonalized] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/recommendations');
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations?.slice(0, limit) || []);
        setPersonalized(data.personalized || false);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconStr: string) => {
    const icons: Record<string, any> = {
      '📚': BookOpen,
      '🎯': Target,
      '💡': Lightbulb,
      '👥': Users,
      '⭐': Star,
      '🛠️': Target,
    };
    return icons[iconStr] || Sparkles;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-r-4 border-r-red-500';
      case 'medium': return 'border-r-4 border-r-yellow-500';
      case 'low': return 'border-r-4 border-r-green-500';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl ${compact ? 'p-4' : 'p-6'} shadow-sm border`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl ${compact ? 'p-4' : 'p-6'} shadow-sm border`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">توصيات ذكية</h2>
              <p className="text-sm text-gray-500">
                {personalized ? 'مخصصة لك' : 'اقتراحات شائعة'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchRecommendations}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const Icon = getIcon(rec.icon);
          
          return (
            <div
              key={index}
              className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  rec.type === 'course' ? 'bg-indigo-100 text-indigo-600' :
                  rec.type === 'tip' ? 'bg-yellow-100 text-yellow-600' :
                  rec.type === 'action' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <span className="text-xs text-gray-400">{rec.reason}</span>
                </div>

                {rec.link && (
                  <Link
                    href={rec.link}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {personalized && (
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" />
            التوصيات تتحسن مع استمرارك في التعلم
          </p>
        </div>
      )}
    </div>
  );
}
