import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  XIcon,
  CheckIcon,
  SparklesIcon,
  EyeIcon,
  EditIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * OnboardingFlow Component
 * Provides guided tour for new users
 */
const OnboardingFlow = ({
  isVisible,
  onComplete,
  onSkip,
  steps = defaultSteps,
  autoStart = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    if (isVisible && autoStart) {
      setIsActive(true);
    }
  }, [isVisible, autoStart]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setIsActive(false);
    onComplete?.();
  };

  const skipOnboarding = () => {
    setIsActive(false);
    onSkip?.();
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  if (!isActive || !isVisible) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={skipOnboarding}
        />

        {/* Onboarding Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-lg mx-4"
        >
          <Card className="bg-white dark:bg-gray-800 shadow-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    {currentStepData.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentStepData.title}
                  </h3>
                </div>
                <button
                  onClick={skipOnboarding}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <XIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <div className="mb-6">
                <div className="text-gray-700 dark:text-gray-300 mb-4">
                  {currentStepData.content}
                </div>

                {/* Step Image/Demo */}
                {currentStepData.image && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={currentStepData.image}
                      alt={currentStepData.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Interactive Elements */}
                {currentStepData.interactive && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    {currentStepData.interactive}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        index === currentStep
                          ? 'bg-blue-500'
                          : completedSteps.has(index)
                            ? 'bg-green-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      icon={<ArrowLeftIcon className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={nextStep}
                    icon={
                      currentStep === steps.length - 1 ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        <ArrowRightIcon className="w-4 h-4" />
                      )
                    }
                    iconPosition="right"
                  >
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  </Button>
                </div>
              </div>

              {/* Skip Option */}
              <div className="mt-4 text-center">
                <button
                  onClick={skipOnboarding}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Skip tour
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Default onboarding steps
const defaultSteps = [
  {
    title: 'Welcome to Resume Builder',
    icon: <SparklesIcon className="w-4 h-4 text-blue-500" />,
    content: (
      <div>
        <p className="mb-3">
          Welcome to JobSphere's AI-powered Resume Builder! We'll help you create
          professional resumes that stand out to employers and pass ATS systems.
        </p>
        <p>
          This quick tour will show you the key features and how to get the most
          out of our platform.
        </p>
      </div>
    ),
  },
  {
    title: 'Step-by-Step Builder',
    icon: <EditIcon className="w-4 h-4 text-green-500" />,
    content: (
      <div>
        <p className="mb-3">
          Our resume builder guides you through each section step by step.
          You'll fill out your personal information, experience, education,
          skills, and projects.
        </p>
        <p>
          Don't worry about formatting - we handle that automatically with
          professional templates.
        </p>
      </div>
    ),
  },
  {
    title: 'Live Preview',
    icon: <EyeIcon className="w-4 h-4 text-purple-500" />,
    content: (
      <div>
        <p className="mb-3">
          See your resume come to life in real-time! As you fill out each section,
          the preview updates instantly so you can see exactly how your resume will look.
        </p>
        <p>
          Switch between different templates and view modes to find the perfect style.
        </p>
      </div>
    ),
  },
  {
    title: 'AI-Powered Analysis',
    icon: <SparklesIcon className="w-4 h-4 text-blue-500" />,
    content: (
      <div>
        <p className="mb-3">
          Our AI analyzes your resume and provides personalized suggestions to
          improve your content, formatting, and ATS compatibility.
        </p>
        <p>
          Get detailed feedback on each section and actionable recommendations
          to make your resume stand out.
        </p>
      </div>
    ),
  },
  {
    title: "You're All Set!",
    icon: <CheckIcon className="w-4 h-4 text-green-500" />,
    content: (
      <div>
        <p className="mb-3">
          You're ready to create amazing resumes! Remember, you can always access
          help tooltips throughout the application by clicking the help icons.
        </p>
        <p>
          Good luck with your job search! 🚀
        </p>
      </div>
    ),
  },
];

/**
 * FeatureHighlight Component
 * Highlights specific features with overlay
 */
export const FeatureHighlight = ({
  targetSelector,
  title,
  content,
  position = 'bottom',
  onNext,
  onSkip
}) => {
  const [targetElement, setTargetElement] = useState(null);
  const [highlightStyle, setHighlightStyle] = useState({});

  useEffect(() => {
    const element = document.querySelector(targetSelector);
    if (element) {
      setTargetElement(element);

      const rect = element.getBoundingClientRect();
      setHighlightStyle({
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      });
    }
  }, [targetSelector]);

  if (!targetElement) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with cutout */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Highlight */}
      <div
        className="absolute border-2 border-blue-500 rounded-lg shadow-lg bg-white/10"
        style={highlightStyle}
      />

      {/* Tooltip */}
      <div className="absolute z-10" style={{
        top: position === 'bottom' ? highlightStyle.top + highlightStyle.height + 16 : highlightStyle.top - 200,
        left: highlightStyle.left,
      }}>
        <Card className="max-w-sm bg-white dark:bg-gray-800 shadow-xl">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {content}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={onNext}>
                Got it
              </Button>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;