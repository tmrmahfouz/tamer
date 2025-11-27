'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, Clock, CheckCircle, AlertCircle, Award,
  Eye, Star, ChevronLeft, Filter, Search
} from 'lucide-react';
import ProjectReview from './ProjectReview';

interface Project {
  _id: string;
  title: string;
  description: string;
  student: {
    _id: string;
    name: string;
    image?: string;
  };
  course: {
    _id: string;
    title: string;
  };
  status: string;
  submittedAt?: string;
  files: any[];
  liveUrl?: string;
  repoUrl?: string;
  technologies: string[];
  feedback?: any;
  revisionCount: number;
  createdAt: string;
}

interface InstructorProjectsPanelProps {
  instructorId?: string;
}

export default function InstructorProjectsPanel({ instructorId }: InstructorProjectsPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);

  const statusOptions = [
    { value: 'submitted', label: 'بانتظار المراجعة', icon: Clock, color: 'text-blue-600' },
    { value: 'under_review', label: 'قيد المراجعة', icon: Eye, color: 'text-yellow-600' },
    { value: 'needs_revision', label: 'يحتاج تعديل', icon: AlertCircle, color: 'text-orange-600' },
    { value: 'approved', label: 'مقبول', icon: CheckCircle, color: 'text-green-600' },
    { value: 'featured', label: 'مميز', icon: Award, color: 'text-purple-600' },
    { value: '', label: 'الكل', icon: FolderOpen, color: 'text-gray-600' }
  ];

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter) params.append('status', filter);
      
      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewComplete = () => {
    setReviewingProject(null);
    fetchProjects();
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    return (
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-700' },
      submitted: { label: 'بانتظار المراجعة', color: 'bg-blue-100 text-blue-700' },
      under_review: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
      needs_revision: { label: 'يحتاج تعديل', color: 'bg-orange-100 text-orange-700' },
      approved: { label: 'مقبول', color: 'bg-green-100 text-green-700' },
      featured: { label: 'مميز', color: 'bg-purple-100 text-purple-700' }
    };
    
    const statusInfo = config[status] || config.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const pendingCount = projects.filter(p => p.status === 'submitted').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">إدارة المشاريع</h2>
              {pendingCount > 0 && (
                <p className="text-sm text-orange-600">
                  {pendingCount} مشروع بانتظار المراجعة
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان أو اسم الطالب..."
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                    filter === option.value
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${option.color}`} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="divide-y">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد مشاريع</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{project.title}</h3>
                    {getStatusBadge(project.status)}
                    {project.revisionCount > 0 && (
                      <span className="text-xs text-gray-500">
                        (مراجعة #{project.revisionCount})
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">الطالب:</span>
                      {project.student?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">الدورة:</span>
                      {project.course?.title}
                    </span>
                    {project.submittedAt && (
                      <span>
                        {new Date(project.submittedAt).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {(project.status === 'submitted' || project.status === 'under_review') && (
                    <button
                      onClick={() => setReviewingProject(project)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      مراجعة
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {reviewingProject && (
        <ProjectReview
          project={reviewingProject}
          onReviewComplete={handleReviewComplete}
          onClose={() => setReviewingProject(null)}
        />
      )}
    </div>
  );
}
