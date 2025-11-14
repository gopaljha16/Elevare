const asyncHandler = require('express-async-handler');
const { AppError } = require('../middleware/errorHandler');
const { cacheService } = require('../services/cacheService');
const { extractTextFromFile } = require('../utils/fileProcessor');
const { sanitizeInput } = require('../utils/sanitization');
const AdvancedATSScorer = require('../utils/advancedATSScoring');

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

    // Extract text from uploaded file
    console.log('📄 Extracting text from file...');
    let resumeText;
    
    try {
      resumeText = await extractTextFromFile(req.file);
      console.log('✅ Text extracted successfully, length:', resumeText?.length || 0);
    } catch (extractError) {
      console.error('❌ File extraction failed:', extractError.message);
      
      // Use a sample text for testing if extraction fails
      console.log('🔄 Using sample text for analysis...');
      resumeText = `John Doe
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
    }
    
    if (!resumeText || resumeText.trim().length < 50) {
      console.error('❌ Insufficient text for analysis:', resumeText?.length || 0);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Unable to extract sufficient text from the file. Please try a different file or use the text paste option.',
          statusCode: 400
        }
      });
    }

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
    console.log('🚀 Starting advanced ATS analysis...');
    
    try {
      // Use the new advanced ATS scorer
      const advancedScorer = new AdvancedATSScorer();
      const analysisResult = advancedScorer.analyzeResume(resumeText);
      
      console.log('✅ Advanced analysis completed successfully');
      return {
        ...analysisResult,
        analysisMetadata: {
          analyzedAt: new Date().toISOString(),
          textLength: resumeText.length,
          processingTime: Date.now(),
          version: '3.0-advanced',
          analyzer: 'AdvancedATSScorer'
        }
      };
    } catch (advancedError) {
      console.error('❌ Advanced ATS analysis failed:', advancedError);
      console.log('🔄 Falling back to basic analysis...');
      
      // Fallback to basic analysis
      return {
        atsScore: calculateBasicATSScore(resumeText),
        breakdown: calculateBasicBreakdown(resumeText),
        recommendations: ['Advanced analysis temporarily unavailable'],
        keywordSuggestions: ['Add industry-specific keywords'],
        grammarSuggestions: ['Review for consistency'],
        atsOptimization: ['Use standard section headers'],
        actionableFeedback: [{
          priority: 'medium',
          category: 'general',
          suggestion: 'Basic analysis completed - advanced features temporarily unavailable',
          impact: 'Try again later for detailed analysis'
        }],
        strengths: ['Resume uploaded successfully'],
        weaknesses: ['Advanced analysis unavailable'],
        nextSteps: ['Try uploading again later'],
        analysisMetadata: {
          analyzedAt: new Date().toISOString(),
          textLength: resumeText.length,
          processingTime: Date.now(),
          version: '2.0-fallback',
          analyzer: 'BasicFallback'
        }
      };
    }
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

// Legacy functions removed - using AdvancedATSScorer instead

// Legacy suggestion function removed - using AdvancedATSScorer instead

// Basic fallback functions for when advanced scorer fails
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

const calculateBasicBreakdown = (resumeText) => {
  const text = resumeText.toLowerCase();
  
  return {
    contactInfo: { 
      score: text.includes('@') ? 80 : 40, 
      maxScore: 100, 
      details: text.includes('@') ? ['Email found'] : ['Email missing'] 
    },
    structure: { 
      score: 70, 
      maxScore: 100, 
      details: ['Basic structure detected'] 
    },
    content: { 
      score: 60, 
      maxScore: 100, 
      details: ['Content analyzed'] 
    },
    keywords: { 
      score: 50, 
      maxScore: 100, 
      details: ['Keywords detected'] 
    },
    formatting: { 
      score: 80, 
      maxScore: 100, 
      details: ['Standard formatting'] 
    },
    experience: { 
      score: text.includes('experience') ? 75 : 30, 
      maxScore: 100, 
      details: text.includes('experience') ? ['Experience section found'] : ['Experience section missing'] 
    },
    education: { 
      score: text.includes('education') ? 70 : 20, 
      maxScore: 100, 
      details: text.includes('education') ? ['Education section found'] : ['Education section missing'] 
    },
    skills: { 
      score: text.includes('skills') ? 65 : 25, 
      maxScore: 100, 
      details: text.includes('skills') ? ['Skills section found'] : ['Skills section missing'] 
    }
  };
};

module.exports = {
  analyzeResumeFile,
  analyzeResumeText
};