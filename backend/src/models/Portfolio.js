const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: String,
    enum: ['modern', 'minimal', 'dark', 'creative'],
    default: 'modern'
  },
  data: {
    personalInfo: {
      name: String,
      title: String,
      email: String,
      phone: String,
      location: String,
      image: String,
      social: {
        linkedin: String,
        github: String,
        twitter: String,
        website: String,
        behance: String,
        dribbble: String
      }
    },
    summary: String,
    about: String,
    skills: {
      technical: [String],
      soft: [String],
      tools: [String],
      languages: [String]
    },
    experience: [{
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      description: String,
      achievements: [String],
      technologies: [String]
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      links: {
        github: String,
        live: String,
        demo: String
      },
      image: String,
      featured: Boolean,
      startDate: String,
      endDate: String
    }],
    education: [{
      degree: String,
      institution: String,
      location: String,
      startDate: String,
      endDate: String,
      gpa: String,
      achievements: [String]
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: String,
      credentialId: String,
      url: String
    }],
    achievements: [String],
    testimonials: [{
      name: String,
      position: String,
      company: String,
      content: String,
      image: String
    }]
  },
  structure: {
    hero: {
      name: String,
      title: String,
      summary: String,
      image: String,
      contact: Object
    },
    about: {
      description: String,
      highlights: [String]
    },
    skills: {
      technical: [String],
      soft: [String],
      tools: [String]
    },
    experience: [Object],
    projects: [Object],
    education: [Object],
    contact: Object
  },
  customizations: {
    colors: {
      primary: String,
      secondary: String,
      accent: String,
      background: String,
      surface: String,
      text: String
    },
    fonts: {
      heading: String,
      body: String
    },
    layout: {
      sections: [String],
      sectionOrder: [String]
    },
    animations: {
      enabled: Boolean,
      style: String
    },
    seo: {
      title: String,
      description: String,
      keywords: [String]
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  deploymentUrl: String,
  deploymentPlatform: {
    type: String,
    enum: ['netlify', 'vercel', 'github-pages']
  },
  publishedAt: Date,
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  performanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
portfolioSchema.index({ userId: 1, createdAt: -1 });
portfolioSchema.index({ isPublished: 1 });
portfolioSchema.index({ template: 1 });

// Virtual for preview URL
portfolioSchema.virtual('previewUrl').get(function() {
  return `/portfolio/preview/${this._id}`;
});

// Virtual for edit URL
portfolioSchema.virtual('editUrl').get(function() {
  return `/portfolio/edit/${this._id}`;
});

// Method to increment view count
portfolioSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

// Static method to get user's portfolio count
portfolioSchema.statics.getUserPortfolioCount = function(userId) {
  return this.countDocuments({ userId });
};

// Pre-save middleware to update SEO score
portfolioSchema.pre('save', function(next) {
  if (this.isModified('data') || this.isModified('customizations')) {
    this.seoScore = this.calculateSEOScore();
  }
  next();
});

// Method to calculate SEO score
portfolioSchema.methods.calculateSEOScore = function() {
  let score = 0;
  
  // Check for essential SEO elements
  if (this.data.personalInfo?.name) score += 15;
  if (this.customizations?.seo?.title) score += 15;
  if (this.customizations?.seo?.description) score += 15;
  if (this.customizations?.seo?.keywords?.length > 0) score += 10;
  if (this.data.summary) score += 10;
  if (this.data.skills?.technical?.length > 0) score += 10;
  if (this.data.projects?.length > 0) score += 10;
  if (this.data.experience?.length > 0) score += 10;
  if (this.data.personalInfo?.social) score += 5;
  
  return Math.min(score, 100);
};

// Method to generate sitemap data
portfolioSchema.methods.getSitemapData = function() {
  return {
    url: this.deploymentUrl,
    lastModified: this.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8
  };
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
