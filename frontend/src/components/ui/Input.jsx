import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Glass Input variant
const GlassInput = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
GlassInput.displayName = "GlassInput";

// Floating Label Input
const FloatingInput = React.forwardRef(({ className, label, id, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        id={id}
        className={cn(
          "peer h-12 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-4 pt-4 pb-2 text-sm text-gray-900 dark:text-white placeholder-transparent focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          className
        )}
        placeholder={label}
        ref={ref}
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-2 text-xs text-gray-500 dark:text-gray-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500"
      >
        {label}
      </label>
    </div>
  );
});
FloatingInput.displayName = "FloatingInput";

export { Input, GlassInput, FloatingInput };