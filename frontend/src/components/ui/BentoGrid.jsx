import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

const BentoGrid = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
BentoGrid.displayName = "BentoGrid";

const BentoGridItem = React.forwardRef(({ 
  className, 
  title, 
  description, 
  header, 
  icon,
  size = "default",
  children,
  ...props 
}, ref) => {
  const sizeClasses = {
    small: "col-span-1 row-span-1",
    default: "col-span-1 md:col-span-2 row-span-1",
    large: "col-span-1 md:col-span-2 lg:col-span-2 row-span-2",
    wide: "col-span-1 md:col-span-2 lg:col-span-3 row-span-1",
    tall: "col-span-1 row-span-2",
    hero: "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 row-span-2"
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-900/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6",
        sizeClasses[size],
        className
      )}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Header Image/Content */}
      {header && (
        <div className="mb-4 overflow-hidden rounded-xl">
          {header}
        </div>
      )}
      
      {/* Icon */}
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
          {icon}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {title && (
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        )}
        
        {children}
      </div>
      
      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
});
BentoGridItem.displayName = "BentoGridItem";

// Specialized Bento Cards for different content types
const StatsBentoCard = ({ title, value, change, icon, trend = "up" }) => (
  <BentoGridItem
    size="small"
    className="flex flex-col justify-between"
  >
    <div className="flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
        {icon}
      </div>
      <div className={cn(
        "flex items-center text-xs font-medium",
        trend === "up" ? "text-green-600" : "text-red-600"
      )}>
        {trend === "up" ? "↗" : "↘"} {change}
      </div>
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
    </div>
  </BentoGridItem>
);

const ChartBentoCard = ({ title, children }) => (
  <BentoGridItem
    size="default"
    title={title}
    className="flex flex-col"
  >
    <div className="flex-1 flex items-center justify-center">
      {children}
    </div>
  </BentoGridItem>
);

const FeatureBentoCard = ({ title, description, icon, action }) => (
  <BentoGridItem
    size="default"
    title={title}
    description={description}
    icon={icon}
    className="flex flex-col justify-between"
  >
    {action && (
      <div className="mt-4">
        {action}
      </div>
    )}
  </BentoGridItem>
);

export { 
  BentoGrid, 
  BentoGridItem, 
  StatsBentoCard, 
  ChartBentoCard, 
  FeatureBentoCard 
};