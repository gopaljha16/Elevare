const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  pathId: {
    type: String,
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedNodes: [{
    nodeId: String,
    completedAt: Date,
    timeSpent: Number // in minutes
  }],
  currentNode: {
    type: String
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Paused'],
    default: 'Not Started'
  },
  estimatedCompletionDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  },
  totalTimeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  notes: [{
    nodeId: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    nodeId: String,
    resourceIndex: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
userProgressSchema.index({ userId: 1, pathId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1 });
userProgressSchema.index({ pathId: 1 });

module.exports = mongoose.model('UserProgress', userProgressSchema);
