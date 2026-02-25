import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
// ✅ Import at top
import StaffLayout from './components/StaffLayout.jsx'; 

// --- LAZY LOAD COMPONENTS ---
// Note: Login/Register are now imported inside LandingPage, 
// so we don't strictly need them here unless used elsewhere.

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory.jsx'));
const AdminMachines = lazy(() => import('./pages/admin/Machines.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/Users.jsx'));
const AdminReports = lazy(() => import('./pages/admin/Reports.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/Settings.jsx'));

// Staff Pages
const StaffPOS = lazy(() => import('./pages/staff/POS.jsx'));
const StaffOrders = lazy(() => import('./pages/staff/Orders.jsx'));

// Customer Pages
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard.jsx'));
const CustomerOrders = lazy(() => import('./pages/customer/Orders.jsx'));
const CustomerProfile = lazy(() => import('./pages/customer/Profile.jsx'));

import LoadingScreen from './components/LoadingScreen.jsx';

// --- CONSTANTS ---
const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer'
};

// --- COMPONENTS ---

// Protected Route Wrapper
const ProtectedRoute = ({ allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingScreen />;

  // Redirect unauthenticated users to Landing Page
  if (!user) return <Navigate to="/" replace />;

  if (user.role !== allowedRole) {
    switch (user.role) {
      case ROLES.ADMIN: return <Navigate to="/admin/dashboard" replace />;
      case ROLES.STAFF: return <Navigate to="/staff/dashboard" replace />;
      case ROLES.CUSTOMER: return <Navigate to="/customer/dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

// Root Dispatcher
const RootDispatcher = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  
  // If guest, show Landing Page (which contains Login/Register modals)
  if (!user) return <LandingPage />;

  // If logged in, send to dashboard
  switch (user.role) {
    case ROLES.ADMIN: return <Navigate to="/admin/dashboard" />;
    case ROLES.STAFF: return <Navigate to="/staff/dashboard" />;
    default: return <Navigate to="/customer/dashboard" />;
  }
};

// --- MAIN ROUTES CONFIGURATION ---
function AppRoutes() {
  const { user, logout } = useContext(AuthContext);
  const pageProps = { user, onLogout: logout };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* === PUBLIC ROUTES === */}
        {/* ✅ CLEANED UP: Only Root is needed now */}
        <Route path="/" element={<RootDispatcher />} />

        {/* === ADMIN ROUTES GROUP === */}
        <Route element={<ProtectedRoute allowedRole={ROLES.ADMIN} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard {...pageProps} />} />
          <Route path="/admin/users" element={<AdminUsers {...pageProps} />} />
          <Route path="/admin/machines" element={<AdminMachines {...pageProps} />} />
          <Route path="/admin/inventory" element={<AdminInventory {...pageProps} />} />
          <Route path="/admin/reports" element={<AdminReports {...pageProps} />} />
          <Route path="/admin/settings" element={<AdminSettings {...pageProps} />} />
        </Route>

        {/* === STAFF ROUTES GROUP === */}
        <Route element={<ProtectedRoute allowedRole={ROLES.STAFF} />}>
          <Route path="/staff/dashboard" element={<StaffPOS {...pageProps} />} />
          <Route path="/staff/orders" element={<StaffOrders {...pageProps} />} />
          <Route path="/staff/machines" element={<AdminMachines {...pageProps} Layout={StaffLayout} />} />
        </Route>

        {/* === CUSTOMER ROUTES GROUP === */}
        <Route element={<ProtectedRoute allowedRole={ROLES.CUSTOMER} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard {...pageProps} />} />
          <Route path="/customer/orders" element={<CustomerOrders {...pageProps} />} />
          <Route path="/customer/profile" element={<CustomerProfile {...pageProps} />} />
        </Route>

        {/* === FALLBACK === */}
        {/* If someone types /login or /register, this catches them and sends them to / */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;