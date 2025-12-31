import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';

// Components
import Login from './components/Login';
import Register from './components/Register';

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

// Customer Pages 
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerOrders from './pages/customer/Orders';
import CustomerProfile from './pages/customer/Profile';

// ✅ 1. THE FIX: Create a reusable Protection Wrapper
// This component handles the logic for ALL routes.
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // 1. Not Logged In? -> Go to Login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Wrong Role? -> Go to their specific home
  if (user.role !== allowedRole) {
    // Redirect based on what role they actually are
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
    if (user.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  // 3. Allowed? -> Render the page
  return children;
};

// ✅ 2. Logic for the Root Path ("/")
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;

  if (!user) return <Login />;
  
  // Auto-redirect logged-in users
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'staff') return <Navigate to="/staff/dashboard" />;
  return <Navigate to="/customer/dashboard" />;
};

function AppRoutes() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/register" element={<Register />} />
      
      {/* --- ADMIN ROUTES --- */}
      {/* Now we just wrap the element. Much cleaner! */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin"><AdminDashboard user={user} onLogout={logout} /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRole="admin"><AdminUsers user={user} onLogout={logout} /></ProtectedRoute>
      } />
      <Route path="/admin/machines" element={
        <ProtectedRoute allowedRole="admin"><AdminMachines user={user} onLogout={logout} /></ProtectedRoute>
      } />
      <Route path="/admin/inventory" element={
        <ProtectedRoute allowedRole="admin"><AdminInventory user={user} onLogout={logout} /></ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRole="admin"><AdminReports user={user} onLogout={logout} /></ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRole="admin"><AdminSettings user={user} onLogout={logout} /></ProtectedRoute>
      } />

      {/* --- STAFF ROUTES --- */}
      <Route path="/staff/dashboard" element={
        <ProtectedRoute allowedRole="staff"><StaffPOS user={user} onLogout={logout} /></ProtectedRoute>
      } />
      <Route path="/staff/orders" element={
        <ProtectedRoute allowedRole="staff"><StaffOrders user={user} onLogout={logout} /></ProtectedRoute>
      } />
      <Route path="/staff/machines" element={
        <ProtectedRoute allowedRole="staff"><AdminMachines user={user} onLogout={logout} Layout={StaffLayout} /></ProtectedRoute>
      } />

      {/* --- CUSTOMER ROUTES --- */}
      <Route path="/customer/dashboard" element={
        <ProtectedRoute allowedRole="customer"><CustomerDashboard user={user} onLogout={logout} /></ProtectedRoute>
      } />
      <Route path="/customer/orders" element={
        <ProtectedRoute allowedRole="customer"><CustomerOrders user={user} onLogout={logout} /></ProtectedRoute>
      } />
      <Route path="/customer/profile" element={
        <ProtectedRoute allowedRole="customer"><CustomerProfile user={user} onLogout={logout} /></ProtectedRoute>
      } />
      
      {/* Catch-all for unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
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