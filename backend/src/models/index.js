// Export all models for easy importing
const User = require('./User');
const Resume = require('./Resume');
const Portfolio = require('./Portfolio');
const InterviewSession = require('./InterviewSession');
const LearningPath = require('./LearningPath');
const ChatHistory = require('./ChatHistory');
const Question = require('./Question');
const ResumeTemplate = require('./ResumeTemplate');
const UserAnalytics = require('./UserAnalytics');
const UserProgress = require('./UserProgress');

// Premium subscription models
const Subscription = require('./Subscription');
const Payment = require('./Payment');
const Invoice = require('./Invoice');
const UsageTracking = require('./UsageTracking');

module.exports = {
  User,
  Resume,
  Portfolio,
  InterviewSession,
  LearningPath,
  ChatHistory,
  Question,
  ResumeTemplate,
  UserAnalytics,
  UserProgress,
  // Premium models
  Subscription,
  Payment,
  Invoice,
  UsageTracking
};
