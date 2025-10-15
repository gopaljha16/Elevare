import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircleIcon } from 'lucide-react';

/**
 * Tooltip Component
 * Provides contextual help and information on hover or click
 */
export const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  trigger = 'hover',
  className = '',
  maxWidth = 'max-w-xs'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  const toggleTooltip = () => setIsVisible(!isVisible);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800 dark:border-t-gray-200';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800 dark:border-b-gray-200';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800 dark:border-l-gray-200';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800 dark:border-r-gray-200';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800 dark:border-t-gray-200';
    }
  };

  const triggerProps = trigger === 'hover' ? {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip
  } : {
    onClick: toggleTooltip
  };

  return (
    <div className={`relative inline-block ${className}`} {...triggerProps}>
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            <div className={`${maxWidth} px-3 py-2 text-sm text-white bg-gray-800 dark:bg-gray-200 dark:text-gray-800 rounded-lg shadow-lg`}>
              {content}
              <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Help Icon with Tooltip
 * Convenient component for adding help icons with tooltips
 */
export const HelpTooltip = ({ 
  content, 
  position = 'top',
  className = '',
  iconClassName = 'h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
}) => {
  return (
    <Tooltip content={content} position={position} className={className}>
      <HelpCircleIcon className={`cursor-help ${iconClassName}`} />
    </Tooltip>
  );
};

/**
 * AI Analysis Help Tooltips
 * Pre-configured tooltips for AI analysis features
 */
export const AIAnalysisTooltips = {
  OverallScore: ({ score }) => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">Overall Score: {score}/100</div>
          <div className="text-xs">
            This score is calculated based on content quality, ATS compatibility, 
            completeness, and industry alignment. Scores above 80 are considered excellent.
          </div>
        </div>
      }
      position="bottom"
    />
  ),

  SectionScore: ({ section, score, description }) => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">{section}: {score}/100</div>
          <div className="text-xs">{description}</div>
        </div>
      }
      position="right"
    />
  ),

  ATSCompatibility: () => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">ATS Compatibility</div>
          <div className="text-xs">
            Measures how well your resume will perform with Applicant Tracking Systems. 
            Higher scores mean better keyword optimization and formatting.
          </div>
        </div>
      }
      position="top"
    />
  ),

  KeywordDensity: () => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">Keyword Optimization</div>
          <div className="text-xs">
            Shows how well your resume matches industry keywords. Include relevant 
            skills and terms from job descriptions you're targeting.
          </div>
        </div>
      }
      position="top"
    />
  ),

  ActionableFeedback: () => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">Actionable Feedback</div>
          <div className="text-xs">
            Prioritized suggestions to improve your resume. Start with high-priority 
            items for the biggest impact on your score.
          </div>
        </div>
      }
      position="left"
    />
  )
};

/**
 * Resume Builder Help Tooltips
 * Pre-configured tooltips for resume builder features
 */
export const ResumeBuilderTooltips = {
  LivePreview: () => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">Live Preview</div>
          <div className="text-xs">
            See your resume exactly as it will appear when exported. Changes 
            update in real-time as you type.
          </div>
        </div>
      }
      position="bottom"
    />
  ),

  AutoSave: () => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">Auto-Save</div>
          <div className="text-xs">
            Your changes are automatically saved every few seconds. You'll see 
            a "Saved" indicator when your work is secure.
          </div>
        </div>
      }
      position="top"
    />
  ),

  TemplateSelector: () => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">Template Selection</div>
          <div className="text-xs">
            Choose from professional templates designed for different industries. 
            Your content will automatically adapt to the new design.
          </div>
        </div>
      }
      position="left"
    />
  ),

  ExperienceFormat: () => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">Experience Descriptions</div>
          <div className="text-xs">
            Use bullet points starting with action verbs. Include quantifiable 
            achievements (numbers, percentages, dollar amounts) when possible.
          </div>
        </div>
      }
      position="right"
    />
  ),

  SkillsSection: () => (
    <HelpTooltip
      content={
        <div>
          <div className="font-medium mb-1">Skills Section</div>
          <div className="text-xs">
            Include both technical and soft skills relevant to your target role. 
            Use keywords from job descriptions you're interested in.
          </div>
        </div>
      }
      position="top"
    />
  )
};

export default Tooltip;