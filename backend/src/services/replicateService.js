const axios = require('axios');

class ReplicateService {
  constructor() {
    this.apiKey = process.env.REPLICATEAI_API_KEY;
    this.baseURL = 'https://api.replicate.com/v1';
    this.isConfigured = !!this.apiKey;
    
    if (!this.isConfigured) {
      console.warn('⚠️ Replicate API key not configured');
    } else {
      console.log('✅ Replicate AI service initialized');
    }
  }

  isAvailable() {
    return this.isConfigured;
  }

  async generatePortfolioCode(prompt, userName, currentCode = null, isImprovement = false) {
    if (!this.isAvailable()) {
      throw new Error('Replicate AI service not configured');
    }

    try {
      console.log('🎨 Generating portfolio with Replicate AI...');
      
      const systemPrompt = this.buildSystemPrompt(userName, isImprovement, currentCode);
      const userPrompt = this.buildUserPrompt(prompt, userName, isImprovement);

      // Use Replicate's text generation model (like Llama or CodeLlama)
      const response = await axios.post(
        `${this.baseURL}/predictions`,
        {
          version: "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
          input: {
            system_prompt: systemPrompt,
            prompt: userPrompt,
            max_new_tokens: 4000,
            temperature: 0.7,
            top_p: 0.9,
            repetition_penalty: 1.1
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const predictionId = response.data.id;
      console.log(`📊 Prediction created: ${predictionId}`);

      // Poll for completion
      const result = await this.pollForCompletion(predictionId);
      
      if (result.status === 'succeeded') {
        const generatedText = Array.isArray(result.output) ? result.output.join('') : result.output;
        return this.parseGeneratedCode(generatedText, userName);
      } else {
        throw new Error(`Replicate prediction failed: ${result.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('❌ Replicate portfolio generation failed:', error);
      
      // Fallback to template-based generation
      console.log('🔄 Using fallback template generation...');
      return this.generateFallbackPortfolio(prompt, userName);
    }
  }

  async pollForCompletion(predictionId, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `${this.baseURL}/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const prediction = response.data;
        
        if (prediction.status === 'succeeded' || prediction.status === 'failed') {
          return prediction;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Polling attempt ${attempt + 1} failed:`, error.message);
        if (attempt === maxAttempts - 1) throw error;
      }
    }
    
    throw new Error('Prediction timed out');
  }

  buildSystemPrompt(userName, isImprovement, currentCode) {
    const contextInfo = currentCode ? `
CURRENT PORTFOLIO CONTEXT:
- HTML Structure: ${currentCode.html ? 'Present' : 'Missing'} (${currentCode.html?.length || 0} chars)
- CSS Styling: ${currentCode.css ? 'Present' : 'Missing'} (${currentCode.css?.length || 0} chars)  
- JavaScript: ${currentCode.js ? 'Present' : 'Missing'} (${currentCode.js?.length || 0} chars)
- Current sections: ${this.extractSections(currentCode.html)}
- Current color scheme: ${this.extractColorScheme(currentCode.css)}
- Current technologies mentioned: ${this.extractTechnologies(currentCode.html)}
` : '';

    return `You are an expert web developer and designer specializing in creating stunning, professional portfolio websites. You understand user intent and create exactly what they ask for.

CRITICAL INSTRUCTIONS:
1. Generate COMPLETE, WORKING code that can be run immediately in a browser
2. Use modern CSS with gradients, animations, and responsive design
3. Include smooth scrolling, hover effects, and professional styling
4. Make it mobile-responsive with proper breakpoints (768px, 480px)
5. Use semantic HTML5 structure with proper accessibility
6. Include proper meta tags and SEO optimization
7. Create an engaging, professional design that stands out
8. ALWAYS include the user's name "${userName}" prominently in the portfolio
9. Make content relevant to the user's profession/description

${contextInfo}

RESPONSE FORMAT - CRITICAL:
You MUST respond with ONLY a valid JSON object in this EXACT format:
{
  "html": "complete HTML code here - must be valid HTML5",
  "css": "complete CSS code here - must be valid CSS3", 
  "js": "complete JavaScript code here - must be valid ES6+",
  "message": "brief description of what was created/improved"
}

DESIGN REQUIREMENTS:
- Modern gradient backgrounds and color schemes
- Smooth CSS animations and transitions (transform, opacity)
- Professional typography (Inter, Roboto, or system fonts)
- Responsive CSS Grid and Flexbox layouts
- Interactive hover effects and micro-animations
- Clean, minimalist design with strong visual hierarchy
- Dark theme with vibrant accent colors (#667eea, #764ba2, #EC4899)
- Proper spacing (rem units) and visual rhythm
- Mobile-first responsive design
- Accessibility features (proper contrast, focus states)

CONTENT REQUIREMENTS:
- Hero section with name, title, and compelling description
- About section with professional summary
- Skills section with relevant technologies
- Projects section with 3-4 impressive projects
- Contact section with professional links
- Smooth navigation between sections

${isImprovement ? `
IMPROVEMENT MODE - CONTEXT AWARE:
You are improving the existing portfolio for ${userName}. 
MAINTAIN the current structure and design language while making the specific improvements requested.
DO NOT completely rebuild - only enhance what exists.
Keep the same color scheme, layout structure, and overall design unless specifically asked to change them.
Focus on the specific improvement request while preserving the user's existing work.

Current Code to Improve:
${JSON.stringify(currentCode, null, 2)}
` : `
CREATION MODE - BUILD FROM SCRATCH:
Create a completely new, stunning portfolio for ${userName} from scratch.
Make it unique, professional, and tailored to their description.
Include placeholder content that matches their profession/style.
`}`;
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

2. ABOUT SECTION:
   - Professional summary that reflects their background from the prompt
   - Personal touch that makes them memorable
   - Key strengths and what makes them unique

3. SKILLS SECTION:
   - Technical skills relevant to their field
   - Soft skills that complement their expertise
   - Tools and technologies they would use
   - Visual skill bars or tags for better presentation

4. PROJECTS SECTION:
   - 3-4 impressive projects relevant to their field
   - Each project should have: title, description, technologies, links
   - Make projects sound professional and impactful
   - Include placeholder GitHub/demo links

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

CONTENT TONE:
- Professional but personable
- Confident without being arrogant
- Specific to their field and expertise level
- Engaging and memorable
- Action-oriented

Create a portfolio that ${userName} would be proud to share with potential employers or clients!`;
  }

  parseGeneratedCode(generatedText, userName) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.html && parsed.css && parsed.js) {
          return {
            html: parsed.html,
            css: parsed.css,
            js: parsed.js,
            message: parsed.message || `Portfolio generated successfully for ${userName}!`
          };
        }
      }

      // If JSON parsing fails, try to extract code blocks
      const htmlMatch = generatedText.match(/```html\n([\s\S]*?)\n```/);
      const cssMatch = generatedText.match(/```css\n([\s\S]*?)\n```/);
      const jsMatch = generatedText.match(/```javascript\n([\s\S]*?)\n```/);

      if (htmlMatch && cssMatch) {
        return {
          html: htmlMatch[1],
          css: cssMatch[1],
          js: jsMatch ? jsMatch[1] : this.generateDefaultJS(),
          message: `Portfolio generated successfully for ${userName}!`
        };
      }

      throw new Error('Could not parse generated code');

    } catch (error) {
      console.error('Code parsing failed:', error);
      return this.generateFallbackPortfolio('professional portfolio', userName);
    }
  }

  generateFallbackPortfolio(prompt, userName) {
    console.log('🎨 Generating fallback portfolio...');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${userName} - Professional Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">${userName}</div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section id="home" class="hero">
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

    <section id="about" class="about">
        <div class="container">
            <h2 class="section-title">About Me</h2>
            <div class="about-content">
                <p>I'm a passionate developer with expertise in modern web technologies. I love creating beautiful, functional, and user-friendly applications that solve real-world problems.</p>
                <p>With a strong foundation in both frontend and backend development, I bring ideas to life through clean code and thoughtful design.</p>
            </div>
        </div>
    </section>

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

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${userName}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

    const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
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

/* Navigation */
.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-logo {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    color: #ffffff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-menu a:hover {
    color: #667eea;
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
    background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
    pointer-events: none;
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
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 1.5rem;
    color: #a0a0a0;
    margin-bottom: 1rem;
    font-weight: 500;
}

.hero-description {
    font-size: 1.1rem;
    color: #888;
    margin-bottom: 2rem;
    line-height: 1.6;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.btn {
    padding: 0.75rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-block;
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
    padding: 5rem 0;
}

.section-title {
    font-size: 2.5rem;
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
    font-size: 1.1rem;
    color: #a0a0a0;
    margin-bottom: 1.5rem;
    line-height: 1.8;
}

/* Skills Section */
.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
}

.project-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
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
    font-size: 1.1rem;
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

/* Responsive Design */
@media (max-width: 768px) {
    .nav-menu {
        display: none;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-subtitle {
        font-size: 1.2rem;
    }
    
    .section-title {
        font-size: 2rem;
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
    
    .hero-buttons {
        flex-direction: column;
        align-items: flex-start;
    }
}

@media (max-width: 480px) {
    .container {
        padding: 0 1rem;
    }
    
    .nav-container {
        padding: 0 1rem;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .btn {
        padding: 0.6rem 1.5rem;
        font-size: 0.9rem;
    }
}`;

    const js = this.generateDefaultJS();

    return {
      html,
      css,
      js,
      message: `Beautiful portfolio created for ${userName} using Replicate AI! ✨`
    };
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

  generateDefaultJS() {
    return `// Smooth scrolling for navigation links
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

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
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

// Typing effect for hero title (optional enhancement)
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

// Add some interactive hover effects
document.querySelectorAll('.project-card').forEach(card => {
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

console.log('Portfolio loaded successfully! 🎉');`;
  }
}

module.exports = new ReplicateService();