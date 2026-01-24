import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import settingService from '../../services/settingService';
import { Save, Lock, Bell, Store, CreditCard } from 'lucide-react';

export default function Settings({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('pricing');
  const [loading, setLoading] = useState(true);
  
  // State for Pricing Form
  const [pricing, setPricing] = useState({
    fullServicePerKg: 0,
    minWeight: 0,
    selfServiceWash: 0,
    selfServiceDry: 0
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
      setLoading(false);
    } catch (err) {
      console.error("Failed to load settings");
      setLoading(false);
    }
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to update live system prices?")) return;

    try {
      await settingService.updateSettings(pricing);
      alert("Prices updated successfully!");
    } catch (err) {
      alert("Failed to update prices.");
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  if (loading) return <div className="p-10 text-center">Loading Settings...</div>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>

      {/* Main Layout: Column on Mobile, Row on Desktop */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Navigation Sidebar/TopBar */}
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
          
          {/* PRICING TAB */}
          {activeTab === 'pricing' && (
            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800">Service Pricing</h3>
                <p className="text-sm text-gray-500">Configure base rates for services. These affect all new orders.</p>
              </div>

              <form onSubmit={handleSavePricing} className="space-y-6">
                
                {/* Full Service Section */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" /> Full Service (Drop-off)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price per Kg (₱)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={pricing.fullServicePerKg}
                        onChange={e => setPricing({...pricing, fullServicePerKg: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Weight (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={pricing.minWeight}
                        onChange={e => setPricing({...pricing, minWeight: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                {/* Self Service Section */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-600" /> Self Service
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wash Cycle Price (₱)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={pricing.selfServiceWash}
                        onChange={e => setPricing({...pricing, selfServiceWash: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dry Cycle Price (₱)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={pricing.selfServiceDry}
                        onChange={e => setPricing({...pricing, selfServiceDry: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OTHER TABS (Placeholders) */}
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