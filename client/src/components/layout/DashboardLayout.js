import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'machines', label: 'Machine Monitor', icon: '🛁' },
    { id: 'orders', label: 'Order History', icon: '📜' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'staff', label: 'Staff Management', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>M</div>
        <span>M-Laundromat</span>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div style={{ paddingLeft: '10px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6B7280', fontWeight: 'bold', marginBottom: '5px' }}>
          Menu
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'white' }}>{user?.username}</div>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Administrator</div>
          </div>
        </div>
        
        <button 
          onClick={logout} 
          className="btn btn-danger btn-block btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;