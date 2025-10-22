const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  suggestions: [{
    type: String
  }],
  actions: [{
    type: {
      type: String
    },
    data: mongoose.Schema.Types.Mixed
  }],
  isError: {
    type: Boolean,
    default: false
  }
});

const chatHistorySchema = new mongoose.Schema({
  portfolioId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  sessionId: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    platform: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
chatHistorySchema.index({ portfolioId: 1, userId: 1, createdAt: -1 });

// TTL index to automatically delete old chat history after 30 days
chatHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Virtual for message count
chatHistorySchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Method to add a message
chatHistorySchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  return this.save();
};

// Method to clear messages
chatHistorySchema.methods.clearMessages = function() {
  this.messages = [];
  return this.save();
};

// Static method to find recent conversations
chatHistorySchema.statics.findRecentConversations = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('portfolioId sessionId updatedAt messageCount');
};

// Static method to get conversation statistics
chatHistorySchema.statics.getConversationStats = function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        totalMessages: { $sum: { $size: '$messages' } },
        avgMessagesPerConversation: { $avg: { $size: '$messages' } }
      }
    }
  ]);
};

module.exports = mongoose.model('ChatHistory', chatHistorySchema);