const mongoose = require('mongoose');

const resumeTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  
  displayName: {
    type: String,
    required: true
  },
  
  description: String,
  
  category: {
    type: String,
    enum: ['classic', 'modern', 'minimal', 'designer', 'professional', 'creative'],
    required: true
  },
  
  thumbnail: String, // Preview image URL
  
  // Template configuration
  config: {
    layout: {
      type: String,
      enum: ['single-column', 'two-column', 'sidebar'],
      default: 'two-column'
    },
    
    sections: {
      showPhoto: { type: Boolean, default: true },
      showSummary: { type: Boolean, default: true },
      showExperience: { type: Boolean, default: true },
      showEducation: { type: Boolean, default: true },
      showSkills: { type: Boolean, default: true },
      showProjects: { type: Boolean, default: false },
      showCertifications: { type: Boolean, default: false },
      showAdditional: { type: Boolean, default: false }
    },
    
    styling: {
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#1E40AF' },
      accentColor: { type: String, default: '#60A5FA' },
      textColor: { type: String, default: '#1F2937' },
      backgroundColor: { type: String, default: '#FFFFFF' },
      fontFamily: { type: String, default: 'Inter' },
      fontSize: {
        base: { type: String, default: '14px' },
        heading: { type: String, default: '24px' },
        subheading: { type: String, default: '18px' }
      },
      spacing: {
        type: String,
        enum: ['compact', 'normal', 'relaxed'],
        default: 'normal'
      }
    }
  },
  
  // For premium templates
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // Usage statistics
  usageCount: {
    type: Number,
    default: 0
  },
  
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  
  // Template status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Order for display
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
resumeTemplateSchema.index({ category: 1, isActive: 1 });
resumeTemplateSchema.index({ displayOrder: 1 });

// Method to increment usage count
resumeTemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
};

// Static method to get active templates
resumeTemplateSchema.statics.getActiveTemplates = function(category = null) {
  const query = { isActive: true };
  if (category) query.category = category;
  return this.find(query).sort({ displayOrder: 1, usageCount: -1 });
};

const ResumeTemplate = mongoose.model('ResumeTemplate', resumeTemplateSchema);

module.exports = ResumeTemplate;
