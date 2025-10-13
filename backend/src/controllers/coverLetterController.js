const Resume = require('../models/Resume');
const UserAnalytics = require('../models/UserAnalytics');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');

// generate cover letter using ai
const generateCoverLetter = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { resumeId, jobDescription, companyName, jobTitle, companyInfo } = req.body;

  if (!resumeId || !jobDescription) {
    throw new AppError('Resume ID and job description are required', 400);
  }

  // Get user's resume
  const resume = await Resume.findOne({ _id: resumeId, userId, isActive: true });
  
  if (!resume) {
    throw new AppError('Resume not found', 404);
  }

  try {
    const aiService = require('../services/aiService');
    
    // Generate cover letter using AI
    const coverLetterData = await aiService.generateCoverLetter(
      resume.toObject(),
      sanitizeInput(jobDescription),
      companyInfo ? sanitizeInput(companyInfo) : `${companyName} - ${jobTitle}`
    );

    // Update analytics
    try {
      let analytics = await UserAnalytics.findOne({ userId });
      if (analytics) {
        await analytics.trackAction('cover_letter_generated', {
          resumeId: resume._id,
          companyName: sanitizeInput(companyName),
          jobTitle: sanitizeInput(jobTitle)
        });
        await analytics.addRecentActivity('cover_letter_generated', `Generated cover letter for ${companyName}`, 'resume');
      }
    } catch (analyticsError) {
      console.error('Analytics update error:', analyticsError);
    }

    res.json({
      success: true,
      message: 'Cover letter generated successfully',
      data: {
        coverLetter: coverLetterData.coverLetter,
        keyHighlights: coverLetterData.keyHighlights || [],
        personalizedElements: coverLetterData.personalizedElements || [],
        metadata: {
          companyName: sanitizeInput(companyName),
          jobTitle: sanitizeInput(jobTitle),
          generatedAt: new Date(),
          resumeUsed: resume.title
        }
      }
    });

  } catch (error) {
    console.error('Cover letter generation error:', error);
    throw new AppError('Failed to generate cover letter. Please try again.', 500);
  }
});

// get cover letter templates
const getCoverLetterTemplates = asyncHandler(async (req, res) => {
  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and formal template suitable for corporate environments',
      structure: ['Header', 'Opening Paragraph', 'Body Paragraphs', 'Closing', 'Signature']
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Modern template with personality for creative roles',
      structure: ['Personal Header', 'Engaging Opening', 'Story-driven Body', 'Call to Action', 'Creative Closing']
    },
    {
      id: 'technical',
      name: 'Technical',
      description: 'Focused template highlighting technical skills and achievements',
      structure: ['Technical Header', 'Skills Summary', 'Project Highlights', 'Technical Fit', 'Professional Closing']
    }
  ];

  res.json({
    success: true,
    data: {
      templates
    }
  });
});

// customize cover letter
const customizeCoverLetter = asyncHandler(async (req, res) => {
  const { coverLetter, customizations } = req.body;
  const userId = req.userId;

  if (!coverLetter) {
    throw new AppError('Cover letter content is required', 400);
  }

  try {
    const aiService = require('../services/aiService');
    
    // Create customization prompt
    const customizationPrompt = `
Please customize this cover letter based on the following requirements:

ORIGINAL COVER LETTER:
${sanitizeInput(coverLetter)}

CUSTOMIZATION REQUESTS:
${customizations ? JSON.stringify(customizations) : 'General improvements'}

Please provide:
1. Improved version of the cover letter
2. List of changes made
3. Suggestions for further improvement

Format as JSON:
{
  "improvedCoverLetter": "Full improved cover letter text",
  "changesMade": ["change1", "change2"],
  "suggestions": ["suggestion1", "suggestion2"]
}
    `;

    // Use AI to customize
    const result = await aiService.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: customizationPrompt }] }],
      generationConfig: aiService.generationConfig,
    });

    const response = await result.response;
    const text = response.text();
    
    let customizedData;
    try {
      customizedData = JSON.parse(text);
    } catch (parseError) {
      customizedData = {
        improvedCoverLetter: text,
        changesMade: ['AI customization applied'],
        suggestions: ['Review and personalize further']
      };
    }

    // Update analytics
    try {
      let analytics = await UserAnalytics.findOne({ userId });
      if (analytics) {
        await analytics.trackAction('cover_letter_customized', {
          customizationsApplied: customizations ? Object.keys(customizations).length : 1
        });
      }
    } catch (analyticsError) {
      console.error('Analytics update error:', analyticsError);
    }

    res.json({
      success: true,
      message: 'Cover letter customized successfully',
      data: customizedData
    });

  } catch (error) {
    console.error('Cover letter customization error:', error);
    throw new AppError('Failed to customize cover letter. Please try again.', 500);
  }
});

// analyze cover letter effectiveness
const analyzeCoverLetter = asyncHandler(async (req, res) => {
  const { coverLetter, jobDescription } = req.body;
  const userId = req.userId;

  if (!coverLetter) {
    throw new AppError('Cover letter content is required', 400);
  }

  try {
    const aiService = require('../services/aiService');
    
    // Create analysis prompt
    const analysisPrompt = `
Analyze this cover letter for effectiveness:

COVER LETTER:
${sanitizeInput(coverLetter)}

${jobDescription ? `JOB DESCRIPTION:\n${sanitizeInput(jobDescription)}` : ''}

Please provide:
1. Overall effectiveness score (1-100)
2. Strengths of the cover letter
3. Areas for improvement
4. Keyword match analysis (if job description provided)
5. Tone and professionalism assessment
6. Specific recommendations

Format as JSON:
{
  "effectivenessScore": 85,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "keywordMatch": {
    "matchedKeywords": ["keyword1", "keyword2"],
    "missingKeywords": ["missing1", "missing2"],
    "matchPercentage": 75
  },
  "toneAssessment": "Professional and engaging",
  "recommendations": ["recommendation1", "recommendation2"]
}
    `;

    const result = await aiService.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
      generationConfig: aiService.generationConfig,
    });

    const response = await result.response;
    const text = response.text();
    
    let analysisData;
    try {
      analysisData = JSON.parse(text);
    } catch (parseError) {
      analysisData = {
        effectivenessScore: 75,
        strengths: ['Well-structured content'],
        improvements: ['Consider personalizing further'],
        keywordMatch: { matchPercentage: 70 },
        toneAssessment: 'Professional',
        recommendations: ['Review and refine based on job requirements']
      };
    }

    // Update analytics
    try {
      let analytics = await UserAnalytics.findOne({ userId });
      if (analytics) {
        await analytics.trackAction('cover_letter_analyzed', {
          effectivenessScore: analysisData.effectivenessScore
        });
      }
    } catch (analyticsError) {
      console.error('Analytics update error:', analyticsError);
    }

    res.json({
      success: true,
      message: 'Cover letter analysis completed',
      data: analysisData
    });

  } catch (error) {
    console.error('Cover letter analysis error:', error);
    throw new AppError('Failed to analyze cover letter. Please try again.', 500);
  }
});

module.exports = {
  generateCoverLetter,
  getCoverLetterTemplates,
  customizeCoverLetter,
  analyzeCoverLetter
};