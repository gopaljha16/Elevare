const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const aiService = require('../services/aiService');
const openRouterService = require('../services/openRouterService');
const replicateService = require('../services/replicateService');
const geminiPortfolioService = require('../services/geminiPortfolioService');
const contextService = require('../services/contextService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Portfolio templates
const portfolioTemplates = {
  modern: {
    name: 'Modern Gradient',
    theme: 'gradient',
    colors: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      accent: '#F472B6',
      background: '#0E101A',
      surface: '#121625'
    }
  },
  minimal: {
    name: 'Minimal Clean',
    theme: 'minimal',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#FFFFFF',
      surface: '#F8FAFC'
    }
  },
  dark: {
    name: 'Dark Professional',
    theme: 'dark',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      background: '#111827',
      surface: '#1F2937'
    }
  }
};

// @desc    Create new portfolio from resume data
// @route   POST /api/portfolio/create
// @access  Private
const createPortfolio = asyncHandler(async (req, res) => {
  const { resumeData, template = 'modern', customizations = {} } = req.body;
  
  if (!resumeData) {
    return res.status(400).json({
      success: false,
      message: 'Resume data is required to create a portfolio'
    });
  }
  
  try {
    console.log('Creating portfolio with resume data:', JSON.stringify(resumeData, null, 2));
    
    // Enhance resume data with AI
    const enhancedData = await enhanceResumeDataWithAI(resumeData);
    console.log('Enhanced data:', JSON.stringify(enhancedData, null, 2));
    
    // Generate portfolio structure
    const portfolioStructure = await generatePortfolioStructure(enhancedData, template);
    console.log('Generated portfolio structure:', JSON.stringify(portfolioStructure, null, 2));
    
    // Create portfolio document
    const portfolio = new Portfolio({
      userId: req.user._id,
      title: `${enhancedData.personalInfo?.name || 'My'} Portfolio`,
      template,
      data: enhancedData,
      structure: portfolioStructure,
      customizations,
      isPublished: false,
      createdAt: new Date()
    });
    
    await portfolio.save();
    
    res.status(201).json({
      success: true,
      portfolio: {
        id: portfolio._id,
        title: portfolio.title,
        template: portfolio.template,
        data: portfolio.data,
        structure: portfolio.structure,
        customizations: portfolio.customizations,
        isPublished: portfolio.isPublished,
        previewUrl: `/portfolio/preview/${portfolio._id}`,
        createdAt: portfolio.createdAt
      }
    });
  } catch (error) {
    console.error('Portfolio creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portfolio',
      error: error.message
    });
  }
});

// @desc    Get user portfolios
// @route   GET /api/portfolio/my-portfolios
// @access  Private
const getUserPortfolios = asyncHandler(async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id })
      .select('title template isPublished createdAt updatedAt')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      portfolios: portfolios.map(p => ({
        id: p._id,
        title: p.title,
        template: p.template,
        isPublished: p.isPublished,
        previewUrl: `/portfolio/preview/${p._id}`,
        editUrl: `/portfolio/edit/${p._id}`,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
});

// @desc    Get portfolio by ID
// @route   GET /api/portfolio/:id
// @access  Private
const getPortfolio = asyncHandler(async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    res.json({
      success: true,
      portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
});

// @desc    Update portfolio
// @route   PUT /api/portfolio/:id
// @access  Private
const updatePortfolio = asyncHandler(async (req, res) => {
  try {
    const { title, data, customizations, template } = req.body;
    
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    // Update fields
    if (title) portfolio.title = title;
    if (data) portfolio.data = data;
    if (customizations) portfolio.customizations = customizations;
    if (template) portfolio.template = template;
    
    portfolio.updatedAt = new Date();
    await portfolio.save();
    
    res.json({
      success: true,
      portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
      error: error.message
    });
  }
});

// @desc    AI Chat for portfolio editing
// @route   POST /api/portfolio/:id/chat
// @access  Private
const portfolioAIChat = asyncHandler(async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    // Generate AI response and suggestions
    const aiResponse = await generateAIResponse(message, portfolio, context);
    
    res.json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI chat failed',
      error: error.message
    });
  }
});

// @desc    Publish portfolio
// @route   POST /api/portfolio/:id/publish
// @access  Private
const publishPortfolio = asyncHandler(async (req, res) => {
  try {
    const { deploymentPlatform = 'netlify' } = req.body;
    
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    // Generate deployment-ready code
    const deploymentCode = await generateDeploymentCode(portfolio);
    
    // Deploy to selected platform
    const deploymentResult = await deployToplatform(deploymentCode, deploymentPlatform, portfolio);
    
    // Update portfolio with deployment info
    portfolio.isPublished = true;
    portfolio.deploymentUrl = deploymentResult.url;
    portfolio.deploymentPlatform = deploymentPlatform;
    portfolio.publishedAt = new Date();
    
    await portfolio.save();
    
    res.json({
      success: true,
      deploymentUrl: deploymentResult.url,
      message: 'Portfolio published successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to publish portfolio',
      error: error.message
    });
  }
});

// Helper Functions
async function enhanceResumeDataWithAI(resumeData) {
  const fallbackData = {
    personalInfo: {
      name: resumeData.personalInfo?.name || 'Your Name',
      title: resumeData.personalInfo?.title || (resumeData.personalInfo?.name ? `${resumeData.personalInfo.name} - Professional` : 'Professional Title'),
      email: resumeData.personalInfo?.email || '',
      phone: resumeData.personalInfo?.phone || '',
      location: resumeData.personalInfo?.location || '',
      social: resumeData.personalInfo?.social || {}
    },
    summary: resumeData.summary || (resumeData.personalInfo?.name ? `${resumeData.personalInfo.name} is a dedicated professional with expertise in modern technologies.` : 'Professional summary'),
    skills: {
      technical: resumeData.skills?.technical || [],
      soft: resumeData.skills?.soft || [],
      tools: resumeData.skills?.tools || []
    },
    experience: resumeData.experience || [],
    projects: resumeData.projects || [],
    education: resumeData.education || []
  };

  try {
    console.log('=== ENHANCING RESUME DATA ===');
    console.log('Input resume data:', JSON.stringify(resumeData, null, 2));
    
    // Check if we have meaningful data to enhance
    const hasData = resumeData.personalInfo?.name || 
                   resumeData.personalInfo?.email || 
                   (resumeData.skills?.technical && resumeData.skills.technical.length > 0) ||
                   (resumeData.experience && resumeData.experience.length > 0) ||
                   (resumeData.education && resumeData.education.length > 0);
    
    if (!hasData) {
      console.log('No meaningful data to enhance, returning original data');
      return resumeData;
    }
    
    // Use the AI service instead of direct genAI
    if (!aiService.model) {
      console.warn('AI service not available, using fallback data');
      return fallbackData;
    }

    const prompt = `
    You are an expert portfolio designer and career coach. Transform this resume data into compelling portfolio content that will impress recruiters and employers.

    CRITICAL: You MUST use the actual data from the resume provided below. Do NOT create fictional information. Enhance and improve what's already there.

    RESUME DATA:
    ${JSON.stringify(resumeData, null, 2)}

    INSTRUCTIONS:
    1. USE THE EXACT NAME, EMAIL, PHONE, LOCATION from the resume data
    2. USE THE ACTUAL SKILLS, EXPERIENCE, PROJECTS, EDUCATION from the resume
    3. Enhance descriptions to be more compelling but keep them truthful
    4. Add professional polish while maintaining authenticity
    5. If a section is empty in the resume, leave it empty in the output
    6. Do NOT add fictional companies, projects, or achievements

    Return ONLY valid JSON in this exact structure:
    {
      "personalInfo": {
        "name": "Full Name",
        "title": "Professional Title (make it compelling)",
        "email": "email@example.com",
        "phone": "phone number",
        "location": "City, State/Country",
        "social": {
          "linkedin": "linkedin url",
          "github": "github url",
          "portfolio": "portfolio url"
        }
      },
      "summary": "Write a compelling 2-3 sentence professional summary that highlights key strengths, experience, and career goals. Make it engaging and specific.",
      "skills": {
        "technical": ["List 8-12 relevant technical skills"],
        "soft": ["List 4-6 important soft skills"],
        "tools": ["List 6-10 tools and technologies"]
      },
      "experience": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "location": "Location",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM or Present",
          "current": true/false,
          "description": "Write 2-3 compelling sentences about the role, responsibilities, and key contributions. Focus on impact and achievements.",
          "achievements": ["Quantified achievement 1", "Quantified achievement 2", "Quantified achievement 3"],
          "technologies": ["tech1", "tech2", "tech3"]
        }
      ],
      "projects": [
        {
          "title": "Project Name",
          "description": "Write an engaging description that explains what the project does, the problem it solves, and your role in building it. Make it sound impressive and professional.",
          "technologies": ["tech1", "tech2", "tech3"],
          "links": {
            "github": "github url if available",
            "live": "live demo url if available"
          },
          "featured": true
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "institution": "Institution Name",
          "location": "Location",
          "startDate": "YYYY",
          "endDate": "YYYY",
          "gpa": "GPA if above 3.5"
        }
      ]
    }

    IMPORTANT: 
    - Make all descriptions compelling and professional
    - Use specific examples and quantified achievements
    - Ensure the content showcases the person's best qualities
    - Return ONLY the JSON, no other text
    `;
    
    const result = await aiService.model.generateContent(prompt);
    const enhancedText = result.response.text();
    
    try {
      // Clean the response to extract JSON
      let cleanedText = enhancedText.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\n?|\n?```/g, '');
      cleanedText = cleanedText.replace(/```\n?|\n?```/g, '');
      
      // Find JSON object in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      const parsedData = JSON.parse(cleanedText);
      
      console.log('=== AI ENHANCED DATA ===');
      console.log('AI enhanced data:', JSON.stringify(parsedData, null, 2));
      
      // Validate that we have the required structure
      if (parsedData.personalInfo && parsedData.skills) {
        return parsedData;
      } else {
        console.warn('AI response missing required structure, using fallback data');
        return fallbackData;
      }
    } catch (parseError) {
      console.warn('AI response parsing failed:', parseError.message);
      console.log('Raw AI response:', enhancedText);
      return fallbackData;
    }
  } catch (error) {
    console.error('AI enhancement failed:', error);
    return fallbackData;
  }
}

async function generatePortfolioStructure(data, template) {
  const baseStructure = {
    hero: {
      name: data.personalInfo?.name || 'Your Name',
      title: data.personalInfo?.title || 'Professional Title',
      summary: data.summary || 'Professional summary goes here',
      image: data.personalInfo?.image || null,
      contact: {
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        location: data.personalInfo?.location || '',
        social: data.personalInfo?.social || {}
      }
    },
    about: {
      description: data.about || data.summary || 'About section content',
      highlights: data.highlights || []
    },
    skills: {
      technical: data.skills?.technical || [],
      soft: data.skills?.soft || [],
      tools: data.skills?.tools || []
    },
    experience: data.experience || [],
    projects: data.projects || [],
    education: data.education || [],
    contact: {
      email: data.personalInfo?.email,
      phone: data.personalInfo?.phone,
      location: data.personalInfo?.location,
      social: data.personalInfo?.social || {}
    }
  };
  
  return baseStructure;
}

async function generateAIResponse(message, portfolio, context) {
  try {
    if (!aiService.model) {
      return {
        response: "I'm here to help with your portfolio. What would you like to improve?",
        suggestions: ["Update your project descriptions", "Add more skills", "Improve your summary"],
        actions: []
      };
    }

    const prompt = `
    You are a portfolio design assistant. User message: "${message}"
    
    Current portfolio context: ${JSON.stringify(context, null, 2)}
    
    Provide helpful suggestions for:
    1. Content improvements
    2. Design changes
    3. Section modifications
    4. SEO optimization
    
    Return JSON with:
    {
      "response": "conversational response",
      "suggestions": ["suggestion1", "suggestion2"],
      "actions": [{"type": "update", "section": "hero", "changes": {}}]
    }
    `;
    
    const result = await aiService.model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return {
        response: responseText,
        suggestions: [],
        actions: []
      };
    }
  } catch (error) {
    return {
      response: "I'm here to help with your portfolio. What would you like to improve?",
      suggestions: ["Update your project descriptions", "Add more skills", "Improve your summary"],
      actions: []
    };
  }
}

async function generateDeploymentCode(portfolio) {
  // Generate React portfolio code based on template and data
  const template = portfolioTemplates[portfolio.template] || portfolioTemplates.modern;
  
  return {
    'package.json': generatePackageJson(portfolio),
    'index.html': generateIndexHtml(portfolio),
    'src/App.jsx': generateAppComponent(portfolio, template),
    'src/components/Hero.jsx': generateHeroComponent(portfolio, template),
    'src/components/About.jsx': generateAboutComponent(portfolio, template),
    'src/components/Skills.jsx': generateSkillsComponent(portfolio, template),
    'src/components/Projects.jsx': generateProjectsComponent(portfolio, template),
    'src/components/Contact.jsx': generateContactComponent(portfolio, template),
    'src/index.css': generateStyles(template),
    'tailwind.config.js': generateTailwindConfig(template)
  };
}

function generatePackageJson(portfolio) {
  return JSON.stringify({
    name: `${portfolio.title.toLowerCase().replace(/\s+/g, '-')}-portfolio`,
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "framer-motion": "^10.16.4",
      "lucide-react": "^0.263.1"
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.0.3",
      tailwindcss: "^3.3.3",
      autoprefixer: "^10.4.14",
      postcss: "^8.4.27",
      vite: "^4.4.5"
    }
  }, null, 2);
}

function generateIndexHtml(portfolio) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${portfolio.title}</title>
  <meta name="description" content="${portfolio.data.summary || 'Professional portfolio'}" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;
}

async function deployToplatform(code, platform, portfolio) {
  // Mock deployment - in real implementation, integrate with Netlify/Vercel APIs
  const mockUrl = `https://${portfolio.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${platform}.app`;
  
  return {
    url: mockUrl,
    status: 'deployed',
    platform
  };
}

// Generate component functions (simplified for brevity)
function generateAppComponent(portfolio, template) {
  return `import React from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-${template.colors.background} to-${template.colors.surface}">
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contact />
    </div>
  );
}

export default App;`;
}

function generateHeroComponent(portfolio, template) {
  const hero = portfolio.structure.hero;
  return `import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          ${hero.name}
        </h1>
        <h2 className="text-2xl md:text-3xl text-gray-300 mb-8">
          ${hero.title}
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          ${hero.summary}
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;`;
}

function generateAboutComponent(portfolio, template) {
  return `import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-white mb-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          About Me
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-300 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          ${portfolio.structure.about.description}
        </motion.p>
      </div>
    </section>
  );
};

export default About;`;
}

function generateSkillsComponent(portfolio, template) {
  return `import React from 'react';
import { motion } from 'framer-motion';

const Skills = () => {
  const skills = ${JSON.stringify(portfolio.structure.skills)};
  
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-white mb-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Skills & Expertise
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(skills).map(([category, skillList], index) => (
            <motion.div
              key={category}
              className="bg-white/5 rounded-xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-white mb-4 capitalize">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;`;
}

function generateProjectsComponent(portfolio, template) {
  return `import React from 'react';
import { motion } from 'framer-motion';

const Projects = () => {
  const projects = ${JSON.stringify(portfolio.structure.projects)};
  
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-white mb-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Featured Projects
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-white mb-3">
                {project.title}
              </h3>
              <p className="text-gray-300 mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies?.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {project.links && (
                <div className="flex gap-3">
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      className="text-pink-400 hover:text-pink-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  )}
                  {project.links.live && (
                    <a
                      href={project.links.live}
                      className="text-purple-400 hover:text-purple-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;`;
}

function generateContactComponent(portfolio, template) {
  return `import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const contact = ${JSON.stringify(portfolio.structure.contact)};
  
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 
          className="text-4xl font-bold text-white mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Get In Touch
        </motion.h2>
        <motion.div
          className="bg-white/5 rounded-xl p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-gray-300 mb-8">
            Let's connect and discuss opportunities!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {contact.email && (
              <a
                href={\`mailto:\${contact.email}\`}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:scale-105 transition-transform"
              >
                Email Me
              </a>
            )}
            {contact.social?.linkedin && (
              <a
                href={contact.social.linkedin}
                className="px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;`;
}

function generateStyles(template) {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
  background: ${template.colors.background};
}`;
}

function generateTailwindConfig(template) {
  return `module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '${template.colors.primary}',
        secondary: '${template.colors.secondary}',
        accent: '${template.colors.accent}',
      }
    }
  },
  plugins: []
};`;
}

// @desc    Generate portfolio code with AI (using Replicate AI)
// @route   POST /api/portfolio/generate-code
// @access  Private
const generatePortfolioCode = asyncHandler(async (req, res) => {
  const { prompt, userName, currentCode, isImprovement } = req.body;
  const userId = req.user._id.toString();
  
  if (!prompt || !userName) {
    return res.status(400).json({
      success: false,
      message: 'Prompt and userName are required'
    });
  }
  
  try {
    console.log(`🎨 Generating portfolio code for ${userName}...`);
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`🔄 Is improvement: ${isImprovement}`);
    
    const startTime = Date.now();
    
    // Get user context for better prompts
    const userContext = await contextService.getContext(userId);
    console.log(`📚 User context: ${userContext ? 'Found' : 'New user'}`);
    
    // Build contextual prompt if we have history
    const enhancedPrompt = userContext ? 
      contextService.buildContextualPrompt(prompt, userContext) : 
      prompt;
    
    let result;
    let aiProvider;
    
    // Primary: Use OpenRouter service for portfolio generation (more reliable)
    if (openRouterService.isAvailable()) {
      console.log('✨ Using OpenRouter AI for portfolio generation...');
      
      result = await openRouterService.generatePortfolioCode(
        enhancedPrompt,
        userName,
        currentCode,
        isImprovement
      );
      
      aiProvider = 'OpenRouter AI';
      console.log('✅ Portfolio code generated successfully with OpenRouter AI!');
    }
    // Secondary: Try Gemini as fallback
    else if (geminiPortfolioService.isAvailable()) {
      console.log('⚠️ OpenRouter not available, trying Gemini AI...');
      
      // Test connection first
      const connectionTest = await geminiPortfolioService.testConnection();
      if (connectionTest) {
        result = await geminiPortfolioService.generatePortfolioCode(
          enhancedPrompt,
          userName,
          currentCode,
          isImprovement
        );
        
        aiProvider = 'Gemini AI (Fallback)';
        console.log('✅ Portfolio code generated successfully with Gemini AI!');
      } else {
        console.warn('⚠️ Gemini connection test failed, skipping to next fallback');
      }
    }
    // Tertiary: Try Replicate as additional fallback
    if (!result && replicateService.isAvailable()) {
      console.log('⚠️ Primary services not available, trying Replicate...');
      
      result = await replicateService.generatePortfolioCode(
        enhancedPrompt,
        userName,
        currentCode,
        isImprovement
      );
      
      aiProvider = 'Replicate AI (Fallback)';
      console.log('✅ Portfolio code generated successfully with Replicate AI!');
    }
    // Final fallback to template-based generation
    if (!result) {
      console.warn('⚠️ All AI services unavailable, using template generation');
      
      result = {
        html: generateFallbackHTML(userName, prompt),
        css: generateFallbackCSS(),
        js: generateFallbackJS(),
        message: 'Portfolio generated with template (AI services not configured)'
      };
      aiProvider = 'Template Fallback';
    }
    
    const responseTime = Date.now() - startTime;
    
    // Store generation info in context for future improvements
    const portfolioInfo = contextService.extractPortfolioInfo(result, prompt);
    portfolioInfo.responseTime = responseTime;
    portfolioInfo.aiProvider = aiProvider;
    portfolioInfo.isImprovement = isImprovement;
    
    await contextService.updateContext(userId, {
      previousGenerations: [
        ...(userContext?.previousGenerations || []),
        portfolioInfo
      ].slice(-10), // Keep last 10 generations
      lastPrompt: prompt,
      lastGeneration: Date.now(),
      userName: userName,
      totalGenerations: (userContext?.totalGenerations || 0) + 1
    });
    
    console.log(`⏱️ Generation completed in ${responseTime}ms`);
    
    res.json({
      success: true,
      code: {
        html: result.html,
        css: result.css,
        js: result.js
      },
      message: result.message,
      aiProvider: aiProvider,
      responseTime: responseTime,
      contextUsed: !!userContext
    });
    
  } catch (error) {
    console.error('❌ Code generation error:', error.message);
    
    // Fallback to template-based generation on error
    const fallbackCode = {
      html: generateFallbackHTML(userName, prompt),
      css: generateFallbackCSS(),
      js: generateFallbackJS()
    };
    
    res.json({
      success: true,
      code: fallbackCode,
      message: `Portfolio generated with template (${error.message})`,
      aiProvider: 'Template Fallback'
    });
  }
});

// Fallback HTML generator
function generateFallbackHTML(userName, prompt) {
  const isProfessional = prompt.toLowerCase().includes('professional') || prompt.toLowerCase().includes('developer');
  const isCreative = prompt.toLowerCase().includes('creative') || prompt.toLowerCase().includes('designer');
  
  return `<!-- Hero Section -->
<section class="hero">
  <div class="hero-content">
    <h1 class="hero-title">${userName}</h1>
    <p class="hero-subtitle">${isProfessional ? 'Full Stack Developer' : isCreative ? 'Creative Designer' : 'Professional'}</p>
    <p class="hero-description">Creating amazing digital experiences with passion and precision</p>
    <div class="hero-buttons">
      <a href="#projects" class="btn btn-primary">View My Work</a>
      <a href="#contact" class="btn btn-secondary">Get In Touch</a>
    </div>
  </div>
  <div class="hero-decoration"></div>
</section>

<!-- About Section -->
<section id="about" class="section">
  <div class="container">
    <h2 class="section-title">About Me</h2>
    <div class="about-content">
      <p>I'm a passionate ${isProfessional ? 'developer' : isCreative ? 'designer' : 'professional'} dedicated to creating exceptional digital experiences. With a focus on innovation and quality, I bring ideas to life through clean code and thoughtful design.</p>
    </div>
  </div>
</section>

<!-- Skills Section -->
<section id="skills" class="section section-alt">
  <div class="container">
    <h2 class="section-title">Skills & Expertise</h2>
    <div class="skills-grid">
      <div class="skill-card">
        <div class="skill-icon">💻</div>
        <h3>Web Development</h3>
        <p>HTML, CSS, JavaScript, React</p>
      </div>
      <div class="skill-card">
        <div class="skill-icon">🎨</div>
        <h3>UI/UX Design</h3>
        <p>Figma, Adobe XD, Responsive Design</p>
      </div>
      <div class="skill-card">
        <div class="skill-icon">⚡</div>
        <h3>Performance</h3>
        <p>Optimization, Best Practices</p>
      </div>
      <div class="skill-card">
        <div class="skill-icon">🚀</div>
        <h3>Deployment</h3>
        <p>CI/CD, Cloud Platforms</p>
      </div>
    </div>
  </div>
</section>

<!-- Projects Section -->
<section id="projects" class="section">
  <div class="container">
    <h2 class="section-title">Featured Projects</h2>
    <div class="projects-grid">
      <div class="project-card">
        <div class="project-image">
          <div class="project-placeholder">🌟</div>
        </div>
        <div class="project-content">
          <h3>Project One</h3>
          <p>An innovative solution that showcases modern web development practices and user-centric design.</p>
          <div class="project-tags">
            <span class="tag">React</span>
            <span class="tag">Node.js</span>
            <span class="tag">MongoDB</span>
          </div>
        </div>
      </div>
      <div class="project-card">
        <div class="project-image">
          <div class="project-placeholder">✨</div>
        </div>
        <div class="project-content">
          <h3>Project Two</h3>
          <p>A creative platform that demonstrates expertise in full-stack development and modern design principles.</p>
          <div class="project-tags">
            <span class="tag">Vue.js</span>
            <span class="tag">Express</span>
            <span class="tag">PostgreSQL</span>
          </div>
        </div>
      </div>
      <div class="project-card">
        <div class="project-image">
          <div class="project-placeholder">🎯</div>
        </div>
        <div class="project-content">
          <h3>Project Three</h3>
          <p>A comprehensive application featuring advanced functionality and seamless user experience.</p>
          <div class="project-tags">
            <span class="tag">TypeScript</span>
            <span class="tag">Next.js</span>
            <span class="tag">Tailwind</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Contact Section -->
<section id="contact" class="section section-alt">
  <div class="container">
    <h2 class="section-title">Let's Connect</h2>
    <div class="contact-content">
      <p class="contact-text">I'm always open to new opportunities and collaborations. Feel free to reach out!</p>
      <div class="contact-buttons">
        <a href="mailto:hello@${userName.toLowerCase().replace(/\s+/g, '')}.com" class="btn btn-primary">Send Email</a>
        <a href="https://linkedin.com" target="_blank" class="btn btn-secondary">LinkedIn</a>
        <a href="https://github.com" target="_blank" class="btn btn-secondary">GitHub</a>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <p>&copy; 2024 ${userName}. All rights reserved.</p>
</footer>`;
}

// Fallback CSS generator
function generateFallbackCSS() {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-x: hidden;
}

html {
  scroll-behavior: smooth;
}

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  z-index: 2;
  max-width: 800px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.8;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.hero-decoration {
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  top: -250px;
  right: -250px;
  animation: float 6s ease-in-out infinite;
}

.section {
  padding: 5rem 2rem;
  position: relative;
}

.section-alt {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 700;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  font-size: 1.2rem;
  line-height: 1.8;
  opacity: 0.9;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.skill-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.skill-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.skill-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.skill-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.skill-card p {
  opacity: 0.8;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.project-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.project-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.project-image {
  height: 200px;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-placeholder {
  font-size: 4rem;
}

.project-content {
  padding: 1.5rem;
}

.project-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.project-content p {
  opacity: 0.8;
  margin-bottom: 1rem;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.contact-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.contact-text {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.contact-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 2rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
}

.btn-primary:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
  transform: translateY(-2px);
}

.footer {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0.8;
}

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

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.3rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .section {
    padding: 3rem 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .skills-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }
}`;
}

// Fallback JavaScript generator
function generateFallbackJS() {
  return `// Smooth scroll for navigation links
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

// Add scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

// Add parallax effect to hero decoration
window.addEventListener('scroll', () => {
  const decoration = document.querySelector('.hero-decoration');
  if (decoration) {
    const scrolled = window.pageYOffset;
    decoration.style.transform = \`translate(\${scrolled * 0.3}px, \${scrolled * 0.3}px)\`;
  }
});

// Add hover effect to cards
document.querySelectorAll('.skill-card, .project-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-10px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

console.log('Portfolio loaded successfully! ✨');`;
}

// @desc    Clear user's portfolio generation context
// @route   DELETE /api/portfolio/context
// @access  Private
const clearPortfolioContext = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id.toString();
    await contextService.clearContext(userId);
    
    res.json({
      success: true,
      message: 'Portfolio generation context cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear context',
      error: error.message
    });
  }
});

// @desc    Get user's portfolio generation context stats
// @route   GET /api/portfolio/context/stats
// @access  Private
const getPortfolioContextStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const stats = await contextService.getContextStats(userId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get context stats',
      error: error.message
    });
  }
});

module.exports = {
  createPortfolio,
  getUserPortfolios,
  getPortfolio,
  updatePortfolio,
  portfolioAIChat,
  publishPortfolio,
  generatePortfolioCode,
  clearPortfolioContext,
  getPortfolioContextStats
};
