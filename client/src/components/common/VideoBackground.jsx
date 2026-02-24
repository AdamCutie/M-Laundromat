import React from 'react';

/**
 * A reusable background video component with customizable overlays.
 * @param {string} videoSrc - The URL of the video (mp4 recommended).
 * @param {number} brightness - (Optional) 0 to 1 for video brightness. Default 0.9.
 * @param {React.ReactNode} children - (Optional) Content to display on top of the video.
 */
const VideoBackground = ({ 
  videoSrc, 
  brightness = 0.9, 
  children 
}) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Video Element */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover transition-opacity duration-1000"
        style={{ filter: `brightness(${brightness})` }}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay for Contrast */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Subtle Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
      
      {/* Content Overlay */}
      {children && (
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default VideoBackground;
