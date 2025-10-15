import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  SearchIcon, 
  BookOpenIcon, 
  MessageCircleIcon,
  HelpCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BrainIcon,
  TargetIcon,
  TrendingUpIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  StarIcon,
  ZapIcon,
  EyeIcon,
  SettingsIcon
} from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpenIcon },
    { id: 'ai-analysis', name: 'AI Analysis', icon: BrainIcon },
    { id: 'resume-builder', name: 'Resume Builder', icon: FileTextIcon },
    { id: 'live-preview', name: 'Live Preview', icon: EyeIcon },
    { id: 'optimization', name: 'Optimization', icon: TrendingUpIcon },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: SettingsIcon }
  ];

  const helpArticles = [
    {
      id: 1,
      title: 'Understanding AI Resume Analysis',
      category: 'ai-analysis',
      description: 'Learn how our AI analyzes your resume and provides actionable feedback',
      content: `
        <h3>How AI Analysis Works</h3>
        <p>Our AI-powered resume analysis uses Google Gemini to evaluate your resume across multiple dimensions:</p>
        <ul>
          <li><strong>Content Quality:</strong> Evaluates the relevance and impact of your experience descriptions</li>
          <li><strong>ATS Compatibility:</strong> Checks formatting and keyword optimization for Applicant Tracking Systems</li>
          <li><strong>Grammar & Language:</strong> Identifies language improvements and consistency issues</li>
          <li><strong>Completeness:</strong> Assesses whether all important sections are properly filled</li>
          <li><strong>Industry Alignment:</strong> Compares your resume against current industry standards</li>
        </ul>
        
        <h3>Understanding Your Score</h3>
        <p>Your overall score (0-100) is calculated based on:</p>
        <ul>
          <li>Personal Information completeness (20%)</li>
          <li>Experience quality and quantifiable achievements (30%)</li>
          <li>Skills relevance and breadth (20%)</li>
          <li>Education and certifications (15%)</li>
          <li>Projects and additional sections (15%)</li>
        </ul>
        
        <h3>Acting on Feedback</h3>
        <p>The AI provides three types of suggestions:</p>
        <ul>
          <li><strong>High Priority:</strong> Critical improvements that significantly impact your score</li>
          <li><strong>Medium Priority:</strong> Important enhancements for better presentation</li>
          <li><strong>Low Priority:</strong> Minor tweaks for polish and perfection</li>
        </ul>
      `,
      tags: ['ai', 'analysis', 'scoring', 'feedback']
    },
    {
      id: 2,
      title: 'Using Live Preview Effectively',
      category: 'live-preview',
      description: 'Master the live preview feature to see your resume in real-time',
      content: `
        <h3>Live Preview Features</h3>
        <p>The live preview shows your resume exactly as it will appear when exported:</p>
        <ul>
          <li><strong>Real-time Updates:</strong> Changes appear instantly as you type</li>
          <li><strong>Template Switching:</strong> Preview different designs without losing data</li>
          <li><strong>Responsive Views:</strong> See how your resume looks on different screen sizes</li>
          <li><strong>Print Preview:</strong> Ensure proper formatting for PDF export</li>
        </ul>
        
        <h3>Preview Controls</h3>
        <ul>
          <li><strong>Zoom:</strong> Adjust preview size for better visibility</li>
          <li><strong>Template Selector:</strong> Switch between available resume templates</li>
          <li><strong>View Mode:</strong> Toggle between desktop, tablet, and mobile views</li>
          <li><strong>Panel Toggle:</strong> Hide/show the form panel for full preview</li>
        </ul>
        
        <h3>Best Practices</h3>
        <ul>
          <li>Use the preview to check formatting after major changes</li>
          <li>Test different templates to find the best fit for your industry</li>
          <li>Ensure content fits well on a single page when possible</li>
          <li>Check that all sections are properly aligned and readable</li>
        </ul>
      `,
      tags: ['preview', 'templates', 'formatting', 'responsive']
    },
    {
      id: 3,
      title: 'Optimizing for ATS Systems',
      category: 'optimization',
      description: 'Learn how to make your resume ATS-friendly and increase your chances',
      content: `
        <h3>What is ATS?</h3>
        <p>Applicant Tracking Systems (ATS) are software tools used by employers to filter and rank resumes before human review. Making your resume ATS-friendly is crucial for getting noticed.</p>
        
        <h3>ATS Optimization Tips</h3>
        <ul>
          <li><strong>Use Standard Headings:</strong> Stick to common section names like "Experience", "Education", "Skills"</li>
          <li><strong>Include Keywords:</strong> Use relevant industry keywords from job descriptions</li>
          <li><strong>Simple Formatting:</strong> Avoid complex layouts, graphics, and unusual fonts</li>
          <li><strong>Consistent Dates:</strong> Use standard date formats (MM/YYYY)</li>
          <li><strong>Clear Contact Info:</strong> Include phone, email, and LinkedIn profile</li>
        </ul>
        
        <h3>Common ATS Mistakes to Avoid</h3>
        <ul>
          <li>Using images or graphics for important information</li>
          <li>Complex table layouts or multiple columns</li>
          <li>Unusual file formats (stick to PDF or Word)</li>
          <li>Headers and footers with critical information</li>
          <li>Special characters or symbols in section headings</li>
        </ul>
        
        <h3>Testing Your Resume</h3>
        <p>Our AI analysis includes ATS compatibility checks. Pay attention to:</p>
        <ul>
          <li>ATS optimization suggestions in your analysis</li>
          <li>Keyword density recommendations</li>
          <li>Formatting warnings and fixes</li>
        </ul>
      `,
      tags: ['ats', 'optimization', 'keywords', 'formatting']
    },
    {
      id: 4,
      title: 'Writing Impactful Experience Descriptions',
      category: 'resume-builder',
      description: 'Craft compelling experience descriptions that showcase your achievements',
      content: `
        <h3>The STAR Method</h3>
        <p>Structure your experience descriptions using the STAR method:</p>
        <ul>
          <li><strong>Situation:</strong> Context or background</li>
          <li><strong>Task:</strong> What you needed to accomplish</li>
          <li><strong>Action:</strong> What you did</li>
          <li><strong>Result:</strong> The outcome or impact</li>
        </ul>
        
        <h3>Quantify Your Achievements</h3>
        <p>Use numbers and metrics whenever possible:</p>
        <ul>
          <li>"Increased sales by 25%" instead of "Improved sales"</li>
          <li>"Managed team of 8 developers" instead of "Led a team"</li>
          <li>"Reduced processing time by 40%" instead of "Made processes faster"</li>
          <li>"Generated $2M in revenue" instead of "Contributed to company success"</li>
        </ul>
        
        <h3>Action Verbs</h3>
        <p>Start each bullet point with a strong action verb:</p>
        <ul>
          <li><strong>Leadership:</strong> Led, Managed, Directed, Coordinated, Supervised</li>
          <li><strong>Achievement:</strong> Achieved, Exceeded, Delivered, Accomplished, Attained</li>
          <li><strong>Improvement:</strong> Optimized, Enhanced, Streamlined, Upgraded, Transformed</li>
          <li><strong>Creation:</strong> Developed, Created, Built, Designed, Implemented</li>
        </ul>
        
        <h3>Industry-Specific Tips</h3>
        <ul>
          <li><strong>Tech:</strong> Mention specific technologies, frameworks, and methodologies</li>
          <li><strong>Sales:</strong> Include quotas, conversion rates, and revenue figures</li>
          <li><strong>Marketing:</strong> Highlight campaign results, engagement metrics, and ROI</li>
          <li><strong>Management:</strong> Focus on team size, budget responsibility, and strategic outcomes</li>
        </ul>
      `,
      tags: ['experience', 'achievements', 'writing', 'star-method']
    }
  ];

  const faqs = [
    {
      id: 1,
      question: 'How accurate is the AI analysis?',
      answer: 'Our AI analysis is powered by Google Gemini and trained on thousands of successful resumes. While highly accurate, it should be used as guidance alongside your professional judgment. The AI excels at identifying formatting issues, missing keywords, and structural improvements.',
      category: 'ai-analysis'
    },
    {
      id: 2,
      question: 'Why is my AI analysis taking a long time?',
      answer: 'AI analysis typically takes 2-5 seconds. Delays can occur due to high demand or temporary service issues. If analysis takes longer than 30 seconds, try refreshing the page or contact support.',
      category: 'troubleshooting'
    },
    {
      id: 3,
      question: 'Can I use the resume builder offline?',
      answer: 'The resume builder requires an internet connection for AI analysis and cloud saving. However, your work is automatically saved as you type, so you won\'t lose progress if your connection is temporarily interrupted.',
      category: 'resume-builder'
    },
    {
      id: 4,
      question: 'How do I improve my ATS score?',
      answer: 'Focus on the high-priority suggestions from your AI analysis. Common improvements include adding relevant keywords, using standard section headings, including quantifiable achievements, and ensuring all contact information is complete.',
      category: 'optimization'
    },
    {
      id: 5,
      question: 'What file formats can I export?',
      answer: 'You can export your resume as PDF (recommended for applications) or Word document. PDF preserves formatting across all devices and is preferred by most employers.',
      category: 'resume-builder'
    },
    {
      id: 6,
      question: 'How often should I run AI analysis?',
      answer: 'Run AI analysis after making significant changes to your resume content. The system automatically triggers analysis when you make substantial edits, but you can also manually request analysis at any time.',
      category: 'ai-analysis'
    },
    {
      id: 7,
      question: 'Why doesn\'t the live preview match my exported PDF?',
      answer: 'Minor differences can occur due to browser rendering vs. PDF generation. If you notice significant discrepancies, try refreshing the page or switching templates. Contact support if issues persist.',
      category: 'live-preview'
    },
    {
      id: 8,
      question: 'Can I customize the resume templates?',
      answer: 'Currently, you can choose from our pre-designed templates but cannot modify their styling. We\'re working on adding customization options in future updates.',
      category: 'live-preview'
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Help Center
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get the most out of your resume builder with AI-powered insights and optimization tips
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Quick Start Guide */}
      {selectedCategory === 'all' && searchQuery === '' && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <ZapIcon className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">Build Your Resume</h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Fill out all sections with your information. Use the live preview to see changes in real-time.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">Get AI Analysis</h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Run AI analysis to get personalized feedback and optimization suggestions.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">Optimize & Export</h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Implement suggestions to improve your score, then export as PDF for applications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Articles */}
      {filteredArticles.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Help Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      {categories.find(c => c.id === article.category)?.name}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {article.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      {filteredFAQs.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    {expandedFAQ === faq.id ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedFAQ === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredArticles.length === 0 && filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <HelpCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try adjusting your search terms or selecting a different category.
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            variant="outline"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Contact Support */}
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="text-center py-8">
          <MessageCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Still need help?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Button variant="primary">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpCenter;