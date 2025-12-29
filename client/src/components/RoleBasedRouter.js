// client/src/components/RoleBasedRouter.js
import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Login from './Login';
import AdminDashboard from './dashboards/AdminDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import CustomerDashboard from './dashboards/CustomerDashboard';

/**
 * ROLE-BASED ROUTING SYSTEM
 * 
 * This component acts as a "traffic controller" that decides
 * which dashboard to show based on the user's role.
 * 
 * Flow:
 * 1. Check if user is logged in
 * 2. If not logged in -> Show Login
 * 3. If logged in -> Check role and show appropriate dashboard
 */

const RoleBasedRouter = () => {
  const { user, loading } = useContext(AuthContext);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>
          <h2>Loading...</h2>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show login page
  if (!user) {
    return <Login />;
  }

  // Route user to appropriate dashboard based on role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    
    case 'staff':
      return <StaffDashboard />;
    
    case 'customer':
      return <CustomerDashboard />;
    
    default:
      // Fallback for unexpected roles
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>⚠️ Invalid Role</h2>
          <p>Your account role is not recognized. Please contact support.</p>
          <p>Role detected: {user.role}</p>
        </div>
      );
  }
};

export default RoleBasedRouter;

// ============================================
// EXPLANATION:
// ============================================
// This is the "brain" of the frontend routing system.
// 
// Instead of using React Router with multiple routes,
// we use a single component that decides what to show
// based on the user's role stored in AuthContext.
// 
// Benefits:
// - Simple and secure (role is verified on backend)
// - No URL manipulation can bypass restrictions
// - Easy to understand and maintain
// - Automatic redirection when user logs in/out