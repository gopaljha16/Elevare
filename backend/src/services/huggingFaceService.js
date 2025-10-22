const axios = require('axios');

class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUG_API_KEY;
    this.apiUrl = 'https://api-inference.huggingface.co/models';
  }

  // Chat with Hugging Face model
  async chat(message, portfolioContext = {}) {
    try {
      const prompt = this.buildPrompt(message, portfolioContext);
      
      const response = await axios.post(
        `${this.apiUrl}/mistralai/Mixtral-8x7B-Instruct-v0.1`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const text = response.data[0]?.generated_text || response.data.generated_text || '';
      return this.parseResponse(text);
      
    } catch (error) {
      console.error('Hugging Face API Error:', error.response?.data || error.message);
      throw new Error('Failed to get AI response');
    }
  }

  buildPrompt(message, context) {
    const { name, skills, experience, summary } = context;
    
    return `You are a professional portfolio advisor. Help improve this portfolio.

Portfolio Info:
- Name: ${name || 'Not provided'}
- Skills: ${skills?.join(', ') || 'Not provided'}
- Experience: ${experience || 'Not provided'}
- Summary: ${summary || 'Not provided'}

User Question: ${message}

Provide specific, actionable advice. Be concise and helpful.

Response:`;
  }

  parseResponse(text) {
    // Clean up the response
    const cleaned = text.trim();
    
    return {
      content: cleaned,
      suggestions: this.extractSuggestions(cleaned),
      actions: []
    };
  }

  extractSuggestions(text) {
    const suggestions = [];
    
    if (text.toLowerCase().includes('summary')) {
      suggestions.push('Improve summary');
    }
    if (text.toLowerCase().includes('skill')) {
      suggestions.push('Add more skills');
    }
    if (text.toLowerCase().includes('project')) {
      suggestions.push('Add projects');
    }
    if (text.toLowerCase().includes('experience')) {
      suggestions.push('Enhance experience');
    }
    
    return suggestions;
  }

  // Generate portfolio content with AI
  async generatePortfolioContent(resumeData) {
    try {
      const prompt = `Create a professional portfolio summary for:

Name: ${resumeData.personal?.name}
Skills: ${resumeData.skills?.technical?.join(', ')}
Experience: ${resumeData.experience?.map(e => `${e.title} at ${e.company}`).join(', ')}

Write a compelling 2-3 sentence professional summary that highlights their expertise and value.

Summary:`;

      const response = await axios.post(
        `${this.apiUrl}/mistralai/Mixtral-8x7B-Instruct-v0.1`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.8
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data[0]?.generated_text?.trim() || resumeData.summary;
      
    } catch (error) {
      console.error('Content generation error:', error);
      return resumeData.summary;
    }
  }
}

module.exports = new HuggingFaceService();