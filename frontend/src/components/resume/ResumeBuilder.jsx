import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, BentoCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { useForm, validationRules } from '../../hooks/useForm';
import { FormField, EmailField, PhoneField } from '../ui/FormField';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';
import { ResumeBuilderProvider, useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import LiveResumePreview from './LiveResumePreview';
import AIInsightsPanel from './AIInsightsPanel';
import AutoSaveIndicator, { AutoSaveStatus } from '../ui/AutoSaveIndicator';
import ErrorBoundary from '../common/ErrorBoundary';
import { 
  setCurrentStep, 
  setActiveSection,
  toggleAIAnalysisVisibility,
  toggleSidebar
} from '../../store/slices/resumeBuilderSlice';

// Main ResumeBuilder wrapper with provider
const ResumeBuilder = () => {
  return (
    <ResumeBuilderProvider>
      <ResumeBuilderLayout />
    </ResumeBuilderProvider>
  );
};

// Enhanced ResumeBuilder layout component
const ResumeBuilderLayout = () => {
  const { 
    resumeData, 
    ui, 
    analysis, 
    performance, 
    dispatch 
  } = useResumeBuilder();
  
  const { success, error } = useToast();
  const [isMobile, setIsMobile] = useState(false);

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: '👤' },
    { id: 'experience', title: 'Experience', icon: '💼' },
    { id: 'education', title: 'Education', icon: '🎓' },
    { id: 'skills', title: 'Skills', icon: '⚡' },
    { id: 'projects', title: 'Projects', icon: '🚀' },
    { id: 'review', title: 'Review', icon: '👁️' }
  ];

  const progress = ((ui.currentStep + 1) / steps.length) * 100;

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextStep = () => {
    if (ui.currentStep < steps.length - 1) {
      dispatch(setCurrentStep(ui.currentStep + 1));
    }
  };

  const prevStep = () => {
    if (ui.currentStep > 0) {
      dispatch(setCurrentStep(ui.currentStep - 1));
    }
  };

  const handleStepClick = (stepIndex) => {
    dispatch(setCurrentStep(stepIndex));
  };

  const toggleAIPanel = () => {
    dispatch(toggleAIAnalysisVisibility());
  };

  const toggleSidebarPanel = () => {
    dispatch(toggleSidebar());
  };

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
                Resume Builder
              </h1>
              {!isMobile && (
                <Badge variant="glass" className="px-3 py-1">
                  Step {ui.currentStep + 1} of {steps.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ErrorBoundary fallback={<div className="text-xs text-gray-500">Auto-save unavailable</div>}>
                <AutoSaveIndicator showDetails={false} />
              </ErrorBoundary>
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleAIPanel}
                className={cn(
                  "hidden md:flex",
                  ui.isAIAnalysisVisible && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                AI Analysis
              </Button>
              <Button variant="outline" size="sm">
                Save Draft
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar - Mobile/Desktop Responsive */}
        <motion.div 
          className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress: {Math.round(progress)}%
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
                onClick={() => handleStepClick(index)}
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

        {/* Main Content - Responsive Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Form Section */}
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
                  {ui.currentStep === 0 && <PersonalInfoStep />}
                  {ui.currentStep === 1 && <ExperienceStep />}
                  {ui.currentStep === 2 && <EducationStep />}
                  {ui.currentStep === 3 && <SkillsStep />}
                  {ui.currentStep === 4 && <ProjectsStep />}
                  {ui.currentStep === 5 && <ReviewStep />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Live Preview Panel - Desktop Only */}
          {!isMobile && ui.isPreviewVisible && (
            <div className="w-1/2 border-l border-gray-200 dark:border-gray-700">
              <LiveResumePreview />
            </div>
          )}

          {/* AI Analysis Panel - Slide-out */}
          <AnimatePresence>
            {ui.isAIAnalysisVisible && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <AIInsightsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons - Fixed Bottom */}
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
              
              {/* Auto-save status */}
              <AutoSaveStatus className="hidden sm:block" />
            </div>
            
            {/* Mobile Preview Toggle */}
            {isMobile && (
              <Button
                variant="outline"
                onClick={() => {/* TODO: Implement mobile preview modal */}}
                className="px-4"
              >
                Preview
              </Button>
            )}
            
            <Button
              variant="gradient"
              onClick={nextStep}
              disabled={ui.currentStep === steps.length - 1}
              className="px-6"
            >
              {ui.currentStep === steps.length - 1 ? 'Complete Resume' : 'Next Step'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Step Components
const PersonalInfoStep = () => {
  const { resumeData, updatePersonalInfo } = useResumeBuilder();
  const { personalInfo } = resumeData;
  
  const { values, errors, touched, handleChange, handleBlur } = useForm(
    personalInfo || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      portfolio: ''
    },
    {
      firstName: [validationRules.required()],
      lastName: [validationRules.required()],
      email: [validationRules.required(), validationRules.email()],
      phone: [validationRules.required()],
      location: [validationRules.required()]
    }
  );

  // Update resume data when form values change
  React.useEffect(() => {
    updatePersonalInfo(values);
  }, [values, updatePersonalInfo]);

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">👤</span>
          <span>Personal Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="First Name"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.firstName}
            touched={touched.firstName}
            required
            variant="glass"
            showSaveStatus={true}
            debounceMs={300}
          />
          <FormField
            label="Last Name"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.lastName}
            touched={touched.lastName}
            required
            variant="glass"
            showSaveStatus={true}
            debounceMs={300}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmailField
            label="Email Address"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            required
            variant="glass"
            showSaveStatus={true}
            debounceMs={300}
          />
          <PhoneField
            label="Phone Number"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            touched={touched.phone}
            required
            variant="glass"
            showSaveStatus={true}
            debounceMs={300}
          />
        </div>

        <FormField
          label="Location"
          name="location"
          placeholder="City, State, Country"
          value={values.location}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.location}
          touched={touched.location}
          required
          variant="glass"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Website"
            name="website"
            placeholder="https://yourwebsite.com"
            value={values.website}
            onChange={handleChange}
            onBlur={handleBlur}
            variant="glass"
          />
          <FormField
            label="LinkedIn"
            name="linkedin"
            placeholder="https://linkedin.com/in/yourprofile"
            value={values.linkedin}
            onChange={handleChange}
            onBlur={handleBlur}
            variant="glass"
          />
        </div>

        <FormField
          label="Portfolio"
          name="portfolio"
          placeholder="https://yourportfolio.com"
          value={values.portfolio}
          onChange={handleChange}
          onBlur={handleBlur}
          variant="glass"
        />
      </CardContent>
    </Card>
  );
};

const ExperienceStep = () => {
  const { resumeData, updateExperience } = useResumeBuilder();
  const [experiences, setExperiences] = useState(resumeData.experience || []);

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    const updated = [...experiences, newExperience];
    setExperiences(updated);
    updateExperience(updated);
  };

  const removeExperience = (id) => {
    const updated = experiences.filter(exp => exp.id !== id);
    setExperiences(updated);
    updateExperience(updated);
  };

  const updateExperienceItem = (id, field, value) => {
    const updated = experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    setExperiences(updated);
    updateExperience(updated);
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💼</span>
            <span>Work Experience</span>
          </div>
          <Button onClick={addExperience} variant="outline" size="sm">
            Add Experience
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Add Your Work Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Include your professional experience to showcase your career journey
            </p>
            <Button onClick={addExperience} variant="gradient">
              Add First Experience
            </Button>
          </div>
        ) : (
          experiences.map((exp, index) => (
            <div key={exp.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Experience #{index + 1}
                </h4>
                <Button 
                  onClick={() => removeExperience(exp.id)}
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Company"
                  value={exp.company}
                  onChange={(e) => updateExperienceItem(exp.id, 'company', e.target.value)}
                  placeholder="Company Name"
                  variant="glass"
                />
                <FormField
                  label="Position"
                  value={exp.position}
                  onChange={(e) => updateExperienceItem(exp.id, 'position', e.target.value)}
                  placeholder="Job Title"
                  variant="glass"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Start Date"
                  type="date"
                  value={exp.startDate}
                  onChange={(e) => updateExperienceItem(exp.id, 'startDate', e.target.value)}
                  variant="glass"
                />
                <FormField
                  label="End Date"
                  type="date"
                  value={exp.endDate}
                  onChange={(e) => updateExperienceItem(exp.id, 'endDate', e.target.value)}
                  disabled={exp.current}
                  variant="glass"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => updateExperienceItem(exp.id, 'current', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I currently work here
                  </span>
                </label>
              </div>
              
              <FormField
                label="Description"
                value={exp.description}
                onChange={(e) => updateExperienceItem(exp.id, 'description', e.target.value)}
                placeholder="Describe your role and responsibilities..."
                variant="glass"
                multiline
                rows={3}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const EducationStep = () => {
  const { resumeData, updateEducation } = useResumeBuilder();
  const [education, setEducation] = useState(resumeData.education || []);

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      institution: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: ''
    };
    const updated = [...education, newEducation];
    setEducation(updated);
    updateEducation(updated);
  };

  const removeEducation = (id) => {
    const updated = education.filter(edu => edu.id !== id);
    setEducation(updated);
    updateEducation(updated);
  };

  const updateEducationItem = (id, field, value) => {
    const updated = education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEducation(updated);
    updateEducation(updated);
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎓</span>
            <span>Education</span>
          </div>
          <Button onClick={addEducation} variant="outline" size="sm">
            Add Education
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Add Your Education
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Include your educational background and qualifications
            </p>
            <Button onClick={addEducation} variant="gradient">
              Add Education
            </Button>
          </div>
        ) : (
          education.map((edu, index) => (
            <div key={edu.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Education #{index + 1}
                </h4>
                <Button 
                  onClick={() => removeEducation(edu.id)}
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Institution"
                  value={edu.institution}
                  onChange={(e) => updateEducationItem(edu.id, 'institution', e.target.value)}
                  placeholder="University/School Name"
                  variant="glass"
                />
                <FormField
                  label="Degree"
                  value={edu.degree}
                  onChange={(e) => updateEducationItem(edu.id, 'degree', e.target.value)}
                  placeholder="Bachelor's, Master's, etc."
                  variant="glass"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Field of Study"
                  value={edu.field}
                  onChange={(e) => updateEducationItem(edu.id, 'field', e.target.value)}
                  placeholder="Computer Science, Business, etc."
                  variant="glass"
                />
                <FormField
                  label="Graduation Date"
                  type="date"
                  value={edu.graduationDate}
                  onChange={(e) => updateEducationItem(edu.id, 'graduationDate', e.target.value)}
                  variant="glass"
                />
              </div>
              
              <FormField
                label="GPA (Optional)"
                value={edu.gpa}
                onChange={(e) => updateEducationItem(edu.id, 'gpa', e.target.value)}
                placeholder="3.8/4.0"
                variant="glass"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const SkillsStep = () => {
  const { resumeData, updateSkills } = useResumeBuilder();
  const [skills, setSkills] = useState(resumeData.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      updateSkills(updated);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const updated = skills.filter(skill => skill !== skillToRemove);
    setSkills(updated);
    updateSkills(updated);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const suggestedSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker',
    'TypeScript', 'MongoDB', 'Express.js', 'HTML/CSS', 'REST APIs', 'GraphQL',
    'Project Management', 'Team Leadership', 'Communication', 'Problem Solving'
  ];

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">⚡</span>
          <span>Skills</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Skill Input */}
        <div className="flex gap-2">
          <FormField
            label="Add Skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a skill..."
            variant="glass"
            className="flex-1"
          />
          <Button 
            onClick={addSkill}
            disabled={!newSkill.trim()}
            variant="gradient"
            className="mt-6"
          >
            Add
          </Button>
        </div>

        {/* Current Skills */}
        {skills.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Your Skills ({skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} ✕
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Skills */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Suggested Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills
              .filter(skill => !skills.includes(skill))
              .map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-3 py-1 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => {
                    const updated = [...skills, skill];
                    setSkills(updated);
                    updateSkills(updated);
                  }}
                >
                  {skill} +
                </Badge>
              ))}
          </div>
        </div>

        {skills.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Add Your Skills
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Include both technical and soft skills relevant to your career
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProjectsStep = () => {
  const { resumeData, updateProjects } = useResumeBuilder();
  const [projects, setProjects] = useState(resumeData.projects || []);

  const addProject = () => {
    const newProject = {
      id: Date.now(),
      name: '',
      description: '',
      technologies: [],
      link: ''
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    updateProjects(updated);
  };

  const removeProject = (id) => {
    const updated = projects.filter(proj => proj.id !== id);
    setProjects(updated);
    updateProjects(updated);
  };

  const updateProjectItem = (id, field, value) => {
    const updated = projects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    setProjects(updated);
    updateProjects(updated);
  };

  const addTechnology = (projectId, tech) => {
    if (tech.trim()) {
      const updated = projects.map(proj => 
        proj.id === projectId 
          ? { ...proj, technologies: [...(proj.technologies || []), tech.trim()] }
          : proj
      );
      setProjects(updated);
      updateProjects(updated);
    }
  };

  const removeTechnology = (projectId, techToRemove) => {
    const updated = projects.map(proj => 
      proj.id === projectId 
        ? { ...proj, technologies: proj.technologies.filter(tech => tech !== techToRemove) }
        : proj
    );
    setProjects(updated);
    updateProjects(updated);
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚀</span>
            <span>Projects</span>
          </div>
          <Button onClick={addProject} variant="outline" size="sm">
            Add Project
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Showcase Your Projects
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add projects that demonstrate your skills and experience
            </p>
            <Button onClick={addProject} variant="gradient">
              Add First Project
            </Button>
          </div>
        ) : (
          projects.map((project, index) => (
            <ProjectItem
              key={project.id}
              project={project}
              index={index}
              onUpdate={updateProjectItem}
              onRemove={removeProject}
              onAddTechnology={addTechnology}
              onRemoveTechnology={removeTechnology}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

const ProjectItem = ({ 
  project, 
  index, 
  onUpdate, 
  onRemove, 
  onAddTechnology, 
  onRemoveTechnology 
}) => {
  const [newTech, setNewTech] = useState('');

  const handleAddTech = () => {
    if (newTech.trim()) {
      onAddTechnology(project.id, newTech);
      setNewTech('');
    }
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Project #{index + 1}
        </h4>
        <Button 
          onClick={() => onRemove(project.id)}
          variant="ghost" 
          size="sm"
          className="text-red-500 hover:text-red-700"
        >
          Remove
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormField
          label="Project Name"
          value={project.name}
          onChange={(e) => onUpdate(project.id, 'name', e.target.value)}
          placeholder="My Awesome Project"
          variant="glass"
        />
        <FormField
          label="Project Link (Optional)"
          value={project.link}
          onChange={(e) => onUpdate(project.id, 'link', e.target.value)}
          placeholder="https://github.com/username/project"
          variant="glass"
        />
      </div>
      
      <FormField
        label="Description"
        value={project.description}
        onChange={(e) => onUpdate(project.id, 'description', e.target.value)}
        placeholder="Describe what this project does and your role in it..."
        variant="glass"
        multiline
        rows={3}
        className="mb-4"
      />
      
      {/* Technologies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Technologies Used
        </label>
        
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {project.technologies.map((tech, techIndex) => (
              <Badge
                key={techIndex}
                variant="secondary"
                className="px-2 py-1 cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                onClick={() => onRemoveTechnology(project.id, tech)}
              >
                {tech} ✕
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <FormField
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
            placeholder="Add technology..."
            variant="glass"
            className="flex-1"
          />
          <Button 
            onClick={handleAddTech}
            disabled={!newTech.trim()}
            variant="outline"
            size="sm"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

const ReviewStep = () => {
  const { resumeData, analysis, saveResume, triggerAnalysis } = useResumeBuilder();
  
  const completionStats = React.useMemo(() => {
    const sections = {
      personalInfo: resumeData.personalInfo?.firstName && resumeData.personalInfo?.email,
      experience: resumeData.experience?.length > 0,
      education: resumeData.education?.length > 0,
      skills: resumeData.skills?.length > 0,
      projects: resumeData.projects?.length > 0
    };

    const completed = Object.values(sections).filter(Boolean).length;
    const total = Object.keys(sections).length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage, sections };
  }, [resumeData]);

  return (
    <div className="space-y-6">
      {/* Completion Overview */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">📋</span>
            <span>Resume Review</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {completionStats.percentage}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Resume Completion ({completionStats.completed}/{completionStats.total} sections)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(completionStats.sections).map(([section, completed]) => (
              <div 
                key={section}
                className={cn(
                  "p-3 rounded-lg border-2 transition-colors",
                  completed 
                    ? "border-green-200 bg-green-50 dark:bg-green-900/20" 
                    : "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={completed ? "text-green-600" : "text-yellow-600"}>
                    {completed ? "✓" : "⚠️"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Summary */}
      {analysis.data && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <span>AI Analysis</span>
              </div>
              <Button onClick={triggerAnalysis} variant="outline" size="sm">
                Refresh Analysis
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {analysis.data.overallScore || 0}/100
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Overall Resume Score
              </p>
            </div>
            
            {analysis.data.actionableFeedback && analysis.data.actionableFeedback.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Top Recommendations:
                </h4>
                <ul className="space-y-1">
                  {analysis.data.actionableFeedback.slice(0, 3).map((feedback, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {feedback.suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              Download PDF
            </Button>
            <Button onClick={saveResume} variant="gradient" size="lg">
              Save Resume
            </Button>
            <Button variant="outline" size="lg">
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeBuilder;