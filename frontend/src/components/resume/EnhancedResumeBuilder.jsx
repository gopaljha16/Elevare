import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { useForm, validationRules } from '../../hooks/useForm';
import { FormField, EmailField, PhoneField } from '../ui/FormField';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';
import { useAutoSave } from '../../hooks/useAutoSave';
import AutoSaveIndicator from '../ui/AutoSaveIndicator';
import ErrorBoundary from '../common/ErrorBoundary';

// Enhanced components
import LaTeXPreviewPanel from './LaTeXPreviewPanel';
import AIAssistPanel from './AIAssistPanel';
import TemplateSelector from './TemplateSelector';
import ResumeInputForm from './ResumeInputForm';
import SaveDialog from './SaveDialog';

// Services
import { resumeService } from '../../services/resumeService';
import { latexService } from '../../services/latexService';
import { aiService } from '../../services/aiService';

/**
 * Enhanced Resume Builder - Complete AI-Powered Resume Creation System
 * 
 * Features:
 * - Real-time LaTeX generation and preview
 * - AI-powered content generation and optimization
 * - Multiple professional templates
 * - Auto-save functionality
 * - ATS optimization scoring
 * - Export to PDF
 * - Revision history
 */
const EnhancedResumeBuilder = () => {
  // Core state management
  const [resumeData, setResumeData] = useState({
    id: null,
    title: 'My Resume',
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      portfolio: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    achievements: [],
    projects: [],
    templateType: 'modern'
  });

  // UI state
  const [ui, setUI] = useState({
    currentStep: 0,
    activeSection: 'personal',
    isPreviewVisible: true,
    isAIAssistVisible: false,
    isSaving: false,
    showSaveDialog: false,
    previewMode: 'desktop' // desktop, tablet, mobile
  });

  // LaTeX and preview state
  const [latexContent, setLatexContent] = useState('');
  const [previewHTML, setPreviewHTML] = useState('');
  const [isGeneratingLatex, setIsGeneratingLatex] = useState(false);

  // AI state
  const [aiAnalysis, setAiAnalysis] = useState({
    data: null,
    isLoading: false,
    error: null,
    lastAnalyzed: null
  });

  // Auto-save functionality
  const { 
    saveStatus, 
    lastSaved, 
    isDirty, 
    triggerSave 
  } = useAutoSave(resumeData, resumeService.saveResume, {
    debounceMs: 2000,
    enabled: true
  });

  const { success, error } = useToast();

  // Steps configuration
  const steps = [
    { id: 'personal', title: 'Personal Info', icon: '👤', required: true },
    { id: 'summary', title: 'Summary', icon: '📝', required: false },
    { id: 'experience', title: 'Experience', icon: '💼', required: true },
    { id: 'education', title: 'Education', icon: '🎓', required: true },
    { id: 'skills', title: 'Skills', icon: '⚡', required: true },
    { id: 'projects', title: 'Projects', icon: '🚀', required: false },
    { id: 'certifications', title: 'Certifications', icon: '🏆', required: false },
    { id: 'review', title: 'Review & Export', icon: '👁️', required: false }
  ];

  // Calculate completion progress
  const progress = useMemo(() => {
    const completedSteps = steps.filter(step => {
      switch (step.id) {
        case 'personal':
          return resumeData.personalInfo.firstName && resumeData.personalInfo.email;
        case 'summary':
          return resumeData.summary?.length > 0;
        case 'experience':
          return resumeData.experience?.length > 0;
        case 'education':
          return resumeData.education?.length > 0;
        case 'skills':
          return resumeData.skills?.length > 0;
        case 'projects':
          return resumeData.projects?.length > 0;
        case 'certifications':
          return resumeData.certifications?.length > 0;
        default:
          return true;
      }
    }).length;
    
    return Math.round((completedSteps / steps.length) * 100);
  }, [resumeData, steps]);

  // Generate LaTeX content when resume data changes
  useEffect(() => {
    const generateLatex = async () => {
      if (!resumeData.personalInfo.firstName) return;
      
      setIsGeneratingLatex(true);
      try {
        const latex = await latexService.generateLatex(resumeData, resumeData.templateType);
        setLatexContent(latex);
        
        // Also generate HTML preview
        const html = await latexService.generateHTMLPreview(latex);
        setPreviewHTML(html);
      } catch (err) {
        console.error('LaTeX generation error:', err);
        error('Failed to generate resume preview');
      } finally {
        setIsGeneratingLatex(false);
      }
    };

    const debounceTimer = setTimeout(generateLatex, 500);
    return () => clearTimeout(debounceTimer);
  }, [resumeData, error]);

  // Navigation handlers
  const nextStep = useCallback(() => {
    if (ui.currentStep < steps.length - 1) {
      setUI(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  }, [ui.currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (ui.currentStep > 0) {
      setUI(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [ui.currentStep]);

  const goToStep = useCallback((stepIndex) => {
    setUI(prev => ({ ...prev, currentStep: stepIndex }));
  }, []);

  // Data update handlers
  const updateResumeData = useCallback((updates) => {
    setResumeData(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePersonalInfo = useCallback((updates) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...updates }
    }));
  }, []);

  const updateExperience = useCallback((experience) => {
    setResumeData(prev => ({ ...prev, experience }));
  }, []);

  const updateEducation = useCallback((education) => {
    setResumeData(prev => ({ ...prev, education }));
  }, []);

  const updateSkills = useCallback((skills) => {
    setResumeData(prev => ({ ...prev, skills }));
  }, []);

  const updateProjects = useCallback((projects) => {
    setResumeData(prev => ({ ...prev, projects }));
  }, []);

  // AI assistance handlers
  const toggleAIAssist = useCallback(() => {
    setUI(prev => ({ ...prev, isAIAssistVisible: !prev.isAIAssistVisible }));
  }, []);

  const triggerAIAnalysis = useCallback(async () => {
    setAiAnalysis(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const analysis = await aiService.analyzeResume(resumeData);
      setAiAnalysis({
        data: analysis,
        isLoading: false,
        error: null,
        lastAnalyzed: new Date().toISOString()
      });
      success('AI analysis completed');
    } catch (err) {
      setAiAnalysis(prev => ({
        ...prev,
        isLoading: false,
        error: err.message
      }));
      error('AI analysis failed: ' + err.message);
    }
  }, [resumeData, success, error]);

  // Template change handler
  const handleTemplateChange = useCallback((templateType) => {
    setResumeData(prev => ({ ...prev, templateType }));
  }, []);

  // Save handlers
  const handleSave = useCallback(async () => {
    setUI(prev => ({ ...prev, isSaving: true }));
    
    try {
      const savedResume = await resumeService.saveResume(resumeData);
      setResumeData(savedResume);
      success('Resume saved successfully');
    } catch (err) {
      error('Failed to save resume: ' + err.message);
    } finally {
      setUI(prev => ({ ...prev, isSaving: false }));
    }
  }, [resumeData, success, error]);

  const handleExportPDF = useCallback(async () => {
    try {
      const pdfBlob = await latexService.compileToPDF(latexContent);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      success('Resume exported successfully');
    } catch (err) {
      error('Failed to export PDF: ' + err.message);
    }
  }, [latexContent, resumeData.personalInfo, success, error]);

  // Responsive layout detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="h-screen flex flex-col">
        
        {/* Header */}
        <motion.div 
          className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                AI Resume Builder
              </h1>
              {!isMobile && (
                <Badge variant="glass" className="px-3 py-1">
                  Step {ui.currentStep + 1} of {steps.length}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ErrorBoundary fallback={<div className="text-xs text-gray-500">Auto-save unavailable</div>}>
                <AutoSaveIndicator 
                  status={saveStatus}
                  lastSaved={lastSaved}
                  isDirty={isDirty}
                  showDetails={!isMobile}
                />
              </ErrorBoundary>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleAIAssist}
                className={cn(
                  "hidden md:flex",
                  ui.isAIAssistVisible && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                🤖 AI Assist
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSave}
                disabled={ui.isSaving}
              >
                {ui.isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress: {progress}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {steps[ui.currentStep].title}
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          
          {/* Step Navigation */}
          <div className={cn(
            "flex items-center",
            isMobile ? "justify-center gap-2 overflow-x-auto" : "justify-between"
          )}>
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-0",
                  isMobile ? "flex-shrink-0" : "",
                  index === ui.currentStep 
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                    : index < ui.currentStep 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50" 
                      : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                  index === ui.currentStep 
                    ? "border-blue-500 bg-blue-500 text-white" 
                    : index < ui.currentStep 
                      ? "border-green-500 bg-green-500 text-white" 
                      : "border-gray-300 dark:border-gray-600"
                )}>
                  {index < ui.currentStep ? '✓' : step.icon}
                </div>
                {!isMobile && (
                  <span className="text-xs font-medium">
                    {step.title}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel - Input Form */}
          <div className={cn(
            "flex-1 overflow-auto",
            isMobile ? "w-full" : ui.isPreviewVisible ? "w-1/2" : "w-full"
          )}>
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={ui.currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResumeInputForm
                    currentStep={ui.currentStep}
                    steps={steps}
                    resumeData={resumeData}
                    onUpdatePersonalInfo={updatePersonalInfo}
                    onUpdateExperience={updateExperience}
                    onUpdateEducation={updateEducation}
                    onUpdateSkills={updateSkills}
                    onUpdateProjects={updateProjects}
                    onUpdateResumeData={updateResumeData}
                    aiAnalysis={aiAnalysis}
                    onTriggerAIAnalysis={triggerAIAnalysis}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel - LaTeX Preview */}
          {!isMobile && ui.isPreviewVisible && (
            <div className="w-1/2 border-l border-gray-200 dark:border-gray-700">
              <LaTeXPreviewPanel
                latexContent={latexContent}
                previewHTML={previewHTML}
                isGenerating={isGeneratingLatex}
                templateType={resumeData.templateType}
                onTemplateChange={handleTemplateChange}
                onExportPDF={handleExportPDF}
                previewMode={ui.previewMode}
                onPreviewModeChange={(mode) => setUI(prev => ({ ...prev, previewMode: mode }))}
              />
            </div>
          )}

          {/* AI Assist Panel - Slide-out */}
          <AnimatePresence>
            {ui.isAIAssistVisible && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <AIAssistPanel
                  resumeData={resumeData}
                  aiAnalysis={aiAnalysis}
                  onTriggerAnalysis={triggerAIAnalysis}
                  onUpdateResumeData={updateResumeData}
                  currentSection={steps[ui.currentStep].id}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <motion.div 
          className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-white/20 dark:border-gray-700/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={ui.currentStep === 0}
                className="px-6"
              >
                Previous
              </Button>
              
              {/* Mobile Preview Toggle */}
              {isMobile && (
                <Button
                  variant="outline"
                  onClick={() => setUI(prev => ({ ...prev, isPreviewVisible: !prev.isPreviewVisible }))}
                  className="px-4"
                >
                  {ui.isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {ui.currentStep === steps.length - 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleExportPDF}
                    className="px-6"
                  >
                    Export PDF
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleSave}
                    disabled={ui.isSaving}
                    className="px-6"
                  >
                    {ui.isSaving ? 'Saving...' : 'Save Resume'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="gradient"
                  onClick={nextStep}
                  disabled={ui.currentStep === steps.length - 1}
                  className="px-6"
                >
                  Next Step
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Dialog */}
      <SaveDialog
        isOpen={ui.showSaveDialog}
        onClose={() => setUI(prev => ({ ...prev, showSaveDialog: false }))}
        resumeData={resumeData}
        onSave={handleSave}
      />
    </div>
  );
};

export default EnhancedResumeBuilder;