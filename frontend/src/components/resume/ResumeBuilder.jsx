import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, BentoCard } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { useForm, validationRules } from '../../hooks/useForm';
import { FormField, EmailField, PhoneField } from '../ui/FormField';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';

const ResumeBuilder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState({});
  const { success, error } = useToast();

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: '👤' },
    { id: 'experience', title: 'Experience', icon: '💼' },
    { id: 'education', title: 'Education', icon: '🎓' },
    { id: 'skills', title: 'Skills', icon: '⚡' },
    { id: 'projects', title: 'Projects', icon: '🚀' },
    { id: 'preview', title: 'Preview', icon: '👁️' }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
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
                Resume Builder
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Create your professional resume with AI-powered optimization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="glass" className="px-4 py-2">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <Button variant="outline">
                Save Draft
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress: {Math.round(progress)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {steps[currentStep].title}
              </span>
            </div>
            <Progress value={progress} className="mb-6" />
            
            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-200",
                    index === currentStep 
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                      : index < currentStep 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50" 
                        : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium border-2 transition-all",
                    index === currentStep 
                      ? "border-blue-500 bg-blue-500 text-white" 
                      : index < currentStep 
                        ? "border-green-500 bg-green-500 text-white" 
                        : "border-gray-300 dark:border-gray-600"
                  )}>
                    {index < currentStep ? '✓' : step.icon}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {step.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && <PersonalInfoStep />}
                {currentStep === 1 && <ExperienceStep />}
                {currentStep === 2 && <EducationStep />}
                {currentStep === 3 && <SkillsStep />}
                {currentStep === 4 && <ProjectsStep />}
                {currentStep === 5 && <PreviewStep />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Tips Card */}
            <BentoCard className="col-span-1 row-span-1">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  💡
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Pro Tips
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Use action verbs to describe your experience</li>
                    <li>• Quantify your achievements with numbers</li>
                    <li>• Tailor your resume for each job application</li>
                    <li>• Keep it concise and relevant</li>
                  </ul>
                </div>
              </div>
            </BentoCard>

            {/* ATS Score Preview */}
            <BentoCard className="col-span-1 row-span-1">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  ATS Score Preview
                </h3>
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.75)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">75%</span>
                  </div>
                </div>
                <Badge variant="success" className="text-xs">
                  Good Score
                </Badge>
              </div>
            </BentoCard>

            {/* Template Selection */}
            <BentoCard className="col-span-1 row-span-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Choose Template
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {['Modern', 'Classic', 'Creative', 'Minimal'].map((template) => (
                  <button
                    key={template}
                    className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
                  >
                    <div className="w-full h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded mb-2"></div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {template}
                    </span>
                  </button>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>

        {/* Navigation Buttons */}
        <motion.div 
          className="flex justify-between mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-8"
          >
            Previous
          </Button>
          <Button
            variant="gradient"
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className="px-8"
          >
            {currentStep === steps.length - 1 ? 'Generate Resume' : 'Next Step'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

// Step Components
const PersonalInfoStep = () => {
  const { values, errors, touched, handleChange, handleBlur } = useForm(
    {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: ''
    },
    {
      firstName: [validationRules.required()],
      lastName: [validationRules.required()],
      email: [validationRules.required(), validationRules.email()],
      phone: [validationRules.required()],
      location: [validationRules.required()]
    }
  );

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
      </CardContent>
    </Card>
  );
};

const ExperienceStep = () => (
  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <span className="text-2xl">💼</span>
        <span>Work Experience</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Experience section is being built with advanced features
        </p>
      </div>
    </CardContent>
  </Card>
);

const EducationStep = () => (
  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <span className="text-2xl">🎓</span>
        <span>Education</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Education section is being built with advanced features
        </p>
      </div>
    </CardContent>
  </Card>
);

const SkillsStep = () => (
  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <span className="text-2xl">⚡</span>
        <span>Skills</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Skills section is being built with advanced features
        </p>
      </div>
    </CardContent>
  </Card>
);

const ProjectsStep = () => (
  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <span className="text-2xl">🚀</span>
        <span>Projects</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Projects section is being built with advanced features
        </p>
      </div>
    </CardContent>
  </Card>
);

const PreviewStep = () => (
  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <span className="text-2xl">👁️</span>
        <span>Preview & Download</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Resume Preview
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your resume will be generated here with the selected template
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="gradient">
            Download PDF
          </Button>
          <Button variant="outline">
            Share Link
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ResumeBuilder;