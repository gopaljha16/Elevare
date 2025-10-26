const { GoogleGenerativeAI } = require('@google/generative-ai');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store chat sessions in memory (in production, use Redis or database)
const chatSessions = new Map();

/**
 * AI Portfolio Assistant - Main chat endpoint
 */
const portfolioAssistant = asyncHandler(async (req, res) => {
  const { message, portfolioData, sessionId = 'default', context = {} } = req.body;

  if (!message || !message.trim()) {
    throw new AppError('Message is required', 400);
  }

  console.log('💬 Portfolio Assistant Request:', {
    message: message.substring(0, 100) + '...',
    sessionId,
    hasPortfolioData: !!portfolioData,
    portfolioName: portfolioData?.personal?.name
  });

  try {
    // Get or create chat session
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, {
        history: [],
        createdAt: new Date(),
        lastActivity: new Date()
      });
    }

    const session = chatSessions.get(sessionId);
    session.lastActivity = new Date();

    // Generate AI response
    const aiResponse = await generateAIResponse(message, portfolioData, session.history, context);

    // Add to session history
    session.history.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse.content, timestamp: new Date() }
    );

    // Keep only last 20 messages to manage memory
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    res.json({
      success: true,
      data: aiResponse,
      sessionId,
      message: 'AI response generated successfully'
    });

  } catch (error) {
    console.error('❌ Portfolio Assistant Error:', error);
    
    // Return fallback response
    const fallbackResponse = generateFallbackResponse(message, portfolioData);
    
    res.json({
      success: false,
      data: fallbackResponse,
      message: 'AI service unavailable, using fallback response',
      error: error.message
    });
  }
});

/**
 * Generate AI response using Gemini
 */
const generateAIResponse = async (message, portfolioData, chatHistory, context) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build context for AI
    const portfolioContext = buildPortfolioContext(portfolioData);
    const conversationHistory = chatHistory.slice(-10).map(h => `${h.role}: ${h.content}`).join('\n');

    const systemPrompt = `You are an expert AI Portfolio Assistant. Your role is to help users create, improve, and optimize their professional portfolios.

CURRENT PORTFOLIO DATA:
${portfolioContext}

CONVERSATION HISTORY:
${conversationHistory}

USER CONTEXT:
- Current section: ${context.currentSection || 'portfolio-builder'}
- User intent: ${context.userIntent || 'portfolio-improvement'}
- Timestamp: ${context.timestamp || new Date().toISOString()}

INSTRUCTIONS:
1. Provide helpful, actionable advice for portfolio improvement
2. Be specific and personalized based on the user's actual data
3. Suggest concrete improvements, not generic advice
4. When appropriate, provide actionable suggestions the user can apply
5. Keep responses concise but informative (max 200 words)
6. Always be encouraging and professional
7. Focus on practical improvements that will make a real difference

RESPONSE FORMAT:
Your response should be helpful advice. If you have specific actionable suggestions, mention them naturally in your response.

CURRENT USER MESSAGE: "${message}"

Provide a helpful, personalized response based on their portfolio data and question.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const content = response.text().trim();

    // Analyze the message to determine if we should provide suggestions or actions
    const suggestions = generateSuggestions(message, portfolioData);
    const actions = generateActions(message, portfolioData);

    return {
      content,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      actions: actions.length > 0 ? actions : undefined,
      timestamp: new Date().toISOString(),
      confidence: 0.9
    };

  } catch (error) {
    console.error('❌ AI Response Generation Failed:', error);
    throw error;
  }
};

/**
 * Build portfolio context for AI
 */
const buildPortfolioContext = (portfolioData) => {
  if (!portfolioData) {
    return 'No portfolio data available.';
  }

  const context = [];

  // Personal Information
  if (portfolioData.personal) {
    context.push(`PERSONAL INFO:
Name: ${portfolioData.personal.name || 'Not provided'}
Email: ${portfolioData.personal.email || 'Not provided'}
Location: ${portfolioData.personal.location || 'Not provided'}
LinkedIn: ${portfolioData.personal.linkedin || 'Not provided'}
GitHub: ${portfolioData.personal.github || 'Not provided'}`);
  }

  // Summary
  if (portfolioData.summary) {
    context.push(`SUMMARY: ${portfolioData.summary}`);
  }

  // Skills
  if (portfolioData.skills) {
    context.push(`SKILLS:
Technical: ${portfolioData.skills.technical?.join(', ') || 'None listed'}
Soft: ${portfolioData.skills.soft?.join(', ') || 'None listed'}`);
  }

  // Experience
  if (portfolioData.experience && portfolioData.experience.length > 0) {
    context.push(`EXPERIENCE:
${portfolioData.experience.map(exp => 
  `- ${exp.title || 'Role'} at ${exp.company || 'Company'} (${exp.duration || 'Duration not specified'})`
).join('\n')}`);
  }

  // Projects
  if (portfolioData.projects && portfolioData.projects.length > 0) {
    context.push(`PROJECTS:
${portfolioData.projects.map(proj => 
  `- ${proj.name || 'Project'}: ${proj.description || 'No description'} (${proj.technologies?.join(', ') || 'No technologies listed'})`
).join('\n')}`);
  }

  // Education
  if (portfolioData.education && portfolioData.education.length > 0) {
    context.push(`EDUCATION:
${portfolioData.education.map(edu => 
  `- ${edu.degree || 'Degree'} from ${edu.institution || 'Institution'} (${edu.year || 'Year not specified'})`
).join('\n')}`);
  }

  return context.join('\n\n');
};

/**
 * Generate contextual suggestions based on user message
 */
const generateSuggestions = (message, portfolioData) => {
  const lowerMessage = message.toLowerCase();
  const suggestions = [];

  if (lowerMessage.includes('summary') || lowerMessage.includes('about')) {
    suggestions.push(
      "Make my summary more compelling",
      "Add specific achievements to summary",
      "Optimize summary for my industry"
    );
  } else if (lowerMessage.includes('skill')) {
    suggestions.push(
      "Add trending technologies to my skills",
      "Organize skills by proficiency level",
      "Suggest missing skills for my role"
    );
  } else if (lowerMessage.includes('project')) {
    suggestions.push(
      "Improve my project descriptions",
      "Add more technical details to projects",
      "Suggest new project ideas"
    );
  } else if (lowerMessage.includes('missing') || lowerMessage.includes('section')) {
    suggestions.push(
      "Add certifications section",
      "Include volunteer experience",
      "Add testimonials section"
    );
  } else {
    // Default suggestions
    suggestions.push(
      "Improve my professional summary",
      "Enhance my skills section",
      "Better project descriptions",
      "What sections am I missing?"
    );
  }

  return suggestions.slice(0, 4); // Limit to 4 suggestions
};

/**
 * Generate actionable items based on user message
 */
const generateActions = (message, portfolioData) => {
  const lowerMessage = message.toLowerCase();
  const actions = [];

  if (lowerMessage.includes('summary') && lowerMessage.includes('improve')) {
    const improvedSummary = generateImprovedSummary(portfolioData);
    if (improvedSummary) {
      actions.push({
        type: 'update_summary',
        data: improvedSummary,
        description: 'Apply improved summary'
      });
    }
  }

  if (lowerMessage.includes('skill') && lowerMessage.includes('add')) {
    const suggestedSkills = suggestSkills(portfolioData);
    if (suggestedSkills.length > 0) {
      actions.push({
        type: 'add_skills',
        data: suggestedSkills,
        description: 'Add suggested skills'
      });
    }
  }

  return actions;
};

/**
 * Generate improved summary based on portfolio data
 */
const generateImprovedSummary = (portfolioData) => {
  if (!portfolioData) return null;

  const name = portfolioData.personal?.name || 'Professional';
  const skills = portfolioData.skills?.technical?.slice(0, 3) || ['technology'];
  const experience = portfolioData.experience?.[0];
  const yearsExp = extractYearsOfExperience(portfolioData.experience);

  let summary = '';

  if (experience?.title) {
    summary += `${experience.title} with ${yearsExp} of experience specializing in ${skills.join(', ')}. `;
  } else {
    summary += `Experienced professional with expertise in ${skills.join(', ')}. `;
  }

  summary += `Passionate about creating innovative solutions and delivering high-quality results. `;
  
  if (portfolioData.projects && portfolioData.projects.length > 0) {
    summary += `Proven track record of successful project delivery and technical leadership. `;
  }

  summary += `Committed to continuous learning and driving excellence in collaborative environments.`;

  return summary;
};

/**
 * Extract years of experience from experience data
 */
const extractYearsOfExperience = (experience) => {
  if (!experience || experience.length === 0) return '2+ years';

  // Simple heuristic - count number of positions
  if (experience.length >= 3) return '5+ years';
  if (experience.length >= 2) return '3+ years';
  return '2+ years';
};

/**
 * Suggest skills based on existing skills and industry trends
 */
const suggestSkills = (portfolioData) => {
  const existingSkills = portfolioData?.skills?.technical || [];
  const suggestions = [];

  // Common complementary skills
  const skillSuggestions = {
    'JavaScript': ['TypeScript', 'Node.js', 'React', 'Vue.js'],
    'React': ['Redux', 'Next.js', 'TypeScript', 'Jest'],
    'Python': ['Django', 'Flask', 'FastAPI', 'Pandas'],
    'Node.js': ['Express.js', 'MongoDB', 'PostgreSQL', 'Docker'],
    'Java': ['Spring Boot', 'Maven', 'JUnit', 'Hibernate']
  };

  existingSkills.forEach(skill => {
    if (skillSuggestions[skill]) {
      skillSuggestions[skill].forEach(suggestedSkill => {
        if (!existingSkills.includes(suggestedSkill) && !suggestions.includes(suggestedSkill)) {
          suggestions.push(suggestedSkill);
        }
      });
    }
  });

  return suggestions.slice(0, 5); // Limit to 5 suggestions
};

/**
 * Generate fallback response when AI is unavailable
 */
const generateFallbackResponse = (message, portfolioData) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('summary')) {
    return {
      content: "I can help you improve your professional summary! A great summary should highlight your key skills, experience, and what makes you unique. Consider including specific achievements and technologies you work with.",
      suggestions: [
        "Make my summary more compelling",
        "Add specific achievements",
        "Include key technologies",
        "Optimize for my industry"
      ]
    };
  }

  if (lowerMessage.includes('skill')) {
    return {
      content: "Let's enhance your skills section! Consider organizing your skills by category (frontend, backend, tools) and adding any trending technologies relevant to your field.",
      suggestions: [
        "Add trending technologies",
        "Organize skills by category",
        "Rate skill proficiency levels",
        "Add soft skills"
      ]
    };
  }

  if (lowerMessage.includes('project')) {
    return {
      content: "Your projects section is crucial for showcasing your abilities! Make sure each project has a clear description, lists the technologies used, and includes links to live demos or GitHub repositories.",
      suggestions: [
        "Improve project descriptions",
        "Add technical details",
        "Include live demo links",
        "Highlight key achievements"
      ]
    };
  }

  // Default response
  return {
    content: "I'm here to help you create an amazing portfolio! I can assist with improving your summary, organizing skills, enhancing project descriptions, and ensuring you have all the essential sections.",
    suggestions: [
      "Improve my professional summary",
      "Enhance my skills section",
      "Better project descriptions",
      "What sections am I missing?"
    ]
  };
};

/**
 * Clear chat history for a session
 */
const clearChatHistory = asyncHandler(async (req, res) => {
  const { sessionId = 'default' } = req.body;

  if (chatSessions.has(sessionId)) {
    chatSessions.delete(sessionId);
  }

  res.json({
    success: true,
    message: 'Chat history cleared successfully'
  });
});

module.exports = {
  portfolioAssistant,
  clearChatHistory
};