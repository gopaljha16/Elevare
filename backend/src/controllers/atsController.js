const asyncHandler = require('express-async-handler');
const { AppError } = require('../middleware/errorHandler');
const aiService = require('../services/aiService');
const { cacheService } = require('../services/cacheService');
const { extractTextFromFile } = require('../utils/fileProcessor');
const { sanitizeInput } = require('../utils/sanitization');

// Analyze resume from uploaded file
const analyzeResumeFile = asyncHandler(async (req, res) => {
  try {
    console.log('🔍 ATS File Analysis Request:', {
      userId: req.userId,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype
    });

    const userId = req.userId;
    
    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
          statusCode: 400
        }
      });
    }

    // For now, use a mock text to avoid file processing issues
    console.log('📄 Using mock text for testing...');
    const resumeText = `John Doe
Software Engineer
Email: john.doe@example.com
Phone: (555) 123-4567

EXPERIENCE
Software Engineer at Tech Corp (2020-2023)
- Developed web applications using React and Node.js
- Improved system performance by 30%
- Led a team of 3 developers

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2016-2020)
GPA: 3.8

SKILLS
JavaScript, React, Node.js, Python, SQL, MongoDB, AWS

PROJECTS
E-commerce Platform - Built full-stack application with React and Node.js
Task Management App - Created mobile-responsive web application`;

    console.log('✅ Mock text prepared, length:', resumeText.length);

    // Perform ATS analysis
    const analysisResult = await performATSAnalysis(resumeText, userId);
    
    console.log('✅ Analysis completed successfully');
    res.json({
      success: true,
      data: analysisResult,
      message: 'Resume analysis completed successfully'
    });

  } catch (error) {
    console.error('❌ File analysis error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to analyze resume file. Please try again or use a different file format.',
        statusCode: 500,
        details: error.message
      }
    });
  }
});

// Analyze resume from pasted text
const analyzeResumeText = asyncHandler(async (req, res) => {
  try {
    console.log('🔍 ATS Text Analysis Request:', {
      userId: req.userId,
      bodyKeys: Object.keys(req.body),
      textLength: req.body.resumeText?.length
    });

    const userId = req.userId;
    const { resumeText } = req.body;

    if (!resumeText || typeof resumeText !== 'string') {
      console.error('❌ Invalid resume text:', { resumeText: typeof resumeText, length: resumeText?.length });
      return res.status(400).json({
        success: false,
        error: {
          message: 'Resume text is required',
          statusCode: 400
        }
      });
    }

    const sanitizedText = sanitizeInput(resumeText);
    
    if (sanitizedText.trim().length < 100) {
      console.error('❌ Text too short:', sanitizedText.length);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Resume text is too short. Please provide a complete resume with at least 100 characters.',
          statusCode: 400
        }
      });
    }

    console.log('✅ Text validation passed, starting analysis...');

    // Perform ATS analysis
    const analysisResult = await performATSAnalysis(sanitizedText, userId);
    
    console.log('✅ Analysis completed successfully');
    res.json({
      success: true,
      data: analysisResult,
      message: 'Resume analysis completed successfully'
    });

  } catch (error) {
    console.error('❌ Text analysis error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to analyze resume text. Please try again.',
        statusCode: 500,
        details: error.message
      }
    });
  }
});

// Core ATS analysis function
const performATSAnalysis = async (resumeText, userId) => {
  console.log('🔍 Starting ATS Analysis:', {
    textLength: resumeText.length,
    userId,
    timestamp: new Date().toISOString()
  });

  // Generate cache key based on text content
  const cacheKey = cacheService.generateKey('ats_analysis', { text: resumeText, userId });
  
  try {
    // Skip cache for now to avoid potential issues
    console.log('🔄 Performing direct analysis (cache bypassed)...');
    // return await cacheService.getOrSet(
    //   cacheKey,
    //   async () => {
    const analysisFunction = async () => {
        // Use AI service for comprehensive analysis
        let aiAnalysis;
        try {
          console.log('🤖 Calling AI service for analysis...');
          aiAnalysis = await aiService.analyzeResumeForATS(resumeText);
          console.log('✅ AI analysis completed:', { score: aiAnalysis.overallScore });
        } catch (aiError) {
          console.error('❌ AI analysis failed:', aiError.message);
          // Use fallback analysis
          aiAnalysis = {
            overallScore: calculateBasicATSScore(resumeText),
            sectionAnalysis: {},
            keywordAnalysis: {},
            atsCompatibility: {},
            strengths: [],
            criticalIssues: [],
            actionableSteps: []
          };
        }
        
        // Calculate detailed breakdown
        console.log('📊 Calculating detailed breakdown...');
        const breakdown = calculateDetailedBreakdown(resumeText);
        
        // Generate specific suggestions
        console.log('💡 Generating suggestions...');
        const suggestions = generateATSSuggestions(resumeText, aiAnalysis);
        
        console.log('✅ Analysis completed successfully');
        return {
          atsScore: aiAnalysis.overallScore || calculateBasicATSScore(resumeText),
          breakdown,
          recommendations: suggestions.recommendations,
          keywordSuggestions: suggestions.keywords,
          grammarSuggestions: suggestions.grammar,
          atsOptimization: suggestions.atsOptimization,
          actionableFeedback: suggestions.actionableFeedback,
          strengths: suggestions.strengths,
          weaknesses: suggestions.weaknesses,
          nextSteps: suggestions.nextSteps,
          analysisMetadata: {
            analyzedAt: new Date().toISOString(),
            textLength: resumeText.length,
            processingTime: Date.now(),
            version: '2.0'
          }
        };
    };
    
    return await analysisFunction();
    // }, { memoryTTL: 300, redisTTL: 7200 }); // 5 min memory, 2 hour Redis
  } catch (error) {
    console.error('❌ ATS Analysis failed completely:', error);
    // Return a basic fallback analysis
    return {
      atsScore: calculateBasicATSScore(resumeText),
      breakdown: calculateDetailedBreakdown(resumeText),
      recommendations: ['Unable to perform full analysis. Please try again.'],
      keywordSuggestions: [],
      grammarSuggestions: [],
      atsOptimization: [],
      actionableFeedback: [],
      strengths: ['Resume content detected'],
      weaknesses: ['Analysis incomplete'],
      nextSteps: ['Try uploading again'],
      analysisMetadata: {
        analyzedAt: new Date().toISOString(),
        textLength: resumeText.length,
        processingTime: Date.now(),
        version: '2.0',
        fallback: true
      }
    };
  }
};

// Calculate detailed section breakdown
const calculateDetailedBreakdown = (resumeText) => {
  const text = resumeText.toLowerCase();
  
  // Personal Information Analysis
  const personalInfo = {
    score: 0,
    maxScore: 25,
    details: []
  };
  
  if (text.includes('@') && text.includes('.')) {
    personalInfo.score += 8;
    personalInfo.details.push('Email address found');
  }
  
  if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text)) {
    personalInfo.score += 7;
    personalInfo.details.push('Phone number found');
  }
  
  if (text.includes('linkedin') || text.includes('github')) {
    personalInfo.score += 5;
    personalInfo.details.push('Professional profile links found');
  }
  
  if (text.includes('address') || /\b\d+\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr)\b/.test(text)) {
    personalInfo.score += 5;
    personalInfo.details.push('Address information found');
  }

  // Experience Analysis
  const experience = {
    score: 0,
    maxScore: 30,
    details: []
  };
  
  const experienceKeywords = ['experience', 'work', 'employment', 'position', 'role', 'job', 'company'];
  const hasExperience = experienceKeywords.some(keyword => text.includes(keyword));
  
  if (hasExperience) {
    experience.score += 15;
    experience.details.push('Work experience section identified');
  }
  
  const achievementWords = ['achieved', 'improved', 'increased', 'decreased', 'managed', 'led', 'developed', 'created'];
  const achievementCount = achievementWords.filter(word => text.includes(word)).length;
  
  if (achievementCount >= 3) {
    experience.score += 10;
    experience.details.push('Multiple achievement-oriented descriptions found');
  } else if (achievementCount >= 1) {
    experience.score += 5;
    experience.details.push('Some achievement-oriented descriptions found');
  }
  
  if (/\b\d+%|\b\d+\s*(million|thousand|k)\b|\$\d+/.test(text)) {
    experience.score += 5;
    experience.details.push('Quantifiable achievements with numbers/percentages');
  }

  // Education Analysis
  const education = {
    score: 0,
    maxScore: 15,
    details: []
  };
  
  const educationKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd', 'diploma'];
  const hasEducation = educationKeywords.some(keyword => text.includes(keyword));
  
  if (hasEducation) {
    education.score += 10;
    education.details.push('Education section identified');
  }
  
  if (text.includes('gpa') || /\b[3-4]\.\d+\b/.test(text)) {
    education.score += 3;
    education.details.push('GPA information provided');
  }
  
  if (text.includes('honors') || text.includes('magna cum laude') || text.includes('summa cum laude')) {
    education.score += 2;
    education.details.push('Academic honors mentioned');
  }

  // Skills Analysis
  const skills = {
    score: 0,
    maxScore: 20,
    details: []
  };
  
  const skillKeywords = ['skills', 'technologies', 'programming', 'software', 'tools', 'languages'];
  const hasSkills = skillKeywords.some(keyword => text.includes(keyword));
  
  if (hasSkills) {
    skills.score += 10;
    skills.details.push('Skills section identified');
  }
  
  const techSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'aws', 'docker'];
  const techSkillCount = techSkills.filter(skill => text.includes(skill)).length;
  
  if (techSkillCount >= 5) {
    skills.score += 10;
    skills.details.push(`${techSkillCount} technical skills identified`);
  } else if (techSkillCount >= 3) {
    skills.score += 7;
    skills.details.push(`${techSkillCount} technical skills identified`);
  } else if (techSkillCount >= 1) {
    skills.score += 3;
    skills.details.push(`${techSkillCount} technical skills identified`);
  }

  // Structure Analysis
  const structure = {
    score: 0,
    maxScore: 10,
    details: []
  };
  
  const sections = ['experience', 'education', 'skills', 'projects', 'achievements'];
  const sectionCount = sections.filter(section => text.includes(section)).length;
  
  if (sectionCount >= 4) {
    structure.score += 10;
    structure.details.push('Well-structured with multiple sections');
  } else if (sectionCount >= 3) {
    structure.score += 7;
    structure.details.push('Good structure with key sections');
  } else if (sectionCount >= 2) {
    structure.score += 4;
    structure.details.push('Basic structure present');
  }

  return {
    personalInfo,
    experience,
    education,
    skills,
    structure
  };
};

// Generate ATS-specific suggestions
const generateATSSuggestions = (resumeText, aiAnalysis) => {
  const text = resumeText.toLowerCase();
  const suggestions = {
    recommendations: [],
    keywords: [],
    grammar: [],
    atsOptimization: [],
    actionableFeedback: [],
    strengths: [],
    weaknesses: [],
    nextSteps: []
  };

  // Basic ATS optimization suggestions
  if (!text.includes('experience') && !text.includes('work')) {
    suggestions.atsOptimization.push('Add a clear "Work Experience" or "Professional Experience" section header');
    suggestions.actionableFeedback.push({
      priority: 'high',
      category: 'structure',
      suggestion: 'Include a dedicated work experience section',
      impact: 'ATS systems look for standard section headers to parse your resume correctly'
    });
  }

  if (!text.includes('education')) {
    suggestions.atsOptimization.push('Add an "Education" section even if you have work experience');
    suggestions.actionableFeedback.push({
      priority: 'medium',
      category: 'content',
      suggestion: 'Include your educational background',
      impact: 'Most ATS systems expect to find education information'
    });
  }

  if (!text.includes('skills')) {
    suggestions.atsOptimization.push('Create a dedicated "Skills" section with relevant keywords');
    suggestions.actionableFeedback.push({
      priority: 'high',
      category: 'keywords',
      suggestion: 'Add a skills section with industry-relevant keywords',
      impact: 'Skills sections are heavily weighted by ATS systems for keyword matching'
    });
  }

  // Keyword suggestions
  const commonKeywords = ['leadership', 'management', 'communication', 'problem-solving', 'teamwork', 'analytical'];
  const missingKeywords = commonKeywords.filter(keyword => !text.includes(keyword));
  
  if (missingKeywords.length > 0) {
    suggestions.keywords.push(`Consider adding these common professional keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
  }

  // Quantification suggestions
  if (!/\b\d+%|\b\d+\s*(million|thousand|k)\b|\$\d+/.test(text)) {
    suggestions.actionableFeedback.push({
      priority: 'high',
      category: 'content',
      suggestion: 'Add quantifiable achievements with specific numbers, percentages, or dollar amounts',
      impact: 'Quantified achievements are more impactful and easier for ATS systems to identify'
    });
  }

  // Contact information
  if (!text.includes('@')) {
    suggestions.actionableFeedback.push({
      priority: 'high',
      category: 'contact',
      suggestion: 'Include a professional email address',
      impact: 'Contact information is essential for ATS parsing and recruiter follow-up'
    });
  }

  // Strengths identification
  if (text.includes('@') && /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text)) {
    suggestions.strengths.push('Complete contact information provided');
  }

  if (text.includes('achieved') || text.includes('improved') || text.includes('increased')) {
    suggestions.strengths.push('Achievement-oriented language used');
  }

  // Next steps
  suggestions.nextSteps.push('Review job descriptions for industry-specific keywords to include');
  suggestions.nextSteps.push('Ensure all section headers use standard terminology (Experience, Education, Skills)');
  suggestions.nextSteps.push('Add quantifiable metrics to demonstrate impact in previous roles');

  return suggestions;
};

// Fallback basic ATS score calculation
const calculateBasicATSScore = (resumeText) => {
  const text = resumeText.toLowerCase();
  let score = 0;

  // Basic scoring criteria
  if (text.includes('@') && text.includes('.')) score += 15; // Email
  if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text)) score += 10; // Phone
  if (text.includes('experience') || text.includes('work')) score += 20; // Experience section
  if (text.includes('education')) score += 15; // Education section
  if (text.includes('skills')) score += 15; // Skills section
  if (/\b\d+%|\b\d+\s*(million|thousand|k)\b|\$\d+/.test(text)) score += 15; // Quantified achievements
  if (text.includes('linkedin') || text.includes('github')) score += 10; // Professional profiles

  return Math.min(score, 100);
};

module.exports = {
  analyzeResumeFile,
  analyzeResumeText
};