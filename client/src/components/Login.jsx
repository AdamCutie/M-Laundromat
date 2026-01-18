import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom'; // ✅ Removed useNavigate
import AuthContext from '../context/AuthContext';
import { Sparkles, AlertCircle, LogIn, User } from 'lucide-react';

export default function Login({ isModal = false, onSwitchToRegister }) { 
  const { login } = useContext(AuthContext);
  // ✅ Removed const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // App.js RootDispatcher handles the redirect automatically
    } else {
      setError(result.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  // CONDITIONAL STYLING
  const containerClass = isModal 
    ? "w-full" 
    : "min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-cyan-500 p-4";

  const cardClass = isModal
    ? "bg-white p-8 rounded-2xl shadow-none" 
    : "bg-white/95 backdrop-blur-md w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/20";

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">M-Laundromat</h1>
          <p className="text-gray-500 mt-2">Welcome back! Please sign in.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <input 
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : (
              <>
                <LogIn className="w-5 h-5" /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            {isModal ? (
              <button 
                onClick={onSwitchToRegister}
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline bg-transparent border-none cursor-pointer"
              >
                Create Account
              </button>
            ) : (
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                Create Account
              </Link>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}