import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Help Tooltip Component
 * Provides contextual help information with expandable details
 */
export const HelpTooltip = ({ 
  title, 
  content, 
  position = 'top',
  size = 'sm',
  className = '',
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        className="inline-flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children || <HelpCircle className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className={`absolute z-50 ${positionClasses[position]} ${sizeClasses[size]}`}>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <div className="flex items-start justify-between mb-2">
              {title && (
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {title}
                </h4>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {typeof content === 'string' ? (
                <p>{content}</p>
              ) : (
                content
              )}
            </div>

            {/* Arrow */}
            <div className={`absolute w-2 h-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-0 border-r-0' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-0 border-b-0' :
              'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-0 border-t-0'
            }`} />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * AI Analysis Help Component
 * Specialized help for AI analysis features
 */
export const AIAnalysisHelp = () => {
  const content = (
    <div className="space-y-3">
      <div>
        <h5 className="font-medium text-gray-900 dark:text-white mb-1">How AI Analysis Works</h5>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Our AI analyzes your resume using advanced language models to provide:
        </p>
        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
          <li>ATS compatibility score</li>
          <li>Grammar and language improvements</li>
          <li>Keyword optimization suggestions</li>
          <li>Content enhancement recommendations</li>
        </ul>
      </div>
      
      <div>
        <h5 className="font-medium text-gray-900 dark:text-white mb-1">Understanding Scores</h5>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">80-100:</span>
            <span className="text-gray-600 dark:text-gray-400">Excellent</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600 dark:text-yellow-400">60-79:</span>
            <span className="text-gray-600 dark:text-gray-400">Good</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600 dark:text-red-400">Below 60:</span>
            <span className="text-gray-600 dark:text-gray-400">Needs improvement</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <HelpTooltip
      title="AI Resume Analysis"
      content={content}
      size="lg"
      position="bottom"
    />
  );
};

/**
 * Live Preview Help Component
 */
export const LivePreviewHelp = () => {
  const content = (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        The live preview shows how your resume will look in real-time as you make changes.
      </p>
      
      <div>
        <h5 className="font-medium text-gray-900 dark:text-white mb-1">Features:</h5>
        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
          <li>Real-time updates as you type</li>
          <li>Multiple template options</li>
          <li>Responsive design preview</li>
          <li>Print-ready formatting</li>
        </ul>
      </div>
      
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Changes are automatically saved as you work
        </p>
      </div>
    </div>
  );

  return (
    <HelpTooltip
      title="Live Preview"
      content={content}
      size="md"
      position="bottom"
    />
  );
};

/**
 * Form Field Help Component
 */
export const FieldHelp = ({ field, children }) => {
  const fieldHelp = {
    personalInfo: {
      email: "Use a professional email address. Avoid nicknames or unprofessional domains.",
      phone: "Include your country code if applying internationally. Use a consistent format.",
      linkedin: "Include your full LinkedIn profile URL. Make sure your profile is up-to-date.",
      portfolio: "Link to your professional portfolio, GitHub, or personal website."
    },
    experience: {
      position: "Use the exact job title from your employment. Be specific and professional.",
      company: "Include the full company name. Add location if it's a well-known company.",
      description: "Focus on achievements, not just responsibilities. Use action verbs and quantify results.",
      achievements: "Include specific, measurable accomplishments. Use numbers, percentages, or dollar amounts."
    },
    education: {
      degree: "Include your full degree name (e.g., Bachelor of Science, Master of Arts).",
      field: "Specify your major or field of study. Include minors if relevant.",
      gpa: "Only include GPA if it's 3.5 or higher. Otherwise, leave blank.",
      institution: "Use the full, official name of your school or university."
    },
    skills: {
      technical: "List specific technologies, programming languages, and tools you're proficient in.",
      soft: "Include relevant soft skills like leadership, communication, or problem-solving.",
      certifications: "Add any relevant certifications or professional qualifications."
    },
    projects: {
      name: "Use a clear, descriptive project name that explains what it does.",
      description: "Explain what the project does, your role, and the impact or results.",
      technologies: "List the specific technologies, frameworks, and tools you used.",
      link: "Include links to live demos, GitHub repositories, or project documentation."
    }
  };

  const helpText = fieldHelp[field.section]?.[field.name];
  
  if (!helpText) return children;

  return (
    <div className="flex items-center gap-2">
      {children}
      <HelpTooltip
        content={helpText}
        size="md"
        position="top"
      />
    </div>
  );
};

export default HelpTooltip;