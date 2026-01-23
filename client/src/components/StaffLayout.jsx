import React from 'react';
import Logo from './Logo'; // ✅ Import Logo
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, ClipboardList, LogOut, WashingMachine } from 'lucide-react'; // Removed Sparkles

const navItems = [
  { path: '/staff/dashboard', icon: ShoppingCart, label: 'Point of Sale' },
  { path: '/staff/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/staff/machines', icon: WashingMachine, label: 'Machine Status' }, // Added this back for full functionality
];

export default function StaffLayout({ children, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        
        {/* ✅ FIXED: Sidebar Header with Centered Logo */}
        <div className="py-6 border-b border-gray-200 flex flex-col items-center justify-center text-center">
          <Link to="/staff/dashboard">
            <Logo /> 
          </Link>
          <p className="text-xs text-gray-500 mt-3 font-medium tracking-wider uppercase">
            Staff Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600 font-medium' // Kept Emerald theme for Staff
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
            <p className="text-sm font-medium">{user?.username || 'Staff'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'No Email'}</p>
            <p className="text-xs text-emerald-600 mt-1 font-semibold">Staff Member</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'Staff Panel'}
            </h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}