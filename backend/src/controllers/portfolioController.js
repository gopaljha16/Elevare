const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const aiService = require('../services/aiService');
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

module.exports = {
  createPortfolio,
  getUserPortfolios,
  getPortfolio,
  updatePortfolio,
  portfolioAIChat,
  publishPortfolio
};
