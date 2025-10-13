import React from 'react';
import { cn } from '../../utils/cn';

const badgeVariants = {
  default: "bg-gray-900 text-gray-50 hover:bg-gray-900/80 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/80",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
  destructive: "bg-red-500 text-gray-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/80",
  outline: "text-gray-950 dark:text-gray-50 border border-gray-200 dark:border-gray-800",
  success: "bg-green-500 text-white hover:bg-green-500/80",
  warning: "bg-yellow-500 text-white hover:bg-yellow-500/80",
  info: "bg-blue-500 text-white hover:bg-blue-500/80",
};

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:focus:ring-gray-300",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge, badgeVariants };