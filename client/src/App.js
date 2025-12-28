// 1. IMPORT useContext HERE
import React, { useContext } from 'react'; 
import './App.css';

// 2. IMPORT THE CONTEXT HERE
import AuthContext, { AuthProvider } from './context/AuthContext'; 

// Import Components
import Login from './components/Login';
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import InventoryManager from './components/InventoryManager';
import MachineDashboard from './components/MachineDashboard';
import Analytics from './components/Analytics';
import StaffAttendance from './components/StaffAttendance';
import StaffManager from './components/StaffManager';

// Create a component to hold the main dashboard
const Dashboard = () => {
  const { logout, user } = useContext(AuthContext);

  return (
    <div className="App" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#0056b3', margin: 0 }}>🌊 M-Laundromat</h1>
        <div>
          <span style={{ marginRight: '10px' }}>Hello, <strong>{user?.username}</strong></span>
          <button onClick={logout} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* 1. ATTENDANCE (New!) */}
      <StaffAttendance />
      
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

      {/* NEW: Staff Management */}
      <StaffManager />

      <hr style={{ margin: '40px 0' }} />
      
      {/* Render the OrderList Component here */}
      <OrderList />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainScreen />
    </AuthProvider>
  );
}

// A small helper component to decide what to show
const MainScreen = () => {
  const { user } = useContext(AuthContext);
  // If user exists, show Dashboard. If not, show Login.
  return user ? <Dashboard /> : <Login />;
};

export default App;