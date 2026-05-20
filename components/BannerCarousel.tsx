'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Saksham Event-themed banners
  const banners = [
    {
      id: 1,
      title: 'NICSI Saksham',
      subtitle: 'Empowering Digital India Through Skilled IT Professionals',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop',
      gradient: 'from-blue-600 to-blue-800',
      link: '#',
    },
    {
      id: 2,
      title: 'Saksham Platform',
      subtitle: 'Transforming Government Digital Infrastructure',
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&h=400&fit=crop',
      gradient: 'from-orange-500 to-orange-700',
      link: '#',
    },
    {
      id: 3,
      title: 'Skill Development',
      subtitle: 'Building IT Capacity for Government Projects',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop',
      gradient: 'from-green-600 to-green-800',
      link: '#',
    },
    {
      id: 4,
      title: 'Digital Transformation',
      subtitle: 'Innovating Government Services Through Technology',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
      gradient: 'from-purple-600 to-purple-800',
      link: '#',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Auto-rotate every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (

    <div className="relative w-full lg:max-w-7xl 2xl:max-w-8xl mx-auto w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] mb-8 rounded-lg overflow-hidden shadow-lg border-2 border-gray-300">
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div
              className={`w-full h-full bg-gradient-to-r ${banner.gradient} flex items-center justify-center text-white relative`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${banner.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="text-center px-4 z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl drop-shadow-md">
                  {banner.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all z-20"
        aria-label="Previous banner"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all z-20"
        aria-label="Next banner"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
              ? 'bg-white w-8'
              : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Government Badge Overlay */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-md z-20">
        <span className="text-xs font-bold text-gray-800">भारत सरकार</span>
      </div>
    </div>
  );
};
