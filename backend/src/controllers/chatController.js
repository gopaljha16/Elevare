const { asyncHandler, AppError } = require('../middleware/errorHandler');
const huggingFaceService = require('../services/huggingFaceService');
const ChatHistory = require('../models/ChatHistory');

// Send chat message and get AI response
const sendChatMessage = asyncHandler(async (req, res) => {
  const { message, portfolioData, portfolioId, context } = req.body;
  const userId = req.userId || 'demo-user';

  if (!message || !message.trim()) {
    throw new AppError('Message is required', 400);
  }

  try {
    // Get AI response using Hugging Face
    const portfolioContext = {
      name: portfolioData?.personal?.name,
      skills: portfolioData?.skills?.technical,
      experience: portfolioData?.experience?.map(e => `${e.title} at ${e.company}`).join(', '),
      summary: portfolioData?.summary
    };
    
    const aiResponse = await huggingFaceService.chat(message, portfolioContext);
    
    // Save chat history
    const chatEntry = {
      portfolioId: portfolioId || 'default',
      userId,
      messages: [
        {
          type: 'user',
          content: message,
          timestamp: new Date()
        },
        {
          type: 'bot',
          content: aiResponse.content,
          timestamp: new Date(),
          suggestions: aiResponse.suggestions,
          actions: aiResponse.actions
        }
      ]
    };

    // In production, save to database
    // await ChatHistory.create(chatEntry);

    res.json({
      success: true,
      response: aiResponse,
      message: 'Chat message processed successfully'
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Return error but with fallback
    res.json({
      success: false,
      response: {
        content: "I'm having trouble connecting right now. Please try: 'Improve my summary' or 'Add more skills'",
        suggestions: ['Improve summary', 'Add skills', 'Enhance experience'],
        actions: []
      },
      message: 'Using fallback response'
    });
  }
});



// Extract improved content from AI response
const extractImprovedContent = (text, type) => {
  // Look for quoted content or specific patterns
  const quotedContent = text.match(/"([^"]+)"/);
  if (quotedContent) {
    return quotedContent[1];
  }
  
  // Fallback to generating improved content
  if (type === 'summary') {
    return "Passionate professional with expertise in modern technologies and a proven track record of delivering innovative solutions that drive business growth and user satisfaction.";
  }
  
  return text;
};

// Extract skill suggestions from AI response
const extractSkillSuggestions = (text) => {
  const skills = {
    technical: [],
    soft: [],
    trending: []
  };
  
  // Extract mentioned technologies
  const techKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes'];
  techKeywords.forEach(tech => {
    if (text.toLowerCase().includes(tech.toLowerCase())) {
      skills.technical.push(tech);
    }
  });
  
  return skills;
};

// Extract project suggestions from AI response
const extractProjectSuggestions = (text) => {
  return {
    improvements: [
      "Add quantifiable metrics and results",
      "Include live demo links",
      "Highlight problem-solving approach",
      "Mention technologies used"
    ],
    newProjects: [
      "Personal portfolio website",
      "Open source contribution",
      "Industry-specific application"
    ]
  };
};

// Get contextual suggestions based on response
const getContextualSuggestions = (text, portfolioData) => {
  const suggestions = [];
  
  if (text.toLowerCase().includes('missing')) {
    suggestions.push("Show missing sections");
  }
  
  if (text.toLowerCase().includes('industry')) {
    suggestions.push("Optimize for specific industry");
  }
  
  if (text.toLowerCase().includes('seo')) {
    suggestions.push("Improve SEO optimization");
  }
  
  return suggestions;
};

// Fallback response when AI is unavailable
const getFallbackResponse = (message, portfolioData) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('summary')) {
    return {
      content: "I can help you improve your professional summary! A great summary should highlight your key skills, experience, and what makes you unique. It should be concise (2-3 sentences) and tailored to your target role.",
      suggestions: [
        "Write a new summary",
        "Add industry keywords",
        "Highlight achievements",
        "Make it more engaging"
      ],
      actions: []
    };
  }
  
  if (lowerMessage.includes('skills')) {
    return {
      content: "Let's organize your skills section! I recommend grouping them by category (Technical, Tools, Soft Skills) and focusing on the most relevant ones for your target role. Consider adding proficiency levels too.",
      suggestions: [
        "Reorganize by category",
        "Add proficiency levels",
        "Remove outdated skills",
        "Add trending technologies"
      ],
      actions: []
    };
  }
  
  if (lowerMessage.includes('project')) {
    return {
      content: "Great project descriptions should tell a story! Include the problem you solved, your approach, technologies used, and the impact. Don't forget to add links to live demos or code repositories.",
      suggestions: [
        "Improve descriptions",
        "Add project metrics",
        "Include demo links",
        "Highlight technologies"
      ],
      actions: []
    };
  }
  
  return {
    content: "I'm here to help you improve your portfolio! I can assist with writing better summaries, organizing skills, improving project descriptions, optimizing for specific industries, and much more. What would you like to work on?",
    suggestions: [
      "Improve summary",
      "Organize skills",
      "Better project descriptions",
      "Industry optimization"
    ],
    actions: []
  };
};

// Get chat history for a portfolio
const getChatHistory = asyncHandler(async (req, res) => {
  const { portfolioId } = req.params;
  const userId = req.userId || 'demo-user';

  // In production, fetch from database
  // const history = await ChatHistory.find({ portfolioId, userId }).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: [], // Return empty for demo
    message: 'Chat history retrieved successfully'
  });
});

// Clear chat history
const clearChatHistory = asyncHandler(async (req, res) => {
  const { portfolioId } = req.params;
  const userId = req.userId || 'demo-user';

  // In production, delete from database
  // await ChatHistory.deleteMany({ portfolioId, userId });
  
  res.json({
    success: true,
    message: 'Chat history cleared successfully'
  });
});

// Get portfolio improvement suggestions
const getPortfolioSuggestions = asyncHandler(async (req, res) => {
  const { portfolioData } = req.body;

  if (!portfolioData) {
    throw new AppError('Portfolio data is required', 400);
  }

  const suggestions = analyzePortfolio(portfolioData);
  
  res.json({
    success: true,
    data: suggestions,
    message: 'Portfolio analysis completed'
  });
});

// Analyze portfolio and provide suggestions
const analyzePortfolio = (portfolioData) => {
  const suggestions = [];
  
  // Check summary
  if (!portfolioData.summary || portfolioData.summary.length < 50) {
    suggestions.push({
      type: 'summary',
      priority: 'high',
      title: 'Improve Professional Summary',
      description: 'Your summary is too short or missing. A compelling summary should be 2-3 sentences highlighting your expertise.',
      action: 'Write a stronger professional summary'
    });
  }
  
  // Check skills
  if (!portfolioData.skills?.technical || portfolioData.skills.technical.length < 5) {
    suggestions.push({
      type: 'skills',
      priority: 'high',
      title: 'Add More Technical Skills',
      description: 'Include more relevant technical skills to showcase your expertise.',
      action: 'Add 5-10 relevant technical skills'
    });
  }
  
  // Check projects
  if (!portfolioData.projects || portfolioData.projects.length < 3) {
    suggestions.push({
      type: 'projects',
      priority: 'medium',
      title: 'Add More Projects',
      description: 'Showcase at least 3-5 projects to demonstrate your capabilities.',
      action: 'Add more project examples'
    });
  }
  
  // Check contact information
  if (!portfolioData.personal?.email || !portfolioData.personal?.linkedin) {
    suggestions.push({
      type: 'contact',
      priority: 'high',
      title: 'Complete Contact Information',
      description: 'Ensure all contact methods are provided for potential employers.',
      action: 'Add missing contact information'
    });
  }
  
  // Check for missing sections
  const missingSections = [];
  if (!portfolioData.certifications) missingSections.push('Certifications');
  if (!portfolioData.achievements) missingSections.push('Achievements');
  if (!portfolioData.testimonials) missingSections.push('Testimonials');
  
  if (missingSections.length > 0) {
    suggestions.push({
      type: 'sections',
      priority: 'medium',
      title: 'Add Missing Sections',
      description: `Consider adding: ${missingSections.join(', ')}`,
      action: 'Add recommended sections'
    });
  }
  
  return {
    score: calculatePortfolioScore(portfolioData),
    suggestions,
    strengths: identifyStrengths(portfolioData),
    improvements: suggestions.length
  };
};

// Calculate portfolio completeness score
const calculatePortfolioScore = (portfolioData) => {
  let score = 0;
  const maxScore = 100;
  
  // Personal info (20 points)
  if (portfolioData.personal?.name) score += 5;
  if (portfolioData.personal?.email) score += 5;
  if (portfolioData.personal?.linkedin) score += 5;
  if (portfolioData.personal?.github) score += 5;
  
  // Summary (15 points)
  if (portfolioData.summary && portfolioData.summary.length > 50) score += 15;
  
  // Skills (20 points)
  if (portfolioData.skills?.technical?.length >= 5) score += 20;
  
  // Experience (20 points)
  if (portfolioData.experience?.length >= 1) score += 20;
  
  // Projects (15 points)
  if (portfolioData.projects?.length >= 3) score += 15;
  
  // Education (10 points)
  if (portfolioData.education?.length >= 1) score += 10;
  
  return Math.min(score, maxScore);
};

// Identify portfolio strengths
const identifyStrengths = (portfolioData) => {
  const strengths = [];
  
  if (portfolioData.skills?.technical?.length >= 8) {
    strengths.push('Diverse technical skill set');
  }
  
  if (portfolioData.projects?.length >= 5) {
    strengths.push('Strong project portfolio');
  }
  
  if (portfolioData.experience?.length >= 3) {
    strengths.push('Extensive work experience');
  }
  
  if (portfolioData.summary && portfolioData.summary.length > 100) {
    strengths.push('Detailed professional summary');
  }
  
  return strengths;
};

// Apply portfolio suggestion
const applyPortfolioSuggestion = asyncHandler(async (req, res) => {
  const { suggestionType, portfolioData, suggestionData } = req.body;

  if (!suggestionType || !portfolioData) {
    throw new AppError('Suggestion type and portfolio data are required', 400);
  }

  let updatedPortfolio = { ...portfolioData };
  
  switch (suggestionType) {
    case 'update_summary':
      updatedPortfolio.summary = suggestionData;
      break;
      
    case 'update_skills':
      updatedPortfolio.skills = { ...updatedPortfolio.skills, ...suggestionData };
      break;
      
    case 'add_section':
      updatedPortfolio[suggestionData.type] = suggestionData.content;
      break;
      
    default:
      throw new AppError('Unknown suggestion type', 400);
  }
  
  res.json({
    success: true,
    data: updatedPortfolio,
    message: 'Portfolio updated successfully'
  });
});

module.exports = {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  getPortfolioSuggestions,
  applyPortfolioSuggestion
};