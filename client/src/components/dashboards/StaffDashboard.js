// client/src/components/dashboards/StaffDashboard.js
import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

// Staff Components (POS Operations)
import StaffAttendance from '../StaffAttendance';
import OrderForm from '../OrderForm';
import OrderList from '../OrderList';
import MachineDashboard from '../MachineDashboard';

/**
 * STAFF DASHBOARD
 * Point-of-Sale and order management interface
 */
const StaffDashboard = () => {
  const { logout, user } = useContext(AuthContext);

  return (
    <div style={{ 
      padding: '30px', 
      maxWidth: '900px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        backgroundColor: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
      }}>
        <div>
          <h1 style={{ color: '#0056b3', margin: 0, fontSize: '24px' }}>
            🌊 M-Laundromat POS
          </h1>
          <p style={{ margin: '3px 0 0 0', color: '#666', fontSize: '14px' }}>
            Staff Terminal
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ 
              backgroundColor: '#28a745', 
              color: 'white', 
              padding: '3px 10px', 
              borderRadius: '15px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              STAFF
            </span>
          </div>
          <span style={{ marginRight: '10px', fontSize: '14px' }}>
            {user?.username}
          </span>
          <button 
            onClick={logout} 
            style={{ 
              padding: '6px 12px', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer',
              borderRadius: '5px',
              fontSize: '13px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Attendance Tracking */}
      <StaffAttendance />

      {/* Machine Status Monitor */}
      <div style={{ marginTop: '20px' }}>
        <MachineDashboard />
      </div>

      {/* Point of Sale - Create New Order */}
      <div style={{ marginTop: '20px' }}>
        <OrderForm />
      </div>

      {/* Active Orders List */}
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ 
          backgroundColor: 'white', 
          padding: '12px 15px', 
          borderRadius: '10px',
          margin: '0 0 10px 0',
          fontSize: '18px'
        }}>
          📋 Active Orders
        </h2>
        <OrderList />
      </div>
    </div>
  );
};

export default StaffDashboard;

// ============================================
// STAFF CAPABILITIES:
// ============================================
// ✅ Clock in/out (attendance tracking)
// ✅ Create new orders (POS)
// ✅ Update order status (workflow)
// ✅ Monitor machine availability
// ❌ Cannot manage staff
// ❌ Cannot change prices
// ❌ Cannot modify inventory