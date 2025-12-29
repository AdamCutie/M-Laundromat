import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '', email: '', role: 'customer' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegistering ? '/customers/register' : '/auth/login';
    
    try {
      const res = await api.post(endpoint, formData);
      login(res.data, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', // Brand Gradient
      padding: '20px'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        background: 'rgba(255, 255, 255, 0.95)', // Slight transparency
        backdropFilter: 'blur(10px)',
        padding: '2.5rem'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌊</div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-main)' }}>M-Laundromat</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isRegistering ? 'Create your account' : 'Welcome back, please sign in.'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'var(--danger-bg)', color: 'var(--danger-text)', 
            padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' 
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label">Username</label>
            <input name="username" className="input" onChange={handleChange} required placeholder="Enter username" />
          </div>

          {isRegistering && (
             <div className="input-group">
               <label className="label">Email Address</label>
               <input name="email" type="email" className="input" onChange={handleChange} placeholder="name@example.com" />
             </div>
          )}

          <div className="input-group">
            <label className="label">Password</label>
            <input name="password" type="password" className="input" onChange={handleChange} required placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem', padding: '0.75rem' }}>
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', marginLeft: '5px' }}
          >
            {isRegistering ? 'Sign In' : 'Register Now'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;