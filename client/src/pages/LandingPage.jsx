import React, { useState } from 'react';
import { WashingMachine, Clock, Smartphone, ShieldCheck, ArrowRight, Menu, X } from 'lucide-react';

import Login from '../components/Login'; 
import Register from '../components/Register';
import logo from '../assets/logo.png';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Dual Modal State: 'login', 'register', or null
  const [activeModal, setActiveModal] = useState(null); 

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
          <div className="flex justify-between items-center h-16">
            
            {/* --- HYBRID LOGO: Clickable Div (Scrolls to Top) --- */}
            <div 
              onClick={() => {
                closeModal(); // 1. Close modals
                window.scrollTo({ top: 0, behavior: 'smooth' }); // 2. Scroll to top
              }} 
              className="flex items-center gap-3 select-none cursor-pointer group"
            >
              
              {/* 1. The Character Image */}
              <img 
                src={logo} 
                alt="M Laundro-Mat" 
                className="w-12 h-12 rounded-full border-2 border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-300" 
              />

              {/* 2. The Modern Wordmark */}
              <span className="font-[Outfit,sans-serif] text-2xl font-extrabold tracking-tight text-gray-900">
                M-Laundr
                {/* The "o" matches the cyan in your image background */}
                <span className="text-cyan-500 inline-block group-hover:animate-bounce">o</span>
                -Mat
              </span>
              
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
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
            <a href="#features" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>How it Works</a>
            <hr />
            
            <button 
              onClick={openLogin}
              className="block w-full text-left text-indigo-600 font-bold"
            >
              Log In
            </button>
            
            <button 
              onClick={openRegister}
              className="block w-full text-center bg-indigo-600 text-white px-5 py-3 rounded-lg font-bold"
            >
              Sign Up Now
            </button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            <span className="text-xs font-bold text-indigo-900 tracking-wide uppercase">New: Smart Tracking v2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Laundry Day, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Modernized.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the future of laundry with real-time tracking, seamless payments, and smart notifications. No more waiting in line.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Create Account Button */}
            <button 
              onClick={openRegister}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Create Account <ArrowRight className="w-5 h-5" />
            </button>
            
            {/* Login Button */}
            <button 
              onClick={openLogin}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
            >
              Log In
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-200 pt-8 opacity-70">
            <div>
              <p className="text-3xl font-bold text-indigo-600">500+</p>
              <p className="text-sm text-gray-500">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-600">12k</p>
              <p className="text-sm text-gray-500">Loads Washed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-600">24/7</p>
              <p className="text-sm text-gray-500">Smart Lockers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-600">4.9</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose M-Laundromat?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We combine premium cleaning technology with a seamless digital experience to give you back your weekends.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-lg">
              <WashingMachine className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block">M Laundro-Mat</span>
              <span className="text-xs text-gray-400">© 2026 All rights reserved.</span>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-400">
            {/* ✅ Fixed anchor warnings by using valid paths */}
            <a href="/" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}