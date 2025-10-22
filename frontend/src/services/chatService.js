import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ChatService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/chat`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Chat API Error:', error);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
      };
    }
  }

  /**
   * Send a chat message and get AI response
   * @param {string} message - User message
   * @param {Object} portfolioData - Current portfolio data
   * @param {string} portfolioId - Portfolio ID
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} AI response
   */
  async sendMessage(message, portfolioData = null, portfolioId = 'default', context = {}) {
    try {
      const response = await this.api.post('/message', {
        message,
        portfolioData,
        portfolioId,
        context,
      });

      return {
        success: true,
        data: response.data.response,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send message',
        data: this.getFallbackResponse(message, portfolioData),
      };
    }
  }

  /**
   * Get chat history for a portfolio
   * @param {string} portfolioId - Portfolio ID
   * @returns {Promise<Object>} Chat history
   */
  async getChatHistory(portfolioId = 'default') {
    try {
      const response = await this.api.get(`/history/${portfolioId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get chat history',
        data: [],
      };
    }
  }

  /**
   * Clear chat history for a portfolio
   * @param {string} portfolioId - Portfolio ID
   * @returns {Promise<Object>} Success status
   */
  async clearChatHistory(portfolioId = 'default') {
    try {
      const response = await this.api.delete(`/history/${portfolioId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to clear chat history',
      };
    }
  }

  /**
   * Get portfolio improvement suggestions
   * @param {Object} portfolioData - Portfolio data to analyze
   * @returns {Promise<Object>} Suggestions and analysis
   */
  async getPortfolioSuggestions(portfolioData) {
    try {
      const response = await this.api.post('/suggestions', {
        portfolioData,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get suggestions',
        data: this.getFallbackSuggestions(portfolioData),
      };
    }
  }

  /**
   * Apply a portfolio suggestion
   * @param {string} suggestionType - Type of suggestion
   * @param {Object} portfolioData - Current portfolio data
   * @param {Object} suggestionData - Suggestion data to apply
   * @returns {Promise<Object>} Updated portfolio data
   */
  async applySuggestion(suggestionType, portfolioData, suggestionData) {
    try {
      const response = await this.api.post('/apply-suggestion', {
        suggestionType,
        portfolioData,
        suggestionData,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to apply suggestion',
        data: portfolioData, // Return original data on error
      };
    }
  }

  /**
   * Get fallback response when API is unavailable
   * @param {string} message - User message
   * @param {Object} portfolioData - Portfolio data
   * @returns {Object} Fallback response
   */
  getFallbackResponse(message, portfolioData) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('summary') || lowerMessage.includes('about')) {
      return {
        content: "I can help you improve your professional summary! A great summary should be concise, highlight your key skills, and show what makes you unique. Would you like me to suggest some improvements?",
        suggestions: [
          "Make it more engaging",
          "Add industry keywords",
          "Highlight achievements",
          "Keep it concise"
        ],
        actions: []
      };
    }

    if (lowerMessage.includes('skills')) {
      return {
        content: "Let's work on your skills section! I recommend organizing them by category (Technical, Tools, Soft Skills) and focusing on the most relevant ones for your target role.",
        suggestions: [
          "Organize by category",
          "Add proficiency levels",
          "Remove outdated skills",
          "Add trending technologies"
        ],
        actions: []
      };
    }

    if (lowerMessage.includes('project')) {
      return {
        content: "Great project descriptions should tell a story! Include the problem you solved, your approach, technologies used, and the impact. Don't forget links to demos or code.",
        suggestions: [
          "Improve descriptions",
          "Add project metrics",
          "Include demo links",
          "Highlight technologies"
        ],
        actions: []
      };
    }

    if (lowerMessage.includes('missing') || lowerMessage.includes('section')) {
      return {
        content: "I can help identify missing sections in your portfolio! Common sections include: Certifications, Achievements, Testimonials, and Blog/Articles. Which would you like to add?",
        suggestions: [
          "Add Certifications",
          "Add Achievements",
          "Add Testimonials",
          "Add Blog section"
        ],
        actions: []
      };
    }

    // Default response
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
  }

  /**
   * Get fallback suggestions when API is unavailable
   * @param {Object} portfolioData - Portfolio data
   * @returns {Object} Fallback suggestions
   */
  getFallbackSuggestions(portfolioData) {
    const suggestions = [];
    let score = 50; // Base score

    // Check summary
    if (!portfolioData.summary || portfolioData.summary.length < 50) {
      suggestions.push({
        type: 'summary',
        priority: 'high',
        title: 'Improve Professional Summary',
        description: 'Your summary needs to be more detailed and engaging.',
        action: 'Write a stronger professional summary'
      });
    } else {
      score += 15;
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
    } else {
      score += 20;
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
    } else {
      score += 15;
    }

    return {
      score: Math.min(score, 100),
      suggestions,
      strengths: this.identifyStrengths(portfolioData),
      improvements: suggestions.length
    };
  }

  /**
   * Identify portfolio strengths
   * @param {Object} portfolioData - Portfolio data
   * @returns {Array} List of strengths
   */
  identifyStrengths(portfolioData) {
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
  }

  /**
   * Generate contextual suggestions based on user input
   * @param {string} message - User message
   * @param {Object} portfolioData - Portfolio data
   * @returns {Array} Contextual suggestions
   */
  generateContextualSuggestions(message, portfolioData) {
    const suggestions = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('improve')) {
      suggestions.push("What specific area would you like to improve?");
    }

    if (lowerMessage.includes('industry')) {
      suggestions.push("Which industry are you targeting?");
    }

    if (lowerMessage.includes('job') || lowerMessage.includes('role')) {
      suggestions.push("What type of role are you applying for?");
    }

    if (lowerMessage.includes('template') || lowerMessage.includes('design')) {
      suggestions.push("Would you like to change your portfolio template?");
    }

    return suggestions;
  }
}

// Create and export a singleton instance
const chatService = new ChatService();
export default chatService;