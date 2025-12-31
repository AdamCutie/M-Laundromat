import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/LoadingScreen';
import { Package, Clock, CheckCircle, DollarSign, ArrowRight } from 'lucide-react';
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
      // 1. Fetch orders specific to this customer
      const data = await orderService.getCustomerOrders();
      setOrders(data);

      // 2. Calculate Stats dynamically
      const total = data.length;
      const active = data.filter(o => ['Pending', 'In Progress', 'Ready'].includes(o.status)).length;
      const completed = data.filter(o => ['Completed', 'Claimed'].includes(o.status)).length;
      const spent = data.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl mb-8 shadow-lg shadow-indigo-200">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-indigo-100 opacity-90">Here is what is happening with your laundry today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Package} title="Total Orders" value={stats.total} color="blue" />
        <StatCard icon={Clock} title="In Progress" value={stats.active} color="yellow" />
        <StatCard icon={CheckCircle} title="Completed" value={stats.completed} color="green" />
        <StatCard icon={DollarSign} title="Total Spent" value={`₱${stats.spent.toLocaleString()}`} color="purple" />
      </div>

      {/* Recent Orders Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link to="/customer/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
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
    'Ready': 'bg-green-100 text-green-700',
    'Completed': 'bg-gray-100 text-gray-600',
    'Claimed': 'bg-gray-200 text-gray-500 line-through',
  };
  return (
    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}