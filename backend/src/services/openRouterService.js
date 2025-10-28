const axios = require('axios');

class OpenRouterService {
  constructor() {
    this.apiKey = "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";
    this.model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';
    this.baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    
    if (!this.apiKey) {
      console.warn('⚠️ OPENROUTER_API_KEY not found. Portfolio AI features will use fallback.');
    } else {
      console.log('✅ OpenRouter service initialized with model:', this.model);
    }
  }

  /**
   * Generate portfolio code using OpenRouter (DeepSeek)
   * @param {string} prompt - User's portfolio description
   * @param {string} userName - User's name
   * @param {Object} currentCode - Current code for improvements (optional)
   * @param {boolean} isImprovement - Whether this is an improvement request
   * @returns {Promise<Object>} Generated code {html, css, js, message}
   */
  async generatePortfolioCode(prompt, userName, currentCode = null, isImprovement = false) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      let systemPrompt, userPrompt;

      if (isImprovement && currentCode) {
        systemPrompt = `You are Elevare Portfolio Generator, the world's most elite web design AI that creates MIND-BLOWING, AWARD-WINNING websites. You excel at improving existing code to make it absolutely REVOLUTIONARY.`;
        
        userPrompt = `Improve this portfolio website for ${userName} based on their request.

Current Code:
HTML:
${currentCode.html}

CSS:
${currentCode.css}

JavaScript:
${currentCode.js}

Improvement Request: ${prompt}

Create an IMPROVED version that's even more stunning and responsive. Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "html": "improved HTML body content with extensive content (no DOCTYPE, html, head, or body tags)",
  "css": "improved CSS with perfect mobile responsiveness and award-winning styling",
  "js": "improved JavaScript with cutting-edge interactivity",
  "message": "Brief description of revolutionary improvements made"
}

Requirements:
- Make it SUPER RESPONSIVE (mobile-first, perfect on all devices)
- Add advanced animations and interactions
- Use glassmorphism, gradients, and modern effects
- Ensure perfect mobile optimization
- Include rich, detailed content`;

      } else {
        systemPrompt = `You are Elevare Portfolio Generator, the world's most elite web design AI that creates MIND-BLOWING, AWARD-WINNING websites that look like they cost $100,000+. You ONLY create websites that would win design awards and make people say "HOLY SH*T, THIS IS INCREDIBLE!"`;
        
        userPrompt = `Create a REVOLUTIONARY, BREATHTAKING portfolio website for ${userName}.

User's Vision: ${prompt}

🔥 CREATE AN AWARD-WINNING MASTERPIECE WITH:

EXTENSIVE CONTENT & STRUCTURE:
- Stunning hero section with animated backgrounds and ${userName}'s name
- Comprehensive about section with detailed bio and personality
- Advanced skills showcase with interactive cards and proficiency levels
- Rich projects/portfolio section with 4-6 detailed project cards
- Professional experience timeline with achievements
- Testimonials section with client feedback
- Services/offerings section with detailed descriptions
- Contact section with interactive form and social links
- Premium footer with multiple columns and links

SUPER RESPONSIVE DESIGN (MOBILE-FIRST):
- Perfect on ALL devices: mobile (320px+), tablet (768px+), desktop (1024px+), ultra-wide (1920px+)
- Fluid typography using clamp(): font-size: clamp(1rem, 4vw, 2.5rem)
- Responsive spacing: padding: clamp(1rem, 5vw, 3rem)
- Mobile-optimized touch interactions (44px minimum touch targets)
- Responsive navigation with mobile hamburger menu
- Adaptive layouts that reflow beautifully on all screen sizes
- Touch-friendly hover alternatives for mobile devices

CUTTING-EDGE VISUAL EFFECTS:
- Advanced glassmorphism: backdrop-filter: blur(20px); background: rgba(255,255,255,0.05)
- Stunning gradients: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)
- 3D transforms with mobile fallbacks: transform: perspective(1000px) rotateX(10deg)
- Premium shadows: box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)
- Morphing shapes: border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%
- Animated gradient backgrounds and particle effects
- Smooth transitions and micro-interactions

ADVANCED INTERACTIVITY:
- Scroll-triggered animations with Intersection Observer
- Smooth parallax effects (optimized for mobile)
- Interactive particle systems
- Advanced form validation with real-time feedback
- Smooth page transitions and loading states
- Animated counters and progress bars
- Interactive image galleries with lightbox
- Mobile-friendly carousels with touch gestures
- Dark/light mode toggle with smooth transitions

PREMIUM FEATURES:
- Responsive sticky navigation with scroll effects
- Animated skill bars and proficiency indicators
- Interactive project cards with hover/touch effects
- Testimonial carousel with auto-play
- Contact form with validation and success states
- Social media integration with animated icons
- Newsletter signup section
- Scroll-to-top button with smooth animation
- Loading screen with brand animation

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "html": "complete semantic HTML5 body content with EXTENSIVE sections and rich content (no DOCTYPE, html, head, or body tags)",
  "css": "complete responsive CSS with mobile-first approach, advanced effects, and PERFECT responsiveness across ALL devices",
  "js": "complete vanilla JavaScript with advanced interactions, scroll animations, and responsive behaviors",
  "message": "Brief description of the revolutionary portfolio created"
}

CRITICAL REQUIREMENTS:
- SUPER RESPONSIVE: Must work flawlessly on mobile, tablet, desktop, and ultra-wide screens
- EXTENSIVE CONTENT: Rich, detailed content in every section - never sparse or minimal
- AWARD-WINNING DESIGN: Must look like it belongs in Awwwards or CSS Design Awards
- SMOOTH ANIMATIONS: All animations must be smooth, purposeful, and mobile-optimized
- PERFECT SPACING: Every element must have perfect spacing and alignment on all screen sizes
- ACCESSIBLE: Proper ARIA labels, semantic HTML, and keyboard navigation
- PERFORMANT: Optimized for fast loading and smooth performance on all devices

Make this portfolio so stunning that ${userName} and everyone who sees it will be absolutely AMAZED! Create a MASTERPIECE that would make Apple, Google, and Tesla jealous! 🚀✨`;
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 16000, // Increased for extensive content
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
            'X-Title': 'Elevare Portfolio Builder'
          },
          timeout: 120000 // 120 second timeout for extensive content generation
        }
      );

      const content = response.data.choices[0].message.content;
      
      // Parse the JSON response
      let cleanedText = content.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\n?|\n?```/g, '');
      cleanedText = cleanedText.replace(/```\n?|\n?```/g, '');
      
      // Extract JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.html || !parsed.css || !parsed.js) {
        throw new Error('AI response missing required fields');
      }

      return {
        html: parsed.html,
        css: parsed.css,
        js: parsed.js,
        message: parsed.message || 'Portfolio generated successfully!'
      };

    } catch (error) {
      console.error('❌ OpenRouter API error details:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error Message:', error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenRouter API key');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 402) {
        throw new Error('Insufficient credits. Please add credits to your OpenRouter account.');
      } else if (error.response?.status === 400) {
        throw new Error(`Bad request: ${error.response?.data?.error?.message || 'Invalid request parameters'}`);
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new Error('Request timeout. The AI model is taking too long to respond.');
      }
      
      throw error;
    }
  }

  /**
   * Check if OpenRouter service is available
   * @returns {boolean}
   */
  isAvailable() {
    return !!this.apiKey;
  }
}

module.exports = new OpenRouterService();
