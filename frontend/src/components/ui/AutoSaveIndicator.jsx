import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './Badge';
import { cn } from '../../lib/utils';
import { useAutoSave } from '../../hooks/useAutoSave';

/**
 * AutoSaveIndicator Component
 * Shows the current auto-save status with visual feedback
 */
const AutoSaveIndicator = ({ className, showDetails = false }) => {
  const {
    saveStatus,
    lastSaveTime,
    nextSaveIn,
    isAutoSaveEnabled,
    isDirty,
    canSave,
    isSaving,
    formatTimeUntilSave,
    formatLastSaveTime,
    forceSave,
    toggleAutoSave
  } = useAutoSave();

  if (!isAutoSaveEnabled && !isDirty) {
    return null;
  }

  const getStatusConfig = () => {
    if (isSaving || saveStatus === 'saving') {
      return {
        variant: 'secondary',
        icon: <SpinnerIcon />,
        text: 'Saving...',
        color: 'text-blue-600'
      };
    }
    
    if (saveStatus === 'saved') {
      return {
        variant: 'success',
        icon: <CheckIcon />,
        text: 'Saved',
        color: 'text-green-600'
      };
    }
    
    if (saveStatus === 'error') {
      return {
        variant: 'destructive',
        icon: <ErrorIcon />,
        text: 'Save failed',
        color: 'text-red-600'
      };
    }
    
    if (isDirty && isAutoSaveEnabled) {
      return {
        variant: 'warning',
        icon: <ClockIcon />,
        text: nextSaveIn ? `Auto-save in ${formatTimeUntilSave()}` : 'Changes pending',
        color: 'text-yellow-600'
      };
    }
    
    if (isDirty && !isAutoSaveEnabled) {
      return {
        variant: 'warning',
        icon: <WarningIcon />,
        text: 'Unsaved changes',
        color: 'text-orange-600'
      };
    }
    
    return null;
  };

  const statusConfig = getStatusConfig();
  
  if (!statusConfig) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={saveStatus}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Badge 
            variant={statusConfig.variant}
            className="flex items-center gap-1 text-xs"
          >
            {statusConfig.icon}
            {statusConfig.text}
          </Badge>
        </motion.div>
      </AnimatePresence>

      {showDetails && (
        <div className="flex items-center gap-1">
          {canSave && (
            <button
              onClick={forceSave}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
              disabled={isSaving}
            >
              Save now
            </button>
          )}
          
          <button
            onClick={toggleAutoSave}
            className={cn(
              "text-xs underline",
              isAutoSaveEnabled 
                ? "text-gray-600 hover:text-gray-800" 
                : "text-blue-600 hover:text-blue-800"
            )}
          >
            {isAutoSaveEnabled ? 'Disable auto-save' : 'Enable auto-save'}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Detailed AutoSave Status Component
 * Shows comprehensive auto-save information
 */
export const AutoSaveStatus = ({ className }) => {
  const {
    saveStatus,
    lastSaveTime,
    nextSaveIn,
    isAutoSaveEnabled,
    isDirty,
    formatTimeUntilSave,
    formatLastSaveTime
  } = useAutoSave();

  return (
    <div className={cn("text-xs text-gray-500 dark:text-gray-400", className)}>
      <div className="flex items-center justify-between">
        <span>
          {isDirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
        
        {lastSaveTime && (
          <span>
            Last saved: {formatLastSaveTime()}
          </span>
        )}
      </div>
      
      {isAutoSaveEnabled && nextSaveIn && (
        <div className="mt-1">
          Next auto-save: {formatTimeUntilSave()}
        </div>
      )}
      
      {!isAutoSaveEnabled && isDirty && (
        <div className="mt-1 text-yellow-600">
          Auto-save is disabled
        </div>
      )}
    </div>
  );
};

// Icon components
const SpinnerIcon = () => (
  <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
);

const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

export default AutoSaveIndicator;