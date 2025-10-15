import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FormField } from './FormField';
import { useOptimizedCallback, usePerformanceMonitor } from '../../utils/performance.jsx';

/**
 * OptimizedFormField Component
 * Performance-optimized form field with debouncing and memoization
 */
const OptimizedFormField = React.memo(({
  value,
  onChange,
  onBlur,
  debounceMs = 300,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);
  const { startTiming, endTiming } = usePerformanceMonitor('OptimizedFormField');

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Optimized change handler with debouncing
  const debouncedOnChange = useOptimizedCallback((newValue) => {
    startTiming('onChange');
    onChange?.(newValue);
    endTiming('onChange');
  }, debounceMs, [onChange, startTiming, endTiming]);

  // Handle local input changes
  const handleLocalChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(e);
  }, [debouncedOnChange]);

  // Optimized blur handler
  const handleBlur = useOptimizedCallback((e) => {
    startTiming('onBlur');
    onBlur?.(e);
    endTiming('onBlur');
  }, 100, [onBlur, startTiming, endTiming]);

  // Memoized props to prevent unnecessary re-renders
  const memoizedProps = useMemo(() => ({
    ...props,
    value: localValue,
    onChange: handleLocalChange,
    onBlur: handleBlur
  }), [props, localValue, handleLocalChange, handleBlur]);

  return <FormField {...memoizedProps} />;
});

OptimizedFormField.displayName = 'OptimizedFormField';

export default OptimizedFormField;