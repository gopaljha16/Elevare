import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

const MainNavigation = ({ currentPage = 'dashboard' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0',
      description: 'Overview and analytics'
    },
    {
      id: 'resume-builder',
      label: 'Resume Builder',
      href: '/resume-builder',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      description: 'Create and optimize resumes',
      badge: 'New'
    },
    {
      id: 'interview-prep',
      label: 'Interview Prep',
      href: '/interview-prep',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      description: 'Practice interviews with AI'
    },
    {
      id: 'learning-paths',
      label: 'Learning Paths',
      href: '/learning-paths',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      description: 'Company-specific skill roadmaps'
    },
    {
      id: 'ai-features',
      label: 'AI Features',
      href: '/ai-features',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      description: 'AI-powered career tools',
      badge: 'Pro'
    }
  ];

  return (
    <motion.div
      className={cn(
        "fixed left-0 top-0 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 z-40 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">JobSphere</h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            <svg 
              className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="p-4 space-y-2">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <a
              href={item.href}
              className={cn(
                "flex items-center p-3 rounded-xl transition-all duration-200 group relative",
                currentPage === item.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <svg 
                className={cn("w-5 h-5 flex-shrink-0", !isCollapsed && "mr-3")} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              
              {!isCollapsed && (
                <>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant={item.badge === 'Pro' ? 'gradient' : 'success'} 
                          className="text-xs ml-2"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-75 mt-1">{item.description}</p>
                  </div>
                </>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                </div>
              )}
            </a>
          </motion.div>
        ))}
      </div>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Upgrade to Pro</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Unlock unlimited AI features and advanced analytics
            </p>
            <Button variant="gradient" size="sm" className="w-full">
              Upgrade Now
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MainNavigation;