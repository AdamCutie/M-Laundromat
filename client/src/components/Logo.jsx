import React from 'react';
import logo from '../assets/logo.png'; 

export default function Logo({ className = "" }) {
  return (
    // ✅ 1. Changed 'flex' to 'flex flex-col' to stack them vertically
    // ✅ 2. Reduced 'gap-3' to 'gap-1' so the text sits closer to the image
    <div className={`flex flex-col items-center gap-1 select-none cursor-pointer group ${className}`}>
      
      {/* 2. The Character Image */}
      <img 
        src={logo} 
        alt="M Laundro-Mat" 
        className="w-12 h-12 rounded-full border-2 border-indigo-100 shadow-sm transform transition-transform duration-300 group-hover:scale-110" 
      />

      {/* 3. The Modern Wordmark */}
      <span className="font-[Outfit,sans-serif] text-xl font-extrabold tracking-tight text-gray-900">
        M-Laundr
        <span className="text-cyan-500 inline-block group-hover:animate-bounce">o</span>
        -Mat
      </span>
      
    </div>
  );
}