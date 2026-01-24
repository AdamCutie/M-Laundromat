import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, User, LogOut } from 'lucide-react';
import logo from '../assets/logo.png'; // ✅ Importing image directly

const navItems = [
  { path: '/customer/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/customer/orders', icon: ClipboardList, label: 'My Orders' },
  { path: '/customer/profile', icon: User, label: 'Profile' },
];

export default function CustomerLayout({ children, user, onLogout }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* --- LOGO SECTION --- */}
            {/* ✅ Changed div to Link, removed onClick scroll, points to Dashboard */}
            <Link 
              to="/customer/dashboard" 
              className="flex items-center gap-3 select-none cursor-pointer group"
            >
              
              {/* 1. The Character Image */}
              <img 
                src={logo} 
                alt="M Laundro-Mat" 
                className="w-10 h-10 rounded-full border-2 border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-300" 
              />

              {/* 2. The Modern Wordmark */}
              <span className="font-[Outfit,sans-serif] text-xl font-extrabold tracking-tight text-gray-900">
                M Laundr
                {/* The "o" matches the cyan in your image background */}
                <span className="text-cyan-500 inline-block group-hover:animate-bounce">o</span>
                -Mat
              </span>
              
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2 sm:gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}

              <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}