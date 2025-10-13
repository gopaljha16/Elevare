import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const Sidebar = ({ 
  isCollapsed = false, 
  onToggle, 
  activeTab, 
  onTabChange, 
  items = [] 
}) => {
  return (
    <motion.div
      className={cn(
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 min-h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-4">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
            </svg>
          </div>
          {!isCollapsed && (
            <motion.h1 
              className="ml-3 text-xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              JobSphere
            </motion.h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 transition-all duration-200",
                  isCollapsed ? "px-3" : "px-4",
                  activeTab === item.id && "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                )}
                onClick={() => onTabChange(item.id)}
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
                  <motion.span 
                    className="font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
                {!isCollapsed && item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </motion.div>
          ))}
        </nav>

        {/* Upgrade Card */}
        {!isCollapsed && (
          <motion.div 
            className="mt-8 p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
            <p className="text-purple-100 text-sm mb-3">
              Unlock advanced features and unlimited resumes
            </p>
            <Button 
              variant="glass" 
              size="sm" 
              className="w-full bg-white/20 hover:bg-white/30 border-white/30"
            >
              Upgrade Now
            </Button>
          </motion.div>
        )}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 -right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-full"
          onClick={onToggle}
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
    </motion.div>
  );
};

export default Sidebar;