import React, { useState } from 'react';
import Logo from './Logo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  ClipboardList, 
  LogOut, 
  WashingMachine, 
  Menu, // ✅ Added for Mobile
  X     // ✅ Added for Close Button
} from 'lucide-react';

const navItems = [
  { path: '/staff/dashboard', icon: ShoppingCart, label: 'Point of Sale' },
  { path: '/staff/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/staff/machines', icon: WashingMachine, label: 'Machine Status' },
];

export default function StaffLayout({ children, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ Mobile State

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* ✅ MOBILE HEADER (Visible only on small screens) */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <Link to="/staff/dashboard" onClick={() => setIsSidebarOpen(false)}>
           {/* Horizontal Logo for mobile header */}
           <Logo variant="horizontal" iconSize="w-8 h-8" textSize="text-lg" />
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* ✅ MOBILE OVERLAY (Backdrop) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ✅ RESPONSIVE SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg md:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        
        {/* Sidebar Header */}
        <div className="py-6 border-b border-gray-200 flex flex-col items-center justify-center text-center relative bg-emerald-50/30">
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <Link to="/staff/dashboard" onClick={() => setIsSidebarOpen(false)}>
            <Logo variant="vertical" /> 
          </Link>
          <p className="text-xs text-gray-500 mt-3 font-medium tracking-wider uppercase">
            Staff Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)} // Close on click
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600 shadow-sm' // Kept Emerald theme
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="px-4 py-3 bg-white border border-gray-100 rounded-lg mb-2 shadow-sm">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.username || 'Staff'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'No Email'}</p>
            <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-xs text-emerald-600 font-semibold">Active Staff</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent w-full transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ✅ MAIN CONTENT WRAPPER */}
      {/* md:ml-64 ensures it only pushes right on desktop */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
        
        {/* Top Header (Desktop Only) */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20 justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'Staff Panel'}
            </h1>
          </div>
          <div className="text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}