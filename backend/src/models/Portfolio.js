const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  portfolioData: {
    personal: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      website: String
    },
    summary: String,
    experience: [{
      title: String,
      company: String,
      duration: String,
      location: String,
      achievements: [String]
    }],
    skills: {
      technical: [String],
      soft: [String]
    },
    education: [{
      degree: String,
      institution: String,
      year: String,
      gpa: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      link: String,
      github: String
    }],
    certifications: [String]
  },
  htmlCode: {
    type: String,
    required: true
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#3b82f6'
    },
    fontFamily: {
      type: String,
      default: 'Inter'
    },
    layout: {
      type: String,
      enum: ['minimal', 'modern', 'creative'],
      default: 'modern'
    }
  },
  deployments: [{
    platform: {
      type: String,
      enum: ['vercel', 'netlify', 'render'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    deployedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'failed', 'inactive'],
      default: 'active'
    }
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  shareSettings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowComments: {
      type: Boolean,
      default: false
    },
    seoEnabled: {
      type: Boolean,
      default: true
    }
  },
  version: {
    type: Number,
    default: 1
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
portfolioSchema.index({ userId: 1, createdAt: -1 });
portfolioSchema.index({ isPublished: 1, createdAt: -1 });
portfolioSchema.index({ 'deployments.platform': 1 });
portfolioSchema.index({ tags: 1 });

// Virtual for deployment count
portfolioSchema.virtual('deploymentCount').get(function() {
  return this.deployments.filter(d => d.status === 'active').length;
});

// Virtual for active deployments
portfolioSchema.virtual('activeDeployments').get(function() {
  return this.deployments.filter(d => d.status === 'active');
});

// Method to increment views
portfolioSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

// Method to increment clicks
portfolioSchema.methods.incrementClicks = function() {
  this.analytics.clicks += 1;
  return this.save();
};

// Method to add deployment
portfolioSchema.methods.addDeployment = function(platform, url) {
  this.deployments.push({
    platform,
    url,
    deployedAt: new Date(),
    status: 'active'
  });
  return this.save();
};

// Method to update deployment status
portfolioSchema.methods.updateDeploymentStatus = function(platform, status) {
  const deployment = this.deployments.find(d => d.platform === platform);
  if (deployment) {
    deployment.status = status;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find public portfolios
portfolioSchema.statics.findPublicPortfolios = function(limit = 10) {
  return this.find({
    isPublished: true,
    'shareSettings.isPublic': true
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('userId', 'name email');
};

// Static method to find portfolios by user
portfolioSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .sort({ createdAt: -1 });
};

// Pre-save middleware to update version
portfolioSchema.pre('save', function(next) {
  if (this.isModified('htmlCode') || this.isModified('portfolioData')) {
    this.version += 1;
  }
  next();
});

// Pre-save middleware to generate tags
portfolioSchema.pre('save', function(next) {
  if (this.isModified('portfolioData')) {
    const tags = [];
    
    // Add skills as tags
    if (this.portfolioData.skills?.technical) {
      tags.push(...this.portfolioData.skills.technical);
    }
    
    // Add technologies from projects as tags
    if (this.portfolioData.projects) {
      this.portfolioData.projects.forEach(project => {
        if (project.technologies) {
          tags.push(...project.technologies);
        }
      });
    }
    
    // Add job titles as tags
    if (this.portfolioData.experience) {
      this.portfolioData.experience.forEach(exp => {
        if (exp.title) {
          tags.push(exp.title);
        }
      });
    }
    
    // Remove duplicates and convert to lowercase
    this.tags = [...new Set(tags.map(tag => tag.toLowerCase()))];
  }
  next();
});

module.exports = mongoose.model('Portfolio', portfolioSchema);