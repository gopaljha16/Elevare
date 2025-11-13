const axios = require('axios');

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
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
        systemPrompt = `You are Elevare Portfolio Generator, an expert web design AI that makes TARGETED, PRECISE improvements to existing portfolios. You NEVER rebuild from scratch - you only modify what the user specifically requests while preserving everything else.`;
        
        userPrompt = `CRITICAL INSTRUCTIONS - READ CAREFULLY:

You are improving an EXISTING portfolio for ${userName}. The user wants SPECIFIC changes, NOT a complete rebuild.

CURRENT WORKING CODE (DO NOT DISCARD THIS):
HTML:
${currentCode.html}

CSS:
${currentCode.css}

JavaScript:
${currentCode.js}

USER'S SPECIFIC REQUEST: "${prompt}"

🎯 YOUR TASK:
1. ANALYZE the user's request carefully - what EXACTLY do they want changed?
2. KEEP 95% of the existing code unchanged
3. ONLY modify the specific elements mentioned in the request
4. PRESERVE all existing content, structure, and styling not mentioned
5. Make SURGICAL, TARGETED changes - not wholesale replacements

EXAMPLES OF TARGETED CHANGES:
- "Change colors to blue" → ONLY update color values in CSS, keep everything else
- "Add a contact form" → ONLY add form HTML/CSS/JS, keep all other sections
- "Make hero bigger" → ONLY adjust hero section height/padding, keep rest unchanged
- "Add animations" → ONLY add animation CSS/JS, keep existing structure
- "Fix mobile layout" → ONLY adjust responsive CSS, keep desktop styles

⚠️ CRITICAL RULES:
- If user says "change colors", ONLY change colors - don't rebuild sections
- If user says "add X", ONLY add X - don't remove or rebuild existing content
- If user says "improve Y", ONLY enhance Y - don't touch other sections
- MAINTAIN the same HTML structure unless specifically asked to change it
- PRESERVE all existing content (text, images, links) unless asked to change it
- Keep the same overall design aesthetic unless asked to change it

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "html": "the SAME HTML with ONLY the requested changes applied",
  "css": "the SAME CSS with ONLY the requested changes applied",
  "js": "the SAME JavaScript with ONLY the requested changes applied",
  "message": "Brief description of the SPECIFIC changes made (not a rebuild)"
}

Remember: You're making TARGETED IMPROVEMENTS, not creating a new portfolio!`;

      } else {
        systemPrompt = `You are Elevare Portfolio Generator, an expert web design AI that creates stunning, professional portfolio websites. You understand user intent deeply and create portfolios that perfectly match their vision and profession.`;
        
        userPrompt = `Create a professional, modern portfolio website for ${userName}.

User's Request: "${prompt}"

🎯 UNDERSTAND THE USER'S INTENT:
- Analyze their profession/role from the request
- Understand their style preferences (modern, minimal, creative, etc.)
- Identify what sections they need based on their field
- Match the tone and aesthetic to their profession

🔥 CREATE A STUNNING PORTFOLIO WITH:

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
