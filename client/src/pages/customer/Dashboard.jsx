import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/LoadingScreen';
import { Package, Clock, CheckCircle, DollarSign, ArrowRight, Calendar } from 'lucide-react'; // Added Calendar icon
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
      // 1. Fetch all orders (we still need history for the list at the bottom)
      const data = await orderService.getCustomerOrders();
      setOrders(data);

      // 2. Define "Today" (Midnight to Midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to 12:00 AM today

      // 3. Filter orders to get only those created today
      const todaysOrders = data.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0); // Normalize order time to 12:00 AM
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

  // Get only the 3 most recent orders (from the full list)
  const recentOrders = orders.slice(0, 3);

  return (
    <CustomerLayout user={user} onLogout={onLogout}>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl mb-8 shadow-lg shadow-indigo-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username || 'Customer'}!</h1>
            <p className="text-indigo-100 opacity-90">Here is your daily activity report.</p>
          </div>
          {/* Daily Badge */}
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
             <Calendar className="w-5 h-5 text-white" />
             <span className="font-bold text-sm">Today's Stats</span>
          </div>
        </div>
      </div>

      {/* Stats Cards (Now reflects ONLY today) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Package} title="Orders Today" value={stats.total} color="blue" />
        <StatCard icon={Clock} title="Active Today" value={stats.active} color="yellow" />
        <StatCard icon={CheckCircle} title="Completed Today" value={stats.completed} color="green" />
        <StatCard icon={DollarSign} title="Spent Today" value={`₱${stats.spent.toLocaleString()}`} color="purple" />
      </div>

      {/* Recent Orders Panel (Shows all time history) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          <Link to="/customer/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View All History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 cursor-default">
                
                {/* ID & Service */}
                <div className="flex-1 mb-2 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      order.serviceType === 'Full-Service' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.serviceType}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {order.serviceType === 'Full-Service' ? `${order.weight}kg Load` : `${order.washCount} Wash / ${order.dryCount} Dry`}
                  </p>
                </div>

                {/* Date */}
                <div className="flex-1 sm:text-center mb-2 sm:mb-0">
                  <p className="text-sm text-gray-700 font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Price & Status */}
                <div className="flex-1 flex justify-between sm:block sm:text-right items-center">
                  <p className="text-sm font-bold text-gray-900 mb-1">₱{order.totalPrice.toFixed(2)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No orders yet. Visit the shop to get started!</p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

// Sub-components for cleaner code
function StatCard({ icon: Icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-orange-100 text-orange-600',
    green: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
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
    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}