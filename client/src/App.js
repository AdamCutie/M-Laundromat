// client/src/App.js
import React from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import RoleBasedRouter from './components/RoleBasedRouter';

/**
 * MAIN APPLICATION COMPONENT
 * 
 * Architecture:
 * 1. AuthProvider wraps everything - manages login state
 * 2. RoleBasedRouter decides which dashboard to show
 * 3. Each role gets their own complete dashboard
 */

function App() {
  return (
    <AuthProvider>
      <RoleBasedRouter />
    </AuthProvider>
  );
}

export default App;

// ============================================
// ARCHITECTURE EXPLANATION:
// ============================================
// 
// OLD SYSTEM:
// - Single dashboard for everyone
// - Components shown/hidden based on role
// - Confusing and insecure
//
// NEW SYSTEM:
// - Three separate dashboards (Admin, Staff, Customer)
// - Role-based routing at the top level
// - Clean separation of concerns
// - Each role only loads their components
//
// AUTHENTICATION FLOW:
// 1. User visits site → Sees Login/Register
// 2. User logs in → AuthContext stores user data + role
// 3. RoleBasedRouter checks role → Routes to correct dashboard
// 4. Each dashboard only shows features for that role
//
// SECURITY:
// - Backend enforces permissions (middleware)
// - Frontend only shows appropriate UI
// - JWT token includes role information
// - Each API call is validated on the server