import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import settingService from '../../services/settingService';
import { Save, Lock, Bell, Store, CreditCard, Megaphone } from 'lucide-react';

export default function Settings({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('pricing');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Added loading state for button

  // Announcement State
  const [announcement, setAnnouncement] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  
  // Pricing State
  const [pricing, setPricing] = useState({
    fullServicePerKg: "", // Initialize as strings to allow empty inputs
    minWeight: "",
    selfServiceWash: "",
    selfServiceDry: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingService.getSettings();
      setPricing({
        fullServicePerKg: data.fullServicePerKg || 0,
        minWeight: data.minWeight || 0,
        selfServiceWash: data.selfServiceWash || 0,
        selfServiceDry: data.selfServiceDry || 0
      });
      setAnnouncement(data.announcementText || "");
      setShowAnnouncement(data.showAnnouncement ?? true);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load settings");
      setLoading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to update system settings?")) return;

    setIsSaving(true); // Start loading spinner

    try {
      // ✅ FIX: Convert Strings to Numbers HERE, just before sending
      const payload = {
        fullServicePerKg: Number(pricing.fullServicePerKg),
        minWeight: Number(pricing.minWeight),
        selfServiceWash: Number(pricing.selfServiceWash),
        selfServiceDry: Number(pricing.selfServiceDry),
        announcementText: announcement,
        showAnnouncement: showAnnouncement
      };

      await settingService.updateSettings(payload);
      
      // Optional: Refresh data to ensure sync
      await fetchSettings(); 
      alert("Settings updated successfully!");
    } catch (err) {
      alert("Failed to update settings.");
    } finally {
      setIsSaving(false); // Stop loading spinner
    }
  };

  const tabs = [
    { id: 'pricing', label: 'General & Pricing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  if (loading) return <div className="p-10 text-center">Loading Settings...</div>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row lg:flex-col overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-1 lg:flex-none
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 border-b-2 lg:border-b-0 lg:border-l-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 border-b-2 lg:border-b-0 lg:border-l-4 border-transparent'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'pricing' && (
            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800">General Configuration</h3>
                <p className="text-sm text-gray-500">Manage pricing and customer-facing announcements.</p>
              </div>

              <form onSubmit={handleSaveChanges} className="space-y-8">
                
                {/* Announcement Section */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Megaphone className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-semibold text-indigo-900">Announcement Banner</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white p-3 rounded-md border border-indigo-100">
                        <span className="text-sm font-medium text-gray-700">Show on Customer Dashboard</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={showAnnouncement}
                            onChange={(e) => setShowAnnouncement(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Message</label>
                        <input
                          type="text"
                          value={announcement}
                          onChange={(e) => setAnnouncement(e.target.value)}
                          placeholder="e.g., We are closed on Dec 25 for Christmas!"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <Store className="w-4 h-4 text-blue-600" /> Full Service (Drop-off)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price per Kg (₱)</label>
                          <input 
                              type="number" min="0" step="0.01" required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              value={pricing.fullServicePerKg}
                              // ✅ FIX: Don't use parseFloat here. Just store value.
                              onChange={e => setPricing({...pricing, fullServicePerKg: e.target.value})}
                          />
                          </div>
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Weight (kg)</label>
                          <input 
                              type="number" min="0" step="0.1" required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              value={pricing.minWeight}
                              onChange={e => setPricing({...pricing, minWeight: e.target.value})}
                          />
                          </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-green-600" /> Self Service
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Wash Cycle Price (₱)</label>
                          <input 
                              type="number" min="0" step="0.01" required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              value={pricing.selfServiceWash}
                              onChange={e => setPricing({...pricing, selfServiceWash: e.target.value})}
                          />
                          </div>
                          <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dry Cycle Price (₱)</label>
                          <input 
                              type="number" min="0" step="0.01" required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              value={pricing.selfServiceDry}
                              onChange={e => setPricing({...pricing, selfServiceDry: e.target.value})}
                          />
                          </div>
                      </div>
                    </div>
                </div>

                {/* Save Button with Loading State */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg shadow-lg transition-colors
                      ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    <Save className="w-5 h-5" /> 
                    {isSaving ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>

              </form>
            </div>
          )}
          
          {/* Other Tabs Placeholder */}
          {activeTab !== 'pricing' && (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h3>
              <p className="text-gray-500">The {activeTab} settings module is currently under development.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
