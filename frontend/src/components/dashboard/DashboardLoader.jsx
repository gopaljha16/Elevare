import React from 'react';
import { Spinner } from '../ui/LoadingOverlay';

const DashboardLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b3a] via-[#2d1b69] to-[#1a1b3a] flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Loading Animation */}
        <div className="w-20 h-20 bg-gradient-to-r from-[#ff6b6b] to-[#a855f7] rounded-2xl flex items-center justify-center mx-auto">
          <Spinner size="xl" color="white" />
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Loading Dashboard...
          </h2>
          <p className="text-gray-300 text-sm">
            Setting up your personalized experience
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-[#ff6b6b] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[#ff6b6b] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-[#a855f7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoader;