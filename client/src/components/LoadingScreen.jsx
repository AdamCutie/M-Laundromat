import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      
      {/* Central Bubble Cluster Container */}
      <div className="relative w-32 h-32 mb-4">
        
        {/* Large Main Bubble */}
        <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-gradient-to-tr from-blue-100 to-blue-500/10 border border-blue-200 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)] animate-float-slow">
          {/* Shine/Reflection */}
          <div className="absolute top-4 left-4 w-6 h-3 bg-white/60 rounded-full rotate-45 blur-[1px]"></div>
        </div>

        {/* Medium Left Bubble */}
        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-gradient-to-tr from-blue-100 to-blue-400/10 border border-blue-200 shadow-inner animate-float-medium">
           <div className="absolute top-3 left-3 w-4 h-2 bg-white/60 rounded-full rotate-45 blur-[1px]"></div>
        </div>

        {/* Small Right Bubble */}
        <div className="absolute top-2 right-0 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-100 to-blue-300/10 border border-blue-200 shadow-inner animate-float-fast">
           <div className="absolute top-2 left-2 w-3 h-1.5 bg-white/60 rounded-full rotate-45 blur-[1px]"></div>
        </div>

        {/* Tiny popping bubbles */}
        <div className="absolute -top-4 left-1/2 w-6 h-6 rounded-full bg-blue-100/50 border border-blue-200 animate-pop-1 opacity-0"></div>
        <div className="absolute -bottom-2 right-0 w-4 h-4 rounded-full bg-blue-100/50 border border-blue-200 animate-pop-2 opacity-0"></div>

      </div>

      <h2 className="text-xl font-bold text-blue-500 tracking-widest animate-pulse">
        WASHING...
      </h2>

      {/* CSS Styles for the Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(5px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-8px) translateX(-5px); }
        }
        @keyframes popUp {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
        }

        .animate-float-slow {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-reverse 3s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float 2.5s ease-in-out infinite;
        }
        .animate-pop-1 {
          animation: popUp 2s ease-out infinite;
          animation-delay: 0.5s;
        }
        .animate-pop-2 {
          animation: popUp 3s ease-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}