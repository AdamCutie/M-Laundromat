import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Boxes, 
  Package, 
  FileText, 
  Settings, 
  LogOut,
  Sparkles 
} from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Users & Staff' },
  { path: '/admin/machines', icon: Boxes, label: 'Machines' },
  { path: '/admin/inventory', icon: Package, label: 'Inventory' },
  { path: '/admin/reports', icon: ReportsPlaceholder, label: 'Reports' }, // Placeholder function below
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

// Helper for the report icon to avoid errors if not imported
function ReportsPlaceholder(props) { return <FileText {...props} />; }

export default function AdminLayout({ children, user, onLogout }) {
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
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="w-6 h-6" />
            <span className="font-bold text-lg">Laundromat v2</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
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
            <p className="text-sm font-medium">{user?.username || 'Admin'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
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

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
            </h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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