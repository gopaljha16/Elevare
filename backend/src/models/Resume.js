const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  achievements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Achievement cannot exceed 500 characters']
  }]
});

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  field: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true
  },
  graduationDate: {
    type: Date,
    required: [true, 'Graduation date is required']
  },
  gpa: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4.0, 'GPA cannot exceed 4.0']
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  technologies: [{
    type: String,
    trim: true
  }],
  link: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  startDate: Date,
  endDate: Date
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  personalInfo: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    address: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(v);
        },
        message: 'Please enter a valid LinkedIn URL'
      }
    },
    portfolio: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Please enter a valid portfolio URL'
      }
    }
  },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [{
    type: String,
    trim: true
  }],
  projects: [projectSchema],
  achievements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Achievement cannot exceed 500 characters']
  }],
  templateId: {
    type: String,
    default: 'template_1',
    enum: ['template_1', 'template_2', 'template_3']
  },
  atsScore: {
    type: Number,
    min: [0, 'ATS score cannot be negative'],
    max: [100, 'ATS score cannot exceed 100'],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastOptimized: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, isActive: 1 });
resumeSchema.index({ atsScore: -1 });

// Virtual for calculating resume completeness
resumeSchema.virtual('completeness').get(function() {
  let score = 0;
  const maxScore = 100;
  
  // Personal info (20 points)
  if (this.personalInfo.name) score += 5;
  if (this.personalInfo.email) score += 5;
  if (this.personalInfo.phone) score += 5;
  if (this.personalInfo.address) score += 5;
  
  // Experience (30 points)
  if (this.experience.length > 0) {
    score += 20;
    if (this.experience.some(exp => exp.achievements.length > 0)) score += 10;
  }
  
  // Education (20 points)
  if (this.education.length > 0) score += 20;
  
  // Skills (15 points)
  if (this.skills.length >= 5) score += 15;
  else if (this.skills.length > 0) score += 10;
  
  // Projects (10 points)
  if (this.projects.length > 0) score += 10;
  
  // Achievements (5 points)
  if (this.achievements.length > 0) score += 5;
  
  return Math.min(score, maxScore);
});

// Method to calculate ATS score based on content
resumeSchema.methods.calculateATSScore = function() {
  let score = 0;
  
  // Basic information completeness (30 points)
  if (this.personalInfo.name && this.personalInfo.email) score += 10;
  if (this.personalInfo.phone) score += 5;
  if (this.personalInfo.linkedin) score += 5;
  if (this.personalInfo.address) score += 10;
  
  // Content quality (40 points)
  if (this.experience.length > 0) score += 15;
  if (this.education.length > 0) score += 10;
  if (this.skills.length >= 5) score += 15;
  
  // Formatting and structure (30 points)
  if (this.experience.some(exp => exp.achievements.length > 0)) score += 10;
  if (this.projects.length > 0) score += 10;
  if (this.achievements.length > 0) score += 10;
  
  return Math.min(score, 100);
};

// Method to get resume summary
resumeSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    completeness: this.completeness,
    atsScore: this.atsScore,
    lastModified: this.updatedAt,
    experienceCount: this.experience.length,
    skillsCount: this.skills.length,
    projectsCount: this.projects.length
  };
};

module.exports = mongoose.model('Resume', resumeSchema);