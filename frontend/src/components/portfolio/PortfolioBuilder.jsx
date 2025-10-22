import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';
import ChatInterface from '../chat/ChatInterface';
import PortfolioTemplates from '../templates/PortfolioTemplates';
import {
  Upload,
  FileText,
  Wand2,
  Eye,
  Download,
  Share2,
  Palette,
  Code,
  Globe,
  Sparkles,
  Zap,
  Rocket,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Github,
  Monitor,
  Smartphone,
  Tablet,
  MessageCircle
} from 'lucide-react';

const PortfolioBuilder = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [portfolioData, setPortfolioData] = useState({
    personal: {},
    summary: '',
    experience: [],
    skills: [],
    projects: [],
    education: [],
    theme: 'modern'
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState('idle');
  const [deploymentLinks, setDeploymentLinks] = useState({});
  const [previewMode, setPreviewMode] = useState('desktop');
  const [currentApiKey, setCurrentApiKey] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
  const { success, error } = useToast();
  const codeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Multiple Gemini API keys for rotation
  const apiKeys = [
    'AIzaSyBH8vQKxJ2mF9pL3nR7sT4uV6wX8yZ0aB2',
    'AIzaSyC9dE5fG7hI1jK3lM5nO7pQ9rS1tU3vW5x',
    'AIzaSyD1eF7gH9iJ3kL5mN7oP9qR1sT3uV5wX7z',
    'AIzaSyE3fG9hI1jK5lM7nO9pQ1rS3tU5vW7xY9a'
  ];

  // Rotate API key automatically
  const rotateApiKey = () => {
    setCurrentApiKey((prev) => (prev + 1) % apiKeys.length);
  };

  // Typing animation effect
  const typeWriter = (text, callback) => {
    let i = 0;
    setTypingText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypingText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        if (callback) callback();
      }
    }, 30);
    return timer;
  };

  // AI Code Generation with animated typing
  const generatePortfolioWithAI = async (inputData, type = 'prompt') => {
    setIsGenerating(true);
    setShowCode(true);
    
    try {
      // Start typing animation
      const loadingMessages = [
        '🤖 Initializing AI Portfolio Generator...',
        '📄 Analyzing your information...',
        '🎨 Designing your portfolio layout...',
        '💻 Writing HTML structure...',
        '🎯 Adding CSS styling...',
        '⚡ Implementing JavaScript interactions...',
        '🚀 Optimizing for performance...',
        '✨ Adding final touches...'
      ];

      // Show typing animation
      for (let i = 0; i < loadingMessages.length; i++) {
        setTypingText(loadingMessages[i]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Make API call to generate portfolio from prompt
      const response = await fetch('/api/portfolio/generate-from-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputData,
          type,
          theme: selectedTemplate,
          preferences: {
            animations: true,
            responsive: true,
            darkMode: true,
            seo: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate portfolio');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update portfolio data and generated code
        setPortfolioData(result.portfolioData);
        setGeneratedCode(result.htmlCode);
        setTypingText('🎉 Portfolio generated successfully!');
        setActiveTab('preview');
        success('Portfolio generated successfully!');
      } else {
        throw new Error(result.message || 'Failed to generate portfolio');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      error(err.message || 'Failed to generate portfolio');
      setTypingText('❌ Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      error('File size must be less than 10MB');
      return;
    }

    setIsGenerating(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Show upload progress
      success('Uploading and parsing resume...');
      
      const response = await fetch('/api/portfolio/parse-resume', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to parse resume');

      const result = await response.json();
      console.log('Resume parsing result:', result);
      
      if (result.success && result.data) {
        console.log('Received parsed data:', result.data);
        
        // Update portfolio data immediately with parsed data
        const updatedData = { ...result.data, theme: selectedTemplate };
        setPortfolioData(updatedData);
        
        success(`Resume parsed successfully! Extracted: ${result.data.personal?.name || 'data'}`);
        
        // Generate portfolio HTML with the parsed data
        await generatePortfolioFromData(updatedData);
        
        // Switch to preview tab to show results
        setActiveTab('preview');
      } else {
        throw new Error(result.error?.message || 'Failed to parse resume');
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      error(`Failed to parse resume: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate portfolio from parsed data
  const generatePortfolioFromData = async (parsedData) => {
    try {
      setIsGenerating(true);
      console.log('Generating portfolio from data:', parsedData);
      
      const response = await fetch('/api/portfolio/generate-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioData: parsedData,
          theme: selectedTemplate
        })
      });

      if (!response.ok) throw new Error('Failed to generate portfolio HTML');

      const result = await response.json();
      console.log('Portfolio generation result:', result);
      
      if (result.success && result.htmlCode) {
        setGeneratedCode(result.htmlCode);
        success(`Portfolio generated with ${parsedData.personal?.name || 'your data'}!`);
      } else {
        throw new Error('Failed to generate HTML');
      }
    } catch (err) {
      console.error('Portfolio generation error:', err);
      error(`Failed to generate portfolio: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle prompt-based generation
  const handlePromptGeneration = async (prompt) => {
    if (!prompt.trim()) {
      error('Please enter a description');
      return;
    }

    await generatePortfolioWithAI({ prompt }, 'prompt');
  };

  // Deploy to platform
  const deployToplatform = async (platform) => {
    if (!generatedCode) {
      error('Please generate a portfolio first');
      return;
    }

    setDeploymentStatus('deploying');
    
    try {
      const response = await fetch('/api/portfolio/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlCode: generatedCode,
          portfolioData,
          platform,
          projectName: `portfolio-${Date.now()}`
        })
      });

      if (!response.ok) throw new Error('Deployment failed');

      const result = await response.json();
      
      setDeploymentLinks(prev => ({
        ...prev,
        [platform]: {
          url: result.url,
          instructions: result.instructions,
          files: result.files
        }
      }));

      setDeploymentStatus('success');
      success(`Portfolio prepared for ${platform} deployment!`);
      
      // Show deployment instructions
      alert(`🚀 Deployment Ready!\n\n${result.instructions}`);
      
    } catch (err) {
      setDeploymentStatus('error');
      error(`Failed to prepare deployment for ${platform}: ${err.message}`);
    }
  };

  // Download deployment files
  const downloadDeploymentFiles = async (platform) => {
    try {
      const response = await fetch('/api/portfolio/download-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlCode: generatedCode,
          portfolioData,
          platform,
          projectName: `portfolio-${Date.now()}`
        })
      });

      if (!response.ok) throw new Error('Failed to create deployment files');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${platform}-deployment.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      success(`Deployment files downloaded for ${platform}!`);
    } catch (err) {
      error(`Failed to download deployment files: ${err.message}`);
    }
  };

  // Copy code to clipboard
  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    success('Code copied to clipboard!');
  };

  // Download portfolio as ZIP
  const downloadPortfolio = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedCode], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'portfolio.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    success('Portfolio downloaded!');
  };

  // Handle portfolio updates from chat
  const handlePortfolioUpdate = (updatedData) => {
    setPortfolioData(updatedData);
    
    // Regenerate portfolio with updated data
    if (updatedData.personal?.name || updatedData.summary) {
      generatePortfolioFromData(updatedData);
    }
    
    success('Portfolio updated from AI suggestions!');
  };

  // Handle suggestion application from chat
  const handleSuggestionApply = async (action) => {
    console.log('Applying suggestion:', action);
    
    try {
      let updatedData = { ...portfolioData };
      
      switch (action.type) {
        case 'update_summary':
          updatedData.summary = action.data;
          break;
          
        case 'update_skills':
          updatedData.skills = { ...updatedData.skills, ...action.data };
          break;
          
        case 'add_section':
          updatedData[action.data.type] = action.data.content;
          break;
          
        case 'update_projects':
          if (action.data.improvements) {
            // Apply project improvements
            updatedData.projects = updatedData.projects.map(project => ({
              ...project,
              description: project.description + ' ' + action.data.improvements[0]
            }));
          }
          break;
          
        default:
          console.log('Unknown action type:', action.type);
          return;
      }
      
      // Update state
      setPortfolioData(updatedData);
      
      // Regenerate portfolio
      await generatePortfolioFromData(updatedData);
      
      success('AI suggestion applied successfully!');
      
    } catch (error) {
      console.error('Error applying suggestion:', error);
      error('Failed to apply suggestion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
      <div className={cn("max-w-7xl mx-auto transition-all duration-300", isChatOpen ? "mr-96" : "")}>
        {/* AI Chat Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            AI Portfolio Builder
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Create stunning, professional portfolios in seconds with AI-powered generation
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="gradient" className="px-3 py-1">
              <Sparkles className="w-4 h-4 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Zap className="w-4 h-4 mr-1" />
              Template: {selectedTemplate}
            </Badge>
            {portfolioData.personal?.name && (
              <Badge variant="success" className="px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                Data Loaded
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Resume
            </TabsTrigger>
            <TabsTrigger value="prompt" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              AI Prompt
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="deploy" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Deploy
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardContent className="p-6">
                  <PortfolioTemplates
                    onSelectTemplate={(templateId) => {
                      setSelectedTemplate(templateId);
                      setPortfolioData(prev => ({ ...prev, theme: templateId }));
                      
                      // If we have portfolio data, regenerate with new template
                      if (portfolioData.personal?.name || portfolioData.summary) {
                        generatePortfolioFromData({ ...portfolioData, theme: templateId });
                      }
                      
                      success(`Template changed to ${templateId}`);
                    }}
                    selectedTemplate={selectedTemplate}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Upload Resume Tab */}
          <TabsContent value="upload">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Upload Your Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Drop your resume here or click to browse
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Supports PDF, DOCX files up to 10MB
                      </p>
                      <Button variant="outline">
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Auto-Extract</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          AI extracts all relevant information
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Wand2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">AI Generate</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Creates beautiful portfolio instantly
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Rocket className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">One-Click Deploy</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Deploy to Vercel, Netlify, or Render
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* AI Prompt Tab */}
          <TabsContent value="prompt">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Describe Yourself - AI Will Build Your Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PromptBuilder onGenerate={handlePromptGeneration} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6">
                {/* Preview Controls */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant={previewMode === 'desktop' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode('desktop')}
                          >
                            <Monitor className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={previewMode === 'tablet' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode('tablet')}
                          >
                            <Tablet className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={previewMode === 'mobile' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreviewMode('mobile')}
                          >
                            <Smartphone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={copyCode}>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Code
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadPortfolio}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Portfolio Preview */}
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                    <CardHeader>
                      <CardTitle>Live Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={cn(
                        "border rounded-lg overflow-hidden bg-white",
                        previewMode === 'mobile' && "max-w-sm mx-auto",
                        previewMode === 'tablet' && "max-w-2xl mx-auto",
                        previewMode === 'desktop' && "w-full"
                      )}>
                        {generatedCode ? (
                          <iframe
                            srcDoc={generatedCode}
                            className="w-full h-96 border-0"
                            title="Portfolio Preview"
                          />
                        ) : portfolioData.personal?.name ? (
                          <div className="h-96 p-4 overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">Extracted Portfolio Data:</h3>
                            <div className="space-y-3 text-sm">
                              <div><strong>Name:</strong> {portfolioData.personal.name}</div>
                              <div><strong>Email:</strong> {portfolioData.personal.email}</div>
                              <div><strong>Phone:</strong> {portfolioData.personal.phone}</div>
                              <div><strong>Summary:</strong> {portfolioData.summary}</div>
                              <div><strong>Skills:</strong> {portfolioData.skills?.technical?.join(', ')}</div>
                              <div><strong>Experience:</strong> {portfolioData.experience?.length} entries</div>
                              <div><strong>Projects:</strong> {portfolioData.projects?.length} entries</div>
                            </div>
                            <Button 
                              onClick={() => generatePortfolioFromData(portfolioData)}
                              className="mt-4"
                            >
                              Generate Portfolio HTML
                            </Button>
                          </div>
                        ) : (
                          <div className="h-96 flex items-center justify-center text-gray-500">
                            Upload a resume or use AI prompt to generate portfolio
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Code View */}
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Generated Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {isGenerating ? (
                          <div className="h-96 bg-gray-900 rounded-lg p-4 overflow-hidden">
                            <div className="text-green-400 font-mono text-sm">
                              <div className="flex items-center gap-2 mb-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                AI Portfolio Generator
                              </div>
                              <div className="whitespace-pre-wrap">
                                {typingText}
                                <span className="animate-pulse">|</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <pre className="h-96 bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono">
                            {generatedCode || '// Your generated portfolio code will appear here...'}
                          </pre>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Deploy Tab */}
          <TabsContent value="deploy">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <DeploymentPanel
                generatedCode={generatedCode}
                portfolioData={portfolioData}
                deploymentStatus={deploymentStatus}
                deploymentLinks={deploymentLinks}
                onDeploy={deployToplatform}
                onDownload={downloadDeploymentFiles}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatInterface
            portfolioData={portfolioData}
            onPortfolioUpdate={handlePortfolioUpdate}
            onSuggestionApply={handleSuggestionApply}
            isMinimized={false}
            onToggleMinimize={() => setIsChatOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Prompt Builder Component
const PromptBuilder = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const examplePrompts = [
    "I'm a Full-Stack MERN developer with 3 years of experience building scalable web applications. Skilled in React, Node.js, MongoDB, and AWS. Built 10+ projects including e-commerce platforms and SaaS tools.",
    "Frontend React developer specializing in modern UI/UX design. 2 years experience with TypeScript, Next.js, and Tailwind CSS. Passionate about creating beautiful, accessible user interfaces.",
    "Backend Python developer with expertise in Django, FastAPI, and PostgreSQL. 4 years experience building APIs and microservices. Strong background in data engineering and machine learning.",
    "DevOps engineer with 5 years experience in AWS, Docker, and Kubernetes. Specialized in CI/CD pipelines, infrastructure automation, and monitoring solutions."
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    onGenerate(prompt);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Describe your professional background
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell us about your role, experience, skills, and achievements..."
          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500">
            {prompt.length}/500 characters
          </span>
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate Portfolio
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Example prompts to get you started:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              className="p-3 text-left text-sm bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {example.substring(0, 100)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Deployment Panel Component
const DeploymentPanel = ({ generatedCode, portfolioData, deploymentStatus, deploymentLinks, onDeploy, onDownload }) => {
  const platforms = [
    {
      name: 'Vercel',
      icon: '▲',
      color: 'bg-black text-white',
      description: 'Deploy to Vercel with automatic HTTPS and global CDN',
      features: ['Automatic HTTPS', 'Global CDN', 'Instant deployments']
    },
    {
      name: 'Netlify',
      icon: '🌐',
      color: 'bg-teal-500 text-white',
      description: 'Deploy to Netlify with form handling and edge functions',
      features: ['Form handling', 'Edge functions', 'Branch previews']
    },
    {
      name: 'Render',
      icon: '🚀',
      color: 'bg-purple-500 text-white',
      description: 'Deploy to Render with automatic SSL and DDoS protection',
      features: ['Automatic SSL', 'DDoS protection', 'Health checks']
    }
  ];

  return (
    <div className="space-y-6">
      {!generatedCode ? (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Portfolio Generated
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please generate a portfolio first before deploying
            </p>
            <Button variant="outline" onClick={() => window.location.hash = '#upload'}>
              Go Back to Generate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Card key={platform.name} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg", platform.color)}>
                      {platform.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {platform.description}
                  </p>
                  <ul className="space-y-1 mb-4">
                    {platform.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {deploymentLinks[platform.name.toLowerCase()] ? (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const deployment = deploymentLinks[platform.name.toLowerCase()];
                          if (deployment.instructions) {
                            alert(`🚀 Deployment Instructions:\n\n${deployment.instructions}`);
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Instructions
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => onDownload(platform.name.toLowerCase())}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download Files
                      </Button>
                      <div className="text-xs text-green-600 dark:text-green-400 text-center">
                        ✅ Ready for deployment
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => onDeploy(platform.name.toLowerCase())}
                      disabled={deploymentStatus === 'deploying'}
                      className="w-full"
                    >
                      {deploymentStatus === 'deploying' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-1" />
                          Prepare for {platform.name}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {Object.keys(deploymentLinks).length > 0 && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Your Live Portfolios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(deploymentLinks).map(([platform, url]) => (
                    <div key={platform} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {platform}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {url}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(url)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PortfolioBuilder;