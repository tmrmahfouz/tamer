'use client';

import { useState } from 'react';
import { 
  Star, CheckCircle, AlertCircle, Award, X, 
  Plus, Trash2, Send, FileText, ExternalLink, Github
} from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  student: {
    _id: string;
    name: string;
    image?: string;
  };
  files: any[];
  liveUrl?: string;
  repoUrl?: string;
  technologies: string[];
  status: string;
  submittedAt?: string;
  revisionCount: number;
}

interface ProjectReviewProps {
  project: Project;
  onReviewComplete: (project: Project) => void;
  onClose: () => void;
}

export default function ProjectReview({
  project,
  onReviewComplete,
  onClose
}: ProjectReviewProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState('');
  const [newImprovement, setNewImprovement] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [status, setStatus] = useState<'approved' | 'needs_revision' | 'featured'>('approved');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addStrength = () => {
    if (newStrength.trim()) {
      setStrengths([...strengths, newStrength.trim()]);
      setNewStrength('');
    }
  };

  const addImprovement = () => {
    if (newImprovement.trim()) {
      setImprovements([...improvements, newImprovement.trim()]);
      setNewImprovement('');
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('يرجى تحديد التقييم');
      return;
    }
    if (!description.trim()) {
      setError('يرجى كتابة ملاحظات التقييم');
      return;
    }
    if (status === 'needs_revision' && !revisionNotes.trim()) {
      setError('يرجى كتابة ملاحظات التعديل المطلوبة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          status,
          feedback: {
            description,
            rating,
            strengths,
            improvements,
            revisionNotes: status === 'needs_revision' ? revisionNotes : undefined
          }
        })
      });

      if (!response.ok) throw new Error('فشل في إرسال التقييم');

      const updated = await response.json();
      onReviewComplete(updated);
    } catch (err) {
      setError('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">مراجعة المشروع</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Project Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-lg mb-2">{project.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{project.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">
                الطالب: <span className="font-medium text-gray-700">{project.student?.name}</span>
              </span>
              {project.submittedAt && (
                <span className="text-gray-500">
                  تاريخ التسليم: {new Date(project.submittedAt).toLocaleDateString('ar-SA')}
                </span>
              )}
              {project.revisionCount > 0 && (
                <span className="text-orange-600">
                  عدد المراجعات: {project.revisionCount}
                </span>
              )}
            </div>

            {/* Links */}
            <div className="flex gap-3 mt-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  معاينة
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:underline"
                >
                  <Github className="w-4 h-4" />
                  الكود
                </a>
              )}
              {project.files?.length > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  {project.files.length} ملفات
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التقييم العام *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="mr-2 text-gray-600">
                {rating > 0 && ['ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'][rating - 1]}
              </span>
            </div>
          </div>

          {/* Feedback Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات التقييم *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب ملاحظاتك على المشروع..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Strengths */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نقاط القوة
            </label>
            {strengths.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {strengths.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                    {s}
                    <button onClick={() => setStrengths(strengths.filter((_, idx) => idx !== i))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                placeholder="أضف نقطة قوة..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={addStrength} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Improvements */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نقاط التحسين
            </label>
            {improvements.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {improvements.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1">
                    {s}
                    <button onClick={() => setImprovements(improvements.filter((_, idx) => idx !== i))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImprovement())}
                placeholder="أضف نقطة تحسين..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={addImprovement} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Decision */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              القرار
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setStatus('approved')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
                  status === 'approved' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <CheckCircle className={`w-8 h-8 ${status === 'approved' ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={status === 'approved' ? 'text-green-700 font-medium' : 'text-gray-600'}>
                  قبول
                </span>
              </button>
              
              <button
                onClick={() => setStatus('needs_revision')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
                  status === 'needs_revision' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <AlertCircle className={`w-8 h-8 ${status === 'needs_revision' ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className={status === 'needs_revision' ? 'text-orange-700 font-medium' : 'text-gray-600'}>
                  يحتاج تعديل
                </span>
              </button>
              
              <button
                onClick={() => setStatus('featured')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
                  status === 'featured' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <Award className={`w-8 h-8 ${status === 'featured' ? 'text-purple-500' : 'text-gray-400'}`} />
                <span className={status === 'featured' ? 'text-purple-700 font-medium' : 'text-gray-600'}>
                  مميز
                </span>
              </button>
            </div>
          </div>

          {/* Revision Notes */}
          {status === 'needs_revision' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات التعديل المطلوبة *
              </label>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="اشرح التعديلات المطلوبة من الطالب..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
