/**
 * UpgradePrompt Component
 * Displays when users hit their usage limits
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import {
  SparklesIcon,
  RocketLaunchIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const UpgradePrompt = ({ 
  isOpen, 
  onClose, 
  feature = 'this feature',
  creditsNeeded = 1,
  creditsRemaining = 0,
  currentPlan = 'free'
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Upgrade to Continue
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
            You've used all your AI credits for this month. Upgrade to Pro for more credits and unlimited features.
          </p>

          {/* Credit info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Credits needed</span>
              <span className="font-medium text-gray-900 dark:text-white">{creditsNeeded}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Credits remaining</span>
              <span className="font-medium text-red-500">{creditsRemaining}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current plan</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{currentPlan}</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <RocketLaunchIcon className="w-4 h-4 text-pink-500" />
              <span>100 AI credits per month</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <RocketLaunchIcon className="w-4 h-4 text-pink-500" />
              <span>Unlimited resume creation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <RocketLaunchIcon className="w-4 h-4 text-pink-500" />
              <span>Premium templates & features</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              variant="primary"
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
            >
              Upgrade Now
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Inline upgrade banner for embedding in pages
 */
export const UpgradeBanner = ({ 
  message = "Upgrade to Pro for unlimited access",
  compact = false 
}) => {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-pink-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{message}</span>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-pink-500 to-purple-600"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
          <SparklesIcon className="w-6 h-6 text-pink-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Unlock More Features
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {message}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/subscription')}
            className="bg-gradient-to-r from-pink-500 to-purple-600"
          >
            View Plans
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Credit display component
 */
export const CreditDisplay = ({ credits, total, showUpgrade = true }) => {
  const navigate = useNavigate();
  const percentage = total > 0 ? (credits / total) * 100 : 0;
  const isLow = percentage < 20;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">AI Credits</span>
          <span className={`text-xs font-medium ${isLow ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
            {credits} / {total === -1 ? '∞' : total}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all ${
              isLow ? 'bg-red-500' : 'bg-pink-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      {showUpgrade && isLow && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/subscription')}
          className="text-pink-500 hover:text-pink-600"
        >
          Upgrade
        </Button>
      )}
    </div>
  );
};

export default UpgradePrompt;
