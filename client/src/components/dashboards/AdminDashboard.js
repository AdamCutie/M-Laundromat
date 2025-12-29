// client/src/components/dashboards/AdminDashboard.js
import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

// Admin Components (Full Access)
import Analytics from '../Analytics';
import OrderList from '../OrderList';
import InventoryManager from '../InventoryManager';
import MachineDashboard from '../MachineDashboard';
import StaffManager from '../StaffManager';
import SettingsPanel from '../SettingsPanel'; // You'll need to create this

/**
 * ADMIN DASHBOARD
 * Full system access and management capabilities
 */
const AdminDashboard = () => {
  const { logout, user } = useContext(AuthContext);

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ color: '#0056b3', margin: 0 }}>
            🔧 Admin Control Panel
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            M-Laundromat Management System
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ 
              backgroundColor: '#dc3545', 
              color: 'white', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ADMIN
            </span>
          </div>
          <span style={{ marginRight: '10px', color: '#666' }}>
            {user?.username}
          </span>
          <button 
            onClick={logout} 
            style={{ 
              padding: '8px 16px', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer',
              borderRadius: '5px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gap: '20px' }}>
        
        {/* Analytics Section */}
        <section>
          <Analytics />
        </section>

        {/* Machine Monitoring */}
        <section>
          <MachineDashboard />
        </section>

        {/* Inventory Management */}
        <section>
          <InventoryManager />
        </section>

        {/* Staff Management */}
        <section>
          <StaffManager />
        </section>

        {/* System Settings (Price Management) */}
        <section>
          <SettingsPanel />
        </section>

        {/* Order History (Read-only for admin) */}
        <section>
          <h2 style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '10px',
            marginBottom: '10px'
          }}>
            📊 All Orders (View Only)
          </h2>
          <OrderList />
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;

// ============================================
// ADMIN CAPABILITIES:
// ============================================
// ✅ View real-time revenue analytics
// ✅ Monitor all machines
// ✅ Manage inventory (add/edit/restock)
// ✅ Manage staff accounts
// ✅ Change system prices
// ✅ View all orders (but doesn't create them - that's staff's job)
// ✅ Generate reports