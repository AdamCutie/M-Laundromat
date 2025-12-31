import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';

// Components
import Login from './components/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminInventory from './pages/admin/Inventory';
import AdminMachines from './pages/admin/Machines';
import AdminUsers from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';   
import AdminSettings from './pages/admin/Settings'; 

// Staff Pages
import StaffPOS from './pages/staff/POS';
import StaffOrders from './pages/staff/Orders';
import StaffLayout from './components/StaffLayout';

// Customer Pages (Placeholder)
const CustomerDashboard = () => <div>Customer Dashboard (Refactor Pending)</div>;

function AppRoutes() {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Root Redirection Logic */}
      <Route path="/" element={
        !user ? <Login /> : 
        user.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
        user.role === 'staff' ? <Navigate to="/staff/dashboard" /> :
        <Navigate to="/customer/dashboard" />
      } />
      
      {/* --- ADMIN ROUTES --- */}
      <Route path="/admin/dashboard" element={
        user?.role === 'admin' ? <AdminDashboard user={user} onLogout={logout} /> : <Navigate to="/" />
      } />
      <Route path="/admin/users" element={
        user?.role === 'admin' ? <AdminUsers user={user} onLogout={logout} /> : <Navigate to="/" />
      } />
      <Route path="/admin/machines" element={
        user?.role === 'admin' ? <AdminMachines user={user} onLogout={logout} /> : <Navigate to="/" />
      } />
      <Route path="/admin/inventory" element={
        user?.role === 'admin' ? <AdminInventory user={user} onLogout={logout} /> : <Navigate to="/" /> 
      } />
      <Route path="/admin/reports" element={
        user?.role === 'admin' ? <AdminReports user={user} onLogout={logout} /> : <Navigate to="/" />
      } />
      <Route path="/admin/settings" element={
        user?.role === 'admin' ? <AdminSettings user={user} onLogout={logout} /> : <Navigate to="/" />
      } />

      {/* --- STAFF ROUTES --- */}
      <Route path="/staff/dashboard" element={
        user?.role === 'staff' ? <StaffPOS user={user} onLogout={logout} /> : <Navigate to="/" />
      } />
      <Route path="/staff/orders" element={
        user?.role === 'staff' ? <StaffOrders user={user} onLogout={logout} /> : <Navigate to="/" />
      } />
      {/* Re-using AdminMachines for Staff so they can check status */}
      <Route path="/staff/machines" element={
        user?.role === 'staff' ? <AdminMachines user={user} onLogout={logout} Layout={StaffLayout} /> : <Navigate to="/" />
      } />

      {/* --- CUSTOMER ROUTES --- */}
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;