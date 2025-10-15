import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * Onboarding Flow Component
 * Guides users through new features and functionality
 */
export const OnboardingFlow = ({ 
  steps = [], 
  isOpen = false, 
  onClose = () => {}, 
  onComplete = () => {},
  storageKey = 'onboarding_completed'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(storageKey);
    if (completed) {
      setIsVisible(false);
    } else {
      setIsVisible(isOpen);
    }
  }, [isOpen, storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onClose();
  };

  if (!isVisible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {currentStepData.icon && (
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                {currentStepData.icon}
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
            {currentStepData.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            {currentStepData.description}
          </p>

          {currentStepData.content && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              {currentStepData.content}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip Tour
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Resume Builder Onboarding
 */
export const ResumeBuilderOnboarding = ({ isOpen, onClose, onComplete }) => {
  const steps = [
    {
      title: "Welcome to the Resume Builder",
      description: "Create professional resumes with live preview and AI-powered insights.",
      icon: <div className="text-blue-500 text-2xl">📄</div>,
      content: (
        <div className="text-sm space-y-2">
          <p>This tool helps you:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>Build resumes with real-time preview</li>
            <li>Get AI-powered optimization suggestions</li>
            <li>Choose from professional templates</li>
            <li>Export to PDF when ready</li>
          </ul>
        </div>
      )
    },
    {
      title: "Live Preview",
      description: "See your resume update in real-time as you make changes.",
      icon: <div className="text-green-500 text-2xl">👁️</div>,
      content: (
        <div className="text-sm space-y-2">
          <p>The preview panel shows:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>How your resume will look when printed</li>
            <li>Real-time updates as you type</li>
            <li>Different template styles</li>
            <li>Mobile and desktop views</li>
          </ul>
        </div>
      )
    },
    {
      title: "AI Analysis",
      description: "Get intelligent feedback to improve your resume's effectiveness.",
      icon: <div className="text-purple-500 text-2xl">🤖</div>,
      content: (
        <div className="text-sm space-y-2">
          <p>AI analysis provides:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>ATS compatibility score</li>
            <li>Grammar and language suggestions</li>
            <li>Keyword optimization tips</li>
            <li>Content improvement recommendations</li>
          </ul>
        </div>
      )
    },
    {
      title: "Auto-Save",
      description: "Your work is automatically saved as you type. No need to worry about losing progress.",
      icon: <div className="text-orange-500 text-2xl">💾</div>,
      content: (
        <div className="text-sm space-y-2">
          <p>Features include:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>Automatic saving every few seconds</li>
            <li>Recovery from unexpected closures</li>
            <li>Version history (coming soon)</li>
            <li>Cloud synchronization</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <OnboardingFlow
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      storageKey="resume_builder_onboarding"
    />
  );
};

/**
 * AI Analysis Onboarding
 */
export const AIAnalysisOnboarding = ({ isOpen, onClose, onComplete }) => {
  const steps = [
    {
      title: "AI-Powered Resume Analysis",
      description: "Get intelligent insights to make your resume stand out to employers.",
      icon: <div className="text-blue-500 text-2xl">🎯</div>,
      content: (
        <div className="text-sm space-y-2">
          <p>Our AI analyzes:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>Content quality and completeness</li>
            <li>ATS (Applicant Tracking System) compatibility</li>
            <li>Grammar and language usage</li>
            <li>Industry-specific keywords</li>
          </ul>
        </div>
      )
    },
    {
      title: "Understanding Your Score",
      description: "Learn how to interpret your resume analysis results.",
      icon: <div className="text-green-500 text-2xl">📊</div>,
      content: (
        <div className="text-sm space-y-3">
          <div>
            <h4 className="font-medium mb-2">Score Ranges:</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-green-600 dark:text-green-400">80-100:</span>
                <span>Excellent - Ready to submit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600 dark:text-yellow-400">60-79:</span>
                <span>Good - Minor improvements needed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600 dark:text-red-400">Below 60:</span>
                <span>Needs work - Follow suggestions</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Acting on Suggestions",
      description: "Use AI recommendations to improve your resume effectively.",
      icon: <div className="text-purple-500 text-2xl">✨</div>,
      content: (
        <div className="text-sm space-y-2">
          <p>Suggestion categories:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li><strong>High Priority:</strong> Critical improvements</li>
            <li><strong>Medium Priority:</strong> Helpful enhancements</li>
            <li><strong>Low Priority:</strong> Nice-to-have changes</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            💡 Start with high-priority suggestions for maximum impact
          </p>
        </div>
      )
    }
  ];

  return (
    <OnboardingFlow
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      storageKey="ai_analysis_onboarding"
    />
  );
};

export default OnboardingFlow;