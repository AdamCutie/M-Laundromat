import React, { useState, useEffect } from 'react';
import settingService from '../services/settingService';
import { Megaphone, X } from 'lucide-react';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState({ text: '', show: false });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingService.getSettings();
      setAnnouncement({
        text: data.announcementText || "",
        show: data.showAnnouncement ?? true
      });
    } catch (error) {
      console.error("Failed to load announcement", error);
    }
  };

  if (!announcement.show || !isVisible) return null;

  return (
    <div className="relative z-40 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-inner flex items-center overflow-hidden">
      
      {/* 1. LEFT: Icon Badge 
          - Uses a semi-transparent dark background for contrast
          - Adds a "NEWS" badge on larger screens
      */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-3 bg-black/10 backdrop-blur-sm border-r border-white/10 shadow-sm">
        <Megaphone className="w-4 h-4 text-yellow-300 animate-pulse shrink-0" />
        <span className="hidden sm:block ml-2 text-[10px] font-bold tracking-wider uppercase bg-white/20 px-1.5 py-0.5 rounded text-white border border-white/10">
          News
        </span>
      </div>

      {/* 2. CENTER: Scrolling Text 
          - 'pl-16' ensures text starts after the icon on mobile
      */}
      <div className="w-full flex items-center overflow-hidden h-full">
        <div className="animate-marquee whitespace-nowrap flex items-center text-xs sm:text-sm font-medium tracking-wide">
           {/* Spacer to prevent text from appearing underneath the left icon initially */}
           <span className="w-screen sm:w-[50vw] inline-block"></span>
           
           {announcement.text}
           
           {/* Optional: Add the text again for a loop effect if you adjust CSS later */}
           {/* <span className="mx-8 text-white/40">•</span> {announcement.text} */}
        </div>
      </div>

      {/* 3. RIGHT: Close Button 
          - Semi-transparent hover effect
      */}
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-0 top-0 bottom-0 z-20 px-3 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-sm border-l border-white/10"
        aria-label="Close announcement"
      >
        <X className="w-4 h-4 text-white/90" />
      </button>

      {/* Decorative Shine Effect (Optional) */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-white/5 to-transparent"></div>
    </div>
  );
}