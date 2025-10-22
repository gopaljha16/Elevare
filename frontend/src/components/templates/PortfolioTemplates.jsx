import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import {
  Monitor,
  Palette,
  Briefcase,
  Zap,
  Code,
  Sparkles,
  Eye,
  Download
} from 'lucide-react';

const PortfolioTemplates = ({ onSelectTemplate, selectedTemplate }) => {
  const templates = [
    {
      id: 'modern',
      name: 'Modern Professional',
      description: 'Clean, minimalist design with smooth animations',
      category: 'Professional',
      color: 'from-blue-500 to-purple-600',
      icon: Monitor,
      features: ['Responsive Design', 'Dark Mode', 'Animations', 'SEO Optimized'],
      preview: '/api/templates/modern/preview',
      popular: true
    },
    {
      id: 'creative',
      name: 'Creative Designer',
      description: 'Bold, colorful design perfect for creative professionals',
      category: 'Creative',
      color: 'from-pink-500 to-orange-500',
      icon: Palette,
      features: ['Visual Focus', 'Portfolio Gallery', 'Custom Colors', 'Interactive'],
      preview: '/api/templates/creative/preview'
    },
    {
      id: 'corporate',
      name: 'Corporate Executive',
      description: 'Professional, business-focused layout',
      category: 'Business',
      color: 'from-gray-600 to-blue-600',
      icon: Briefcase,
      features: ['Professional Layout', 'Achievement Focus', 'Clean Typography', 'Print Ready'],
      preview: '/api/templates/corporate/preview'
    },
    {
      id: 'developer',
      name: 'Tech Developer',
      description: 'Code-focused design with technical elements',
      category: 'Technology',
      color: 'from-green-500 to-teal-600',
      icon: Code,
      features: ['Code Snippets', 'GitHub Integration', 'Tech Stack', 'Project Showcase'],
      preview: '/api/templates/developer/preview'
    },
    {
      id: 'startup',
      name: 'Startup Founder',
      description: 'Dynamic, growth-oriented design',
      category: 'Startup',
      color: 'from-purple-500 to-pink-600',
      icon: Zap,
      features: ['Growth Metrics', 'Vision Focus', 'Team Section', 'Investor Ready'],
      preview: '/api/templates/startup/preview'
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      description: 'Ultra-clean, content-focused design',
      category: 'Minimal',
      color: 'from-gray-400 to-gray-600',
      icon: Sparkles,
      features: ['Ultra Clean', 'Typography Focus', 'Fast Loading', 'Accessibility'],
      preview: '/api/templates/minimalist/preview'
    }
  ];

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Template
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a professional template that matches your style and industry
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map(category => (
          <Badge
            key={category}
            variant="outline"
            className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const IconComponent = template.icon;
          const isSelected = selectedTemplate === template.id;
          
          return (
            <Card
              key={template.id}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl",
                isSelected 
                  ? "ring-2 ring-blue-500 shadow-lg" 
                  : "hover:shadow-lg"
              )}
              onClick={() => onSelectTemplate(template.id)}
            >
              {template.popular && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-orange-500 text-white">
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r text-white",
                    template.color
                  )}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {template.description}
                </p>
                
                {/* Template Preview */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <TemplatePreview template={template} />
                </div>
                
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Features:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template.id);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open preview in new tab
                      window.open(template.preview, '_blank');
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Template Customization Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          All Templates Are Fully Customizable
        </h3>
        <p className="text-blue-700 dark:text-blue-300 mb-4">
          Every template can be personalized with your colors, fonts, and content. 
          The AI will adapt the design to match your professional brand.
        </p>
        <div className="flex justify-center gap-4 text-sm text-blue-600 dark:text-blue-400">
          <span>✓ Custom Colors</span>
          <span>✓ Font Selection</span>
          <span>✓ Layout Options</span>
          <span>✓ Section Reordering</span>
        </div>
      </div>
    </div>
  );
};

// Template Preview Component
const TemplatePreview = ({ template }) => {
  const previewStyles = {
    modern: (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 p-2">
        <div className="bg-white rounded shadow-sm h-full p-2 space-y-1">
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          <div className="h-1 bg-gray-100 rounded w-3/4"></div>
          <div className="h-1 bg-gray-100 rounded w-2/3"></div>
          <div className="flex gap-1 mt-2">
            <div className="h-1 bg-blue-200 rounded w-1/4"></div>
            <div className="h-1 bg-purple-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    ),
    creative: (
      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 p-2">
        <div className="bg-white rounded shadow-sm h-full p-2 space-y-1">
          <div className="h-2 bg-gradient-to-r from-pink-200 to-orange-200 rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-1 mt-2">
            <div className="h-4 bg-pink-100 rounded"></div>
            <div className="h-4 bg-orange-100 rounded"></div>
            <div className="h-4 bg-yellow-100 rounded"></div>
          </div>
        </div>
      </div>
    ),
    corporate: (
      <div className="w-full h-full bg-gray-50 p-2">
        <div className="bg-white rounded shadow-sm h-full p-2 space-y-1">
          <div className="h-2 bg-gray-600 rounded w-1/2"></div>
          <div className="h-1 bg-gray-300 rounded w-3/4"></div>
          <div className="h-1 bg-gray-300 rounded w-2/3"></div>
          <div className="flex gap-1 mt-2">
            <div className="h-3 bg-blue-600 rounded w-1/3"></div>
            <div className="h-3 bg-gray-400 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    ),
    developer: (
      <div className="w-full h-full bg-gray-900 p-2">
        <div className="bg-gray-800 rounded h-full p-2 space-y-1">
          <div className="h-2 bg-green-400 rounded w-1/2"></div>
          <div className="h-1 bg-gray-400 rounded w-3/4"></div>
          <div className="bg-gray-700 rounded p-1 mt-2">
            <div className="h-1 bg-green-300 rounded w-1/2 mb-1"></div>
            <div className="h-1 bg-blue-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    ),
    startup: (
      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 p-2">
        <div className="bg-white rounded shadow-sm h-full p-2 space-y-1">
          <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded w-1/2"></div>
          <div className="h-1 bg-gray-200 rounded w-3/4"></div>
          <div className="flex gap-1 mt-2">
            <div className="h-2 bg-purple-200 rounded-full w-4"></div>
            <div className="h-2 bg-pink-200 rounded-full w-4"></div>
            <div className="h-2 bg-yellow-200 rounded-full w-4"></div>
          </div>
        </div>
      </div>
    ),
    minimalist: (
      <div className="w-full h-full bg-white p-2">
        <div className="h-full p-2 space-y-2">
          <div className="h-1 bg-gray-900 rounded w-1/3"></div>
          <div className="h-px bg-gray-300 rounded w-full"></div>
          <div className="h-px bg-gray-200 rounded w-3/4"></div>
          <div className="h-px bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  };

  return previewStyles[template.id] || previewStyles.modern;
};

export default PortfolioTemplates;