import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import orderService from '../../services/orderService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FileText, Download, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Month');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch report data");
      setLoading(false);
    }
  };

  // --- 1. FILTER LOGIC ---
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      // This moves the order to "Today" if it was PAID today, even if created last week.
      const orderDate = (order.paymentStatus === 'Paid' && order.paidAt) 
        ? new Date(order.paidAt) 
        : new Date(order.createdAt);
      
      switch (dateRange) {
        case 'Today': return orderDate >= startOfDay;
        case 'This Week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - 7); 
          return orderDate >= startOfWeek;
        case 'This Month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return orderDate >= startOfMonth;
        case 'This Year':
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return orderDate >= startOfYear;
        default: return true;
      }
    });
  }, [orders, dateRange]);

  // --- 2. DATA PROCESSING ---
  
  // Service Type Distribution (Counts ALL orders for operational volume)
  const serviceStats = filteredOrders.reduce((acc, order) => {
    const service = order.serviceType || 'Unknown';
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {});
  
  const serviceChartData = Object.keys(serviceStats).map(key => ({
    name: key,
    value: serviceStats[key]
  }));

  // ✅ FIX 1: Revenue by Date (Only count if PAID)
  const revenueByDate = filteredOrders.reduce((acc, order) => {
    // Skip unpaid orders for the revenue chart
    if (order.paymentStatus !== 'Paid') return acc;

    const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + order.totalPrice;
    return acc;
  }, {});

  const revenueChartData = Object.keys(revenueByDate).map(date => ({
      date,
      revenue: revenueByDate[date]
  }));

  // ✅ FIX 2: Top Metrics (Only count revenue if PAID)
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    return order.paymentStatus === 'Paid' ? sum + order.totalPrice : sum;
  }, 0);

  // Total Orders counts EVERYTHING (Work done)
  const totalOrders = filteredOrders.length;
  
  // Avg Value based on PAID revenue / Total Orders
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) return <div className="p-10 text-center">Generating Reports...</div>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Financial Reports</h2>
          <p className="text-gray-500 text-sm mt-1">
             Performance overview for <span className="font-semibold text-blue-600">{dateRange}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Date Selector */}
          <div className="relative w-full sm:w-48">
             <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
             <select 
               value={dateRange}
               onChange={(e) => setDateRange(e.target.value)}
               className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer bg-white text-sm"
             >
               <option>Today</option>
               <option>This Week</option>
               <option>This Month</option>
               <option>This Year</option>
             </select>
          </div>

          {/* Export Button */}
          <button 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" /> 
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Revenue (Paid)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Avg. Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₱{avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Revenue Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend (Paid Only)</h3>
          <div className="h-64 w-full">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10} 
                  />
                  <YAxis 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `₱${val}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`₱${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <span className="text-sm">No paid revenue data for {dateRange}</span>
              </div>
            )}
          </div>
        </div>

        {/* Service Type Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Orders by Service Type</h3>
          <div className="h-64 w-full">
            {serviceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {serviceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <span className="text-sm">No orders found for {dateRange}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
           <h3 className="text-lg font-bold text-gray-800">Filtered Transactions</h3>
        </div>
        
        {/* Scrollable Container for Mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Order ID</th>
                <th className="px-6 py-3 text-left font-semibold">Date</th>
                <th className="px-6 py-3 text-left font-semibold">Customer</th>
                <th className="px-6 py-3 text-left font-semibold">Service</th>
                <th className="px-6 py-3 text-right font-semibold">Amount</th>
                <th className="px-6 py-3 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {order.serviceType}
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
                      ₱{order.totalPrice}
                      {/* ✅ FIX 3: Visual indicator for Unpaid orders */}
                      {order.paymentStatus !== 'Paid' && (
                        <div className="text-[10px] text-red-500 font-normal uppercase mt-0.5 bg-red-50 inline-block px-1 rounded">Unpaid</div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    No transactions found for {dateRange}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}