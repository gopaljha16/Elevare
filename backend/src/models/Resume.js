const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Personal Information
  personalInfo: {
    fullName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: String,
    photo: String, // Cloudinary URL
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      dribbble: String,
      instagram: String,
      twitter: String,
      website: String
    }
  },
  
  // Professional Summary
  professionalSummary: {
    type: String,
    default: ''
  },
  
  // Experience
  experience: [{
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    startDate: { type: String, required: true },
    endDate: String,
    current: { type: Boolean, default: false },
    description: String,
    achievements: [String]
  }],
  
  // Education
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    location: String,
    startDate: String,
    endDate: String,
    gpa: String,
    description: String
  }],
  
  // Skills
  skills: {
    technical: [String],
    soft: [String],
    languages: [String],
    tools: [String]
  },
  
  // Projects
  projects: [{
    title: { type: String, required: true },
    description: String,
    technologies: [String],
    link: String,
    github: String,
    startDate: String,
    endDate: String
  }],
  
  // Certifications
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    credentialId: String,
    link: String
  }],
  
  // Additional Details
  additionalDetails: {
    awards: [String],
    publications: [String],
    volunteering: [String],
    hobbies: [String]
  },
  
  // Template & Theme
  template: {
    type: String,
    enum: ['classic', 'modern', 'minimal', 'designer', 'professional', 'creative'],
    default: 'modern'
  },
  
  theme: {
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#1E40AF' },
    fontFamily: { type: String, default: 'Inter' },
    fontSize: { type: String, default: 'medium' }
  },
  
  // AI Analysis & Scores
  atsScore: {
    score: { type: Number, min: 0, max: 100 },
    strengths: [String],
    improvements: [String],
    missingKeywords: [String],
    lastAnalyzed: Date
  },
  
  // AI Suggestions
  aiSuggestions: {
    summary: String,
    experienceImprovements: [String],
    skillRecommendations: [String],
    generalTips: [String],
    lastGenerated: Date
  },
  
  // Metadata
  status: {
    type: String,
    enum: ['draft', 'completed', 'published'],
    default: 'draft'
  },
  
  version: {
    type: Number,
    default: 1
  },
  
  shareLink: {
    type: String,
    unique: true,
    sparse: true
  },
  
  pdfUrl: String,
  
  viewCount: {
    type: Number,
    default: 0
  },
  
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
resumeSchema.index({ userId: 1, status: 1 });
resumeSchema.index({ shareLink: 1 });
resumeSchema.index({ createdAt: -1 });

// Pre-save middleware to update lastModified
resumeSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Method to generate share link
resumeSchema.methods.generateShareLink = function() {
  const randomString = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
  this.shareLink = `resume-${this._id}-${randomString}`;
  return this.shareLink;
};

// Method to increment view count
resumeSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
};

// Static method to get user's resumes
resumeSchema.statics.getUserResumes = function(userId, status = null) {
  const query = { userId };
  if (status) query.status = status;
  return this.find(query).sort({ lastModified: -1 });
};

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
