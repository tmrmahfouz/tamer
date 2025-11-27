'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, Heart, MessageCircle, Eye, ExternalLink, 
  Github, Star, Filter, Search, ChevronLeft, ChevronRight,
  Award, Clock, CheckCircle, User
} from 'lucide-react';

interface ProjectFile {
  name: string;
  url: string;
  type: string;
}

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
    thumbnail?: string;
  };
  files: ProjectFile[];
  liveUrl?: string;
  repoUrl?: string;
  technologies: string[];
  status: string;
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
  feedback?: {
    rating: number;
  };
}

interface ProjectGalleryProps {
  courseId?: string;
  showFilters?: boolean;
  featured?: boolean;
  limit?: number;
}

export default function ProjectGallery({
  courseId,
  showFilters = true,
  featured = false,
  limit
}: ProjectGalleryProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [allTechnologies, setAllTechnologies] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [courseId, featured, page, selectedTech]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        public: 'true',
        page: page.toString(),
        limit: (limit || 12).toString()
      });
      
      if (courseId) params.append('courseId', courseId);
      if (featured) params.append('featured', 'true');
      
      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();
      
      setProjects(data.projects || []);
      setTotalPages(data.pagination?.pages || 1);
      
      // Extract all technologies
      const techs = new Set<string>();
      data.projects?.forEach((p: Project) => {
        p.technologies?.forEach(t => techs.add(t));
      });
      setAllTechnologies(Array.from(techs));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });
      
      if (response.ok) {
        const updated = await response.json();
        setProjects(projects.map(p => p._id === projectId ? updated : p));
        if (selectedProject?._id === projectId) {
          setSelectedProject(updated);
        }
      }
    } catch (error) {
      console.error('Error liking project:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTech = !selectedTech || 
      project.technologies?.includes(selectedTech);
    
    return matchesSearch && matchesTech;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      approved: { label: 'مقبول', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      featured: { label: 'مميز', color: 'bg-purple-100 text-purple-700', icon: Award }
    };
    
    const statusInfo = config[status];
    if (!statusInfo) return null;
    
    const Icon = statusInfo.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${statusInfo.color}`}>
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </span>
    );
  };

  const getThumbnail = (project: Project) => {
    const imageFile = project.files?.find(f => f.type === 'image');
    if (imageFile) return imageFile.url;
    if (project.course?.thumbnail) return project.course.thumbnail;
    return '/images/project-placeholder.jpg';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      {showFilters && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المشاريع..."
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {allTechnologies.length > 0 && (
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">كل التقنيات</option>
              {allTechnologies.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">لا توجد مشاريع</h3>
          <p className="text-gray-500">لم يتم العثور على مشاريع مطابقة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project._id}
              className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedProject(project)}
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={getThumbnail(project)}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/project-placeholder.jpg';
                  }}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  {getStatusBadge(project.status)}
                </div>
                {project.feedback?.rating && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{project.feedback.rating}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                
                {/* Technologies */}
                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.technologies.slice(0, 3).map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                  {project.student?.image ? (
                    <img src={project.student.image} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <span className="text-sm text-gray-600">{project.student?.name}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className={`w-4 h-4 ${project.likes?.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                      {project.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {project.comments?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {project.views || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-gray-600">
            صفحة {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onLike={() => handleLike(selectedProject._id)}
        />
      )}
    </div>
  );
}

// Project Detail Modal
function ProjectModal({ 
  project, 
  onClose, 
  onLike 
}: { 
  project: Project; 
  onClose: () => void;
  onLike: () => void;
}) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleComment = async () => {
    if (!comment.trim()) return;
    
    setSubmitting(true);
    try {
      await fetch(`/api/projects/${project._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', content: comment })
      });
      setComment('');
      // Refresh would be needed here
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        {project.files?.find(f => f.type === 'image') && (
          <div className="h-64 bg-gray-100">
            <img
              src={project.files.find(f => f.type === 'image')!.url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Title & Status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
              <div className="flex items-center gap-3">
                {project.student?.image ? (
                  <img src={project.student.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <span className="font-medium">{project.student?.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-sm">
                  {new Date(project.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{project.description}</p>

          {/* Technologies */}
          {project.technologies?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">التقنيات المستخدمة</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex gap-4 mb-6">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <ExternalLink className="w-4 h-4" />
                معاينة المشروع
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                <Github className="w-4 h-4" />
                الكود المصدري
              </a>
            )}
          </div>

          {/* Rating */}
          {project.feedback?.rating && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-semibold">تقييم المدرس:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= project.feedback!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 py-4 border-t border-b mb-6">
            <button
              onClick={onLike}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500"
            >
              <Heart className={`w-5 h-5 ${project.likes?.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
              <span>{project.likes?.length || 0} إعجاب</span>
            </button>
            <span className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-5 h-5" />
              {project.comments?.length || 0} تعليق
            </span>
            <span className="flex items-center gap-2 text-gray-600">
              <Eye className="w-5 h-5" />
              {project.views || 0} مشاهدة
            </span>
          </div>

          {/* Comments */}
          <div>
            <h3 className="font-semibold mb-4">التعليقات</h3>
            
            {/* Add Comment */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="أضف تعليقاً..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleComment}
                disabled={submitting || !comment.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                إرسال
              </button>
            </div>

            {/* Comments List */}
            {project.comments?.length > 0 ? (
              <div className="space-y-3">
                {project.comments.map((c, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.user?.name || 'مستخدم'}</p>
                      <p className="text-gray-600">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد تعليقات بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
