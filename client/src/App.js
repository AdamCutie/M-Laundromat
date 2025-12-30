import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';

// Pages
import Login from './components/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInventory from './pages/admin/Inventory';
import AdminMachines from './pages/admin/Machines';
import AdminUsers from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';   
import AdminSettings from './pages/admin/Settings'; 
// Placeholders for now - we will build these next
const StaffDashboard = () => <div>Staff Dashboard (Refactor Pending)</div>;
const CustomerDashboard = () => <div>Customer Dashboard (Refactor Pending)</div>;

function AppRoutes() {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={
        !user ? <Login /> : 
        user.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
        user.role === 'staff' ? <Navigate to="/staff/dashboard" /> :
        <Navigate to="/customer/dashboard" />
      } />
      
      {/* Admin Routes */}
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

      {/* Staff & Customer Routes (Keep old ones for now until we refactor them) */}
      <Route path="/staff/dashboard" element={<StaffDashboard />} />
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