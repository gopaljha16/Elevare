import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import { 
  Upload, 
  Wand2, 
  Eye, 
  Download, 
  Share2, 
  MessageCircle, 
  Palette, 
  Layout, 
  Sparkles,
  FileText,
  Globe,
  Settings,
  ChevronRight,
  X,
  Send,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import LivePortfolioEditor from '../components/LivePortfolioEditor';

// Portfolio Preview Component
const PortfolioPreview = ({ portfolio }) => {
  if (!portfolio || !portfolio.structure) {
    return (
      <div className="flex items-center justify-center h-full">
        <Globe className="h-12 w-12 text-white/40" />
      </div>
    );
  }

  const { structure } = portfolio;
  
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 text-white text-xs">
      {/* Hero Section Preview */}
      <div className="p-4 text-center border-b border-white/10">
        <h1 className="text-lg font-bold mb-1">{structure.hero?.name || 'Your Name'}</h1>
        <p className="text-sm text-gray-300 mb-2">{structure.hero?.title || 'Professional Title'}</p>
        <p className="text-xs text-gray-400 line-clamp-2">{structure.hero?.summary || 'Professional summary'}</p>
      </div>
      
      {/* Skills Preview */}
      {structure.skills && (
        <div className="p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-1">
            {structure.skills.technical?.slice(0, 6).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-purple-600/30 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Experience Preview */}
      {structure.experience && structure.experience.length > 0 && (
        <div className="p-3 border-b border-white/10">
          <h3 className="text-sm font-semibold mb-2">Experience</h3>
          {structure.experience.slice(0, 2).map((exp, index) => (
            <div key={index} className="mb-2">
              <h4 className="text-xs font-medium">{exp.title}</h4>
              <p className="text-xs text-gray-400">{exp.company}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Projects Preview */}
      {structure.projects && structure.projects.length > 0 && (
        <div className="p-3">
          <h3 className="text-sm font-semibold mb-2">Projects</h3>
          {structure.projects.slice(0, 2).map((project, index) => (
            <div key={index} className="mb-2">
              <h4 className="text-xs font-medium">{project.title}</h4>
              <p className="text-xs text-gray-400 line-clamp-2">{project.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PortfolioBuilder = () => {
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [portfolio, setPortfolio] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const steps = [
    { id: 1, title: 'Upload Resume', icon: Upload, description: 'Upload your resume (PDF/DOCX)' },
    { id: 2, title: 'Choose Template', icon: Layout, description: 'Select a portfolio template' },
    { id: 3, title: 'AI Generation', icon: Wand2, description: 'AI creates your portfolio' },
    { id: 4, title: 'Customize', icon: Palette, description: 'Personalize your portfolio' },
    { id: 5, title: 'Deploy', icon: Globe, description: 'Publish your portfolio' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/portfolio/templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setResumeFile(file);
      parseResume(file);
    }
  };

  const parseResume = async (file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await axios.post('/api/resumes/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('=== RESUME PARSING RESPONSE ===');
      console.log('📊 Response Status:', response.status);
      console.log('✅ Success:', response.data.success);
      console.log('📋 Message:', response.data.message);
      
      if (response.data.warning) {
        console.warn('⚠️ Warning:', response.data.warning);
      }
      
      const data = response.data.data;
      console.log('📈 Data Summary:', {
        hasName: !!data.personalInfo?.name,
        hasEmail: !!data.personalInfo?.email,
        hasPhone: !!data.personalInfo?.phone,
        skillsCount: (data.skills?.technical?.length || 0) + (data.skills?.soft?.length || 0) + (data.skills?.tools?.length || 0),
        experienceCount: data.experience?.length || 0,
        projectsCount: data.projects?.length || 0,
        educationCount: data.education?.length || 0
      });
      
      console.log('📋 Full Parsed Data:', JSON.stringify(data, null, 2));
      
      setResumeData(response.data.data);
      setCurrentStep(2);
    } catch (error) {
      console.error('Resume parsing failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePortfolio = async () => {
    if (!resumeData) return;
    
    console.log('=== GENERATING PORTFOLIO ===');
    console.log('Resume data being sent:', JSON.stringify(resumeData, null, 2));
    
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/portfolio/create', {
        resumeData,
        template: selectedTemplate
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('Portfolio creation response:', response.data);
      setPortfolio(response.data.portfolio);
      setCurrentStep(4);
      
      // Initialize chat with welcome message
      setChatMessages([{
        id: 1,
        type: 'ai',
        content: "Hi! I'm your portfolio assistant. I can help you customize your portfolio, improve content, or answer any questions. What would you like to work on?",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Portfolio generation failed:', error);
      
      // Show error message to user
      if (error.response?.data?.message) {
        alert(`Portfolio generation failed: ${error.response.data.message}`);
      } else {
        alert('Portfolio generation failed. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = chatInput;
    setChatInput('');
    
    // Add typing indicator
    const typingMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: 'Typing...',
      isTyping: true,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, typingMessage]);
    
    try {
      let response;
      
      if (portfolio) {
        // Use portfolio-specific chat if portfolio exists
        response = await axios.post(`/api/portfolio/${portfolio.id}/chat`, {
          message: currentMessage,
          context: { currentStep, portfolio, resumeData }
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        // Use general AI chat for portfolio building guidance
        response = await axios.post('/api/resumes/ai/chat', {
          message: currentMessage,
          context: { currentStep, resumeData, selectedTemplate },
          conversationId: 'portfolio-builder'
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      
      // Remove typing indicator and add actual response
      setChatMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const aiMessage = {
        id: Date.now() + 2,
        type: 'ai',
        content: response.data.response?.response || response.data.data?.response || 'I can help you with your portfolio. What would you like to know?',
        suggestions: response.data.response?.suggestions || response.data.data?.suggestions || [],
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Apply any portfolio updates if suggested
      if (response.data.response?.actions || response.data.data?.actions) {
        const actions = response.data.response?.actions || response.data.data?.actions;
        actions.forEach(action => {
          if (action.type === 'update' && portfolio) {
            setPortfolio(prev => ({
              ...prev,
              structure: {
                ...prev.structure,
                [action.section]: { ...prev.structure[action.section], ...action.changes }
              }
            }));
          }
        });
      }
      
    } catch (error) {
      console.error('Chat failed:', error);
      
      // Remove typing indicator and show error message
      setChatMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const errorMessage = {
        id: Date.now() + 3,
        type: 'ai',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again or let me know how I can help you with your portfolio.',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const deployPortfolio = async (platform = 'netlify') => {
    if (!portfolio) return;
    
    setIsDeploying(true);
    try {
      const response = await axios.post(`/api/portfolio/${portfolio.id}/publish`, {
        deploymentPlatform: platform
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setPortfolio(prev => ({
        ...prev,
        deploymentUrl: response.data.deploymentUrl,
        isPublished: true
      }));
      
      setCurrentStep(5);
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E101A] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-44 -left-40 h-[520px] w-[520px] rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-[#EC4899]/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-[#121625]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-2xl font-bold">
                E
              </div>
              <div>
                <h1 className="text-2xl font-bold">Portfolio Builder</h1>
                <p className="text-sm text-white/60">Create your professional portfolio with AI</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full hover:scale-105 transition-transform"
            >
              <MessageCircle className="h-4 w-4" />
              AI Assistant
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] border-transparent text-white'
                      : 'border-white/20 text-white/40'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <step.icon className="h-5 w-5" />
                </motion.div>
                
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6]' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{steps[currentStep - 1]?.title}</h2>
            <p className="text-white/60">{steps[currentStep - 1]?.description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Upload Resume */}
              {currentStep === 1 && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#121625] rounded-2xl p-8 border border-white/10"
                >
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-[#EC4899]/50 transition-colors cursor-pointer"
                  >
                    <Upload className="h-16 w-16 mx-auto mb-4 text-white/40" />
                    <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
                    <p className="text-white/60 mb-4">
                      Drag and drop your resume here, or click to browse
                    </p>
                    <p className="text-sm text-white/40">Supports PDF and DOCX files</p>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {resumeFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-white/5 rounded-xl flex items-center gap-3"
                    >
                      <FileText className="h-8 w-8 text-[#EC4899]" />
                      <div className="flex-1">
                        <p className="font-medium">{resumeFile.name}</p>
                        <p className="text-sm text-white/60">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Choose Template */}
              {currentStep === 2 && (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#121625] rounded-2xl p-8 border border-white/10"
                >
                  <h3 className="text-2xl font-bold mb-6">Choose Your Template</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map((template) => (
                      <motion.div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'border-[#EC4899] bg-[#EC4899]/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-4 flex items-center justify-center">
                          <Layout className="h-8 w-8 text-white/40" />
                        </div>
                        <h4 className="font-semibold mb-2">{template.name}</h4>
                        <p className="text-sm text-white/60 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {template.features?.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/10 text-xs rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setCurrentStep(3)}
                      disabled={!selectedTemplate}
                      className="px-8 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: AI Generation */}
              {currentStep === 3 && (
                <motion.div
                  key="generation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#121625] rounded-2xl p-8 border border-white/10 text-center"
                >
                  <Sparkles className="h-16 w-16 mx-auto mb-6 text-[#EC4899]" />
                  <h3 className="text-2xl font-bold mb-4">AI Portfolio Generation</h3>
                  <p className="text-white/60 mb-8">
                    Our AI will analyze your resume and create a stunning portfolio tailored to your experience and skills.
                  </p>
                  
                  {!isGenerating ? (
                    <button
                      onClick={generatePortfolio}
                      className="px-8 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                    >
                      <Wand2 className="h-5 w-5" />
                      Generate Portfolio
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-[#EC4899]" />
                      <p className="text-white/60">Creating your portfolio...</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 4: Customize */}
              {currentStep === 4 && portfolio && (
                <motion.div
                  key="customize"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#121625] rounded-2xl border border-white/10 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                      <h3 className="text-2xl font-bold">Customize Your Portfolio</h3>
                      <p className="text-white/60 text-sm mt-1">Click on any text to edit it directly. Changes are saved automatically.</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => window.open(`/portfolio/preview/${portfolio.id}`, '_blank')}
                        className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Full Preview
                      </button>
                      <button
                        onClick={() => setCurrentStep(5)}
                        className="px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        <ChevronRight className="h-4 w-4" />
                        Deploy
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-[600px] overflow-y-auto">
                    <LivePortfolioEditor
                      portfolio={portfolio}
                      onUpdate={(updatedPortfolio) => {
                        setPortfolio(updatedPortfolio);
                        // Auto-save changes
                        if (updatedPortfolio.id) {
                          axios.put(`/api/portfolio/${updatedPortfolio.id}`, {
                            structure: updatedPortfolio.structure
                          }, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                          }).catch(error => console.error('Auto-save failed:', error));
                        }
                      }}
                      className="border-0 rounded-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 5: Deploy */}
              {currentStep === 5 && (
                <motion.div
                  key="deploy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#121625] rounded-2xl p-8 border border-white/10"
                >
                  <h3 className="text-2xl font-bold mb-6">Deploy Your Portfolio</h3>
                  
                  {!portfolio?.isPublished ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['netlify', 'vercel', 'github-pages'].map((platform) => (
                          <button
                            key={platform}
                            onClick={() => deployPortfolio(platform)}
                            disabled={isDeploying}
                            className="p-6 border border-white/20 rounded-xl hover:border-[#EC4899]/50 transition-colors disabled:opacity-50"
                          >
                            <Globe className="h-8 w-8 mx-auto mb-3 text-[#EC4899]" />
                            <h4 className="font-semibold capitalize">{platform}</h4>
                            <p className="text-sm text-white/60 mt-1">Deploy to {platform}</p>
                          </button>
                        ))}
                      </div>
                      
                      {isDeploying && (
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-[#EC4899] mx-auto mb-2" />
                          <p className="text-white/60">Deploying your portfolio...</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Globe className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">Portfolio Deployed Successfully!</h4>
                      <p className="text-white/60 mb-6">Your portfolio is now live and accessible to the world.</p>
                      
                      <div className="flex justify-center gap-4">
                        <a
                          href={portfolio.deploymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Live
                        </a>
                        <button className="px-6 py-3 border border-white/20 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2">
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                        <button className="px-6 py-3 border border-white/20 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Export
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resume Data Preview */}
            {resumeData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#121625] rounded-2xl p-6 border border-white/10"
              >
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#EC4899]" />
                  Resume Data
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-white/60">Name:</span>
                    <p className="font-medium">{resumeData.personalInfo?.name || 'Not found'}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Skills:</span>
                    <p className="font-medium">{resumeData.skills?.technical?.length || 0} technical skills</p>
                  </div>
                  <div>
                    <span className="text-white/60">Experience:</span>
                    <p className="font-medium">{resumeData.experience?.length || 0} positions</p>
                  </div>
                  <div>
                    <span className="text-white/60">Projects:</span>
                    <p className="font-medium">{resumeData.projects?.length || 0} projects</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#121625] rounded-2xl p-6 border border-white/10"
            >
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#EC4899]" />
                Pro Tips
              </h4>
              <div className="space-y-3 text-sm text-white/60">
                <p>• Use a well-formatted resume for better AI parsing</p>
                <p>• Include project links and descriptions</p>
                <p>• Add your social media profiles</p>
                <p>• Use the AI chat to refine your portfolio</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Chat Sidebar */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-[#121625] border-l border-white/10 z-50 flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">AI Assistant</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center text-white/60 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-white/40" />
                  <p className="text-sm mb-2">Hi! I'm your AI portfolio assistant.</p>
                  <p className="text-xs">I can help you:</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <p>• Improve your portfolio content</p>
                    <p>• Suggest better descriptions</p>
                    <p>• Optimize for ATS systems</p>
                    <p>• Answer any questions</p>
                  </div>
                </div>
              )}
              
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white'
                        : message.isTyping
                        ? 'bg-white/5 text-white/60'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs ml-2">AI is typing...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <p className="text-xs text-white/80 mb-2">Quick suggestions:</p>
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => setChatInput(suggestion)}
                                className="block w-full text-left text-xs p-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask me anything about your portfolio..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim()}
                  className="p-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioBuilder;
