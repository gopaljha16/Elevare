import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

/**
 * Template Gallery Modal - Overleaf Style
 * Shows available LaTeX resume templates
 */
const TemplateGalleryModal = ({ onSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'modern', name: 'Modern' },
    { id: 'professional', name: 'Professional' },
    { id: 'academic', name: 'Academic' },
    { id: 'creative', name: 'Creative' }
  ];

  const templates = [
    {
      id: 'moderncv-banking',
      name: 'ModernCV Banking',
      category: 'modern',
      description: 'Clean and professional design with blue accents',
      preview: '/templates/moderncv-banking.png',
      code: MODERNCV_BANKING_TEMPLATE,
      features: ['ATS Friendly', 'Modern Design', 'Easy to Customize']
    },
    {
      id: 'moderncv-classic',
      name: 'ModernCV Classic',
      category: 'professional',
      description: 'Traditional professional layout',
      preview: '/templates/moderncv-classic.png',
      code: MODERNCV_CLASSIC_TEMPLATE,
      features: ['Professional', 'Traditional', 'Corporate']
    },
    {
      id: 'academic-cv',
      name: 'Academic CV',
      category: 'academic',
      description: 'Comprehensive academic curriculum vitae',
      preview: '/templates/academic-cv.png',
      code: ACADEMIC_CV_TEMPLATE,
      features: ['Publications', 'Research Focus', 'Academic Format']
    },
    {
      id: 'tech-resume',
      name: 'Tech Resume',
      category: 'modern',
      description: 'Optimized for software engineering roles',
      preview: '/templates/tech-resume.png',
      code: TECH_RESUME_TEMPLATE,
      features: ['Tech Focused', 'Skills Highlight', 'Project Showcase']
    },
    {
      id: 'creative-resume',
      name: 'Creative Resume',
      category: 'creative',
      description: 'Eye-catching design for creative professionals',
      preview: '/templates/creative-resume.png',
      code: CREATIVE_RESUME_TEMPLATE,
      features: ['Creative Design', 'Portfolio Ready', 'Visual Appeal']
    },
    {
      id: 'minimal-resume',
      name: 'Minimal Resume',
      category: 'modern',
      description: 'Clean and minimalist design',
      preview: '/templates/minimal-resume.png',
      code: MINIMAL_RESUME_TEMPLATE,
      features: ['Minimalist', 'Clean Layout', 'Focus on Content']
    }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
              <p className="text-gray-600 mt-1">Select a professional LaTeX resume template</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[600px]">
          {/* Template Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => handleSelectTemplate(template)}
                />
              ))}
            </div>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="w-80 border-l border-gray-200 p-6">
              <TemplatePreview 
                template={selectedTemplate}
                onUse={handleUseTemplate}
              />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Template Card Component
 */
const TemplateCard = ({ template, isSelected, onSelect }) => {
  return (
    <div 
      className={cn(
        "border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-200 hover:border-gray-300"
      )}
      onClick={onSelect}
    >
      {/* Template Preview Image */}
      <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden">
        <img 
          src={template.preview} 
          alt={template.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgdmlld0JveD0iMCAwIDIwMCAyNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzlDQTNBRiIvPgo8cmVjdCB4PSIyMCIgeT0iNTAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAiIGZpbGw9IiNEMUQ1REIiLz4KPHJlY3QgeD0iMjAiIHk9IjcwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRDFENURCIi8+CjxyZWN0IHg9IjIwIiB5PSI5MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K';
          }}
        />
      </div>

      {/* Template Info */}
      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{template.description}</p>

      {/* Features */}
      <div className="flex flex-wrap gap-1">
        {template.features.map((feature, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * Template Preview Component
 */
const TemplatePreview = ({ template, onUse }) => {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
      <p className="text-gray-600 mb-4">{template.description}</p>

      {/* Features List */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
        <ul className="space-y-1">
          {template.features.map((feature, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Code Preview */}
      <div className="mb-4 flex-1">
        <h4 className="font-medium text-gray-900 mb-2">LaTeX Code Preview:</h4>
        <div className="bg-gray-100 rounded-lg p-3 text-xs font-mono overflow-auto max-h-40">
          <pre className="text-gray-700">
            {template.code.substring(0, 200)}...
          </pre>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        onClick={onUse}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Use This Template
      </Button>
    </div>
  );
};

// Template Code Constants
const MODERNCV_BANKING_TEMPLATE = `\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{blue}
\\usepackage[scale=0.75]{geometry}

% Personal data
\\name{John}{Doe}
\\title{Software Engineer}
\\address{123 Main Street}{San Francisco, CA 94102}{}
\\phone[mobile]{+1~(555)~123~4567}
\\email{john.doe@email.com}
\\homepage{www.johndoe.com}
\\social[linkedin]{johndoe}
\\social[github]{johndoe}

\\begin{document}
\\makecvtitle

\\section{Experience}
\\cventry{2020--Present}{Senior Software Engineer}{Tech Corp}{San Francisco}{}{
\\begin{itemize}
\\item Led development of microservices architecture serving 1M+ users
\\item Improved system performance by 40\\% through optimization
\\item Mentored 5 junior developers and conducted code reviews
\\end{itemize}}

\\section{Education}
\\cventry{2016--2020}{Bachelor of Science in Computer Science}{University of California}{Berkeley}{}{}

\\section{Skills}
\\cvitem{Languages}{JavaScript, Python, Java, C++}
\\cvitem{Frameworks}{React, Node.js, Django, Spring Boot}
\\cvitem{Tools}{Git, Docker, AWS, Jenkins}

\\end{document}`;

const MODERNCV_CLASSIC_TEMPLATE = `\\documentclass[11pt,a4paper,roman]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{green}
\\usepackage[scale=0.75]{geometry}

% Personal data
\\name{Jane}{Smith}
\\title{Marketing Manager}
\\address{456 Oak Avenue}{New York, NY 10001}{}
\\phone[mobile]{+1~(555)~987~6543}
\\email{jane.smith@email.com}

\\begin{document}
\\makecvtitle

\\section{Professional Summary}
\\cvitem{}{Results-driven marketing professional with 8+ years of experience in digital marketing, brand management, and campaign optimization. Proven track record of increasing brand awareness and driving revenue growth.}

\\section{Experience}
\\cventry{2019--Present}{Senior Marketing Manager}{Global Corp}{New York}{}{
\\begin{itemize}
\\item Managed \\$2M annual marketing budget across multiple channels
\\item Increased brand awareness by 60\\% through integrated campaigns
\\item Led cross-functional team of 12 marketing professionals
\\end{itemize}}

\\end{document}`;

const ACADEMIC_CV_TEMPLATE = `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\begin{document}

\\begin{center}
{\\Large\\textbf{Dr. Sarah Johnson}}\\\\
\\vspace{2pt}
Professor of Computer Science\\\\
University of Technology\\\\
sarah.johnson@university.edu | (555) 123-4567
\\end{center}

\\section*{Education}
\\textbf{Ph.D. in Computer Science}, Stanford University, 2010\\\\
\\textbf{M.S. in Computer Science}, MIT, 2006\\\\
\\textbf{B.S. in Mathematics}, Harvard University, 2004

\\section*{Research Interests}
Machine Learning, Artificial Intelligence, Natural Language Processing

\\section*{Publications}
\\begin{enumerate}[leftmargin=*]
\\item Johnson, S. (2023). "Advanced Neural Networks in NLP." \\textit{Journal of AI Research}, 45(2), 123-145.
\\item Johnson, S., \& Smith, J. (2022). "Deep Learning Applications." \\textit{IEEE Transactions on AI}, 15(3), 67-89.
\\end{enumerate}

\\end{document}`;

const TECH_RESUME_TEMPLATE = `\\documentclass[letterpaper,11pt]{article}
\\usepackage[left=0.4in,top=0.4in,right=0.4in,bottom=0.4in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\definecolor{techblue}{RGB}{0,102,204}

\\begin{document}

\\begin{center}
{\\Large\\textbf{\\color{techblue}Alex Chen}}\\\\
\\vspace{2pt}
Full Stack Developer | React | Node.js | Python\\\\
alex.chen@email.com | (555) 123-4567 | github.com/alexchen
\\end{center}

\\section*{\\color{techblue}Technical Skills}
\\textbf{Languages:} JavaScript, Python, Java, TypeScript, Go\\\\
\\textbf{Frontend:} React, Vue.js, Angular, HTML5, CSS3, Sass\\\\
\\textbf{Backend:} Node.js, Express, Django, Flask, Spring Boot\\\\
\\textbf{Database:} PostgreSQL, MongoDB, Redis, MySQL\\\\
\\textbf{Tools:} Git, Docker, Kubernetes, AWS, Jenkins, Webpack

\\section*{\\color{techblue}Experience}
\\textbf{Senior Full Stack Developer} | TechStart Inc. | 2021 - Present
\\begin{itemize}[leftmargin=*,noitemsep]
\\item Built scalable web applications serving 100K+ daily active users
\\item Implemented CI/CD pipelines reducing deployment time by 75\\%
\\item Led migration to microservices architecture improving system reliability
\\end{itemize}

\\end{document}`;

const CREATIVE_RESUME_TEMPLATE = `\\documentclass[a4paper,11pt]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{xcolor}
\\usepackage{fontawesome}
\\usepackage{tikz}

\\definecolor{accent}{RGB}{255,87,51}
\\definecolor{dark}{RGB}{51,51,51}

\\begin{document}

\\begin{tikzpicture}[remember picture,overlay]
\\fill[accent] (current page.north west) rectangle ([yshift=-2cm]current page.north east);
\\end{tikzpicture}

\\vspace{1cm}
\\begin{center}
{\\Huge\\color{white}\\textbf{Emma Wilson}}\\\\
\\vspace{0.5cm}
{\\Large\\color{white}Graphic Designer \& Creative Director}\\\\
\\vspace{0.3cm}
{\\color{white}\\faEnvelope\\ emma.wilson@email.com \\quad \\faPhone\\ (555) 123-4567}\\\\
{\\color{white}\\faGlobe\\ emmawilson.design \\quad \\faLinkedin\\ /in/emmawilson}
\\end{center}

\\vspace{1cm}

\\section*{\\color{accent}Creative Experience}
\\textbf{Senior Graphic Designer} | Creative Agency | 2020 - Present
\\begin{itemize}
\\item Designed brand identities for 50+ clients across various industries
\\item Led creative campaigns that increased client engagement by 200\\%
\\item Managed design team of 8 creatives and freelancers
\\end{itemize}

\\section*{\\color{accent}Skills \& Software}
Adobe Creative Suite, Figma, Sketch, Blender, After Effects, Photography

\\end{document}`;

const MINIMAL_RESUME_TEMPLATE = `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\pagestyle{empty}

\\begin{document}

{\\Large\\textbf{Michael Brown}}\\\\
Software Engineer\\\\
michael.brown@email.com | (555) 123-4567 | San Francisco, CA

\\vspace{1em}

\\textbf{Experience}\\\\
\\textbf{Software Engineer} at Google | 2021 - Present\\\\
Developed scalable backend services handling millions of requests daily.

\\vspace{0.5em}

\\textbf{Software Developer} at Startup Inc | 2019 - 2021\\\\
Built full-stack web applications using React and Node.js.

\\vspace{1em}

\\textbf{Education}\\\\
\\textbf{B.S. Computer Science} | UC Berkeley | 2019

\\vspace{1em}

\\textbf{Skills}\\\\
JavaScript, Python, React, Node.js, PostgreSQL, AWS

\\end{document}`;

export default TemplateGalleryModal;