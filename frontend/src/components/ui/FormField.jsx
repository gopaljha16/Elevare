import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Input, GlassInput, FloatingInput } from './Input';
import { debounce } from '../../utils/debounce';

const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  className,
  inputClassName,
  variant = "default",
  icon,
  helpText,
  debounceMs = 300,
  showSaveStatus = false,
  multiline = false,
  rows = 3,
  onKeyPress,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const debouncedOnChangeRef = useRef(null);
  const hasError = touched && error;

  // Create debounced onChange function
  useEffect(() => {
    if (onChange) {
      debouncedOnChangeRef.current = debounce((newValue) => {
        if (showSaveStatus) {
          setIsSaving(true);
        }
        
        // Call the original onChange with proper parameters
        if (typeof onChange === 'function') {
          if (name) {
            onChange(name, newValue);
          } else {
            onChange({ target: { name, value: newValue } });
          }
        }
        
        if (showSaveStatus) {
          setTimeout(() => {
            setIsSaving(false);
            setLastSaved(new Date());
          }, 500);
        }
      }, debounceMs);
    }
    
    return () => {
      if (debouncedOnChangeRef.current) {
        debouncedOnChangeRef.current.cancel?.();
      }
    };
  }, [onChange, debounceMs, showSaveStatus, name]);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (debouncedOnChangeRef.current) {
      debouncedOnChangeRef.current(newValue);
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (onBlur) {
      if (typeof onBlur === 'function') {
        if (name) {
          onBlur(name);
        } else {
          onBlur({ target: { name } });
        }
      }
    }
  }, [onBlur, name]);

  const handleKeyPress = useCallback((e) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
  }, [onKeyPress]);

  const InputComponent = {
    default: Input,
    glass: GlassInput,
    floating: FloatingInput
  }[variant];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && variant !== "floating" && (
        <div className="flex items-center justify-between">
          <label 
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {/* Save Status */}
          {showSaveStatus && (
            <div className="flex items-center space-x-1 text-xs">
              {isSaving ? (
                <>
                  <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full" />
                  <span className="text-blue-600">Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600">Saved</span>
                </>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && !multiline && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        {/* Input or Textarea */}
        {multiline ? (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            rows={rows}
            className={cn(
              "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
              "placeholder-gray-500 dark:placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
              "transition-all duration-200 resize-vertical",
              variant === "glass" && "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              disabled && "opacity-50 cursor-not-allowed",
              inputClassName
            )}
            {...props}
          />
        ) : (
          <InputComponent
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            label={variant === "floating" ? label : undefined}
            className={cn(
              "transition-all duration-200",
              icon && "pl-10",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              inputClassName
            )}
            {...props}
          />
        )}

        {/* Status Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Save Status Icon */}
          {showSaveStatus && !hasError && (
            <>
              {isSaving ? (
                <div className="animate-spin w-4 h-4 border border-blue-500 border-t-transparent rounded-full" />
              ) : lastSaved ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : null}
            </>
          )}
          
          {/* Error Icon */}
          {hasError && (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Specialized form fields
const EmailField = (props) => (
  <FormField
    type="email"
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      </svg>
    }
    {...props}
  />
);

const PasswordField = (props) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <div className="relative">
      <FormField
        type={showPassword ? "text" : "password"}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
        {...props}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
};

const PhoneField = (props) => (
  <FormField
    type="tel"
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    }
    {...props}
  />
);

export { FormField, EmailField, PasswordField, PhoneField };
export default FormField;