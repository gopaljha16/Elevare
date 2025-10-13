import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        glass: "bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white",
        gradient: "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent hover:from-blue-600 hover:to-purple-700"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Animated Badge with pulse effect
const AnimatedBadge = React.forwardRef(({ className, children, ...props }, ref) => (
  <Badge
    ref={ref}
    className={cn("animate-pulse", className)}
    {...props}
  >
    {children}
  </Badge>
));
AnimatedBadge.displayName = "AnimatedBadge";

// Status Badge with dot indicator
const StatusBadge = React.forwardRef(({ className, status = "default", children, ...props }, ref) => {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500", 
    busy: "bg-red-500",
    away: "bg-yellow-500",
    default: "bg-blue-500"
  };

  return (
    <Badge
      ref={ref}
      variant="outline"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      <div className={cn("w-2 h-2 rounded-full", statusColors[status])} />
      {children}
    </Badge>
  );
});
StatusBadge.displayName = "StatusBadge";

export { Badge, AnimatedBadge, StatusBadge, badgeVariants };