const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  resources: [{
    type: {
      type: String,
      enum: ['video', 'article', 'course', 'documentation', 'book', 'project']
    },
    title: String,
    url: String,
    duration: String,
    provider: String
  }],
  projects: [{
    title: String,
    description: String,
    difficulty: String,
    estimatedHours: Number
  }],
  prerequisites: [{
    type: String
  }],
  sequentialOrder: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  estimatedHours: {
    type: Number,
    required: true
  },
  position: {
    x: Number,
    y: Number
  }
});

const connectionSchema = new mongoose.Schema({
  from: String,
  to: String,
  type: {
    type: String,
    enum: ['prerequisite', 'recommended', 'optional'],
    default: 'prerequisite'
  }
});

const learningPathSchema = new mongoose.Schema({
  pathId: {
    type: String,
    required: true,
    unique: true
  },
  pathName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'DevOps', 'Mobile', 'AI/ML', 'Cybersecurity', 'Cloud', 'Other'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  estimatedHours: {
    type: Number,
    required: true
  },
  createdBy: {
    type: String,
    required: false
  },
  nodes: [nodeSchema],
  connections: [connectionSchema],
  tags: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
learningPathSchema.index({ pathId: 1 });
learningPathSchema.index({ category: 1, difficulty: 1 });
learningPathSchema.index({ isPublished: 1 });
learningPathSchema.index({ tags: 1 });

module.exports = mongoose.model('LearningPath', learningPathSchema);
