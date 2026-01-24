import React, { useState } from 'react';
import Logo from './Logo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Boxes, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Menu, 
  X 
} from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Users & Staff' },
  { path: '/admin/machines', icon: Boxes, label: 'Machines' },
  { path: '/admin/inventory', icon: Package, label: 'Inventory' },
  { path: '/admin/reports', icon: ReportsPlaceholder, label: 'Reports' }, 
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

// Helper for the report icon
function ReportsPlaceholder(props) { return <FileText {...props} />; }

export default function AdminLayout({ children, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* ✅ MOBILE HEADER 
        - Visible only on mobile (md:hidden)
        - Uses 'horizontal' logo to fit better
      */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <Link to="/admin/dashboard" onClick={() => setIsSidebarOpen(false)}>
            {/* Optimized for small header height */}
            <Logo variant="horizontal" iconSize="w-8 h-8" textSize="text-lg" />
        </Link>
        
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* ✅ MOBILE OVERLAY BACKDROP */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
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
        <div className="py-6 border-b border-gray-200 flex flex-col items-center justify-center text-center relative bg-gray-50/50">
          {/* Close button (Mobile only) */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          <Link to="/admin/dashboard" onClick={() => setIsSidebarOpen(false)} className="mt-2">
            {/* Standard vertical logo for Sidebar */}
            <Logo variant="vertical" /> 
          </Link>
          
          <p className="text-xs text-gray-400 mt-4 font-semibold tracking-widest uppercase">
            Admin Panel
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
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
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

      {/* ✅ MAIN CONTENT WRAPPER 
        - md:ml-64: Pushes content right on desktop
        - w-full: Takes full width on mobile
      */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
        
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20 justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {user?.username || 'Admin'}
            </p>
          </div>
          <div className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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