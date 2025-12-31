import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/LoadingScreen';
import { Download, Eye, Search, Filter } from 'lucide-react';

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
      <div className="mb-6 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
          <p className="text-gray-500 text-sm">View receipts and track status</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search Order ID..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-indigo-600 font-medium">#{order._id.slice(-6).toUpperCase()}</span>
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
                      ₱{order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                        order.status === 'Completed' || order.status === 'Claimed' ? 'bg-green-100 text-green-700' :
                        order.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
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
      </div>
    </CustomerLayout>
  );
}