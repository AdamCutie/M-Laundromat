import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/LoadingScreen';
import { Download, Eye, Search, Filter, Package, Calendar, ChevronRight } from 'lucide-react';

export default function CustomerOrders({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getCustomerOrders();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders");
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <CustomerLayout user={user} onLogout={onLogout}>
      
      {/* Header & Search */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
          <p className="text-gray-500 text-sm mt-1">View receipts and track status</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search Order ID..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* DESKTOP TABLE (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-indigo-600 font-medium group-hover:underline">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {order.serviceType}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.serviceType === 'Full-Service' 
                        ? `${order.weight}kg` 
                        : `${order.washCount}W / ${order.dryCount}D`
                      }
                      {order.addOns.length > 0 && <span className="text-xs text-gray-400 ml-1">(+Addons)</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ₱{(Number(order.totalPrice) || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <Filter className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD LIST (Hidden on Desktop) */}
        <div className="md:hidden divide-y divide-gray-100">
           {filteredOrders.length > 0 ? (
             filteredOrders.map((order) => (
               <div key={order._id} className="p-4 flex flex-col gap-3 active:bg-gray-50 transition-colors">
                 
                 {/* Top Row: ID & Status */}
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                       <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                          <Package className="w-5 h-5" />
                       </div>
                       <div>
                          <span className="block text-xs text-gray-500 font-mono">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className="block text-sm font-bold text-gray-900">{order.serviceType}</span>
                       </div>
                    </div>
                    <StatusBadge status={order.status} />
                 </div>

                 {/* Middle Row: Details */}
                 <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-1">
                    <div className="space-y-1">
                       <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </div>
                       <p className="text-sm text-gray-700">
                          {order.serviceType === 'Full-Service' 
                            ? `${order.weight}kg Load` 
                            : `${order.washCount} Wash • ${order.dryCount} Dry`
                          }
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-gray-400 mb-0.5">Total</p>
                       <p className="text-lg font-bold text-indigo-600">₱{(Number(order.totalPrice) || 0).toFixed(2)}</p>
                    </div>
                 </div>
               </div>
             ))
           ) : (
             <div className="p-10 text-center text-gray-400">
                <Filter className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No orders found.</p>
             </div>
           )}
        </div>

      </div>
    </CustomerLayout>
  );
}

// Helper Component for consistent badges
function StatusBadge({ status }) {
  const styles = {
    'Completed': 'bg-green-100 text-green-700 border-green-200',
    'Claimed': 'bg-green-100 text-green-700 border-green-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    'Ready': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <span className={`inline-block px-2.5 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-wide rounded-full border ${
      styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'
    }`}>
      {status}
    </span>
  );
}
