import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onToggleForm={toggleForm} />
          ) : (
            <SignupForm onToggleForm={toggleForm} />
          )}
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800"></div>
        
        {/* Geometric Shapes */}
        <div className="absolute inset-0">
          {/* Large circles */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-purple-400 rounded-full opacity-20"></div>
          <div className="absolute bottom-32 left-16 w-48 h-48 bg-blue-400 rounded-full opacity-15"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-indigo-300 rounded-full opacity-25"></div>
          
          {/* Rectangles */}
          <div className="absolute top-1/4 left-1/4 w-16 h-24 bg-cyan-400 opacity-30 transform rotate-12"></div>
          <div className="absolute bottom-1/4 right-1/3 w-20 h-16 bg-teal-400 opacity-25 transform -rotate-12"></div>
          
          {/* Triangles */}
          <div className="absolute top-1/3 right-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-yellow-400 opacity-40"></div>
          <div className="absolute bottom-1/3 left-1/3 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-blue-300 opacity-35"></div>
          
          {/* Lines and patterns */}
          <div className="absolute top-1/2 left-1/2 w-32 h-1 bg-white opacity-20 transform -rotate-45"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-1 bg-cyan-300 opacity-30 transform rotate-45"></div>
          
          {/* Dots pattern */}
          <div className="absolute bottom-1/2 right-1/6">
            <div className="grid grid-cols-4 gap-2">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white rounded-full opacity-20"></div>
              ))}
            </div>
          </div>
          
          {/* Sun/Star shape */}
          <div className="absolute top-3/4 left-1/4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-yellow-400 transform rotate-45 opacity-60"></div>
              <div className="absolute inset-2 bg-yellow-300 transform rotate-45 opacity-80"></div>
            </div>
          </div>
          
          {/* Wave patterns */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>
          
          {/* Additional geometric elements */}
          <div className="absolute top-1/6 left-1/2 w-8 h-8 border-2 border-white opacity-25 transform rotate-45"></div>
          <div className="absolute bottom-1/6 right-1/2 w-6 h-6 bg-pink-400 opacity-35 transform rotate-12"></div>
          
          {/* Gradient overlays */}
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-purple-300 to-transparent opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-400 to-transparent opacity-15"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;