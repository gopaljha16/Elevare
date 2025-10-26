// AI Chat Service for Portfolio Builder
class ChatService {
  constructor() {
    this.baseURL = '/api';
    this.chatHistory = new Map();
  }

  /**
   * Send message to AI chat service
   * @param {string} message - User message
   * @param {Object} portfolioData - Current portfolio data
   * @param {string} sessionId - Chat session ID
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} AI response
   */
  async sendMessage(message, portfolioData, sessionId = 'default', context = {}) {
    try {
      console.log('💬 Sending chat message:', message);
      console.log('📊 Portfolio context:', portfolioData?.personal?.name);

      const response = await fetch(`${this.baseURL}/chat/portfolio-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          portfolioData,
          sessionId,
          context: {
            ...context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Chat service error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Store in local history
        this.addToHistory(sessionId, {
          type: 'user',
          message,
          timestamp: new Date()
        });
        
        this.addToHistory(sessionId, {
          type: 'assistant',
          message: result.data.content,
          suggestions: result.data.suggestions,
          actions: result.data.actions,
          timestamp: new Date()
        });

        return {
          success: true,
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Chat service failed');
      }

    } catch (error) {
      console.error('❌ Chat service error:', error);
      
      // Return fallback response
      return {
        success: false,
        data: this.getFallbackResponse(message, portfolioData)
      };
    }
  }

  /**
   * Get fallback response when AI service is unavailable
   * @param {string} message - User message
   * @param {Object} portfolioData - Portfolio data
   * @returns {Object} Fallback response
   */
  getFallbackResponse(message, portfolioData) {
    const lowerMessage = message.toLowerCase();
    
    // Analyze message intent
    if (lowerMessage.includes('summary') || lowerMessage.includes('about')) {
      return {
        content: "I can help you improve your professional summary! A great summary should highlight your key skills, experience, and what makes you unique. Would you like me to suggest improvements based on your current information?",
        suggestions: [
          "Make my summary more compelling",
          "Add specific achievements to summary",
          "Optimize summary for my industry",
          "Make summary more concise"
        ],
        actions: [{
          type: 'update_summary',
          data: this.generateImprovedSummary(portfolioData)
        }]
      };
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
      return {
        content: "Let's enhance your skills section! I can help you organize your technical skills, add missing ones, or suggest how to present them more effectively.",
        suggestions: [
          "Add trending technologies to my skills",
          "Organize skills by category",
          "Suggest missing skills for my role",
          "Rate my skill proficiency levels"
        ]
      };
    }
    
    if (lowerMessage.includes('project') || lowerMessage.includes('portfolio')) {
      return {
        content: "Your projects section is crucial for showcasing your abilities! I can help you improve project descriptions, suggest new projects, or optimize how you present them.",
        suggestions: [
          "Improve my project descriptions",
          "Suggest new project ideas",
          "Add technical details to projects",
          "Optimize project presentation"
        ]
      };
    }
    
    if (lowerMessage.includes('missing') || lowerMessage.includes('section')) {
      const missingSections = this.analyzeMissingSections(portfolioData);
      return {
        content: `Based on your portfolio, here are some sections that could strengthen your profile: ${missingSections.join(', ')}. Would you like me to help you add any of these?`,
        suggestions: [
          "Add certifications section",
          "Include volunteer experience",
          "Add testimonials/recommendations",
          "Include awards and achievements"
        ]
      };
    }
    
    // Default response
    return {
      content: "I'm here to help you create an amazing portfolio! I can assist with improving your summary, organizing skills, enhancing project descriptions, and much more. What would you like to work on?",
      suggestions: [
        "Improve my professional summary",
        "Enhance my skills section",
        "Better project descriptions",
        "What sections am I missing?",
        "Make my portfolio more professional",
        "Optimize for my target industry"
      ]
    };
  }

  /**
   * Generate improved summary based on portfolio data
   * @param {Object} portfolioData - Portfolio data
   * @returns {string} Improved summary
   */
  generateImprovedSummary(portfolioData) {
    const name = portfolioData?.personal?.name || 'Professional';
    const skills = portfolioData?.skills?.technical?.slice(0, 3) || ['technology'];
    const experience = portfolioData?.experience?.[0];
    
    let summary = `${experience?.title || 'Professional'} with expertise in ${skills.join(', ')}. `;
    
    if (experience?.company) {
      summary += `Currently contributing to innovative solutions at ${experience.company}. `;
    }
    
    summary += `Passionate about creating high-quality, scalable applications and driving technical excellence. `;
    summary += `Committed to continuous learning and delivering impactful results in collaborative environments.`;
    
    return summary;
  }

  /**
   * Analyze missing sections in portfolio
   * @param {Object} portfolioData - Portfolio data
   * @returns {Array} Missing sections
   */
  analyzeMissingSections(portfolioData) {
    const missing = [];
    
    if (!portfolioData?.certifications || portfolioData.certifications.length === 0) {
      missing.push('Certifications');
    }
    
    if (!portfolioData?.projects || portfolioData.projects.length < 2) {
      missing.push('More Projects');
    }
    
    if (!portfolioData?.education || portfolioData.education.length === 0) {
      missing.push('Education');
    }
    
    if (!portfolioData?.personal?.linkedin) {
      missing.push('LinkedIn Profile');
    }
    
    if (!portfolioData?.personal?.github) {
      missing.push('GitHub Profile');
    }
    
    return missing;
  }

  /**
   * Add message to chat history
   * @param {string} sessionId - Session ID
   * @param {Object} message - Message object
   */
  addToHistory(sessionId, message) {
    if (!this.chatHistory.has(sessionId)) {
      this.chatHistory.set(sessionId, []);
    }
    
    const history = this.chatHistory.get(sessionId);
    history.push(message);
    
    // Keep only last 50 messages
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  /**
   * Get chat history for session
   * @param {string} sessionId - Session ID
   * @returns {Array} Chat history
   */
  getHistory(sessionId) {
    return this.chatHistory.get(sessionId) || [];
  }

  /**
   * Clear chat history for session
   * @param {string} sessionId - Session ID
   */
  async clearChatHistory(sessionId) {
    try {
      // Clear server-side history if available
      await fetch(`${this.baseURL}/chat/clear-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      });
    } catch (error) {
      console.warn('Failed to clear server-side chat history:', error);
    }
    
    // Clear local history
    this.chatHistory.delete(sessionId);
  }

  /**
   * Get suggested improvements for portfolio
   * @param {Object} portfolioData - Portfolio data
   * @returns {Array} Improvement suggestions
   */
  getPortfolioSuggestions(portfolioData) {
    const suggestions = [];
    
    // Check summary
    if (!portfolioData?.summary || portfolioData.summary.length < 100) {
      suggestions.push({
        type: 'summary',
        priority: 'high',
        title: 'Enhance Professional Summary',
        description: 'Your summary could be more detailed and compelling'
      });
    }
    
    // Check skills
    if (!portfolioData?.skills?.technical || portfolioData.skills.technical.length < 5) {
      suggestions.push({
        type: 'skills',
        priority: 'medium',
        title: 'Add More Technical Skills',
        description: 'Consider adding more relevant technical skills'
      });
    }
    
    // Check projects
    if (!portfolioData?.projects || portfolioData.projects.length < 3) {
      suggestions.push({
        type: 'projects',
        priority: 'high',
        title: 'Showcase More Projects',
        description: 'Add more projects to demonstrate your capabilities'
      });
    }
    
    // Check contact info
    if (!portfolioData?.personal?.linkedin || !portfolioData?.personal?.github) {
      suggestions.push({
        type: 'contact',
        priority: 'medium',
        title: 'Complete Contact Information',
        description: 'Add LinkedIn and GitHub profiles'
      });
    }
    
    return suggestions;
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;