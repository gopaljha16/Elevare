/**
 * AI Service for Resume Analysis and Content Generation
 * Integrates with backend AI endpoints for resume optimization
 */

class AIService {
  constructor() {
    this.baseURL = '/api/ai';
  }

  /**
   * Analyze resume comprehensively
   * @param {Object} resumeData - Resume data object
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeResume(resumeData) {
    try {
      const response = await fetch(`${this.baseURL}/resume/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  }

  /**
   * Generate content for specific resume section
   * @param {string} section - Section type (summary, experience, etc.)
   * @param {Object} context - Context data for generation
   * @returns {Promise<Object>} - Generated content
   */
  async generateContent(section, context) {
    try {
      const response = await fetch(`${this.baseURL}/resume/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          section,
          context,
          action: 'generate'
        })
      });

      if (!response.ok) {
        throw new Error('Content generation failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Content generation error:', error);
      throw error;
    }
  }

  /**
   * Optimize existing content
   * @param {string} section - Section type
   * @param {string} currentContent - Current content to optimize
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} - Optimized content
   */
  async optimizeContent(section, currentContent, context = {}) {
    try {
      const response = await fetch(`${this.baseURL}/resume/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          section,
          currentContent,
          context,
          action: 'optimize'
        })
      });

      if (!response.ok) {
        throw new Error('Content optimization failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Content optimization error:', error);
      throw error;
    }
  }

  /**
   * Get ATS score and recommendations
   * @param {Object} resumeData - Resume data object
   * @returns {Promise<Object>} - ATS analysis results
   */
  async getATSScore(resumeData) {
    try {
      const response = await fetch(`${this.baseURL}/resume/ats-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        throw new Error('ATS analysis failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('ATS analysis error:', error);
      throw error;
    }
  }

  /**
   * Suggest template based on user profile
   * @param {Object} userProfile - User profile data
   * @returns {Promise<Object>} - Template recommendation
   */
  async suggestTemplate(userProfile) {
    try {
      const response = await fetch(`${this.baseURL}/resume/suggest-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userProfile)
      });

      if (!response.ok) {
        throw new Error('Template suggestion failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Template suggestion error:', error);
      throw error;
    }
  }

  /**
   * Generate professional summary
   * @param {Object} profileData - User profile information
   * @returns {Promise<string>} - Generated summary
   */
  async generateSummary(profileData) {
    const context = {
      experience: profileData.experience || [],
      skills: profileData.skills || [],
      industry: profileData.industry || '',
      yearsOfExperience: profileData.yearsOfExperience || 0,
      targetRole: profileData.targetRole || ''
    };

    const result = await this.generateContent('summary', context);
    return result.summary;
  }

  /**
   * Enhance job descriptions
   * @param {Array} experiences - Array of experience objects
   * @returns {Promise<Array>} - Enhanced experiences
   */
  async enhanceExperiences(experiences) {
    const promises = experiences.map(async (exp) => {
      const context = {
        position: exp.position,
        company: exp.company,
        description: exp.description,
        achievements: exp.achievements || []
      };

      const result = await this.optimizeContent('experience', exp.description, context);
      return {
        ...exp,
        description: result.optimizedDescription,
        achievements: result.suggestedAchievements || exp.achievements
      };
    });

    return Promise.all(promises);
  }

  /**
   * Suggest relevant skills
   * @param {Object} profileData - User profile data
   * @returns {Promise<Array>} - Suggested skills
   */
  async suggestSkills(profileData) {
    const context = {
      industry: profileData.industry || '',
      experience: profileData.experience || [],
      targetRole: profileData.targetRole || '',
      currentSkills: profileData.skills || []
    };

    const result = await this.generateContent('skills', context);
    return result.suggestedSkills || [];
  }

  /**
   * Generate project descriptions
   * @param {Array} projects - Array of project objects
   * @returns {Promise<Array>} - Enhanced projects
   */
  async enhanceProjects(projects) {
    const promises = projects.map(async (project) => {
      const context = {
        name: project.name,
        technologies: project.technologies || [],
        description: project.description || ''
      };

      const result = await this.optimizeContent('projects', project.description, context);
      return {
        ...project,
        description: result.optimizedDescription || project.description
      };
    });

    return Promise.all(promises);
  }

  /**
   * Chat with AI assistant
   * @param {string} message - User message
   * @param {Object} context - Resume context
   * @returns {Promise<Object>} - AI response
   */
  async chatWithAI(message, context) {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message,
          context,
          conversationId: this.getConversationId()
        })
      });

      if (!response.ok) {
        throw new Error('AI chat failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }

  /**
   * Get keyword suggestions for job matching
   * @param {string} jobDescription - Job description text
   * @param {Object} resumeData - Current resume data
   * @returns {Promise<Object>} - Keyword analysis
   */
  async getKeywordSuggestions(jobDescription, resumeData) {
    try {
      const response = await fetch(`${this.baseURL}/resume/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          jobDescription,
          resumeData
        })
      });

      if (!response.ok) {
        throw new Error('Keyword analysis failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Keyword analysis error:', error);
      throw error;
    }
  }

  /**
   * Fallback analysis for when AI is unavailable
   * @param {Object} resumeData - Resume data
   * @returns {Object} - Basic analysis
   */
  getFallbackAnalysis(resumeData) {
    const analysis = {
      overallScore: this.calculateBasicScore(resumeData),
      strengths: [],
      weaknesses: [],
      actionableFeedback: [],
      sectionAnalysis: {}
    };

    // Basic scoring logic
    if (resumeData.personalInfo?.firstName && resumeData.personalInfo?.email) {
      analysis.strengths.push('Complete contact information provided');
    } else {
      analysis.weaknesses.push('Missing essential contact information');
      analysis.actionableFeedback.push({
        section: 'personalInfo',
        suggestion: 'Complete your contact information',
        priority: 'high',
        category: 'content'
      });
    }

    if (resumeData.experience?.length > 0) {
      analysis.strengths.push('Work experience included');
    } else {
      analysis.weaknesses.push('No work experience provided');
      analysis.actionableFeedback.push({
        section: 'experience',
        suggestion: 'Add your work experience',
        priority: 'high',
        category: 'content'
      });
    }

    if (resumeData.skills?.length >= 5) {
      analysis.strengths.push('Good variety of skills listed');
    } else {
      analysis.weaknesses.push('Limited skills listed');
      analysis.actionableFeedback.push({
        section: 'skills',
        suggestion: 'Add more relevant skills',
        priority: 'medium',
        category: 'content'
      });
    }

    return analysis;
  }

  /**
   * Calculate basic resume score
   * @param {Object} resumeData - Resume data
   * @returns {number} - Score out of 100
   */
  calculateBasicScore(resumeData) {
    let score = 0;

    // Personal info (30 points)
    if (resumeData.personalInfo?.firstName) score += 5;
    if (resumeData.personalInfo?.lastName) score += 5;
    if (resumeData.personalInfo?.email) score += 10;
    if (resumeData.personalInfo?.phone) score += 5;
    if (resumeData.personalInfo?.location) score += 5;

    // Content (40 points)
    if (resumeData.summary?.length > 0) score += 10;
    if (resumeData.experience?.length > 0) score += 15;
    if (resumeData.education?.length > 0) score += 10;
    if (resumeData.skills?.length >= 3) score += 5;

    // Additional sections (30 points)
    if (resumeData.projects?.length > 0) score += 10;
    if (resumeData.certifications?.length > 0) score += 10;
    if (resumeData.skills?.length >= 8) score += 5;
    if (resumeData.experience?.some(exp => exp.achievements?.length > 0)) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Get or create conversation ID for chat continuity
   * @returns {string} - Conversation ID
   */
  getConversationId() {
    let conversationId = sessionStorage.getItem('ai_conversation_id');
    if (!conversationId) {
      conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('ai_conversation_id', conversationId);
    }
    return conversationId;
  }

  /**
   * Clear conversation history
   */
  clearConversation() {
    sessionStorage.removeItem('ai_conversation_id');
  }

  /**
   * Get AI usage statistics
   * @returns {Promise<Object>} - Usage stats
   */
  async getUsageStats() {
    try {
      const response = await fetch(`${this.baseURL}/usage`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get usage stats');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Usage stats error:', error);
      return {
        requestsUsed: 0,
        requestsLimit: 100,
        resetDate: new Date()
      };
    }
  }
}

export default new AIService();