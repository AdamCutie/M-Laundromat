import React from 'react';
import logo from '../assets/logo.png'; 

export default function Logo({ 
  className = "", 
  variant = "vertical", // Options: 'vertical' (default) or 'horizontal'
  iconSize = "w-12 h-12", // Allow overriding size
  textSize = "text-xl"    // Allow overriding text size
}) {
  
  // Determine layout direction based on variant
  const layoutClass = variant === 'horizontal' 
    ? "flex-row" 
    : "flex-col";

  return (
    <div className={`flex ${layoutClass} items-center gap-2 select-none cursor-pointer group ${className}`}>
      
      {/* The Character Image */}
      <img 
        src={logo} 
        alt="M Laundro-Mat" 
        className={`${iconSize} rounded-full border-2 border-indigo-100 shadow-sm transform transition-transform duration-300 group-hover:scale-110`} 
      />

      {/* The Modern Wordmark */}
      <span className={`font-[Outfit,sans-serif] ${textSize} font-extrabold tracking-tight text-gray-900`}>
        M Laundr
        <span className="text-cyan-500 inline-block group-hover:animate-bounce">o</span>
        -Mat
      </span>
      
    </div>
  );
}