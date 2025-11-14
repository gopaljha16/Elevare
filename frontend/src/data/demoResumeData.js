// Demo Resume Data - Professional showcase with high ATS score
export const demoResumeData = {
  personalInfo: {
    fullName: 'Sarah Johnson',
    jobTitle: 'Senior Full Stack Developer',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA 94102',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      github: 'https://github.com/sarahjohnson',
      portfolio: 'https://sarahjohnson.dev',
      twitter: 'https://twitter.com/sarahcodes',
      website: 'https://sarahjohnson.dev'
    }
  },
  
  professionalSummary: 'Results-driven Senior Full Stack Developer with 7+ years of experience building scalable web applications and leading cross-functional teams. Proven track record of delivering high-impact solutions that increased user engagement by 45% and reduced infrastructure costs by 30%. Expert in React, Node.js, and cloud architecture with a passion for creating exceptional user experiences and mentoring junior developers.',
  
  experience: [
    {
      jobTitle: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: '',
      current: true,
      description: 'Lead development of enterprise SaaS platform serving 50,000+ users. Architect and implement scalable microservices infrastructure using React, Node.js, and AWS.',
      achievements: [
        'Architected and deployed microservices infrastructure that improved system performance by 60% and reduced latency from 800ms to 200ms',
        'Led team of 5 developers in building real-time collaboration features, increasing user engagement by 45%',
        'Implemented CI/CD pipeline using GitHub Actions and Docker, reducing deployment time from 2 hours to 15 minutes',
        'Mentored 3 junior developers, resulting in 2 promotions within 18 months',
        'Reduced AWS infrastructure costs by 30% through optimization and serverless architecture implementation'
      ]
    },
    {
      jobTitle: 'Full Stack Developer',
      company: 'InnovateTech Inc',
      location: 'San Francisco, CA',
      startDate: '2019-01',
      endDate: '2021-02',
      current: false,
      description: 'Developed and maintained customer-facing web applications using React, Node.js, and PostgreSQL. Collaborated with product and design teams to deliver features.',
      achievements: [
        'Built responsive e-commerce platform that generated $2M in revenue within first 6 months',
        'Optimized database queries reducing page load time by 40% and improving SEO rankings',
        'Implemented automated testing suite achieving 85% code coverage and reducing bugs by 50%',
        'Developed RESTful APIs serving 10,000+ daily active users with 99.9% uptime'
      ]
    },
    {
      jobTitle: 'Junior Software Developer',
      company: 'StartupHub',
      location: 'San Francisco, CA',
      startDate: '2017-06',
      endDate: '2018-12',
      current: false,
      description: 'Contributed to development of mobile-first web applications. Worked with React, Redux, and Firebase to build real-time features.',
      achievements: [
        'Developed 15+ reusable React components adopted across 3 product lines',
        'Implemented real-time chat feature using WebSocket, supporting 1,000+ concurrent users',
        'Collaborated with UX team to improve mobile responsiveness, increasing mobile traffic by 35%'
      ]
    }
  ],
  
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Stanford University',
      location: 'Stanford, CA',
      startDate: '2013-09',
      endDate: '2017-05',
      gpa: '3.8/4.0',
      description: 'Graduated Magna Cum Laude. Focus on Software Engineering and Artificial Intelligence. Dean\'s List all semesters.'
    },
    {
      degree: 'Full Stack Web Development Bootcamp',
      institution: 'General Assembly',
      location: 'San Francisco, CA',
      startDate: '2017-01',
      endDate: '2017-04',
      gpa: '',
      description: 'Intensive 12-week program covering modern web development technologies including React, Node.js, MongoDB, and deployment strategies.'
    }
  ],
  
  skills: {
    technical: [
      'JavaScript (ES6+)',
      'TypeScript',
      'React.js',
      'Node.js',
      'Express.js',
      'Next.js',
      'Vue.js',
      'Python',
      'Java',
      'SQL',
      'MongoDB',
      'PostgreSQL',
      'Redis',
      'GraphQL',
      'REST APIs',
      'Microservices',
      'AWS (EC2, S3, Lambda, RDS)',
      'Docker',
      'Kubernetes',
      'CI/CD',
      'Git',
      'Agile/Scrum'
    ],
    soft: [
      'Team Leadership',
      'Mentoring',
      'Problem Solving',
      'Communication',
      'Project Management',
      'Code Review',
      'Technical Writing',
      'Stakeholder Management',
      'Agile Methodologies',
      'Cross-functional Collaboration'
    ],
    languages: [
      'English (Native)',
      'Spanish (Professional)',
      'Mandarin (Conversational)'
    ],
    tools: [
      'VS Code',
      'GitHub',
      'Jira',
      'Figma',
      'Postman',
      'Jenkins',
      'Terraform',
      'New Relic',
      'Datadog',
      'Slack',
      'Notion'
    ]
  },
  
  projects: [
    {
      title: 'Open Source Task Management System',
      description: 'Built and maintain popular open-source task management application with 5,000+ GitHub stars. Features include real-time collaboration, drag-and-drop interface, and integrations with Slack and Google Calendar.',
      technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Redis', 'Docker'],
      link: 'https://github.com/sarahjohnson/task-manager',
      github: 'https://github.com/sarahjohnson/task-manager',
      startDate: '2020-01',
      endDate: 'Present'
    },
    {
      title: 'AI-Powered Code Review Assistant',
      description: 'Developed machine learning tool that analyzes pull requests and provides automated code review suggestions. Reduced code review time by 40% for teams using the tool.',
      technologies: ['Python', 'TensorFlow', 'FastAPI', 'React', 'PostgreSQL'],
      link: 'https://codereview-ai.dev',
      github: 'https://github.com/sarahjohnson/code-review-ai',
      startDate: '2021-06',
      endDate: '2022-03'
    },
    {
      title: 'Real-time Analytics Dashboard',
      description: 'Created comprehensive analytics dashboard for e-commerce platform processing 1M+ events daily. Features real-time data visualization, custom reports, and predictive analytics.',
      technologies: ['React', 'D3.js', 'Node.js', 'Apache Kafka', 'ClickHouse', 'AWS'],
      link: 'https://analytics-demo.sarahjohnson.dev',
      github: '',
      startDate: '2019-09',
      endDate: '2020-12'
    }
  ],
  
  certifications: [
    {
      name: 'AWS Certified Solutions Architect - Professional',
      issuer: 'Amazon Web Services',
      date: '2022-08',
      credentialId: 'AWS-PSA-12345',
      link: 'https://aws.amazon.com/certification/'
    },
    {
      name: 'Google Cloud Professional Cloud Architect',
      issuer: 'Google Cloud',
      date: '2021-11',
      credentialId: 'GCP-PCA-67890',
      link: 'https://cloud.google.com/certification'
    },
    {
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      date: '2021-05',
      credentialId: 'CKA-54321',
      link: 'https://www.cncf.io/certification/cka/'
    },
    {
      name: 'MongoDB Certified Developer',
      issuer: 'MongoDB University',
      date: '2020-03',
      credentialId: 'MONGO-DEV-98765',
      link: 'https://university.mongodb.com/certification'
    }
  ],
  
  additionalDetails: {
    awards: [
      'Employee of the Year 2022 - TechCorp Solutions',
      'Best Innovation Award 2021 - InnovateTech Inc',
      'Hackathon Winner - TechCrunch Disrupt 2020',
      'Dean\'s List - Stanford University (2013-2017)'
    ],
    publications: [
      'Building Scalable Microservices with Node.js - Medium (2022)',
      'React Performance Optimization Techniques - Dev.to (2021)',
      'Introduction to Kubernetes for Developers - freeCodeCamp (2021)'
    ],
    volunteering: [
      'Mentor at Code2040 - Supporting underrepresented minorities in tech (2020-Present)',
      'Workshop Instructor at Girls Who Code - Teaching web development (2019-Present)',
      'Open Source Contributor - Contributing to React, Node.js, and other projects'
    ],
    hobbies: [
      'Contributing to open source projects',
      'Writing technical blog posts',
      'Speaking at tech conferences',
      'Hiking and photography'
    ]
  },
  
  // Template & Theme
  template: 'modern',
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter',
    fontSize: 'medium'
  },
  
  // Mock ATS Score (high score for demo)
  atsScore: {
    score: 92,
    strengths: [
      'Excellent use of quantifiable achievements with specific metrics',
      'Strong keyword optimization for technical roles',
      'Clear and well-structured professional summary',
      'Comprehensive skills section with relevant technologies',
      'Professional formatting with consistent structure'
    ],
    improvements: [
      'Consider adding more industry-specific certifications',
      'Include volunteer work in main experience section if relevant',
      'Add more action verbs variety in achievement descriptions'
    ],
    missingKeywords: [
      'Machine Learning',
      'DevOps',
      'Blockchain',
      'Mobile Development'
    ],
    lastAnalyzed: new Date()
  },
  
  // Mock AI Suggestions
  aiSuggestions: {
    summary: 'Your resume demonstrates excellent technical expertise and leadership skills. The quantifiable achievements are particularly strong.',
    experienceImprovements: [
      'Consider adding more specific metrics to your most recent role',
      'Highlight cross-functional collaboration in team projects',
      'Emphasize cost savings and efficiency improvements'
    ],
    skillRecommendations: [
      'Add emerging technologies like AI/ML to stay competitive',
      'Include soft skills like "Conflict Resolution" and "Strategic Planning"',
      'Consider adding cloud certifications to strengthen credentials'
    ],
    generalTips: [
      'Your resume is well-optimized for ATS systems',
      'Strong use of action verbs and quantifiable results',
      'Consider tailoring the summary for specific job applications',
      'Excellent balance of technical and leadership skills'
    ],
    lastGenerated: new Date()
  },
  
  // Metadata
  status: 'completed',
  version: 1,
  lastModified: new Date()
};

// Function to get demo resume with fresh timestamps
export const getDemoResumeData = () => {
  return {
    ...demoResumeData,
    atsScore: {
      ...demoResumeData.atsScore,
      lastAnalyzed: new Date()
    },
    aiSuggestions: {
      ...demoResumeData.aiSuggestions,
      lastGenerated: new Date()
    },
    lastModified: new Date()
  };
};

export default demoResumeData;
