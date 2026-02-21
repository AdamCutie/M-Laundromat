import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/LoadingScreen';
import { Package, Clock, CheckCircle, DollarSign, ArrowRight, Calendar } from 'lucide-react'; 
import { Link } from 'react-router-dom';

export default function CustomerDashboard({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    spent: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch all orders
      const data = await orderService.getCustomerOrders();
      setOrders(data);

      // 2. Define "Today" (Midnight to Midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      // 3. Filter orders to get only those created today
      const todaysOrders = data.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0); 
        return orderDate.getTime() === today.getTime();
      });

      // 4. Calculate Stats using ONLY today's orders
      const total = todaysOrders.length;
      const active = todaysOrders.filter(o => 
        ['Pending', 'In Progress', 'Ready'].includes(o.status)
      ).length;
      const completed = todaysOrders.filter(o => 
        ['Completed', 'Claimed'].includes(o.status)
      ).length;
      const spent = todaysOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      setStats({ total, active, completed, spent });
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  // Get only the 3 most recent orders
  const recentOrders = orders.slice(0, 3);

  return (
    <CustomerLayout user={user} onLogout={onLogout}>
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 md:p-8 rounded-2xl mb-6 md:mb-8 shadow-lg shadow-indigo-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, {user?.username?.split(' ')[0] || 'Customer'}!</h1>
            <p className="text-indigo-100 opacity-90 text-sm md:text-base">Here is your daily activity report.</p>
          </div>
          {/* Daily Badge */}
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 self-start md:self-auto">
             <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
             <span className="font-bold text-xs md:text-sm">Today's Stats</span>
          </div>
        </div>
      </div>

      {/* Stats Cards (2 Columns on Mobile, 4 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        <StatCard icon={Package} title="Orders Today" value={stats.total} color="blue" />
        <StatCard icon={Clock} title="Active Today" value={stats.active} color="yellow" />
        <StatCard icon={CheckCircle} title="Completed Today" value={stats.completed} color="green" />
        <StatCard icon={DollarSign} title="Spent Today" value={`₱${stats.spent.toLocaleString()}`} color="purple" />
      </div>

      {/* Recent Orders Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Recent Activity</h2>
          <Link to="/customer/orders" className="text-xs md:text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 group">
            View History <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="divide-y divide-gray-50">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* Top Row (Mobile): ID + Status */}
                <div className="flex justify-between items-center md:hidden">
                   <span className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                   <StatusBadge status={order.status} />
                </div>

                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="hidden md:inline font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                      order.serviceType === 'Full-Service' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.serviceType}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {order.serviceType === 'Full-Service' ? `${order.weight}kg Load` : `${order.washCount} Wash / ${order.dryCount} Dry`}
                  </p>
                  <p className="text-xs text-gray-500 md:hidden mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Date (Desktop Only) */}
                <div className="hidden md:block text-right px-4">
                  <p className="text-sm text-gray-700 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {/* Price & Status (Desktop Layout / Mobile Price) */}
                <div className="flex justify-between items-center md:block md:text-right">
                  <p className="text-base font-bold text-indigo-600 md:text-gray-900 md:mb-1">₱{(Number(order.totalPrice) || 0).toFixed(2)}</p>
                  <div className="hidden md:block">
                    <StatusBadge status={order.status} />
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No recent activity found.</p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

// Sub-components
function StatCard({ icon: Icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-orange-50 text-orange-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
      <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${colors[color]}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{title}</p>
        <h3 className="text-lg md:text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Ready': 'bg-emerald-100 text-emerald-700',
    'Completed': 'bg-green-100 text-green-700',
    'Claimed': 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
