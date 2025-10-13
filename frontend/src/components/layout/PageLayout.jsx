import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const PageLayout = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className,
  headerClassName,
  contentClassName 
}) => {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20", className)}>
      {/* Header */}
      {(title || subtitle || actions) && (
        <motion.div 
          className={cn("p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm", headerClassName)}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-4">
                {actions}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className={cn("p-6", contentClassName)}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Specialized layouts
const DashboardLayout = ({ children, sidebar, ...props }) => (
  <div className="flex min-h-screen">
    {sidebar}
    <div className="flex-1 overflow-auto">
      <PageLayout {...props}>
        {children}
      </PageLayout>
    </div>
  </div>
);

const CenteredLayout = ({ children, maxWidth = "2xl", ...props }) => (
  <PageLayout 
    {...props}
    contentClassName={cn("flex items-center justify-center min-h-screen", props.contentClassName)}
  >
    <div className={cn("w-full", `max-w-${maxWidth}`)}>
      {children}
    </div>
  </PageLayout>
);

export { PageLayout, DashboardLayout, CenteredLayout };
export default PageLayout;