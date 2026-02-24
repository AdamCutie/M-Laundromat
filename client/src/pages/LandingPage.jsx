import React, { useState } from 'react';
import { WashingMachine, Clock, Smartphone, ShieldCheck, ArrowRight, Menu, X } from 'lucide-react';
import Logo from '../components/Logo'; // ✅ Using shared Logo component
import Login from '../components/Login'; 
import Register from '../components/Register';
import ChatWidget from '../components/ChatWidget';
import VideoBackground from '../components/common/VideoBackground';

// Import the video as a React asset
import heroVideo from '../assets/Laundromat_Video_Montage_Prompts.mp4';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Dual Modal State: 'login', 'register', or null
  const [activeModal, setActiveModal] = useState(null); 

  // --- VIDEO CONFIGURATION ---
  const HERO_VIDEO_URL = heroVideo;

  const openLogin = () => {
    setActiveModal('login');
    setIsMenuOpen(false);
  };

  const openRegister = () => {
    setActiveModal('register');
    setIsMenuOpen(false);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleScrollToTop = () => {
    closeModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative">
      
      {/* =========================================
          SHARED MODAL OVERLAY 
      ========================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'login' && (
              <Login 
                isModal={true} 
                onSwitchToRegister={() => setActiveModal('register')} 
              />
            )}
            
            {activeModal === 'register' && (
              <Register 
                isModal={true} 
                onSwitchToLogin={() => setActiveModal('login')} 
              />
            )}
            
          </div>
        </div>
      )}

      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* LOGO */}
            <div onClick={handleScrollToTop}>
               <Logo variant="horizontal" iconSize="w-10 h-10" textSize="text-xl" />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">How it Works</a>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={openLogin}
                  className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                >
                  Log In
                </button>

                <button 
                  onClick={openRegister}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl absolute w-full">
            <a href="#features" className="block text-gray-600 font-medium p-2" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-gray-600 font-medium p-2" onClick={() => setIsMenuOpen(false)}>How it Works</a>
            <hr className="border-gray-100" />
            
            <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={openLogin}
                  className="block w-full text-center text-indigo-600 font-bold border border-indigo-100 py-3 rounded-xl hover:bg-indigo-50"
                >
                  Log In
                </button>
                
                <button 
                  onClick={openRegister}
                  className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md active:scale-95"
                >
                  Sign Up
                </button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[85vh] flex items-center justify-center">
        
        {/* Reusable Video Component */}
        <VideoBackground 
          videoSrc={HERO_VIDEO_URL} 
          brightness={0.7} 
        />

        <div className="max-w-7xl mx-auto text-center relative z-10 px-4">
          
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-4 py-1.5 mb-8 shadow-2xl animate-fade-in-down">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white tracking-wide uppercase drop-shadow-md">New: Smart Tracking v2.0</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight drop-shadow-2xl">
            Laundry Day, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Modernized.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed px-4 font-medium drop-shadow-lg">
            Experience the future of laundry with real-time tracking, seamless payments, and smart notifications. No more waiting in line.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0">
            {/* Create Account Button */}
            <button 
              onClick={openRegister}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-95"
            >
              Create Account <ArrowRight className="w-5 h-5" />
            </button>
            
            {/* Login Button */}
            <button 
              onClick={openLogin}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all active:scale-95 shadow-xl"
            >
              Log In
            </button>
          </div>

          {/* Stats with Glassmorphism */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/20 pt-8 max-w-4xl mx-auto">
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-2xl md:text-3xl font-bold text-blue-300">500+</p>
              <p className="text-sm text-white/80 font-medium">Happy Customers</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-2xl md:text-3xl font-bold text-blue-300">12k</p>
              <p className="text-sm text-white/80 font-medium">Loads Washed</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-2xl md:text-3xl font-bold text-blue-300">24/7</p>
              <p className="text-sm text-white/80 font-medium">Smart Lockers</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-2xl md:text-3xl font-bold text-blue-300">4.9</p>
              <p className="text-sm text-white/80 font-medium">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose M Laundromat?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              We combine premium cleaning technology with a seamless digital experience to give you back your weekends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={Smartphone} 
              title="Real-Time Tracking" 
              desc="Track your laundry status from 'Washing' to 'Ready for Pickup' directly from your phone."
            />
            <FeatureCard 
              icon={Clock} 
              title="Fast Turnaround" 
              desc="Get your clothes back fresh and folded in as little as 24 hours with our Express Service."
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Hygienic & Safe" 
              desc="We use premium detergents and sanitize every machine before use for your safety."
            />
          </div>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo variant="horizontal" iconSize="w-8 h-8" textSize="text-xl text-white" />
            <span className="text-xs text-gray-500 mt-2">© 2026 M Laundro-Mat. All rights reserved.</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm md:text-base">{desc}</p>
    </div>
  );
}