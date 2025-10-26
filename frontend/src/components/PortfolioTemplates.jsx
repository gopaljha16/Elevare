import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Layout,
  Eye,
  Sparkles,
  Palette,
  Smartphone,
  Zap,
  Star,
  ArrowRight,
  Check
} from 'lucide-react';
import axios from 'axios';

const PortfolioTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Templates', count: 0 },
    { id: 'modern', name: 'Modern', count: 0 },
    { id: 'minimal', name: 'Minimal', count: 0 },
    { id: 'creative', name: 'Creative', count: 0 },
    { id: 'professional', name: 'Professional', count: 0 }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/portfolio/templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Fallback templates for demo
      setTemplates([
        {
          id: 'modern',
          name: 'Modern Gradient',
          description: 'Sleek design with gradient backgrounds and smooth animations',
          category: 'modern',
          preview: '/templates/modern-preview.jpg',
          colors: {
            primary: '#EC4899',
            secondary: '#8B5CF6',
            accent: '#F472B6',
            background: '#0E101A',
            surface: '#121625'
          },
          features: ['Gradient backgrounds', 'Smooth animations', 'Mobile responsive', 'Dark theme'],
          rating: 4.9,
          downloads: 1234,
          isPremium: false
        },
        {
          id: 'minimal',
          name: 'Minimal Clean',
          description: 'Clean and professional design with focus on content',
          category: 'minimal',
          preview: '/templates/minimal-preview.jpg',
          colors: {
            primary: '#3B82F6',
            secondary: '#1E40AF',
            accent: '#60A5FA',
            background: '#FFFFFF',
            surface: '#F8FAFC'
          },
          features: ['Clean typography', 'Minimal design', 'Fast loading', 'Light theme'],
          rating: 4.8,
          downloads: 987,
          isPremium: false
        },
        {
          id: 'dark',
          name: 'Dark Professional',
          description: 'Professional dark theme with elegant styling',
          category: 'professional',
          preview: '/templates/dark-preview.jpg',
          colors: {
            primary: '#10B981',
            secondary: '#059669',
            accent: '#34D399',
            background: '#111827',
            surface: '#1F2937'
          },
          features: ['Dark theme', 'Professional look', 'Eye-friendly', 'Modern design'],
          rating: 4.7,
          downloads: 756,
          isPremium: true
        },
        {
          id: 'creative',
          name: 'Creative Showcase',
          description: 'Bold and creative design for designers and artists',
          category: 'creative',
          preview: '/templates/creative-preview.jpg',
          colors: {
            primary: '#F59E0B',
            secondary: '#D97706',
            accent: '#FCD34D',
            background: '#1F2937',
            surface: '#374151'
          },
          features: ['Bold colors', 'Creative layouts', 'Portfolio focus', 'Interactive elements'],
          rating: 4.6,
          downloads: 543,
          isPremium: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const getTemplateGradient = (colors) => {
    return `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E101A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC4899] mx-auto mb-4"></div>
          <p className="text-white/60">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E101A] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-44 -left-40 h-[520px] w-[520px] rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-[#EC4899]/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60 mb-6">
            <Layout className="h-4 w-4" />
            Portfolio Templates
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Choose Your Perfect
            <span className="block bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#8B5CF6] bg-clip-text text-transparent">
              Portfolio Template
            </span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            Professional, responsive, and customizable portfolio templates designed to showcase your work and land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/portfolio-builder"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#8B5CF6] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(236,72,153,0.35)] transition-transform duration-150 hover:translate-y-[-1px]"
            >
              Start Building
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white/80 transition-all duration-150 hover:border-white/30 hover:text-white">
              <Eye className="h-4 w-4" />
              Preview All
            </button>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-[#121625] rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
            >
              {/* Template Preview */}
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-80"
                  style={{ background: getTemplateGradient(template.colors) }}
                />
                
                {/* Mock Portfolio Layout */}
                <div className="absolute inset-4 bg-white/10 backdrop-blur rounded-lg p-4 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full" />
                    <div className="flex-1">
                      <div className="h-2 bg-white/30 rounded mb-1" />
                      <div className="h-1.5 bg-white/20 rounded w-2/3" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="h-1.5 bg-white/30 rounded" />
                    <div className="h-1.5 bg-white/20 rounded w-4/5" />
                    <div className="h-1.5 bg-white/20 rounded w-3/5" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div className="bg-white/10 rounded" />
                    <div className="bg-white/10 rounded" />
                  </div>
                </div>

                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      PRO
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-3">
                    <button className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors">
                      <Eye className="h-5 w-5 text-white" />
                    </button>
                    <Link
                      to={`/portfolio-builder?template=${template.id}`}
                      className="p-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full hover:scale-110 transition-transform"
                    >
                      <ArrowRight className="h-5 w-5 text-white" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-white/60">{template.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white/80">{template.rating}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.features.slice(0, 3).map((feature, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-white/10 text-xs rounded-full text-white/70"
                    >
                      {feature}
                    </span>
                  ))}
                  {template.features.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-xs rounded-full text-white/70">
                      +{template.features.length - 3} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                  <span>{template.downloads.toLocaleString()} downloads</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Smartphone className="h-4 w-4" />
                      <span>Responsive</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link
                    to={`/portfolio-builder?template=${template.id}`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-lg font-medium text-center hover:scale-105 transition-transform"
                  >
                    Use Template
                  </Link>
                  
                  <button className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Why Choose Our Templates?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#121625] rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
              <p className="text-white/60">
                Templates are optimized with AI insights for maximum impact and engagement.
              </p>
            </div>

            <div className="p-6 bg-[#121625] rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fully Responsive</h3>
              <p className="text-white/60">
                Perfect display on all devices - desktop, tablet, and mobile.
              </p>
            </div>

            <div className="p-6 bg-[#121625] rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fully Customizable</h3>
              <p className="text-white/60">
                Customize colors, fonts, layouts, and content to match your style.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-24 text-center bg-gradient-to-r from-[#EC4899]/10 to-[#8B5CF6]/10 rounded-3xl p-12 border border-white/10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your Portfolio?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Choose a template and let our AI help you create a stunning portfolio that showcases your skills and lands you interviews.
          </p>
          
          <Link
            to="/portfolio-builder"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#8B5CF6] px-8 py-4 text-lg font-semibold text-white shadow-[0_20px_60px_rgba(236,72,153,0.35)] transition-transform duration-150 hover:translate-y-[-2px]"
          >
            Start Building Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioTemplates;
