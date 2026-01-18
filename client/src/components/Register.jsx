import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { UserPlus, AlertCircle, Sparkles, Phone } from 'lucide-react'; // ✅ Import Phone Icon

export default function Register({ isModal = false, onSwitchToLogin }) {
  const { register } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '', // ✅ Added phoneNumber state
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber, // ✅ Send phoneNumber to backend
        password: formData.password,
        role: 'customer' 
      });

      if (!result.success) {
        setError(result.message || 'Registration failed');
        setLoading(false);
      }
      // If success, App.js redirects automatically
    } catch (err) {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  // ✅ NEW: Helper to enforce 11 digits & numbers only
const handlePhoneChange = (e) => {
  // 1. Remove any non-number character
  const value = e.target.value.replace(/\D/g, '');
  
  // 2. Only update if length is <= 11
  if (value.length <= 11) {
    setFormData({ ...formData, phoneNumber: value });
  }
};

  // CONDITIONAL STYLING
  const containerClass = isModal 
    ? "w-full" 
    : "min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-indigo-600 p-4";

  const cardClass = isModal
    ? "bg-white p-8 rounded-2xl shadow-none" 
    : "bg-white/95 backdrop-blur-md w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/20";

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-cyan-100 rounded-full text-cyan-600">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-2">Join M-Laundromat today!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              name="username" type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="John Doe" value={formData.username} onChange={handleChange} required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              name="email" type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="you@example.com" value={formData.email} onChange={handleChange} required 
            />
          </div>

          {/* ✅ ADDED: Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <input 
                name="phoneNumber" 
                type="tel" 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                placeholder="0912 345 6789" 
                value={formData.phoneNumber} 
                onChange={handlePhoneChange}
                required 
                maxLength={11}
              />
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-1">Required for order tracking.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password" type="password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="••••••••" value={formData.password} onChange={handleChange} required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              name="confirmPassword" type="password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required 
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-cyan-200 disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : ( <> <UserPlus className="w-5 h-5" /> Sign Up </> )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            {isModal ? (
              <button onClick={onSwitchToLogin} className="font-semibold text-cyan-600 hover:text-cyan-700 hover:underline bg-transparent border-none cursor-pointer">
                Sign In
              </button>
            ) : (
              <Link to="/login" className="font-semibold text-cyan-600 hover:text-cyan-700 hover:underline">
                Sign In
              </Link>
            )}
          </p>
        </div>

      </div>
    </div>
  );
};