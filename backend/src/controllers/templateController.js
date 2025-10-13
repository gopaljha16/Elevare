const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Resume templates data
const resumeTemplates = [
  {
    id: 'template_1',
    name: 'Professional',
    description: 'Clean and professional template suitable for corporate environments',
    category: 'professional',
    preview: '/templates/professional-preview.png',
    features: ['ATS-friendly', 'Clean layout', 'Professional fonts'],
    isActive: true
  },
  {
    id: 'template_2',
    name: 'Modern',
    description: 'Contemporary design with subtle colors and modern typography',
    category: 'modern',
    preview: '/templates/modern-preview.png',
    features: ['Modern design', 'Color accents', 'Creative layout'],
    isActive: true
  },
  {
    id: 'template_3',
    name: 'Minimalist',
    description: 'Simple and clean design focusing on content over decoration',
    category: 'minimalist',
    preview: '/templates/minimalist-preview.png',
    features: ['Minimal design', 'Focus on content', 'Easy to read'],
    isActive: true
  }
];

// Get all available resume templates
const getTemplates = asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  let templates = resumeTemplates.filter(template => template.isActive);
  
  if (category) {
    templates = templates.filter(template => template.category === category);
  }

  res.json({
    success: true,
    data: {
      templates,
      categories: ['professional', 'modern', 'minimalist']
    }
  });
});

// Get a specific template
const getTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  
  const template = resumeTemplates.find(t => t.id === templateId && t.isActive);
  
  if (!template) {
    throw new AppError('Template not found', 404);
  }

  res.json({
    success: true,
    data: {
      template
    }
  });
});

// Get template categories
const getTemplateCategories = asyncHandler(async (req, res) => {
  const categories = [...new Set(resumeTemplates.map(t => t.category))];
  
  res.json({
    success: true,
    data: {
      categories: categories.map(category => ({
        name: category,
        count: resumeTemplates.filter(t => t.category === category && t.isActive).length
      }))
    }
  });
});

module.exports = {
  getTemplates,
  getTemplate,
  getTemplateCategories
};