import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, User, LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';
import ChatWidget from '../components/ChatWidget';
import AnnouncementBar from '../components/AnnouncementBar';

const navItems = [
  { path: '/customer/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/customer/orders', icon: ClipboardList, label: 'My Orders' },
  { path: '/customer/profile', icon: User, label: 'Profile' },
];

export default function CustomerLayout({ children, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* =========================================================
          TOP NAVIGATION BAR (Sticky)
      ========================================================== */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* 1. LEFT: Hamburger (Mobile) & Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <Link to="/customer/dashboard" className="flex items-center gap-2">
                <Logo variant="horizontal" iconSize="w-8 h-8 md:w-9 md:h-9" textSize="text-lg md:text-xl" />
              </Link>
            </div>

            {/* 2. RIGHT: Desktop Navigation (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-6">
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
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="h-6 w-px bg-gray-200 mx-2"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
            
            {/* Mobile Profile Icon (Optional Placeholder if needed) */}
             <div className="md:hidden">
                <Link to="/customer/profile" className="p-2 text-gray-600">
                    <User className="w-6 h-6" />
                </Link>
             </div>

          </div>
        </div>

        {/* ✅ ADD ANNOUNCEMENT BAR HERE (Top of everything) */}
      <AnnouncementBar />
      
      </nav>

      {/* =========================================================
          MOBILE SLIDE-IN MENU (Left Side - Same as Admin)
      ========================================================== */}
      
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl flex flex-col
        transform transition-transform duration-300 ease-in-out md:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Drawer Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
          <Logo variant="horizontal" iconSize="w-7 h-7" textSize="text-lg" />
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Drawer Links */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            
            {/* User Info Card */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="font-semibold text-gray-900 truncate">{user?.username || 'Customer'}</p>
              <p className="text-xs text-indigo-600 font-medium">Active Member</p>
            </div>

            {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-all font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN CONTENT AREA
      ========================================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in overflow-x-hidden">
        {children}
      </main>

      {/* ✅ FIX: Wrap ChatWidget in a div that hides it when menu is open.
        - `md:block`: Always show on desktop
        - `hidden`: Hide on mobile IF menu is open
      */}
      <div className={isMobileMenuOpen ? 'hidden md:block' : 'block'}>
         <ChatWidget />
      </div>
      
    </div>
  );
}