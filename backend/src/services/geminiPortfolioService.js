const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiPortfolioService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.isConfigured = !!this.apiKey;

        if (!this.isConfigured) {
            console.warn('⚠️ Gemini API key not configured');
        } else {
            console.log('✅ Gemini Portfolio service initialized');
            this.genAI = new GoogleGenerativeAI(this.apiKey);

            try {
                // Try gemini-pro first (most stable and widely available)
                this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
                console.log('✅ Successfully initialized with gemini-pro');
            } catch (error) {
                console.warn('⚠️ gemini-pro failed, trying gemini-1.5-pro...');
                try {
                    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
                    console.log('✅ Successfully initialized with gemini-1.5-pro (fallback)');
                } catch (fallbackError) {
                    console.error('❌ Failed to initialize any Gemini model:', fallbackError.message);
                    console.error('Available models might be: gemini-pro, gemini-1.5-pro, gemini-1.5-pro-latest');
                    this.genAI = null;
                    this.model = null;
                    this.isConfigured = false;
                }
            }
        }

        this.generationConfig = {
            temperature: 0.5, // Lower temperature for more consistent output
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 2048, // Much smaller to prevent truncation
        };

        // Test connection on startup (async, don't block initialization)
        if (this.isConfigured && this.model) {
            this.testConnection().catch(error => {
                console.warn('⚠️ Startup connection test failed:', error.message);
            });
        }
    }

    // List available models for debugging
    async listAvailableModels() {
        if (!this.genAI) return [];

        try {
            const models = await this.genAI.listModels();
            console.log('📋 Available Gemini models:', models.map(m => m.name));
            return models;
        } catch (error) {
            console.error('❌ Failed to list models:', error.message);
            return [];
        }
    }

    isAvailable() {
        return this.isConfigured && this.model;
    }

    // Test Gemini connection
    async testConnection() {
        if (!this.isAvailable()) {
            console.error('❌ Gemini service not available');
            return false;
        }

        try {
            console.log('🧪 Testing Gemini connection...');
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: 'Hello, respond with just "OK"' }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 10 },
            });

            const response = await result.response;
            const text = response.text();
            console.log('✅ Gemini connection test successful:', text);
            return true;
        } catch (error) {
            console.error('❌ Gemini connection test failed:', error.message);
            return false;
        }
    }

    async generatePortfolioCode(prompt, userName, currentCode = null, isImprovement = false) {
        if (!this.isAvailable()) {
            throw new Error('Gemini AI service not configured');
        }

        try {
            console.log('🎨 Generating portfolio with Gemini AI...');

            const systemPrompt = this.buildSystemPrompt(userName, isImprovement, currentCode);
            const userPrompt = this.buildUserPrompt(prompt, userName, isImprovement);

            const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

            // Try with current model first
            let result;
            try {
                // Add timeout to prevent hanging
                const generatePromise = this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                    generationConfig: this.generationConfig,
                });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Generation timeout after 30 seconds')), 30000)
                );

                result = await Promise.race([generatePromise, timeoutPromise]);
            } catch (modelError) {
                console.warn('⚠️ Current model failed, trying alternative models...');

                // Try alternative models
                const alternativeModels = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-pro-latest'];

                for (const modelName of alternativeModels) {
                    try {
                        console.log(`🔄 Trying model: ${modelName}`);
                        const altModel = this.genAI.getGenerativeModel({ model: modelName });
                        result = await altModel.generateContent({
                            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                            generationConfig: this.generationConfig,
                        });
                        console.log(`✅ Success with model: ${modelName}`);
                        break;
                    } catch (altError) {
                        console.warn(`❌ Model ${modelName} failed:`, altError.message);
                        continue;
                    }
                }

                if (!result) {
                    throw new Error('All Gemini models failed');
                }
            }

            const response = await result.response;
            const generatedText = response.text();

            return this.parseGeneratedCode(generatedText, userName);

        } catch (error) {
            console.error('❌ Gemini portfolio generation failed:', error);

            // List available models for debugging
            await this.listAvailableModels();

            // Fallback to template-based generation
            console.log('🔄 Using fallback template generation...');
            return this.generateFallbackPortfolio(prompt, userName);
        }
    }

    buildSystemPrompt(userName, isImprovement, currentCode) {
        return `Create a portfolio website for ${userName}. 

CRITICAL RULES:
1. Return ONLY JSON - no markdown, no code blocks, no explanations
2. Start response with { and end with }
3. Keep code compact - use minimal whitespace
4. Escape all quotes and newlines properly

JSON format:
{"html":"<section>content</section>","css":"body{color:red}","js":"console.log('hi')","message":"Portfolio created"}

Create:
- Hero section with ${userName}'s name
- About, Skills, Projects, Contact sections  
- Modern CSS with gradients (#667eea, #764ba2)
- Responsive design
- Smooth animations

${isImprovement ? 'IMPROVE existing code based on request.' : 'CREATE new portfolio from scratch.'}`;
    }

    buildUserPrompt(prompt, userName, isImprovement) {
        if (isImprovement) {
            return `IMPROVEMENT REQUEST for ${userName}'s portfolio:
"${prompt}"

SPECIFIC INSTRUCTIONS:
- Make ONLY the changes requested in the prompt above
- Keep all existing content, structure, and design that wasn't mentioned
- If the request is about colors, only change the color scheme
- If about layout, only adjust the layout elements mentioned
- If about content, only update the specific content areas
- If about functionality, only add/modify the requested features
- Preserve the user's existing work and only enhance what they asked for
- Maintain the same responsive design and accessibility features
- Keep the same overall visual style unless specifically asked to change it

The goal is to make targeted improvements, not rebuild everything.`;
        }

        // Analyze the prompt to understand what type of portfolio they want
        const promptLower = prompt.toLowerCase();
        const isDeveloper = promptLower.includes('developer') || promptLower.includes('programmer') || promptLower.includes('engineer') || promptLower.includes('coding');
        const isDesigner = promptLower.includes('designer') || promptLower.includes('creative') || promptLower.includes('artist') || promptLower.includes('ui/ux');
        const isMarketing = promptLower.includes('marketing') || promptLower.includes('social media') || promptLower.includes('content');
        const isBusiness = promptLower.includes('business') || promptLower.includes('entrepreneur') || promptLower.includes('consultant');

        let professionalContext = '';
        let skillsContext = '';
        let projectsContext = '';

        if (isDeveloper) {
            professionalContext = 'Full Stack Developer & Software Engineer';
            skillsContext = 'React, Node.js, Python, JavaScript, TypeScript, MongoDB, PostgreSQL, AWS, Docker, Git';
            projectsContext = 'E-commerce Platform, Task Management App, API Development, Mobile App, Web Application';
        } else if (isDesigner) {
            professionalContext = 'UI/UX Designer & Creative Professional';
            skillsContext = 'Figma, Adobe Creative Suite, Sketch, Prototyping, User Research, Wireframing, Branding';
            projectsContext = 'Mobile App Design, Website Redesign, Brand Identity, User Experience Research, Design System';
        } else if (isMarketing) {
            professionalContext = 'Digital Marketing Specialist';
            skillsContext = 'SEO, Social Media Marketing, Content Strategy, Google Analytics, PPC, Email Marketing';
            projectsContext = 'Brand Campaign, Social Media Strategy, Content Marketing, SEO Optimization, Marketing Analytics';
        } else if (isBusiness) {
            professionalContext = 'Business Professional & Consultant';
            skillsContext = 'Strategy, Leadership, Project Management, Business Analysis, Consulting, Team Management';
            projectsContext = 'Business Strategy, Process Optimization, Team Leadership, Market Analysis, Growth Initiative';
        } else {
            professionalContext = 'Professional & Creative Individual';
            skillsContext = 'Leadership, Communication, Problem Solving, Project Management, Innovation, Collaboration';
            projectsContext = 'Professional Project, Team Initiative, Creative Solution, Strategic Planning, Innovation Project';
        }

        return `CREATE A STUNNING PORTFOLIO for ${userName}

USER'S REQUEST: "${prompt}"

PROFESSIONAL CONTEXT:
- Name: ${userName}
- Suggested Title: ${professionalContext}
- Key Skills: ${skillsContext}
- Project Types: ${projectsContext}

SPECIFIC REQUIREMENTS:
1. HERO SECTION: 
   - Large, bold name "${userName}"
   - Professional title that matches their description
   - Compelling 2-3 sentence summary based on their prompt
   - Call-to-action buttons (View Work, Contact)
   - Stunning gradient background with animations

2. ABOUT SECTION:
   - Professional summary that reflects their background from the prompt
   - Personal touch that makes them memorable
   - Key strengths and what makes them unique
   - Professional photo placeholder

3. SKILLS SECTION:
   - Technical skills relevant to their field
   - Soft skills that complement their expertise
   - Tools and technologies they would use
   - Visual skill bars or interactive cards

4. PROJECTS SECTION:
   - 3-4 impressive projects relevant to their field
   - Each project should have: title, description, technologies, links
   - Make projects sound professional and impactful
   - Include placeholder GitHub/demo links
   - Use project cards with hover effects

5. CONTACT SECTION:
   - Professional contact information
   - Social media links (LinkedIn, GitHub, etc.)
   - Contact form or clear call-to-action
   - Professional email format

DESIGN STYLE:
- Match the tone from their prompt (professional, creative, modern, etc.)
- Use colors that reflect their personality/field
- Make it visually impressive but not overwhelming
- Ensure excellent mobile responsiveness
- Add subtle animations and hover effects
- Use modern typography and spacing
- Include smooth scrolling navigation

CONTENT TONE:
- Professional but personable
- Confident without being arrogant
- Specific to their field and expertise level
- Engaging and memorable
- Action-oriented

Create a portfolio that ${userName} would be proud to share with potential employers or clients!
Make it look like it was designed by a top-tier agency and cost thousands of dollars!`;
    }

    // Helper methods for context extraction
    extractSections(html) {
        if (!html) return 'None';
        const sections = [];
        if (html.includes('hero') || html.includes('Hero')) sections.push('Hero');
        if (html.includes('about') || html.includes('About')) sections.push('About');
        if (html.includes('skills') || html.includes('Skills')) sections.push('Skills');
        if (html.includes('projects') || html.includes('Projects')) sections.push('Projects');
        if (html.includes('contact') || html.includes('Contact')) sections.push('Contact');
        if (html.includes('experience') || html.includes('Experience')) sections.push('Experience');
        return sections.length > 0 ? sections.join(', ') : 'Basic structure';
    }

    extractColorScheme(css) {
        if (!css) return 'Default';
        const colors = [];
        if (css.includes('#667eea') || css.includes('blue')) colors.push('Blue');
        if (css.includes('#764ba2') || css.includes('purple')) colors.push('Purple');
        if (css.includes('#EC4899') || css.includes('pink')) colors.push('Pink');
        if (css.includes('gradient')) colors.push('Gradient');
        if (css.includes('dark')) colors.push('Dark theme');
        return colors.length > 0 ? colors.join(', ') : 'Standard colors';
    }

    extractTechnologies(html) {
        if (!html) return 'None mentioned';
        const techs = [];
        const techKeywords = ['React', 'JavaScript', 'Python', 'Node.js', 'CSS', 'HTML', 'TypeScript', 'Vue', 'Angular', 'MongoDB', 'SQL'];
        techKeywords.forEach(tech => {
            if (html.toLowerCase().includes(tech.toLowerCase())) {
                techs.push(tech);
            }
        });
        return techs.length > 0 ? techs.join(', ') : 'General web technologies';
    }

    parseGeneratedCode(generatedText, userName) {
        try {
            console.log('🔍 Parsing Gemini response...');

            // Try to extract JSON from the response
            let cleanedText = generatedText.trim();

            // Remove markdown code blocks if present
            cleanedText = cleanedText.replace(/```json\s*/g, '');
            cleanedText = cleanedText.replace(/\s*```/g, '');
            cleanedText = cleanedText.replace(/```/g, '');

            // Find the first complete JSON object
            let jsonStart = cleanedText.indexOf('{');
            if (jsonStart === -1) {
                throw new Error('No JSON object found in response');
            }

            // Find the matching closing brace
            let braceCount = 0;
            let jsonEnd = -1;

            for (let i = jsonStart; i < cleanedText.length; i++) {
                if (cleanedText[i] === '{') {
                    braceCount++;
                } else if (cleanedText[i] === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        jsonEnd = i;
                        break;
                    }
                }
            }

            if (jsonEnd === -1) {
                throw new Error('Incomplete JSON object in response');
            }

            const jsonString = cleanedText.substring(jsonStart, jsonEnd + 1);

            // Try to fix common JSON issues by properly escaping strings
            let fixedJson = this.fixJsonString(jsonString);

            const parsedData = JSON.parse(fixedJson);

            console.log('✅ Successfully parsed Gemini response');

            // Validate that we have the required structure
            if (parsedData.html && parsedData.css && parsedData.js) {
                return {
                    html: parsedData.html,
                    css: parsedData.css,
                    js: parsedData.js,
                    message: parsedData.message || `Portfolio generated successfully for ${userName}!`
                };
            } else {
                console.warn('⚠️ Gemini response missing required fields, using fallback');
                return this.generateFallbackPortfolio('professional portfolio', userName);
            }
        } catch (parseError) {
            console.warn('⚠️ Gemini response parsing failed:', parseError.message);
            console.log('🔄 Attempting alternative extraction...');

            // Try alternative extraction using regex patterns
            try {
                const alternativeResult = this.extractCodeAlternatively(generatedText, userName);
                if (alternativeResult) {
                    console.log('✅ Alternative extraction successful');
                    return alternativeResult;
                }
            } catch (altError) {
                console.warn('⚠️ Alternative extraction also failed:', altError.message);
            }

            // Try simple text extraction as last resort
            try {
                const simpleResult = this.extractSimpleCode(generatedText, userName);
                if (simpleResult) {
                    console.log('✅ Simple extraction successful');
                    return simpleResult;
                }
            } catch (simpleError) {
                console.warn('⚠️ Simple extraction also failed:', simpleError.message);
            }

            console.log('Raw Gemini response (first 1000 chars):', generatedText.substring(0, 1000));
            console.log('Raw Gemini response (last 500 chars):', generatedText.substring(Math.max(0, generatedText.length - 500)));
            return this.generateFallbackPortfolio('professional portfolio', userName);
        }
    }

    // Helper method to fix JSON string issues
    fixJsonString(jsonString) {
        // Split by quotes to handle string values properly
        let result = '';
        let inString = false;
        let escapeNext = false;

        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString[i];

            if (escapeNext) {
                result += char;
                escapeNext = false;
                continue;
            }

            if (char === '\\') {
                result += char;
                escapeNext = true;
                continue;
            }

            if (char === '"') {
                inString = !inString;
                result += char;
                continue;
            }

            if (inString) {
                // Inside a string, escape problematic characters
                if (char === '\n') {
                    result += '\\n';
                } else if (char === '\r') {
                    result += '\\r';
                } else if (char === '\t') {
                    result += '\\t';
                } else {
                    result += char;
                }
            } else {
                // Outside string, keep as is
                result += char;
            }
        }

        return result;
    }

    // Alternative extraction method using regex patterns
    extractCodeAlternatively(generatedText, userName) {
        try {
            // Look for HTML content
            const htmlMatch = generatedText.match(/"html":\s*"([^"]*(?:\\.[^"]*)*)"/s) ||
                generatedText.match(/html['"]\s*:\s*['"](.*?)['"]/s) ||
                generatedText.match(/<[^>]+>/s);

            // Look for CSS content  
            const cssMatch = generatedText.match(/"css":\s*"([^"]*(?:\\.[^"]*)*)"/s) ||
                generatedText.match(/css['"]\s*:\s*['"](.*?)['"]/s) ||
                generatedText.match(/\{[^}]*color[^}]*\}/s);

            // Look for JS content
            const jsMatch = generatedText.match(/"js":\s*"([^"]*(?:\\.[^"]*)*)"/s) ||
                generatedText.match(/js['"]\s*:\s*['"](.*?)['"]/s) ||
                generatedText.match(/function|addEventListener|console/s);

            if (htmlMatch || cssMatch || jsMatch) {
                return {
                    html: htmlMatch ? this.unescapeString(htmlMatch[1] || htmlMatch[0]) : this.generateBasicHTML(userName),
                    css: cssMatch ? this.unescapeString(cssMatch[1] || cssMatch[0]) : this.generateBasicCSS(),
                    js: jsMatch ? this.unescapeString(jsMatch[1] || jsMatch[0]) : this.generateBasicJS(),
                    message: `Portfolio extracted for ${userName} using alternative method`
                };
            }

            return null;
        } catch (error) {
            console.error('Alternative extraction failed:', error);
            return null;
        }
    }

    // Helper to unescape JSON strings
    unescapeString(str) {
        return str
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
    }

    // Generate basic HTML if extraction fails
    generateBasicHTML(userName) {
        return `<section class="hero">
            <h1>Hi, I'm ${userName}</h1>
            <p>Professional Developer</p>
            <a href="#contact" class="btn">Contact Me</a>
        </section>
        <section id="about">
            <h2>About Me</h2>
            <p>I'm a passionate developer creating amazing digital experiences.</p>
        </section>
        <section id="contact">
            <h2>Contact</h2>
            <p>Let's work together!</p>
        </section>`;
    }

    // Generate basic CSS if extraction fails
    generateBasicCSS() {
        return `* { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .btn { padding: 1rem 2rem; background: white; color: #667eea; text-decoration: none; border-radius: 5px; margin-top: 1rem; }
        section { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
        h2 { font-size: 2rem; margin-bottom: 1rem; color: #333; }`;
    }

    // Generate basic JS if extraction fails
    generateBasicJS() {
        return `document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
        console.log('Portfolio loaded successfully!');`;
    }

    // Simple extraction - just look for any HTML-like content
    extractSimpleCode(text, userName) {
        console.log('🔧 Attempting simple code extraction...');

        // Look for any HTML tags
        const htmlPattern = /<[^>]+>/;
        const hasHtml = htmlPattern.test(text);

        if (hasHtml) {
            // Extract everything that looks like HTML
            const htmlMatch = text.match(/<[^>]+>.*?<\/[^>]+>/gs);
            const html = htmlMatch ? htmlMatch.join('') : this.generateBasicHTML(userName);

            return {
                html: html,
                css: this.generateBasicCSS(),
                js: this.generateBasicJS(),
                message: `Basic portfolio extracted for ${userName}`
            };
        }

        return null;
    }

    generateFallbackPortfolio(prompt, userName) {
        console.log('🎨 Generating fallback portfolio...');

        const html = `<!-- Hero Section -->
<section class="hero">
  <div class="hero-container">
    <div class="hero-content">
      <h1 class="hero-title">Hi, I'm <span class="gradient-text">${userName}</span></h1>
      <p class="hero-subtitle">Professional Developer & Designer</p>
      <p class="hero-description">Creating amazing digital experiences with modern technologies and innovative solutions.</p>
      <div class="hero-buttons">
        <a href="#projects" class="btn btn-primary">View My Work</a>
        <a href="#contact" class="btn btn-secondary">Get In Touch</a>
      </div>
    </div>
  </div>
  <div class="hero-bg"></div>
</section>

<!-- About Section -->
<section id="about" class="about">
  <div class="container">
    <h2 class="section-title">About Me</h2>
    <div class="about-content">
      <p>I'm a passionate developer with expertise in modern web technologies. I love creating beautiful, functional, and user-friendly applications that solve real-world problems.</p>
      <p>With a strong foundation in both frontend and backend development, I bring ideas to life through clean code and thoughtful design.</p>
    </div>
  </div>
</section>

<!-- Skills Section -->
<section id="skills" class="skills">
  <div class="container">
    <h2 class="section-title">Skills & Technologies</h2>
    <div class="skills-grid">
      <div class="skill-category">
        <h3>Frontend</h3>
        <div class="skill-tags">
          <span class="skill-tag">React</span>
          <span class="skill-tag">JavaScript</span>
          <span class="skill-tag">TypeScript</span>
          <span class="skill-tag">CSS3</span>
          <span class="skill-tag">HTML5</span>
        </div>
      </div>
      <div class="skill-category">
        <h3>Backend</h3>
        <div class="skill-tags">
          <span class="skill-tag">Node.js</span>
          <span class="skill-tag">Python</span>
          <span class="skill-tag">MongoDB</span>
          <span class="skill-tag">PostgreSQL</span>
          <span class="skill-tag">REST APIs</span>
        </div>
      </div>
      <div class="skill-category">
        <h3>Tools</h3>
        <div class="skill-tags">
          <span class="skill-tag">Git</span>
          <span class="skill-tag">Docker</span>
          <span class="skill-tag">AWS</span>
          <span class="skill-tag">Figma</span>
          <span class="skill-tag">VS Code</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Projects Section -->
<section id="projects" class="projects">
  <div class="container">
    <h2 class="section-title">Featured Projects</h2>
    <div class="projects-grid">
      <div class="project-card">
        <div class="project-image"></div>
        <div class="project-content">
          <h3>E-Commerce Platform</h3>
          <p>A full-stack e-commerce solution with React, Node.js, and MongoDB. Features include user authentication, payment processing, and admin dashboard.</p>
          <div class="project-tech">
            <span>React</span>
            <span>Node.js</span>
            <span>MongoDB</span>
          </div>
          <div class="project-links">
            <a href="#" class="project-link">Live Demo</a>
            <a href="#" class="project-link">GitHub</a>
          </div>
        </div>
      </div>
      <div class="project-card">
        <div class="project-image"></div>
        <div class="project-content">
          <h3>Task Management App</h3>
          <p>A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.</p>
          <div class="project-tech">
            <span>Vue.js</span>
            <span>Express</span>
            <span>Socket.io</span>
          </div>
          <div class="project-links">
            <a href="#" class="project-link">Live Demo</a>
            <a href="#" class="project-link">GitHub</a>
          </div>
        </div>
      </div>
      <div class="project-card">
        <div class="project-image"></div>
        <div class="project-content">
          <h3>Weather Dashboard</h3>
          <p>A responsive weather application with location-based forecasts, interactive maps, and detailed weather analytics.</p>
          <div class="project-tech">
            <span>JavaScript</span>
            <span>API Integration</span>
            <span>Chart.js</span>
          </div>
          <div class="project-links">
            <a href="#" class="project-link">Live Demo</a>
            <a href="#" class="project-link">GitHub</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Contact Section -->
<section id="contact" class="contact">
  <div class="container">
    <h2 class="section-title">Let's Work Together</h2>
    <div class="contact-content">
      <p>I'm always interested in new opportunities and exciting projects. Let's connect and discuss how we can work together!</p>
      <div class="contact-links">
        <a href="mailto:${userName.toLowerCase().replace(/\s+/g, '.')}@example.com" class="contact-link">
          <span>Email</span>
        </a>
        <a href="https://linkedin.com/in/${userName.toLowerCase().replace(/\s+/g, '-')}" class="contact-link">
          <span>LinkedIn</span>
        </a>
        <a href="https://github.com/${userName.toLowerCase().replace(/\s+/g, '')}" class="contact-link">
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <p>&copy; 2024 ${userName}. All rights reserved.</p>
  </div>
</footer>`;

        const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #ffffff;
  background: #0a0a0a;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%);
  pointer-events: none;
  animation: float 6s ease-in-out infinite;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
  animation: fadeInUp 0.8s ease-out;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  color: #a0a0a0;
  margin-bottom: 1rem;
  font-weight: 500;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-description {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #888;
  margin-bottom: 2rem;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

/* Sections */
section {
  padding: clamp(3rem, 8vw, 6rem) 0;
}

.section-title {
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* About Section */
.about {
  background: rgba(255, 255, 255, 0.02);
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.about-content p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #a0a0a0;
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

/* Skills Section */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.skill-category {
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
  backdrop-filter: blur(10px);
}

.skill-category:hover {
  transform: translateY(-5px);
}

.skill-category h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Projects Section */
.projects {
  background: rgba(255, 255, 255, 0.02);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.project-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(10px);
}

.project-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.project-image {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.project-content {
  padding: 1.5rem;
}

.project-content h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.project-content p {
  color: #a0a0a0;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.project-tech span {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
}

.project-links {
  display: flex;
  gap: 1rem;
}

.project-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.project-link:hover {
  color: #764ba2;
}

/* Contact Section */
.contact-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.contact-content p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: #a0a0a0;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.contact-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.contact-link {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.contact-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

/* Footer */
.footer {
  background: rgba(255, 255, 255, 0.02);
  padding: 2rem 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer p {
  color: #666;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-buttons {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
  
  .skills-grid {
    grid-template-columns: 1fr;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-links {
    flex-direction: column;
    align-items: center;
  }
  
  .contact-link {
    width: 100%;
    max-width: 300px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .hero-container {
    padding: 0 1rem;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .skill-category,
  .project-card {
    margin: 0 0.5rem;
  }
}`;

        const js = `// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all sections for scroll animations
document.querySelectorAll('section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

// Add loading animation
window.addEventListener('load', function() {
  document.body.style.opacity = '1';
  document.body.style.transition = 'opacity 0.5s ease';
});

// Initialize
document.body.style.opacity = '0';

// Add interactive hover effects
document.querySelectorAll('.project-card, .skill-category').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-10px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// Add parallax effect to hero background
window.addEventListener('scroll', function() {
  const scrolled = window.pageYOffset;
  const heroBackground = document.querySelector('.hero-bg');
  if (heroBackground) {
    heroBackground.style.transform = \`translateY(\${scrolled * 0.5}px)\`;
  }
});

// Add typing effect to hero title (optional enhancement)
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

console.log('Portfolio loaded successfully! 🎉');`;

        return {
            html,
            css,
            js,
            message: `Beautiful portfolio created for ${userName} using Gemini AI! ✨`
        };
    }
}

module.exports = new GeminiPortfolioService();