const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Question type is required'],
    enum: ['multiple-choice', 'coding', 'behavioral', 'technical', 'system-design'],
    index: true
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['easy', 'medium', 'hard'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Question content is required'],
    trim: true,
    maxlength: [2000, 'Question content cannot exceed 2000 characters']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  hints: [{
    type: String,
    trim: true,
    maxlength: [500, 'Hint cannot exceed 500 characters']
  }],
  suggestedAnswer: {
    type: String,
    trim: true,
    maxlength: [3000, 'Suggested answer cannot exceed 3000 characters']
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1500, 'Explanation cannot exceed 1500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  company: {
    type: String,
    trim: true,
    index: true
  },
  role: {
    type: String,
    trim: true,
    index: true
  },
  category: {
    type: String,
    enum: ['algorithms', 'data-structures', 'system-design', 'behavioral', 'company-culture', 'technical-concepts'],
    index: true
  },
  estimatedTime: {
    type: Number, // in minutes
    min: [1, 'Estimated time must be at least 1 minute'],
    max: [120, 'Estimated time cannot exceed 120 minutes']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
questionSchema.index({ type: 1, difficulty: 1, company: 1 });
questionSchema.index({ category: 1, role: 1 });
questionSchema.index({ tags: 1, isActive: 1 });

// Validation for multiple choice questions
questionSchema.pre('save', function(next) {
  if (this.type === 'multiple-choice') {
    if (!this.options || this.options.length < 2) {
      return next(new Error('Multiple choice questions must have at least 2 options'));
    }
    
    const correctAnswers = this.options.filter(option => option.isCorrect);
    if (correctAnswers.length === 0) {
      return next(new Error('Multiple choice questions must have at least one correct answer'));
    }
  }
  
  next();
});

// Method to get question for display (without correct answers)
questionSchema.methods.getForDisplay = function() {
  const question = this.toObject();
  
  if (question.type === 'multiple-choice') {
    question.options = question.options.map(option => ({
      text: option.text,
      _id: option._id
    }));
  }
  
  // Remove sensitive information
  delete question.suggestedAnswer;
  delete question.explanation;
  
  return question;
};

// Method to check if answer is correct
questionSchema.methods.checkAnswer = function(userAnswer) {
  if (this.type === 'multiple-choice') {
    const correctOption = this.options.find(option => option.isCorrect);
    return correctOption && correctOption._id.toString() === userAnswer;
  }
  
  // For other types, we'll need more sophisticated checking
  return false;
};

// Static method to get random questions
questionSchema.statics.getRandomQuestions = function(filters = {}, limit = 10) {
  const pipeline = [
    { $match: { isActive: true, ...filters } },
    { $sample: { size: limit } }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Question', questionSchema);