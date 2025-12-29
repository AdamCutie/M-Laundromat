import React, { useState } from 'react';
// This import will work now that you created the file in Step 1
import AdminSidebar from '../layout/AdminSidebar'; 

// Import Feature Components
import Analytics from '../Analytics';
import MachineDashboard from '../MachineDashboard';
import OrderList from '../OrderList';
import InventoryManager from '../InventoryManager';
import StaffManager from '../StaffManager';
import SettingsPanel from '../SettingsPanel';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Analytics />;
      case 'machines': return <MachineDashboard />;
      case 'orders': return <OrderList />;
      case 'inventory': return <InventoryManager />;
      case 'staff': return <StaffManager />;
      case 'settings': return <SettingsPanel />;
      default: return <Analytics />;
    }
  };

  const titles = {
    dashboard: "Business Overview",
    machines: "Machine Status Monitor",
    orders: "Transaction History",
    inventory: "Inventory Management",
    staff: "Staff & User Accounts",
    settings: "System Configuration"
  };

  return (
    <div className="admin-layout">
      {/* 1. The Fixed Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. The Main Content Area */}
      <main className="main-content">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#1F2937' }}>
              {titles[activeTab]}
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#6B7280' }}>
              Admin Control Panel • {new Date().toLocaleDateString()}
            </p>
          </header>

          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '25px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            border: '1px solid #E5E7EB',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            {renderContent()}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;