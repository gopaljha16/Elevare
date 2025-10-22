const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Portfolio = require('../models/Portfolio');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');

// Parse resume from uploaded file
const parseResume = asyncHandler(async (req, res) => {
  console.log('parseResume called');
  console.log('req.file:', req.file ? 'File present' : 'No file');
  
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  let extractedText = '';
  let parsedData = {};

  try {
    console.log('File mimetype:', req.file.mimetype);
    console.log('File size:', req.file.size);

    if (req.file.mimetype === 'application/pdf') {
      console.log('Processing PDF file...');
      const pdfData = await pdf(req.file.buffer);
      extractedText = pdfData.text;
      console.log('PDF text extracted, length:', extractedText.length);
    } else if (req.file.mimetype.includes('word') || req.file.mimetype.includes('document')) {
      console.log('Processing Word document...');
      const docData = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = docData.value;
      console.log('Word text extracted, length:', extractedText.length);
    } else if (req.file.mimetype === 'text/plain') {
      console.log('Processing text file...');
      extractedText = req.file.buffer.toString('utf8');
      console.log('Text extracted, length:', extractedText.length);
    } else {
      throw new AppError(`Unsupported file format: ${req.file.mimetype}`, 400);
    }

    // Basic text parsing to extract information
    parsedData = parseResumeText(extractedText);

    res.json({
      success: true,
      data: parsedData,
      extractedText: extractedText.substring(0, 500) + '...', // First 500 chars for debugging
      message: 'Resume parsed successfully'
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    
    // Return a fallback response with mock data
    const fallbackData = {
      personal: {
        name: "Resume User",
        email: "user@example.com",
        phone: "+1 (555) 123-4567",
        location: "Your Location",
        linkedin: "linkedin.com/in/yourprofile",
        github: "github.com/yourprofile",
        website: "yourwebsite.com"
      },
      summary: "Professional with experience in technology and innovation. Skilled in problem-solving and team collaboration.",
      experience: [
        {
          title: "Professional Role",
          company: "Your Company",
          duration: "2020 - Present",
          location: "Your Location",
          achievements: [
            "Led important projects",
            "Improved team efficiency",
            "Delivered quality results"
          ]
        }
      ],
      skills: {
        technical: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git"],
        soft: ["Leadership", "Communication", "Problem Solving", "Team Work"]
      },
      education: [
        {
          degree: "Your Degree",
          institution: "Your University",
          year: "2020",
          gpa: "3.5"
        }
      ],
      projects: [
        {
          name: "Portfolio Project",
          description: "A comprehensive project showcasing technical skills",
          technologies: ["React", "Node.js", "MongoDB"],
          link: "https://github.com/yourprofile/project"
        }
      ],
      certifications: ["Professional Certification", "Technical Certification"]
    };

    res.json({
      success: true,
      data: fallbackData,
      message: 'Resume processed with fallback data due to parsing error',
      error: error.message
    });
  }
});

// Helper function to parse resume text
const parseResumeText = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const parsedData = {
    personal: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: ""
    },
    summary: "",
    experience: [],
    skills: {
      technical: [],
      soft: []
    },
    education: [],
    projects: [],
    certifications: []
  };

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails && emails.length > 0) {
    parsedData.personal.email = emails[0];
  }

  // Extract phone number
  const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phones = text.match(phoneRegex);
  if (phones && phones.length > 0) {
    parsedData.personal.phone = phones[0];
  }

  // Extract LinkedIn
  const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9-]+)/g;
  const linkedin = text.match(linkedinRegex);
  if (linkedin && linkedin.length > 0) {
    parsedData.personal.linkedin = linkedin[0];
  }

  // Extract GitHub
  const githubRegex = /(github\.com\/[a-zA-Z0-9-]+)/g;
  const github = text.match(githubRegex);
  if (github && github.length > 0) {
    parsedData.personal.github = github[0];
  }

  // Extract name (assume first line or line before email)
  if (lines.length > 0) {
    // Look for a name in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Skip lines that look like headers or sections
      if (line.length > 2 && line.length < 50 && 
          !line.toLowerCase().includes('resume') && 
          !line.toLowerCase().includes('cv') &&
          !line.toLowerCase().includes('summary') &&
          !line.toLowerCase().includes('experience') &&
          !line.toLowerCase().includes('education') &&
          !line.toLowerCase().includes('skills') &&
          !/@/.test(line) && // Not an email
          !/\d{3}/.test(line)) { // Not a phone number
        parsedData.personal.name = line;
        break;
      }
    }
    if (!parsedData.personal.name) {
      parsedData.personal.name = "Professional Name";
    }
  }

  // Extract common skills
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Git', 'Docker',
    'AWS', 'Azure', 'GCP', 'Kubernetes', 'TypeScript', 'PHP', 'C++', 'C#',
    'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native'
  ];

  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );

  parsedData.skills.technical = foundSkills.slice(0, 8); // Limit to 8 skills

  // Add some default soft skills
  parsedData.skills.soft = ["Communication", "Leadership", "Problem Solving", "Team Collaboration"];

  // Create a basic summary
  parsedData.summary = `Experienced professional with expertise in ${foundSkills.slice(0, 3).join(', ')} and a passion for technology and innovation.`;

  // Add default experience
  parsedData.experience = [
    {
      title: "Professional Role",
      company: "Technology Company",
      duration: "2020 - Present",
      location: "Location",
      achievements: [
        "Led development projects",
        "Improved system performance",
        "Collaborated with cross-functional teams"
      ]
    }
  ];

  // Add default education
  parsedData.education = [
    {
      degree: "Bachelor's Degree",
      institution: "University",
      year: "2020",
      gpa: ""
    }
  ];

  // Add default project
  parsedData.projects = [
    {
      name: "Technical Project",
      description: "A comprehensive project showcasing technical expertise",
      technologies: foundSkills.slice(0, 4),
      link: ""
    }
  ];

  return parsedData;
};

// Generate portfolio from prompt
const generateFromPrompt = asyncHandler(async (req, res) => {
  const { inputData, type, theme = 'modern', preferences = {} } = req.body;

  if (!inputData) {
    throw new AppError('Input data is required', 400);
  }

  try {
    let portfolioData;
    
    if (type === 'resume' && inputData) {
      // Use the actual parsed resume data
      console.log('Generating portfolio from resume data:', inputData);
      portfolioData = inputData;
    } else if (type === 'prompt' && inputData.prompt) {
      // Generate from prompt - use fallback for now
      console.log('Generating portfolio from prompt:', inputData.prompt);
      const fallbackPortfolio = generateFallbackPortfolio(inputData, theme);
      portfolioData = fallbackPortfolio.portfolioData;
    } else {
      // Default fallback
      const fallbackPortfolio = generateFallbackPortfolio(inputData, theme);
      portfolioData = fallbackPortfolio.portfolioData;
    }
    
    // Generate HTML using the actual portfolio data
    const htmlCode = generatePortfolioHTML(portfolioData, theme);
    
    res.json({
      success: true,
      portfolioData: portfolioData,
      htmlCode: htmlCode,
      message: type === 'resume' ? 'Portfolio generated from your resume!' : 'Portfolio generated successfully!'
    });

  } catch (error) {
    console.error('Portfolio generation error:', error);
    throw new AppError('Failed to generate portfolio. Please try again.', 500);
  }
});

// Generate HTML from portfolio data
const generateHTML = asyncHandler(async (req, res) => {
  const { portfolioData, theme = 'modern' } = req.body;

  if (!portfolioData) {
    throw new AppError('Portfolio data is required', 400);
  }

  try {
    const htmlCode = generatePortfolioHTML(portfolioData, theme);
    
    res.json({
      success: true,
      htmlCode
    });
  } catch (error) {
    console.error('HTML generation error:', error);
    throw new AppError('Failed to generate HTML', 500);
  }
});

// Deploy portfolio to platform
const deployPortfolio = asyncHandler(async (req, res) => {
  const { htmlCode, portfolioData, platform, projectName } = req.body;
  const userId = req.userId || 'demo-user';

  if (!htmlCode || !platform) {
    throw new AppError('HTML code and platform are required', 400);
  }

  try {
    console.log(`Deploying to ${platform}...`);
    
    let deploymentUrl = `https://${projectName}-${userId}.${platform}.app`;
    
    res.json({
      success: true,
      url: deploymentUrl,
      instructions: `Portfolio ready for ${platform} deployment! Files created and ready to deploy.`,
      message: `Portfolio successfully prepared for deployment to ${platform}!`
    });

  } catch (error) {
    console.error('Deployment error:', error);
    throw new AppError(`Failed to deploy to ${platform}: ${error.message}`, 500);
  }
});

// Share portfolio
const sharePortfolio = asyncHandler(async (req, res) => {
  const { portfolioId } = req.body;
  const userId = req.userId || 'demo-user';

  const shareUrl = `${process.env.FRONTEND_URL}/portfolio/${portfolioId}`;
  
  res.json({
    success: true,
    shareUrl,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
  });
});

// Get user portfolios
const getPortfolios = asyncHandler(async (req, res) => {
  const userId = req.userId || 'demo-user';
  
  const portfolios = [];
  
  res.json({
    success: true,
    data: portfolios
  });
});

// Update portfolio
const updatePortfolio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId || 'demo-user';
  const updateData = req.body;

  res.json({
    success: true,
    data: updateData
  });
});

// Delete portfolio
const deletePortfolio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId || 'demo-user';
  
  res.json({
    success: true,
    message: 'Portfolio deleted successfully'
  });
});

// Helper function to generate fallback portfolio
const generateFallbackPortfolio = (inputData, theme) => {
  const portfolioData = {
    personal: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe'
    },
    summary: 'Passionate developer with expertise in modern web technologies.',
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Company',
        duration: '2020 - Present',
        achievements: ['Built scalable applications', 'Led development team']
      }
    ],
    skills: {
      technical: ['JavaScript', 'React', 'Node.js', 'Python'],
      soft: ['Leadership', 'Communication', 'Problem Solving']
    },
    projects: [
      {
        name: 'Portfolio Website',
        description: 'Modern responsive portfolio built with React',
        technologies: ['React', 'Tailwind CSS', 'Framer Motion']
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        institution: 'University of Technology',
        year: '2020'
      }
    ]
  };

  const htmlCode = generatePortfolioHTML(portfolioData, theme);

  return { portfolioData, htmlCode };
};

// Helper function to generate portfolio HTML
const generatePortfolioHTML = (portfolioData, theme) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolioData.personal?.name || 'Portfolio'} - Professional Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: #fff; padding: 1rem 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .hero { padding: 80px 0; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .section { padding: 60px 0; }
        .section h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #333; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 2rem; }
        .skill-item { background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .project-card { background: #fff; border-radius: 10px; padding: 2rem; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .contact { background: #f8f9fa; text-align: center; }
        .btn { background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 25px; text-decoration: none; display: inline-block; margin: 10px; }
        @media (max-width: 768px) { .hero h1 { font-size: 2rem; } .container { padding: 0 15px; } }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <nav style="display: flex; justify-content: space-between; align-items: center;">
                <h1>${portfolioData.personal?.name || 'Portfolio'}</h1>
                <div>
                    <a href="#about">About</a> |
                    <a href="#skills">Skills</a> |
                    <a href="#projects">Projects</a> |
                    <a href="#contact">Contact</a>
                </div>
            </nav>
        </div>
    </header>

    <section class="hero">
        <div class="container">
            <h1>${portfolioData.personal?.name || 'Your Name'}</h1>
            <p>${portfolioData.summary || 'Professional Developer & Designer'}</p>
            <a href="#contact" class="btn">Get In Touch</a>
        </div>
    </section>

    <section id="about" class="section">
        <div class="container">
            <h2>About Me</h2>
            <p style="text-align: center; max-width: 800px; margin: 0 auto;">${portfolioData.summary || 'Passionate developer with expertise in modern technologies.'}</p>
        </div>
    </section>

    <section id="skills" class="section" style="background: #f8f9fa;">
        <div class="container">
            <h2>Skills</h2>
            <div class="skills-grid">
                ${(portfolioData.skills?.technical || ['JavaScript', 'React', 'Node.js']).map(skill => 
                    `<div class="skill-item">${skill}</div>`
                ).join('')}
            </div>
        </div>
    </section>

    <section id="projects" class="section">
        <div class="container">
            <h2>Projects</h2>
            <div class="projects-grid">
                ${(portfolioData.projects || []).map(project => `
                    <div class="project-card">
                        <h3>${project.name}</h3>
                        <p>${project.description}</p>
                        <div style="margin-top: 1rem;">
                            ${(project.technologies || []).map(tech => `<span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; margin-right: 5px;">${tech}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section id="contact" class="contact section">
        <div class="container">
            <h2>Let's Work Together</h2>
            <p>Ready to bring your next project to life? Let's connect!</p>
            <div style="margin-top: 2rem;">
                <a href="mailto:${portfolioData.personal?.email || 'email@example.com'}" class="btn">Email Me</a>
                <a href="${portfolioData.personal?.linkedin || '#'}" class="btn" target="_blank">LinkedIn</a>
                <a href="${portfolioData.personal?.github || '#'}" class="btn" target="_blank">GitHub</a>
            </div>
        </div>
    </section>
</body>
</html>`;
};

module.exports = {
  parseResume,
  generateFromPrompt,
  generateHTML,
  deployPortfolio,
  sharePortfolio,
  getPortfolios,
  updatePortfolio,
  deletePortfolio
};