'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FolderOpen, Plus, ArrowRight,
  Clock, CheckCircle, AlertCircle, Star, Award,
  Eye, FileText
} from 'lucide-react';
import ProjectSubmission from '@/components/ProjectSubmission';
import ProjectGallery from '@/components/ProjectGallery';
import ProjectReview from '@/components/ProjectReview';

interface Project {
  _id: string;
  title: string;
  description: string;
  student: any;
  status: string;
  submittedAt?: string;
  files: any[];
  liveUrl?: string;
  repoUrl?: string;
  technologies: string[];
  feedback?: any;
  revisionCount: number;
  isPublic: boolean;
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  instructor: {
    _id: string;
    name: string;
  };
}

export default function CourseProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gallery' | 'my-projects' | 'pending'>('gallery');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course
      const courseRes = await fetch(`/api/courses/${courseId}`);
      const courseData = await courseRes.json();
      const courseInfo = courseData.course || courseData;
      setCourse(courseInfo);

      // Fetch current user
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userResponse = await userRes.json();
        if (userResponse.success && userResponse.user) {
          const userData = userResponse.user;
          setUser(userData);
          const userId = userData._id || userData.id;
          
          setIsInstructor(
            userId === courseInfo.instructor?._id || 
            userId === courseInfo.instructor?.id ||
            String(userId) === String(courseInfo.instructor) ||
            userData.role === 'admin' ||
            userData.role === 'instructor'
          );

          // Fetch my projects
          const myProjectsRes = await fetch(`/api/projects?courseId=${courseId}&studentId=${userId}`);
          const myProjectsData = await myProjectsRes.json();
          setMyProjects(myProjectsData.projects || []);

          // Fetch pending projects (for instructors)
          if (userId === courseInfo.instructor?._id || 
              userId === courseInfo.instructor?.id || 
              String(userId) === String(courseInfo.instructor) ||
              userData.role === 'admin') {
            const pendingRes = await fetch(`/api/projects?courseId=${courseId}&status=submitted`);
            const pendingData = await pendingRes.json();
            setPendingProjects(pendingData.projects || []);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = () => {
    setShowSubmitForm(false);
    setEditingProject(null);
    fetchData();
  };

  const handleReviewComplete = () => {
    setReviewingProject(null);
    fetchData();
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-700', icon: FileText },
    submitted: { label: 'تم التسليم', color: 'bg-blue-100 text-blue-700', icon: Clock },
    under_review: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
    needs_revision: { label: 'يحتاج تعديل', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    approved: { label: 'مقبول', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    featured: { label: 'مميز', color: 'bg-purple-100 text-purple-700', icon: Award }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للدورة
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">مشاريع الدورة</h1>
                <p className="text-gray-600">{course?.title}</p>
              </div>
            </div>
            
            {user && (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                تسليم مشروع
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'gallery'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                معرض المشاريع
              </div>
            </button>
            
            {user && (
              <button
                onClick={() => setActiveTab('my-projects')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'my-projects'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  مشاريعي
                  {myProjects.length > 0 && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-sm">
                      {myProjects.length}
                    </span>
                  )}
                </div>
              </button>
            )}
            
            {isInstructor && (
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  بانتظار المراجعة
                  {pendingProjects.length > 0 && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {pendingProjects.length}
                    </span>
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <ProjectGallery courseId={courseId} />
        )}

        {/* My Projects Tab */}
        {activeTab === 'my-projects' && (
          <div>
            {myProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">لم تقم بتسليم أي مشروع بعد</h3>
                <p className="text-gray-500 mb-4">ابدأ بتسليم مشروعك الأول</p>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  تسليم مشروع
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myProjects.map(project => {
                  const statusInfo = statusConfig[project.status];
                  const StatusIcon = statusInfo?.icon || FileText;
                  
                  return (
                    <div key={project._id} className="bg-white rounded-xl border p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold">{project.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${statusInfo?.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo?.label}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          
                          {project.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.technologies.map((tech, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-sm text-gray-500">
                            تم الإنشاء: {new Date(project.createdAt).toLocaleDateString('ar-SA')}
                            {project.submittedAt && (
                              <span className="mr-4">
                                تم التسليم: {new Date(project.submittedAt).toLocaleDateString('ar-SA')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {(project.status === 'draft' || project.status === 'needs_revision') && (
                            <button
                              onClick={() => setEditingProject(project)}
                              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                            >
                              تعديل
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Feedback */}
                      {project.feedback && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-blue-800">تقييم المدرس:</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= project.feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{project.feedback.description}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pending Review Tab (Instructor) */}
        {activeTab === 'pending' && isInstructor && (
          <div>
            {pendingProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600">لا توجد مشاريع بانتظار المراجعة</h3>
                <p className="text-gray-500">جميع المشاريع تمت مراجعتها</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProjects.map(project => (
                  <div key={project._id} className="bg-white rounded-xl border p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{project.title}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            بانتظار المراجعة
                          </span>
                          {project.revisionCount > 0 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                              مراجعة #{project.revisionCount + 1}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>الطالب: {project.student?.name}</span>
                          {project.submittedAt && (
                            <span>تاريخ التسليم: {new Date(project.submittedAt).toLocaleDateString('ar-SA')}</span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setReviewingProject(project)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        مراجعة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit/Edit Modal */}
      {(showSubmitForm || editingProject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectSubmission
              courseId={courseId}
              existingProject={editingProject || undefined}
              onSubmit={handleProjectSubmit}
              onCancel={() => {
                setShowSubmitForm(false);
                setEditingProject(null);
              }}
            />
          </div>
        </div>
      )}

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
