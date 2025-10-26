import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FormField, EmailField, PhoneField } from '../ui/FormField';
import { useForm, validationRules } from '../../hooks/useForm';
import { cn } from '../../utils/cn';
import { 
  PlusIcon, 
  TrashIcon, 
  SparklesIcon,
  CalendarIcon,
  BuildingIcon,
  GraduationCapIcon,
  CodeIcon,
  AwardIcon,
  UserIcon,
  FileTextIcon,
  BriefcaseIcon
} from 'lucide-react';

/**
 * Resume Input Form Component
 * 
 * Handles all resume data input across different steps
 */
const ResumeInputForm = ({
  currentStep,
  steps,
  resumeData,
  onUpdatePersonalInfo,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateSkills,
  onUpdateProjects,
  onUpdateResumeData,
  aiAnalysis,
  onTriggerAIAnalysis
}) => {
  const currentStepData = steps[currentStep];

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'personal':
        return <PersonalInfoStep 
          data={resumeData.personalInfo} 
          onUpdate={onUpdatePersonalInfo}
          aiAnalysis={aiAnalysis}
        />;
      case 'summary':
        return <SummaryStep 
          data={resumeData.summary} 
          onUpdate={(summary) => onUpdateResumeData({ summary })}
          aiAnalysis={aiAnalysis}
          onTriggerAI={onTriggerAIAnalysis}
        />;
      case 'experience':
        return <ExperienceStep 
          data={resumeData.experience} 
          onUpdate={onUpdateExperience}
          aiAnalysis={aiAnalysis}
        />;
      case 'education':
        return <EducationStep 
          data={resumeData.education} 
          onUpdate={onUpdateEducation}
          aiAnalysis={aiAnalysis}
        />;
      case 'skills':
        return <SkillsStep 
          data={resumeData.skills} 
          onUpdate={onUpdateSkills}
          aiAnalysis={aiAnalysis}
        />;
      case 'projects':
        return <ProjectsStep 
          data={resumeData.projects} 
          onUpdate={onUpdateProjects}
          aiAnalysis={aiAnalysis}
        />;
      case 'certifications':
        return <CertificationsStep 
          data={resumeData.certifications} 
          onUpdate={(certifications) => onUpdateResumeData({ certifications })}
          aiAnalysis={aiAnalysis}
        />;
      case 'review':
        return <ReviewStep 
          resumeData={resumeData}
          aiAnalysis={aiAnalysis}
          onTriggerAI={onTriggerAIAnalysis}
        />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {renderStepContent()}
    </div>
  );
};

/**
 * Personal Information Step
 */
const PersonalInfoStep = ({ data, onUpdate, aiAnalysis }) => {
  const { values, errors, touched, handleChange, handleBlur } = useForm(
    data || {
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

  React.useEffect(() => {
    onUpdate(values);
  }, [values, onUpdate]);

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserIcon className="w-6 h-6 text-blue-500" />
          <span>Personal Information</span>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Let's start with your basic contact information
        </p>
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
            placeholder="John"
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
            placeholder="Doe"
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
            placeholder="john.doe@email.com"
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
            placeholder="+1 (555) 123-4567"
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
            label="Website (Optional)"
            name="website"
            placeholder="https://yourwebsite.com"
            value={values.website}
            onChange={handleChange}
            onBlur={handleBlur}
            variant="glass"
          />
          <FormField
            label="LinkedIn (Optional)"
            name="linkedin"
            placeholder="https://linkedin.com/in/yourprofile"
            value={values.linkedin}
            onChange={handleChange}
            onBlur={handleBlur}
            variant="glass"
          />
        </div>

        <FormField
          label="Portfolio (Optional)"
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

/**
 * Professional Summary Step
 */
const SummaryStep = ({ data, onUpdate, aiAnalysis, onTriggerAI }) => {
  const [summary, setSummary] = useState(data || '');

  React.useEffect(() => {
    onUpdate(summary);
  }, [summary, onUpdate]);

  const handleAIGenerate = () => {
    const aiSummary = "Results-driven professional with 5+ years of experience in software development. Proven track record of delivering high-quality solutions that improve user experience and drive business growth. Skilled in full-stack development, team leadership, and agile methodologies.";
    setSummary(aiSummary);
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileTextIcon className="w-6 h-6 text-blue-500" />
            <span>Professional Summary</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIGenerate}
            className="flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            AI Generate
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Write a compelling summary that highlights your key strengths and career objectives
        </p>
      </CardHeader>
      <CardContent>
        <FormField
          label="Professional Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Write a brief summary of your professional background, key skills, and career objectives..."
          variant="glass"
          multiline
          rows={6}
          maxLength={500}
          showCharCount
        />
        
        {summary && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Tips for a great summary:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Keep it concise (2-3 sentences)</li>
              <li>• Include your years of experience</li>
              <li>• Mention your key skills and achievements</li>
              <li>• Tailor it to your target role</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Additional step components will be added in separate files to keep this manageable
export default React.memo(ResumeInputForm);