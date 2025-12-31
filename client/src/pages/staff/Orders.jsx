import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/StaffLayout';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/LoadingScreen';
import { Search, Filter, ArrowRight, RefreshCw, Calendar } from 'lucide-react';

export default function StaffOrders({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FILTERS STATE
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Today'); // ✅ Default: Today

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load orders");
      setLoading(false);
    }
  };

  // WORKFLOW LOGIC: Move order to next stage
  const handleNextStatus = async (order) => {
    const workflow = ['Pending', 'In Progress', 'Ready', 'Completed', 'Claimed'];
    const currentIndex = workflow.indexOf(order.status);
    const nextStatus = workflow[currentIndex + 1];

    if (nextStatus) {
      if (!window.confirm(`Move Order #${order._id.slice(-4)} to "${nextStatus}"?`)) return;
      
      try {
        await orderService.updateStatus(order._id, nextStatus);
        fetchOrders(); // Refresh list
      } catch (err) {
        alert("Failed to update status");
      }
    }
  };

  // ✅ FILTERING LOGIC (Updated with Date)
  const filteredOrders = orders.filter(order => {
    // 1. Search Filter
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status Filter
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    // 3. Date Filter
    let matchesDate = true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === 'Today') {
      matchesDate = orderDate >= startOfDay;
    } else if (dateFilter === 'This Week') {
      const startOfWeek = new Date(now); 
      startOfWeek.setDate(now.getDate() - 7); 
      matchesDate = orderDate >= startOfWeek;
    } else if (dateFilter === 'This Month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
      matchesDate = orderDate >= startOfMonth;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // HELPER: Status Colors
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': 
      case 'Claimed': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'Ready': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <StaffLayout user={user} onLogout={onLogout}>
      {/* Header & Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
             <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white cursor-pointer w-full sm:w-auto"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Refresh Button */}
          <button 
            onClick={fetchOrders}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 self-end sm:self-auto"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-900">#{order._id.slice(-6).toUpperCase()}</h3>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{order.customerName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-medium">{order.serviceType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Details:</span>
                  <span className="font-medium">
                    {order.serviceType === 'Full-Service' 
                      ? `${order.weight}kg` 
                      : `${order.washCount} Wash / ${order.dryCount} Dry`}
                  </span>
                </div>
                {order.addOns.length > 0 && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <strong>Add-ons: </strong> 
                    {order.addOns.map(a => `${a.quantity}x ${a.itemName}`).join(', ')}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xl font-bold text-emerald-600">₱{order.totalPrice.toFixed(2)}</p>
                
                {/* Workflow Button */}
                {order.status !== 'Claimed' && order.status !== 'Cancelled' && (
                  <button 
                    onClick={() => handleNextStatus(order)}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No orders found for <span className="font-bold text-gray-500">{dateFilter}</span>.</p>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}