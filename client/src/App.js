import React from 'react';
import './App.css';
// Import the component we just built
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import InventoryManager from './components/InventoryManager';
import MachineDashboard from './components/MachineDashboard';
import Analytics from './components/Analytics';

function App() {
  return (
    <div className="App" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🌊 M-Laundromat System</h1>

      {/* 1. ANALYTICS (Money First!) */}
      <Analytics />
      <br />
      
      {/* 1. MACHINE DASHBOARD (New!) */}
      <MachineDashboard />
      
      <br />
      
      {/* 1. ORDER FORM */}
      <OrderForm />
      <br />

      {/* 2. INVENTORY MANAGER (New!) */}
      <InventoryManager />

      <hr style={{ margin: '40px 0' }} />
      
      {/* Render the OrderList Component here */}
      <OrderList />
    </div>
  );
}

export default App;