import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import orderService from '../../services/orderService';
import machineService from '../../services/machineService';
import { DollarSign, ShoppingCart, Boxes, Users, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// ✅ METRIC CARD (Mobile Optimized)
function MetricCard({ title, value, subtext, isPositive, icon: Icon, iconBg, iconColor, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white p-5 rounded-xl shadow-sm border border-gray-100 
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md active:scale-95' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+2.5%' : '-1.2%'}</span> {/* Placeholder logic or pass as prop */}
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-1 text-gray-800">{value}</h3>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('Today');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, machinesData] = await Promise.all([
          orderService.getAllOrders(),
          machineService.getMachines()
        ]);
        setOrders(ordersData);
        setMachines(machinesData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 1. FILTER LOGIC ---
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
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

  // --- 2. STATS CALCULATIONS ---
  // ✅ FIX: Only count revenue if paymentStatus is 'Paid'
  const revenue = filteredOrders.reduce((sum, order) => {
    return order.paymentStatus === 'Paid' ? sum + order.totalPrice : sum;
  }, 0);
  const orderCount = filteredOrders.length;
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
  const activeMachines = machines.filter(m => m.status === 'In Use').length;
  const totalMachinesCount = machines.length;

  // --- 3. CHART DATA ---
  const statusCounts = filteredOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const revenueByDate = filteredOrders.reduce((acc, order) => {
    let label;
    const date = new Date(order.createdAt);
    if (dateRange === 'Today') {
      label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    acc[label] = (acc[label] || 0) + order.totalPrice;
    return acc;
  }, {});

  const revenueData = Object.keys(revenueByDate).map(label => ({
    name: label,
    revenue: revenueByDate[label]
  }));

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      
      {/* HEADER WITH FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
           <p className="text-sm text-gray-500 mt-1">
             Overview for <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{dateRange}</span>
           </p>
        </div>
        
        {/* Date Filter - Full width on Mobile */}
        <div className="relative w-full md:w-auto">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full md:w-48 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer hover:border-blue-400 transition-colors text-sm font-medium"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* METRICS GRID (Responsive: 1 -> 2 -> 4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <MetricCard
          title="Revenue"
          value={`₱${revenue.toLocaleString()}`}
          subtext="Total Earnings"
          isPositive={true}
          icon={DollarSign}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          onClick={() => navigate('/admin/reports')}
        />
        <MetricCard
          title="Orders"
          value={orderCount}
          subtext="Total Transactions"
          isPositive={true}
          icon={ShoppingCart}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Active Machines"
          value={`${activeMachines}/${totalMachinesCount}`}
          subtext="Real-time Usage"
          isPositive={activeMachines < totalMachinesCount}
          icon={Boxes}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          onClick={() => navigate('/admin/machines')}
        />
        <MetricCard
          title="Avg Order Value"
          value={`₱${Math.round(avgOrderValue)}`}
          subtext="Per Transaction"
          isPositive={true}
          icon={Users}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* CHARTS GRID (Responsive: 1 -> 2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Revenue Trend Chart */}
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h2>
          <div className="h-64 md:h-72 w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₱${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`₱${value}`, 'Revenue']} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p>No revenue data for {dateRange}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Status</h2>
          <div className="h-64 md:h-72 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false} // Cleaner look on mobile
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p>No orders found for {dateRange}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}