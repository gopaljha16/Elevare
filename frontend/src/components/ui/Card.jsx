import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Glass Card variant with glassmorphism effect
const GlassCard = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-xl",
      className
    )}
    {...props}
  />
));
GlassCard.displayName = "GlassCard";

// Bento Card for grid layouts
const BentoCard = React.forwardRef(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    small: "col-span-1 row-span-1",
    default: "col-span-2 row-span-1", 
    large: "col-span-2 row-span-2",
    wide: "col-span-3 row-span-1",
    tall: "col-span-1 row-span-2"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-900/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
BentoCard.displayName = "BentoCard";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, GlassCard, BentoCard };