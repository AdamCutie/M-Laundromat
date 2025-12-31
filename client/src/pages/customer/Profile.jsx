import React from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { Save, User, Mail, Phone, MapPin } from 'lucide-react';

export default function CustomerProfile({ user, onLogout }) {
  return (
    <CustomerLayout user={user} onLogout={onLogout}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user.username || user.name}
                readOnly // Made readOnly for now unless we add update logic
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                defaultValue={user.email}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue={user.phoneNumber || ""}
                placeholder="Add phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Address
              </label>
              <textarea
                placeholder="Enter your delivery address..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences (Visual Only) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
              <span className="text-sm text-gray-700">Email notifications for order updates</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
              <span className="text-sm text-gray-700">SMS alerts when order is complete</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={() => alert("Profile update feature coming soon!")}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
}