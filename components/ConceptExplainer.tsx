'use client';

import { useState, useEffect } from 'react';
import { 
  Lightbulb, Search, BookOpen, Code, 
  ChevronDown, ChevronUp, Loader2, Copy, Check,
  GraduationCap, Zap, Brain
} from 'lucide-react';

interface ExplanationResult {
  found: boolean;
  title: string;
  category?: string;
  level?: string;
  explanation: string;
  examples: string[];
  relatedConcepts: string[];
  availableLevels?: string[];
}

interface ConceptExplainerProps {
  initialConcept?: string;
  showSearch?: boolean;
  compact?: boolean;
}

export default function ConceptExplainer({
  initialConcept,
  showSearch = true,
  compact = false
}: ConceptExplainerProps) {
  const [query, setQuery] = useState(initialConcept || '');
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('beginner');
  const [availableConcepts, setAvailableConcepts] = useState<any[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  useEffect(() => {
    fetchAvailableConcepts();
    if (initialConcept) {
      explainConcept(initialConcept);
    }
  }, [initialConcept]);

  const fetchAvailableConcepts = async () => {
    try {
      const response = await fetch('/api/ai/explain');
      const data = await response.json();
      if (data.success) {
        setAvailableConcepts(data.concepts || []);
      }
    } catch (error) {
      console.error('Error fetching concepts:', error);
    }
  };

  const explainConcept = async (concept: string, level?: string) => {
    if (!concept.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          concept, 
          level: level || selectedLevel 
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
        if (data.level) setSelectedLevel(data.level);
      }
    } catch (error) {
      console.error('Error explaining concept:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    explainConcept(query);
  };

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return GraduationCap;
      case 'intermediate': return Zap;
      case 'advanced': return Brain;
      default: return BookOpen;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدئ';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'متقدم';
      default: return level;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h2 className="font-bold text-lg">شرح المفاهيم</h2>
          <p className="text-sm text-gray-500">اسأل عن أي مفهوم برمجي</p>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن مفهوم... (مثال: المتغيرات، الدوال، المصفوفات)"
              className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          
          {/* Quick concepts */}
          {availableConcepts.length > 0 && !result && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">مفاهيم متاحة:</p>
              <div className="flex flex-wrap gap-2">
                {availableConcepts.map((concept, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setQuery(concept.title);
                      explainConcept(concept.id);
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {concept.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Title & Category */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{result.title}</h3>
              {result.category && (
                <span className="text-sm text-gray-500">{result.category}</span>
              )}
            </div>
            {result.found && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                تم العثور
              </span>
            )}
          </div>

          {/* Level Selector */}
          {result.availableLevels && result.availableLevels.length > 1 && (
            <div className="flex gap-2">
              {result.availableLevels.map((level) => {
                const LevelIcon = getLevelIcon(level);
                return (
                  <button
                    key={level}
                    onClick={() => {
                      setSelectedLevel(level);
                      explainConcept(query, level);
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedLevel === level
                        ? 'bg-yellow-100 text-yellow-700 font-medium'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <LevelIcon className="w-4 h-4" />
                    {getLevelLabel(level)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Explanation */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.explanation}
            </p>
          </div>

          {/* Examples */}
          {result.examples && result.examples.length > 0 && (
            <div>
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center gap-2 text-gray-700 font-medium mb-2"
              >
                <Code className="w-5 h-5" />
                أمثلة برمجية ({result.examples.length})
                {showExamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showExamples && (
                <div className="space-y-2">
                  {result.examples.map((example, i) => (
                    <div key={i} className="relative group">
                      <pre className="p-3 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto font-mono">
                        {example}
                      </pre>
                      <button
                        onClick={() => copyCode(example, i)}
                        className="absolute top-2 left-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedCode === i ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Related Concepts */}
          {result.relatedConcepts && result.relatedConcepts.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">مفاهيم ذات صلة:</p>
              <div className="flex flex-wrap gap-2">
                {result.relatedConcepts.map((concept, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(concept);
                      explainConcept(concept);
                    }}
                    className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full text-sm transition-colors"
                  >
                    {concept}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear button */}
          <button
            onClick={() => {
              setResult(null);
              setQuery('');
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            بحث جديد
          </button>
        </div>
      )}
    </div>
  );
}
