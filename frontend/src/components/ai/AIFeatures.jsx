import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, BentoCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FormField } from '../ui/FormField';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';

const AIFeatures = () => {
  const [activeFeature, setActiveFeature] = useState('cover-letter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const { success, error } = useToast();

  const features = [
    {
      id: 'cover-letter',
      title: 'AI Cover Letter Generator',
      description: 'Generate personalized cover letters tailored to specific job postings',
      icon: '📝',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'resume-optimizer',
      title: 'Resume Optimizer',
      description: 'AI-powered resume optimization with ATS scoring and suggestions',
      icon: '🎯',
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 'portfolio-generator',
      title: 'Portfolio Website Generator',
      description: 'Create stunning portfolio websites from your resume data',
      icon: '🌐',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'interview-coach',
      title: 'AI Interview Coach',
      description: 'Get personalized interview coaching and feedback',
      icon: '🤖',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleGenerate = async (type) => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      if (type === 'cover-letter') {
        setGeneratedContent(`Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at Google. With my background in computer science and passion for innovative technology solutions, I am excited about the opportunity to contribute to Google's mission of organizing the world's information.

In my previous role at TechCorp, I successfully:
• Developed scalable microservices handling 1M+ daily requests
• Improved system performance by 40% through optimization
• Led a team of 5 engineers in delivering critical features

My experience with Python, Java, and distributed systems aligns perfectly with Google's technical requirements. I am particularly drawn to Google's commitment to innovation and would love to contribute to projects that impact billions of users worldwide.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's success.

Best regards,
[Your Name]`);
      } else if (type === 'resume-optimization') {
        setGeneratedContent(`Resume Optimization Report:

ATS Score: 87/100 (Excellent)

✅ Strengths:
• Strong technical keywords alignment
• Clear formatting and structure
• Quantified achievements
• Relevant experience highlighted

⚠️ Improvements Needed:
• Add more industry-specific keywords
• Include soft skills section
• Optimize for mobile ATS systems
• Add certifications section

🎯 Recommended Changes:
1. Replace "Worked on" with action verbs like "Developed", "Implemented"
2. Add keywords: "Agile", "CI/CD", "Cloud Computing"
3. Quantify more achievements with percentages and numbers
4. Include relevant certifications and courses

Estimated improvement: +8 ATS points`);
      }
      setIsGenerating(false);
      success('Content generated successfully!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                AI-Powered Features
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Leverage artificial intelligence to enhance your job search
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="glass" className="px-4 py-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" />
                AI Ready
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Feature Selection */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <button
                  onClick={() => setActiveFeature(feature.id)}
                  className={cn(
                    "w-full p-6 rounded-2xl border-2 transition-all duration-300 text-left group",
                    activeFeature === feature.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center mb-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 bg-gradient-to-r",
                      feature.color
                    )}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Feature Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-2">
            {activeFeature === 'cover-letter' && <CoverLetterGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />}
            {activeFeature === 'resume-optimizer' && <ResumeOptimizer onGenerate={handleGenerate} isGenerating={isGenerating} />}
            {activeFeature === 'portfolio-generator' && <PortfolioGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />}
            {activeFeature === 'interview-coach' && <InterviewCoach onGenerate={handleGenerate} isGenerating={isGenerating} />}
          </div>

          {/* Output & Stats */}
          <div className="space-y-6">
            
            {/* Generated Content */}
            {generatedContent && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Generated Content</span>
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                      {generatedContent}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Usage Stats */}
            <BentoCard>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                AI Usage Today
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cover Letters</span>
                  <span className="font-medium">3/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Optimizations</span>
                  <span className="font-medium">2/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Portfolios</span>
                  <span className="font-medium">1/3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Coaching</span>
                  <span className="font-medium">5/15</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Badge variant="success" className="text-xs">
                  Pro Plan Active
                </Badge>
              </div>
            </BentoCard>

            {/* Quick Tips */}
            <BentoCard>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                💡 AI Tips
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Be specific in your job descriptions for better results</li>
                <li>• Review and customize AI-generated content</li>
                <li>• Use keywords from the job posting</li>
                <li>• Always proofread before submitting</li>
              </ul>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cover Letter Generator Component
const CoverLetterGenerator = ({ onGenerate, isGenerating }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-2xl mr-3">📝</span>
          AI Cover Letter Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          label="Company Name"
          name="company"
          value={companyName}
          onChange={(name, value) => setCompanyName(value)}
          onBlur={() => {}}
          placeholder="e.g., Google, Microsoft, Apple"
          variant="glass"
        />
        
        <FormField
          label="Position Title"
          name="position"
          value={position}
          onChange={(name, value) => setPosition(value)}
          onBlur={() => {}}
          placeholder="e.g., Software Engineer, Product Manager"
          variant="glass"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full h-40 p-4 rounded-xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all duration-200 resize-none"
          />
        </div>

        <Button 
          variant="gradient" 
          className="w-full"
          onClick={() => onGenerate('cover-letter')}
          loading={isGenerating}
          disabled={!jobDescription.trim() || !companyName.trim() || !position.trim()}
        >
          {isGenerating ? 'Generating Cover Letter...' : 'Generate Cover Letter'}
        </Button>
      </CardContent>
    </Card>
  );
};

// Resume Optimizer Component
const ResumeOptimizer = ({ onGenerate, isGenerating }) => {
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-2xl mr-3">🎯</span>
          Resume Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Optimize Your Resume
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload your resume or use your existing Elevare resume for AI-powered optimization
          </p>
          <div className="space-y-3">
            <Button variant="gradient" className="w-full" onClick={() => onGenerate('resume-optimization')} loading={isGenerating}>
              {isGenerating ? 'Analyzing Resume...' : 'Analyze Current Resume'}
            </Button>
            <Button variant="outline" className="w-full">
              Upload New Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Portfolio Generator Component
const PortfolioGenerator = ({ onGenerate, isGenerating }) => {
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-2xl mr-3">🌐</span>
          Portfolio Website Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Create Your Portfolio
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate a beautiful portfolio website from your resume data with customizable themes
          </p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {['Modern', 'Classic', 'Creative'].map((theme) => (
              <button
                key={theme}
                className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="w-full h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded mb-2"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {theme}
                </span>
              </button>
            ))}
          </div>
          <Button variant="gradient" className="w-full" onClick={() => onGenerate('portfolio')} loading={isGenerating}>
            {isGenerating ? 'Generating Portfolio...' : 'Generate Portfolio'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Interview Coach Component
const InterviewCoach = ({ onGenerate, isGenerating }) => {
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-2xl mr-3">🤖</span>
          AI Interview Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Personal Interview Coach
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get personalized coaching based on your interview performance and target role
          </p>
          <Button variant="gradient" className="w-full" onClick={() => onGenerate('coaching')} loading={isGenerating}>
            {isGenerating ? 'Analyzing Performance...' : 'Get Coaching Insights'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFeatures;