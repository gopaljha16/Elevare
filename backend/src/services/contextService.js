const Redis = require('redis');

class ContextService {
  constructor() {
    this.contexts = new Map(); // In-memory fallback
    this.redis = null;
    
    // Try to initialize Redis if available
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = Redis.createClient({
          url: process.env.REDIS_URL
        });
        
        await this.redis.connect();
        console.log('✅ Context service initialized with Redis');
      } else {
        console.log('📝 Context service using in-memory storage (Redis not configured)');
      }
    } catch (error) {
      console.warn('⚠️ Redis connection failed, using in-memory context storage:', error.message);
      this.redis = null;
    }
  }

  /**
   * Store portfolio generation context
   * @param {string} userId - User ID
   * @param {Object} context - Context data
   */
  async storeContext(userId, context) {
    const contextData = {
      ...context,
      timestamp: Date.now(),
      version: context.version || 1
    };

    try {
      if (this.redis) {
        await this.redis.setEx(
          `portfolio_context:${userId}`, 
          3600, // 1 hour TTL
          JSON.stringify(contextData)
        );
      } else {
        this.contexts.set(userId, contextData);
      }
    } catch (error) {
      console.error('Context storage error:', error);
      // Fallback to memory
      this.contexts.set(userId, contextData);
    }
  }

  /**
   * Retrieve portfolio generation context
   * @param {string} userId - User ID
   * @returns {Object|null} Context data
   */
  async getContext(userId) {
    try {
      if (this.redis) {
        const data = await this.redis.get(`portfolio_context:${userId}`);
        return data ? JSON.parse(data) : null;
      } else {
        return this.contexts.get(userId) || null;
      }
    } catch (error) {
      console.error('Context retrieval error:', error);
      return this.contexts.get(userId) || null;
    }
  }

  /**
   * Update existing context with new information
   * @param {string} userId - User ID
   * @param {Object} updates - Updates to apply
   */
  async updateContext(userId, updates) {
    const existingContext = await this.getContext(userId) || {};
    
    const updatedContext = {
      ...existingContext,
      ...updates,
      timestamp: Date.now(),
      version: (existingContext.version || 0) + 1,
      history: [
        ...(existingContext.history || []),
        {
          timestamp: Date.now(),
          changes: updates
        }
      ].slice(-10) // Keep last 10 changes
    };

    await this.storeContext(userId, updatedContext);
    return updatedContext;
  }

  /**
   * Build enhanced prompt with context
   * @param {string} prompt - User's current prompt
   * @param {Object} context - Current context
   * @returns {string} Enhanced prompt with context
   */
  buildContextualPrompt(prompt, context) {
    if (!context || !context.previousGenerations) {
      return prompt;
    }

    const recentGenerations = context.previousGenerations.slice(-3); // Last 3 generations
    
    let contextualPrompt = `CONVERSATION CONTEXT:
Previous portfolio generations for this user:
${recentGenerations.map((gen, index) => `
${index + 1}. Previous request: "${gen.prompt}"
   - Generated: ${gen.sections?.join(', ') || 'Basic portfolio'}
   - Style: ${gen.style || 'Modern'}
   - User feedback: ${gen.feedback || 'None'}
`).join('')}

CURRENT REQUEST: "${prompt}"

Based on the conversation history above, understand what the user is trying to achieve and build upon their previous requests. If this is an improvement, reference the previous work. If it's a new direction, acknowledge the change while maintaining quality.`;

    return contextualPrompt;
  }

  /**
   * Extract key information from generated portfolio
   * @param {Object} generatedCode - Generated HTML, CSS, JS
   * @param {string} prompt - Original prompt
   * @returns {Object} Extracted information
   */
  extractPortfolioInfo(generatedCode, prompt) {
    const info = {
      prompt,
      timestamp: Date.now(),
      sections: [],
      style: 'modern',
      technologies: [],
      colorScheme: []
    };

    // Extract sections from HTML
    if (generatedCode.html) {
      const html = generatedCode.html.toLowerCase();
      if (html.includes('hero') || html.includes('banner')) info.sections.push('Hero');
      if (html.includes('about')) info.sections.push('About');
      if (html.includes('skills')) info.sections.push('Skills');
      if (html.includes('projects') || html.includes('portfolio')) info.sections.push('Projects');
      if (html.includes('experience') || html.includes('work')) info.sections.push('Experience');
      if (html.includes('contact')) info.sections.push('Contact');
      if (html.includes('testimonial')) info.sections.push('Testimonials');
      if (html.includes('service')) info.sections.push('Services');
    }

    // Extract style information from CSS
    if (generatedCode.css) {
      const css = generatedCode.css.toLowerCase();
      if (css.includes('gradient')) info.style = 'gradient';
      if (css.includes('minimal')) info.style = 'minimal';
      if (css.includes('dark')) info.style = 'dark';
      if (css.includes('glassmorphism') || css.includes('backdrop-filter')) info.style = 'glassmorphism';
      
      // Extract colors
      const colorMatches = css.match(/#[0-9a-f]{6}/gi) || [];
      info.colorScheme = [...new Set(colorMatches)].slice(0, 5); // Top 5 unique colors
    }

    // Extract technologies from content
    const allContent = `${generatedCode.html} ${generatedCode.css} ${generatedCode.js}`.toLowerCase();
    const techKeywords = ['react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'node.js', 'mongodb', 'sql', 'aws', 'docker'];
    info.technologies = techKeywords.filter(tech => allContent.includes(tech));

    return info;
  }

  /**
   * Clear context for a user
   * @param {string} userId - User ID
   */
  async clearContext(userId) {
    try {
      if (this.redis) {
        await this.redis.del(`portfolio_context:${userId}`);
      }
      this.contexts.delete(userId);
    } catch (error) {
      console.error('Context clearing error:', error);
      this.contexts.delete(userId);
    }
  }

  /**
   * Get context statistics
   * @param {string} userId - User ID
   * @returns {Object} Context statistics
   */
  async getContextStats(userId) {
    const context = await this.getContext(userId);
    
    if (!context) {
      return {
        totalGenerations: 0,
        lastGeneration: null,
        averageResponseTime: 0,
        commonStyles: [],
        commonSections: []
      };
    }

    const generations = context.previousGenerations || [];
    
    return {
      totalGenerations: generations.length,
      lastGeneration: generations[generations.length - 1]?.timestamp || null,
      averageResponseTime: generations.reduce((acc, gen) => acc + (gen.responseTime || 0), 0) / generations.length || 0,
      commonStyles: this.getMostCommon(generations.map(g => g.style)),
      commonSections: this.getMostCommon(generations.flatMap(g => g.sections || []))
    };
  }

  /**
   * Helper to get most common items from array
   * @param {Array} items - Array of items
   * @returns {Array} Most common items
   */
  getMostCommon(items) {
    const counts = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([item]) => item);
  }
}

module.exports = new ContextService();