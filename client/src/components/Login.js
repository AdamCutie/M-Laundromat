import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../services/api'; // Reuse your API setup

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Send data to backend
      const response = await api.post('/auth/login', formData);

      // DEBUG: Check what the server actually sent
      console.log("Server Response:", response.data);
      
      // 2. If success, activate the global login function
      const user = response.data; 
      const token = response.data.token;

      login(user, token)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f9' }}>
      <div style={{ padding: '40px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '300px' }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>🔐 Staff Login</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
              required 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Password</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
              required 
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;