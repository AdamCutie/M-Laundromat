// client/src/components/Login.js
import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  
  // Login Form Data
  const [loginData, setLoginData] = useState({ 
    username: '', 
    password: '' 
  });
  
  // Registration Form Data
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: ''
  });

  // ============================================
  // LOGIN HANDLER
  // ============================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/auth/login', loginData);
      const userData = response.data;
      
      login(userData, userData.token);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // ============================================
  // REGISTRATION HANDLER
  // ============================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await api.post('/customers/register', {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        phoneNumber: registerData.phoneNumber,
        address: registerData.address
      });

      const userData = response.data;
      
      // Auto-login after successful registration
      login(userData, userData.token);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#e3f2fd',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        padding: '40px', 
        background: 'white', 
        borderRadius: '15px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)', 
        width: '400px',
        maxWidth: '90%'
      }}>
        
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            margin: '0 0 5px 0', 
            color: '#667eea',
            fontSize: '32px'
          }}>
            🌊 M-Laundromat
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#666',
            fontSize: '14px'
          }}>
            {isRegistering ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* ============================================ */}
        {/* LOGIN FORM */}
        {/* ============================================ */}
        {!isRegistering ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Username
              </label>
              <input 
                type="text" 
                value={loginData.username}
                onChange={(e) => setLoginData({
                  ...loginData, 
                  username: e.target.value
                })}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                required 
                placeholder="Enter your username"
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Password
              </label>
              <input 
                type="password" 
                value={loginData.password}
                onChange={(e) => setLoginData({
                  ...loginData, 
                  password: e.target.value
                })}
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                required 
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}
            >
              Sign In
            </button>

            <div style={{ textAlign: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>
                Don't have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Register here
              </button>
            </div>
          </form>
        ) : (
          
          /* ============================================ */
          /* REGISTRATION FORM */
          /* ============================================ */
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                Username *
              </label>
              <input 
                type="text" 
                value={registerData.username}
                onChange={(e) => setRegisterData({
                  ...registerData, 
                  username: e.target.value
                })}
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                required 
                placeholder="Choose a username"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                Email
              </label>
              <input 
                type="email" 
                value={registerData.email}
                onChange={(e) => setRegisterData({
                  ...registerData, 
                  email: e.target.value
                })}
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="your@email.com"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                Phone Number
              </label>
              <input 
                type="tel" 
                value={registerData.phoneNumber}
                onChange={(e) => setRegisterData({
                  ...registerData, 
                  phoneNumber: e.target.value
                })}
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="0912-345-6789"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                Address
              </label>
              <input 
                type="text" 
                value={registerData.address}
                onChange={(e) => setRegisterData({
                  ...registerData, 
                  address: e.target.value
                })}
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Your address"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                Password *
              </label>
              <input 
                type="password" 
                value={registerData.password}
                onChange={(e) => setRegisterData({
                  ...registerData, 
                  password: e.target.value
                })}
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                required 
                placeholder="At least 6 characters"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                Confirm Password *
              </label>
              <input 
                type="password" 
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({
                  ...registerData, 
                  confirmPassword: e.target.value
                })}
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                required 
                placeholder="Re-enter password"
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 'bold',
                marginBottom: '12px'
              }}
            >
              Create Account
            </button>

            <div style={{ textAlign: 'center' }}>
              <span style={{ color: '#666', fontSize: '13px' }}>
                Already have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;