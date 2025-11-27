'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, Upload, Link, Github, Globe, Code, 
  FileText, Image, Video, Send, Save, X, Plus, Trash2,
  CheckCircle, Clock, AlertCircle, Star, Eye
} from 'lucide-react';

interface ProjectFile {
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'code' | 'link' | 'other';
  size?: number;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  files: ProjectFile[];
  liveUrl?: string;
  repoUrl?: string;
  technologies: string[];
  status: string;
  feedback?: {
    description: string;
    rating: number;
    strengths: string[];
    improvements: string[];
    reviewedAt: string;
  };
  revisionNotes?: string;
  isPublic: boolean;
}

interface ProjectSubmissionProps {
  courseId: string;
  lessonId?: string;
  assignmentId?: string;
  existingProject?: Project;
  onSubmit?: (project: Project) => void;
  onCancel?: () => void;
}

export default function ProjectSubmission({
  courseId,
  lessonId,
  assignmentId,
  existingProject,
  onSubmit,
  onCancel
}: ProjectSubmissionProps) {
  const [title, setTitle] = useState(existingProject?.title || '');
  const [description, setDescription] = useState(existingProject?.description || '');
  const [files, setFiles] = useState<ProjectFile[]>(existingProject?.files || []);
  const [liveUrl, setLiveUrl] = useState(existingProject?.liveUrl || '');
  const [repoUrl, setRepoUrl] = useState(existingProject?.repoUrl || '');
  const [technologies, setTechnologies] = useState<string[]>(existingProject?.technologies || []);
  const [newTech, setNewTech] = useState('');
  const [isPublic, setIsPublic] = useState(existingProject?.isPublic || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New file form
  const [showFileForm, setShowFileForm] = useState(false);
  const [newFile, setNewFile] = useState<ProjectFile>({ name: '', url: '', type: 'other' });

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-700', icon: FileText },
    submitted: { label: 'تم التسليم', color: 'bg-blue-100 text-blue-700', icon: Send },
    under_review: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    needs_revision: { label: 'يحتاج تعديل', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    approved: { label: 'مقبول', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    featured: { label: 'مميز', color: 'bg-purple-100 text-purple-700', icon: Star }
  };

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const addFile = () => {
    if (newFile.name && newFile.url) {
      setFiles([...files, newFile]);
      setNewFile({ name: '', url: '', type: 'other' });
      setShowFileForm(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSave = async (submit = false) => {
    if (!title.trim() || !description.trim()) {
      setError('العنوان والوصف مطلوبين');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = existingProject 
        ? `/api/projects/${existingProject._id}`
        : '/api/projects';
      
      const method = existingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          courseId,
          lessonId,
          assignmentId,
          files,
          liveUrl,
          repoUrl,
          technologies,
          isPublic
        })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في حفظ المشروع');
      }
      
      let project = data.project || data;

      // Submit if requested
      if (submit && project._id) {
        const submitResponse = await fetch(`/api/projects/${project._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'submit' })
        });
        
        if (submitResponse.ok) {
          const submitData = await submitResponse.json();
          project = submitData.project || submitData;
        }
      }

      onSubmit?.(project);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ المشروع');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'document': return FileText;
      case 'code': return Code;
      case 'link': return Link;
      default: return FileText;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {existingProject ? 'تعديل المشروع' : 'تسليم مشروع جديد'}
            </h2>
            {existingProject && (
              <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[existingProject.status]?.color}`}>
                {statusConfig[existingProject.status]?.label}
              </span>
            )}
          </div>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Feedback Display */}
      {existingProject?.feedback && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">تقييم المدرس</h3>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= existingProject.feedback!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <p className="text-gray-700 mb-3">{existingProject.feedback.description}</p>
          
          {existingProject.feedback.strengths?.length > 0 && (
            <div className="mb-2">
              <span className="text-green-700 font-medium">نقاط القوة: </span>
              <span className="text-gray-600">{existingProject.feedback.strengths.join('، ')}</span>
            </div>
          )}
          
          {existingProject.feedback.improvements?.length > 0 && (
            <div>
              <span className="text-orange-700 font-medium">نقاط التحسين: </span>
              <span className="text-gray-600">{existingProject.feedback.improvements.join('، ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Revision Notes */}
      {existingProject?.revisionNotes && existingProject.status === 'needs_revision' && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-2">ملاحظات التعديل المطلوبة</h3>
          <p className="text-gray-700">{existingProject.revisionNotes}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عنوان المشروع *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: تطبيق إدارة المهام"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            وصف المشروع *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اشرح فكرة المشروع وما تعلمته أثناء تنفيذه..."
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="w-4 h-4 inline ml-1" />
              رابط المعاينة المباشرة
            </label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://myproject.vercel.app"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Github className="w-4 h-4 inline ml-1" />
              رابط المستودع
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التقنيات المستخدمة
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1"
              >
                {tech}
                <button onClick={() => removeTechnology(tech)} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
              placeholder="React, Node.js, MongoDB..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={addTechnology}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ملفات المشروع
          </label>
          
          {files.length > 0 && (
            <div className="space-y-2 mb-3">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                          {file.url.substring(0, 50)}...
                        </a>
                      </div>
                    </div>
                    <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {showFileForm ? (
            <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
              <input
                type="text"
                value={newFile.name}
                onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                placeholder="اسم الملف"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="url"
                value={newFile.url}
                onChange={(e) => setNewFile({ ...newFile, url: e.target.value })}
                placeholder="رابط الملف"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <select
                value={newFile.type}
                onChange={(e) => setNewFile({ ...newFile, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="image">صورة</option>
                <option value="video">فيديو</option>
                <option value="document">مستند</option>
                <option value="code">كود</option>
                <option value="link">رابط</option>
                <option value="other">أخرى</option>
              </select>
              <div className="flex gap-2">
                <button onClick={addFile} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  إضافة
                </button>
                <button onClick={() => setShowFileForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowFileForm(true)}
              className="w-full p-4 border-2 border-dashed rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-300 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              إضافة ملف أو رابط
            </button>
          )}
        </div>

        {/* Public Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium">مشروع عام</p>
              <p className="text-sm text-gray-500">السماح للآخرين بمشاهدة مشروعك في المعرض</p>
            </div>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            حفظ كمسودة
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading ? 'جاري الإرسال...' : 'تسليم المشروع'}
          </button>
        </div>
      </div>
    </div>
  );
}
