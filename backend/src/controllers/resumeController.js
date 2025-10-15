const Resume = require('../models/Resume');
const UserAnalytics = require('../models/UserAnalytics');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');

// create a new resume
const createResume = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const resumeData = req.body;

  // sanitize input data
  const sanitizedData = {
    userId,
    title: sanitizeInput(resumeData.title),
    personalInfo: {
      name: sanitizeInput(resumeData.personalInfo?.name || ''),
      email: sanitizeInput(resumeData.personalInfo?.email || '').toLowerCase(),
      phone: sanitizeInput(resumeData.personalInfo?.phone || ''),
      address: sanitizeInput(resumeData.personalInfo?.address || ''),
      linkedin: sanitizeInput(resumeData.personalInfo?.linkedin || ''),
      portfolio: sanitizeInput(resumeData.personalInfo?.portfolio || '')
    },
    experience: resumeData.experience || [],
    education: resumeData.education || [],
    skills: (resumeData.skills || []).map(skill => sanitizeInput(skill)),
    projects: resumeData.projects || [],
    achievements: (resumeData.achievements || []).map(achievement => sanitizeInput(achievement)),
    templateId: resumeData.templateId || 'template_1'
  };

  // create resume
  const resume = new Resume(sanitizedData);
  
  // calculate initial ats score
  resume.atsScore = resume.calculateATSScore();
  
  await resume.save();

  // update user analytics
  try {
    let analytics = await UserAnalytics.findOne({ userId });
    if (!analytics) {
      analytics = new UserAnalytics({ userId });
    }
    
    await analytics.trackAction('resume_created', {
      resumeId: resume._id,
      templateId: resume.templateId,
      atsScore: resume.atsScore
    });
    
    // Update resume stats
    const userResumes = await Resume.find({ userId, isActive: true });
    const resumeStats = {
      totalResumes: userResumes.length,
      activeResumes: userResumes.length,
      averageATSScore: userResumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / userResumes.length,
      highestATSScore: Math.max(...userResumes.map(r => r.atsScore || 0))
    };
    
    await analytics.updateResumeStats(resumeStats);
    await analytics.addRecentActivity('resume_created', `Created new resume: ${resume.title}`, 'resume');
  } catch (analyticsError) {
    console.error('Analytics update error:', analyticsError);
    // Don't fail the request if analytics update fails
  }

  res.status(201).json({
    success: true,
    message: 'Resume created successfully',
    data: {
      resume: resume.toObject()
    }
  });
});

// get all resumes for a user
const getResumes = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 10, sortBy = 'updatedAt', sortOrder = 'desc', search } = req.query;

  const query = { userId, isActive: true };
  
  // Add search functionality
  if (search) {
    const searchRegex = new RegExp(sanitizeInput(search), 'i');
    query.$or = [
      { title: searchRegex },
      { 'personalInfo.name': searchRegex },
      { skills: { $in: [searchRegex] } }
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  };

  const resumes = await Resume.find(query)
    .sort(options.sort)
    .limit(options.limit * 1)
    .skip((options.page - 1) * options.limit)
    .exec();

  const total = await Resume.countDocuments(query);

  // Get resume summaries
  const resumeSummaries = resumes.map(resume => resume.getSummary());

  res.json({
    success: true,
    data: {
      resumes: resumeSummaries,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalResumes: total,
        hasNext: options.page < Math.ceil(total / options.limit),
        hasPrev: options.page > 1
      }
    }
  });
});

// get a specific resume
const getResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.userId;

  const resume = await Resume.findOne({ _id: resumeId, userId, isActive: true });
  
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  res.json({
    success: true,
    data: {
      resume: resume.toObject()
    }
  });
});

// update a resume
const updateResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.userId;
  const updateData = req.body;

  const resume = await Resume.findOne({ _id: resumeId, userId, isActive: true });
  
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  // Sanitize and update fields
  const allowedFields = [
    'title', 'personalInfo', 'experience', 'education', 
    'skills', 'projects', 'achievements', 'templateId'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === 'title') {
        resume[field] = sanitizeInput(updateData[field]);
      } else if (field === 'skills' || field === 'achievements') {
        resume[field] = updateData[field].map(item => sanitizeInput(item));
      } else if (field === 'personalInfo') {
        resume[field] = {
          name: sanitizeInput(updateData[field].name || resume[field].name),
          email: sanitizeInput(updateData[field].email || resume[field].email).toLowerCase(),
          phone: sanitizeInput(updateData[field].phone || resume[field].phone),
          address: sanitizeInput(updateData[field].address || resume[field].address),
          linkedin: sanitizeInput(updateData[field].linkedin || resume[field].linkedin),
          portfolio: sanitizeInput(updateData[field].portfolio || resume[field].portfolio)
        };
      } else {
        resume[field] = updateData[field];
      }
    }
  });

  // Recalculate ATS score
  resume.atsScore = resume.calculateATSScore();
  
  await resume.save();

  // Update analytics
  try {
    let analytics = await UserAnalytics.findOne({ userId });
    if (analytics) {
      await analytics.trackAction('resume_updated', {
        resumeId: resume._id,
        atsScore: resume.atsScore
      });
      await analytics.addRecentActivity('resume_updated', `Updated resume: ${resume.title}`, 'resume');
    }
  } catch (analyticsError) {
    console.error('Analytics update error:', analyticsError);
  }

  res.json({
    success: true,
    message: 'Resume updated successfully',
    data: {
      resume: resume.toObject()
    }
  });
});

// delete a resume (soft delete)
const deleteResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.userId;

  const resume = await Resume.findOne({ _id: resumeId, userId, isActive: true });
  
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  // Soft delete
  resume.isActive = false;
  await resume.save();

  // Update analytics
  try {
    let analytics = await UserAnalytics.findOne({ userId });
    if (analytics) {
      await analytics.trackAction('resume_deleted', {
        resumeId: resume._id,
        title: resume.title
      });
      await analytics.addRecentActivity('resume_deleted', `Deleted resume: ${resume.title}`, 'resume');
      
      // Update resume stats
      const userResumes = await Resume.find({ userId, isActive: true });
      const resumeStats = {
        totalResumes: userResumes.length,
        activeResumes: userResumes.length,
        averageATSScore: userResumes.length > 0 ? 
          userResumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / userResumes.length : 0,
        highestATSScore: userResumes.length > 0 ? 
          Math.max(...userResumes.map(r => r.atsScore || 0)) : 0
      };
      
      await analytics.updateResumeStats(resumeStats);
    }
  } catch (analyticsError) {
    console.error('Analytics update error:', analyticsError);
  }

  res.json({
    success: true,
    message: 'Resume deleted successfully'
  });
});

// duplicate a resume
const duplicateResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.userId;

  const originalResume = await Resume.findOne({ _id: resumeId, userId, isActive: true });
  
  if (!originalResume) {
    throw new AppError('Resume not found', 404);
  }

  // Create duplicate
  const duplicateData = originalResume.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;
  duplicateData.title = `${duplicateData.title} (Copy)`;

  const duplicateResume = new Resume(duplicateData);
  duplicateResume.atsScore = duplicateResume.calculateATSScore();
  
  await duplicateResume.save();

  // Update analytics
  try {
    let analytics = await UserAnalytics.findOne({ userId });
    if (analytics) {
      await analytics.trackAction('resume_duplicated', {
        originalResumeId: originalResume._id,
        duplicateResumeId: duplicateResume._id
      });
      await analytics.addRecentActivity('resume_duplicated', `Duplicated resume: ${originalResume.title}`, 'resume');
    }
  } catch (analyticsError) {
    console.error('Analytics update error:', analyticsError);
  }

  res.status(201).json({
    success: true,
    message: 'Resume duplicated successfully',
    data: {
      resume: duplicateResume.toObject()
    }
  });
});

// optimize resume using ai
const optimizeResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const { jobDescription } = req.body;
  const userId = req.userId;

  const resume = await Resume.findOne({ _id: resumeId, userId, isActive: true });
  
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  // Import AI service
  const aiService = require('../services/aiService');
  
  let aiOptimization = null;
  let suggestions = [];

  try {
    // Use AI for optimization if available
    aiOptimization = await aiService.optimizeResumeContent(resume.toObject(), jobDescription);
    
    // Convert AI suggestions to our format
    suggestions = [
      ...aiOptimization.grammarImprovements.map(improvement => ({
        type: 'grammar',
        field: 'content',
        message: improvement,
        impact: 'medium'
      })),
      ...aiOptimization.keywordSuggestions.map(keyword => ({
        type: 'keyword',
        field: 'skills',
        message: `Consider adding "${keyword}" to your skills`,
        impact: 'high'
      })),
      ...aiOptimization.contentEnhancements.map(enhancement => ({
        type: 'content',
        field: 'experience',
        message: enhancement,
        impact: 'high'
      })),
      ...aiOptimization.atsImprovements.map(improvement => ({
        type: 'ats',
        field: 'formatting',
        message: improvement,
        impact: 'medium'
      }))
    ];

  } catch (aiError) {
    console.error('AI optimization failed, falling back to rule-based:', aiError);
    
    // Fallback to rule-based suggestions
    if (!resume.personalInfo.linkedin) {
      suggestions.push({
        type: 'missing_info',
        field: 'linkedin',
        message: 'Add your LinkedIn profile URL to increase ATS score',
        impact: 'medium'
      });
    }
    
    if (resume.skills.length < 5) {
      suggestions.push({
        type: 'content',
        field: 'skills',
        message: 'Add more relevant skills to improve keyword matching',
        impact: 'high'
      });
    }
    
    if (resume.experience.length === 0) {
      suggestions.push({
        type: 'content',
        field: 'experience',
        message: 'Add work experience to strengthen your resume',
        impact: 'high'
      });
    }
    
    if (resume.projects.length === 0) {
      suggestions.push({
        type: 'content',
        field: 'projects',
        message: 'Add relevant projects to showcase your skills',
        impact: 'medium'
      });
    }
  }

  // Update last optimized date
  resume.lastOptimized = new Date();
  await resume.save();

  // Update analytics
  try {
    let analytics = await UserAnalytics.findOne({ userId });
    if (analytics) {
      await analytics.trackAction('resume_optimized', {
        resumeId: resume._id,
        suggestionsCount: suggestions.length,
        aiUsed: !!aiOptimization
      });
      
      const resumeStats = {
        lastOptimized: resume.lastOptimized,
        totalOptimizations: (analytics.resumeStats.totalOptimizations || 0) + 1
      };
      
      await analytics.updateResumeStats(resumeStats);
      await analytics.addRecentActivity('resume_optimized', `AI-optimized resume: ${resume.title}`, 'resume');
    }
  } catch (analyticsError) {
    console.error('Analytics update error:', analyticsError);
  }

  res.json({
    success: true,
    message: 'Resume optimization completed',
    data: {
      currentATSScore: resume.atsScore,
      aiOptimization: aiOptimization ? {
        effectivenessScore: aiOptimization.effectivenessScore,
        summary: aiOptimization.summary
      } : null,
      suggestions,
      optimizedAt: resume.lastOptimized,
      aiUsed: !!aiOptimization
    }
  });
});

// calculate ats score for a resume
const calculateATSScore = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.userId;

  const resume = await Resume.findOne({ _id: resumeId, userId, isActive: true });
  
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  const atsScore = resume.calculateATSScore();
  
  // Update the resume with new score
  resume.atsScore = atsScore;
  await resume.save();

  // Provide detailed breakdown
  const breakdown = {
    personalInfo: {
      score: 0,
      maxScore: 30,
      details: []
    },
    content: {
      score: 0,
      maxScore: 40,
      details: []
    },
    structure: {
      score: 0,
      maxScore: 30,
      details: []
    }
  };

  // Personal info scoring
  if (resume.personalInfo.name && resume.personalInfo.email) {
    breakdown.personalInfo.score += 10;
    breakdown.personalInfo.details.push('Basic contact information provided');
  }
  if (resume.personalInfo.phone) {
    breakdown.personalInfo.score += 5;
    breakdown.personalInfo.details.push('Phone number provided');
  }
  if (resume.personalInfo.linkedin) {
    breakdown.personalInfo.score += 5;
    breakdown.personalInfo.details.push('LinkedIn profile provided');
  }
  if (resume.personalInfo.address) {
    breakdown.personalInfo.score += 10;
    breakdown.personalInfo.details.push('Address provided');
  }

  // Content scoring
  if (resume.experience.length > 0) {
    breakdown.content.score += 15;
    breakdown.content.details.push(`${resume.experience.length} work experience entries`);
  }
  if (resume.education.length > 0) {
    breakdown.content.score += 10;
    breakdown.content.details.push(`${resume.education.length} education entries`);
  }
  if (resume.skills.length >= 5) {
    breakdown.content.score += 15;
    breakdown.content.details.push(`${resume.skills.length} skills listed`);
  }

  // Structure scoring
  if (resume.experience.some(exp => exp.achievements.length > 0)) {
    breakdown.structure.score += 10;
    breakdown.structure.details.push('Achievements included in experience');
  }
  if (resume.projects.length > 0) {
    breakdown.structure.score += 10;
    breakdown.structure.details.push(`${resume.projects.length} projects showcased`);
  }
  if (resume.achievements.length > 0) {
    breakdown.structure.score += 10;
    breakdown.structure.details.push(`${resume.achievements.length} achievements listed`);
  }

  res.json({
    success: true,
    data: {
      atsScore,
      breakdown,
      completeness: resume.completeness,
      recommendations: atsScore < 70 ? [
        'Add more relevant skills',
        'Include quantifiable achievements',
        'Ensure all contact information is complete'
      ] : []
    }
  });
});

// match resume against job description
const matchJobDescription = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const { jobDescription } = req.body;
  const userId = req.userId;

  if (!jobDescription) {
    throw new AppError('Job description is required', 400);
  }

  const resume = await Resume.findOne({ _id: resumeId, userId, isActive: true });
  
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  // Simple keyword matching (in a real implementation, this would use NLP)
  const jobKeywords = sanitizeInput(jobDescription)
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word));

  const resumeText = [
    resume.personalInfo.name,
    ...resume.skills,
    ...resume.experience.map(exp => `${exp.company} ${exp.position} ${exp.description}`),
    ...resume.education.map(edu => `${edu.institution} ${edu.degree} ${edu.field}`),
    ...resume.projects.map(proj => `${proj.name} ${proj.description} ${proj.technologies.join(' ')}`),
    ...resume.achievements
  ].join(' ').toLowerCase();

  const matchedKeywords = jobKeywords.filter(keyword => 
    resumeText.includes(keyword)
  );

  const matchPercentage = jobKeywords.length > 0 ? 
    Math.round((matchedKeywords.length / jobKeywords.length) * 100) : 0;

  const missingKeywords = jobKeywords.filter(keyword => 
    !resumeText.includes(keyword)
  ).slice(0, 10); // Limit to top 10 missing keywords

  res.json({
    success: true,
    data: {
      matchPercentage,
      matchedKeywords: matchedKeywords.slice(0, 10),
      missingKeywords,
      totalJobKeywords: jobKeywords.length,
      recommendations: missingKeywords.length > 0 ? [
        `Consider adding these skills: ${missingKeywords.slice(0, 5).join(', ')}`,
        'Update your experience descriptions to include more relevant keywords',
        'Add projects that demonstrate the required skills'
      ] : [
        'Great match! Your resume aligns well with this job description'
      ]
    }
  });
});

// get resume analytics
const getResumeAnalytics = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const resumes = await Resume.find({ userId, isActive: true });
  
  if (resumes.length === 0) {
    return res.json({
      success: true,
      data: {
        totalResumes: 0,
        averageATSScore: 0,
        highestATSScore: 0,
        templateUsage: {},
        recentActivity: []
      }
    });
  }

  const analytics = {
    totalResumes: resumes.length,
    averageATSScore: Math.round(resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length),
    highestATSScore: Math.max(...resumes.map(r => r.atsScore || 0)),
    templateUsage: {},
    completenessDistribution: {
      low: 0,    // 0-40%
      medium: 0, // 41-70%
      high: 0    // 71-100%
    },
    recentActivity: resumes
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5)
      .map(resume => ({
        id: resume._id,
        title: resume.title,
        action: 'updated',
        timestamp: resume.updatedAt,
        atsScore: resume.atsScore
      }))
  };

  // Calculate template usage
  resumes.forEach(resume => {
    const template = resume.templateId || 'template_1';
    analytics.templateUsage[template] = (analytics.templateUsage[template] || 0) + 1;
  });

  // Calculate completeness distribution
  resumes.forEach(resume => {
    const completeness = resume.completeness;
    if (completeness <= 40) {
      analytics.completenessDistribution.low++;
    } else if (completeness <= 70) {
      analytics.completenessDistribution.medium++;
    } else {
      analytics.completenessDistribution.high++;
    }
  });

  res.json({
    success: true,
    data: analytics
  });
});

// Input validation for AI analysis
const validateResumeAnalysisInput = (resumeData) => {
  if (!resumeData || typeof resumeData !== 'object') {
    throw new AppError('Resume data is required and must be an object', 400);
  }
  
  // Validate personal info
  if (!resumeData.personalInfo || typeof resumeData.personalInfo !== 'object') {
    throw new AppError('Personal information is required', 400);
  }
  
  // Sanitize and validate arrays
  const sanitizedData = {
    personalInfo: {
      firstName: sanitizeInput(resumeData.personalInfo.firstName || ''),
      lastName: sanitizeInput(resumeData.personalInfo.lastName || ''),
      email: sanitizeInput(resumeData.personalInfo.email || '').toLowerCase(),
      phone: sanitizeInput(resumeData.personalInfo.phone || ''),
      location: sanitizeInput(resumeData.personalInfo.location || ''),
      linkedin: sanitizeInput(resumeData.personalInfo.linkedin || ''),
      portfolio: sanitizeInput(resumeData.personalInfo.portfolio || '')
    },
    experience: Array.isArray(resumeData.experience) ? resumeData.experience.slice(0, 20) : [],
    education: Array.isArray(resumeData.education) ? resumeData.education.slice(0, 10) : [],
    skills: Array.isArray(resumeData.skills) ? 
      resumeData.skills.slice(0, 50).map(skill => sanitizeInput(skill)) : [],
    projects: Array.isArray(resumeData.projects) ? resumeData.projects.slice(0, 15) : [],
    achievements: Array.isArray(resumeData.achievements) ? 
      resumeData.achievements.slice(0, 20).map(achievement => sanitizeInput(achievement)) : []
  };
  
  return sanitizedData;
};

// New endpoint for comprehensive AI analysis
const analyzeResumeWithAI = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const rawResumeData = req.body;
  
  // Validate and sanitize input
  const resumeData = validateResumeAnalysisInput(rawResumeData);
  
  // Import required modules
  const aiService = require('../services/aiService');
  const { safeRedisUtils } = require('../middleware/redis');
  const crypto = require('crypto');
  
  // Create cache key based on resume content hash
  const resumeHash = crypto
    .createHash('md5')
    .update(JSON.stringify(resumeData))
    .digest('hex');
  const cacheKey = `resume_analysis:${userId}:${resumeHash}`;
  
  // Check cache first (cache for 2 hours)
  try {
    const cachedResult = await safeRedisUtils.getUserSession(cacheKey);
    if (cachedResult && cachedResult.data) {
      return res.json({
        success: true,
        data: cachedResult.data,
        cached: true,
        analyzedAt: cachedResult.analyzedAt
      });
    }
  } catch (cacheError) {
    console.error('Cache read error:', cacheError);
    // Continue without cache
  }
  
  try {
    const startTime = Date.now();
    
    // Perform comprehensive AI analysis
    const analysis = await aiService.analyzeResumeComprehensive(resumeData);
    
    const processingTime = Date.now() - startTime;
    
    // Enhance analysis with metadata
    const enhancedAnalysis = {
      ...analysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        processingTime,
        aiModel: 'gemini-1.5-flash',
        version: '1.0'
      }
    };
    
    // Cache the result (2 hours TTL)
    try {
      await safeRedisUtils.setUserSession(cacheKey, {
        data: enhancedAnalysis,
        analyzedAt: enhancedAnalysis.metadata.analyzedAt
      }, 7200); // 2 hours
    } catch (cacheError) {
      console.error('Cache write error:', cacheError);
      // Continue without caching
    }
    
    // Update analytics
    try {
      let analytics = await UserAnalytics.findOne({ userId });
      if (analytics) {
        await analytics.trackAction('ai_analysis_performed', {
          overallScore: analysis.overallScore,
          suggestionsCount: analysis.actionableFeedback?.length || 0,
          processingTime,
          cached: false
        });
        
        await analytics.addRecentActivity(
          'ai_analysis', 
          `AI analyzed resume with score: ${analysis.overallScore}/100`, 
          'analysis'
        );
      }
    } catch (analyticsError) {
      console.error('Analytics update error:', analyticsError);
    }
    
    res.json({
      success: true,
      data: enhancedAnalysis,
      cached: false,
      message: 'Resume analysis completed successfully'
    });
    
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Return fallback analysis on AI failure
    const fallbackAnalysis = aiService.getFallbackComprehensiveAnalysis();
    
    // Add metadata to fallback
    const enhancedFallback = {
      ...fallbackAnalysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        processingTime: 0,
        aiModel: 'fallback',
        version: '1.0',
        fallback: true
      }
    };
    
    res.json({
      success: true,
      data: enhancedFallback,
      fallback: true,
      message: 'AI analysis temporarily unavailable, showing basic analysis'
    });
  }
});
  

module.exports = {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  duplicateResume,
  optimizeResume,
  calculateATSScore,
  matchJobDescription,
  getResumeAnalytics,
  analyzeResumeWithAI
};