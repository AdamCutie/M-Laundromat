import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import orderService from '../../services/orderService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FileText, Download, TrendingUp, DollarSign } from 'lucide-react';

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

  // --- 1. FILTER LOGIC (The Fix) ---
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      switch (dateRange) {
        case 'Today':
          return orderDate >= startOfDay;
        case 'This Week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - 7); // Last 7 days
          return orderDate >= startOfWeek;
        case 'This Month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return orderDate >= startOfMonth;
        case 'This Year':
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return orderDate >= startOfYear;
        default:
          return true;
      }
    });
  }, [orders, dateRange]);

  // --- 2. DATA PROCESSING (Uses filteredOrders now) ---
  
  // Service Type Distribution
  const serviceStats = filteredOrders.reduce((acc, order) => {
    const service = order.serviceType || 'Unknown';
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {});
  
  const serviceChartData = Object.keys(serviceStats).map(key => ({
    name: key,
    value: serviceStats[key]
  }));

  // Revenue by Date
  const revenueByDate = filteredOrders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + order.totalPrice;
    return acc;
  }, {});

  const revenueChartData = Object.keys(revenueByDate).map(date => ({
      date,
      revenue: revenueByDate[date]
  }));

  // Top Metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) return <div className="p-10 text-center">Generating Reports...</div>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Financial Reports</h2>
          <p className="text-gray-500 text-sm">Overview of your business performance</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <button 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards (Now Dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Revenue ({dateRange})</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Orders ({dateRange})</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-gray-500 text-sm font-medium">Avg. Order Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₱{avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-64">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`₱${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No revenue data for {dateRange}
              </div>
            )}
          </div>
        </div>

        {/* Service Type Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Orders by Service Type</h3>
          <div className="h-64">
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No orders found for {dateRange}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
           <h3 className="text-lg font-bold text-gray-800">Filtered Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Service</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
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
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
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
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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