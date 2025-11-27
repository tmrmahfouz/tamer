import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectFile {
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'code' | 'link' | 'other';
  size?: number;
}

export interface IProjectFeedback {
  odescription: string;
  rating: number;
  strengths: string[];
  improvements: string[];
  reviewedBy: mongoose.Types.ObjectId;
  reviewedAt: Date;
}

export interface IProjectComment {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IProject extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  
  // Project Details
  files: IProjectFile[];
  liveUrl?: string;
  repoUrl?: string;
  technologies: string[];
  
  // Status
  status: 'draft' | 'submitted' | 'under_review' | 'needs_revision' | 'approved' | 'featured';
  submittedAt?: Date;
  
  // Review & Feedback
  feedback?: IProjectFeedback;
  revisionNotes?: string;
  revisionCount: number;
  
  // Community
  isPublic: boolean;
  likes: mongoose.Types.ObjectId[];
  comments: IProjectComment[];
  views: number;
  
  // Assignment Reference (if project is for an assignment)
  assignment?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFileSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['image', 'video', 'document', 'code', 'link', 'other'],
    default: 'other'
  },
  size: Number
});

const ProjectFeedbackSchema = new Schema({
  description: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  strengths: [String],
  improvements: [String],
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedAt: { type: Date, default: Date.now }
});

const ProjectCommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  files: [ProjectFileSchema],
  liveUrl: String,
  repoUrl: String,
  technologies: [String],
  
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'needs_revision', 'approved', 'featured'],
    default: 'draft'
  },
  submittedAt: Date,
  
  feedback: ProjectFeedbackSchema,
  revisionNotes: String,
  revisionCount: { type: Number, default: 0 },
  
  isPublic: { type: Boolean, default: false },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [ProjectCommentSchema],
  views: { type: Number, default: 0 },
  
  assignment: { type: Schema.Types.ObjectId, ref: 'Assignment' }
}, {
  timestamps: true
});

// Indexes
ProjectSchema.index({ course: 1, student: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ isPublic: 1, status: 1 });
ProjectSchema.index({ 'likes': 1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
