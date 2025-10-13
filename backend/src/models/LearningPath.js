const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: ['video', 'article', 'course', 'practice', 'documentation', 'tutorial'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  provider: {
    type: String,
    trim: true,
    enum: ['YouTube', 'Coursera', 'Udemy', 'freeCodeCamp', 'MDN', 'LeetCode', 'HackerRank', 'GeeksforGeeks', 'Other']
  },
  duration: {
    type: Number, // in minutes
    min: [1, 'Duration must be at least 1 minute']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  estimatedHours: {
    type: Number,
    min: [1, 'Estimated hours must be at least 1'],
    max: [200, 'Estimated hours cannot exceed 200']
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  resources: [resourceSchema],
  category: {
    type: String,
    enum: ['programming', 'algorithms', 'system-design', 'databases', 'web-development', 'mobile-development', 'devops', 'soft-skills'],
    index: true
  },
  priority: {
    type: Number,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10'],
    default: 5
  }
});

const learningPathSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Learning path title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  skills: [skillSchema],
  estimatedDuration: {
    type: Number, // in hours
    min: [1, 'Estimated duration must be at least 1 hour']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
    default: 'intermediate'
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  roles: [{
    type: String,
    trim: true,
    index: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  version: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
learningPathSchema.index({ company: 1, isActive: 1 });
learningPathSchema.index({ roles: 1, difficulty: 1 });
learningPathSchema.index({ tags: 1, isActive: 1 });

// Virtual for total resources count
learningPathSchema.virtual('totalResources').get(function() {
  return this.skills.reduce((total, skill) => total + skill.resources.length, 0);
});

// Virtual for calculating estimated duration from skills
learningPathSchema.virtual('calculatedDuration').get(function() {
  return this.skills.reduce((total, skill) => total + (skill.estimatedHours || 0), 0);
});

// Method to get path summary
learningPathSchema.methods.getSummary = function() {
  return {
    id: this._id,
    company: this.company,
    title: this.title,
    description: this.description,
    skillsCount: this.skills.length,
    totalResources: this.totalResources,
    estimatedDuration: this.estimatedDuration || this.calculatedDuration,
    difficulty: this.difficulty,
    roles: this.roles,
    tags: this.tags
  };
};

// Method to get skills by category
learningPathSchema.methods.getSkillsByCategory = function() {
  const categories = {};
  
  this.skills.forEach(skill => {
    const category = skill.category || 'other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(skill);
  });
  
  return categories;
};

// Static method to find paths by company and role
learningPathSchema.statics.findByCompanyAndRole = function(company, role) {
  return this.find({
    company: new RegExp(company, 'i'),
    roles: new RegExp(role, 'i'),
    isActive: true
  }).sort({ createdAt: -1 });
};

// Static method to get popular companies
learningPathSchema.statics.getPopularCompanies = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$company', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
};

module.exports = mongoose.model('LearningPath', learningPathSchema);