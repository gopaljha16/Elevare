import React, { useState, useEffect } from 'react';

const ImageCarousel = ({ interval = 2000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Beautiful Unsplash images for the carousel
  const backgrounds = [
    {
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Capturing Moments,',
      subtitle: 'Creating Memories'
    },
    {
      image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Build Your Future,',
      subtitle: 'Start Today'
    },
    {
      image: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Dream Big,',
      subtitle: 'Achieve More'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === backgrounds.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [backgrounds.length, interval]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <img
            src={bg.image}
            alt={`${bg.title} ${bg.subtitle}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-purple-800/60 to-transparent"></div>
          
          {/* Additional dark overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      ))}
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-start p-12 text-white z-10">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {backgrounds[currentIndex].title}<br />
            {backgrounds[currentIndex].subtitle}
          </h1>
          
          {/* Dots Indicator */}
          <div className="flex space-x-2 mt-8">
            {backgrounds.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;