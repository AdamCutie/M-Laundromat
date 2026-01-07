import React, { useState, useEffect, useContext } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Save, User, Mail, Phone, MapPin, 
  Loader, CheckCircle, AlertCircle, Info, Smartphone 
} from 'lucide-react';

export default function CustomerProfile({ onLogout }) {
  const { user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/customers/profile', {
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        username: formData.username,
        email: formData.email
      });

      if (response.data) {
        login(response.data.username, null);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Soft reload to update UI without full refresh if possible, 
        // or keep window.location.reload() if strictly needed for deep context updates
        window.location.reload(); 
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if phone is missing
  const isPhoneMissing = !formData.phoneNumber;

  return (
    <CustomerLayout user={user} onLogout={onLogout}>
      
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Manage your personal information and delivery preferences.
          </p>
        </div>

        {/* 🚀 IMPROVEMENT: Phone Number Alert Banner */}
        {isPhoneMissing && (
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-800">Link your account to POS</h3>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                  You haven't added a phone number yet. Adding one allows our staff to 
                  <strong> automatically link your in-store orders</strong> to this dashboard so you can track them in real-time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Message Toast */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm border animate-fade-in ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message.type === 'success' ? 
              <CheckCircle className="w-5 h-5 shrink-0" /> : 
              <AlertCircle className="w-5 h-5 shrink-0" />
            }
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Personal Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* Read-Only Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Critical Info Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    Phone Number
                  </label>
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-medium">
                    Crucial for Tracking
                  </span>
                </div>
                
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g., 0912 345 6789"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all font-mono text-lg ${
                    isPhoneMissing 
                      ? 'border-amber-300 focus:ring-amber-500 bg-amber-50/30' 
                      : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                />
                <p className="text-xs text-gray-500 flex items-start gap-1.5 mt-2">
                  <Info className="w-3 h-3 mt-0.5 text-indigo-500" />
                  Use the same number you provide to the staff at the laundromat counter.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Delivery Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Street, Barangay, City..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Discard Changes
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:transform active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed font-medium text-sm"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </CustomerLayout>
  );
}