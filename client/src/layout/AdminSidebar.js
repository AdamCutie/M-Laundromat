// client/src/components/layout/AdminSidebar.js
import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'machines', label: 'Machine Monitor', icon: '🛁' },
    { id: 'orders', label: 'Transaction Logs', icon: '📜' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'staff', label: 'Staff & Users', icon: '👥' },
    { id: 'settings', label: 'Pricing Settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div style={{ 
          width: '32px', height: '32px', 
          background: '#4F46E5', borderRadius: '8px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: '18px' 
        }}>M</div>
        <span>M-Laundromat</span>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div style={{ paddingLeft: '10px', fontSize: '11px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 'bold', marginBottom: '10px', letterSpacing: '1px' }}>
          Main Menu
        </div>
        
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            background: '#374151', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', color: 'white', fontWeight: 'bold' 
          }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>{user?.username}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Administrator</div>
          </div>
        </div>
        
        <button 
          onClick={logout} 
          style={{ 
            width: '100%', padding: '8px', 
            background: '#EF4444', color: 'white', border: 'none', 
            borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;