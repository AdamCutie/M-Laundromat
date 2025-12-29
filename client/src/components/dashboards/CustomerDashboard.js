// client/src/components/dashboards/CustomerDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

/**
 * CUSTOMER DASHBOARD
 * Order tracking and account management interface
 */
const CustomerDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const [ordersRes, machinesRes] = await Promise.all([
        api.get('/customers/my-orders'),
        api.get('/customers/machines/available')
      ]);
      
      setOrders(ordersRes.data);
      setMachines(machinesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  // Helper: Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ffc107',
      'In Progress': '#17a2b8',
      'Ready': '#28a745',
      'Completed': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h3>Loading your dashboard...</h3>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f0f4f8',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '15px',
          marginBottom: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
              <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '28px' }}>
                🌊 M-Laundromat
              </h1>
              <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>
                Welcome back, <strong>{user?.username}</strong>!
              </p>
            </div>
            <button 
              onClick={logout}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Machine Availability */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 15px 0', 
            color: '#34495e',
            fontSize: '20px'
          }}>
            ⚙️ Available Machines
          </h2>
          
          {machines.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '15px'
            }}>
              {machines.map(machine => (
                <div 
                  key={machine._id}
                  style={{ 
                    padding: '15px',
                    backgroundColor: '#d4edda',
                    border: '2px solid #c3e6cb',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: '#155724'
                  }}>
                    {machine.machineNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: '#155724' }}>
                    {machine.type}
                  </div>
                  <div style={{ 
                    marginTop: '8px',
                    fontSize: '11px',
                    color: '#155724',
                    fontWeight: 'bold'
                  }}>
                    ✓ AVAILABLE
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#95a5a6', textAlign: 'center', padding: '20px' }}>
              All machines are currently in use. Please check back later.
            </p>
          )}
        </div>

        {/* My Orders */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            color: '#34495e',
            fontSize: '20px'
          }}>
            📦 My Orders
          </h2>

          {orders.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#95a5a6'
            }}>
              <p style={{ fontSize: '18px', margin: 0 }}>
                No orders yet
              </p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                Visit our shop to place your first order!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orders.map(order => (
                <div 
                  key={order._id}
                  style={{ 
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px',
                    border: '1px solid #dee2e6'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6c757d',
                        marginBottom: '5px'
                      }}>
                        Order #{order._id.slice(-6).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {order.serviceType}
                      </div>
                    </div>
                    <span style={{ 
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: getStatusColor(order.status),
                      color: 'white'
                    }}>
                      {order.status}
                    </span>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    fontSize: '14px',
                    color: '#495057'
                  }}>
                    <div>
                      <div style={{ color: '#6c757d', fontSize: '12px' }}>Date</div>
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6c757d', fontSize: '12px' }}>Total</div>
                      <div style={{ fontWeight: 'bold' }}>₱{order.totalPrice}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6c757d', fontSize: '12px' }}>Status</div>
                      <div>
                        {order.status === 'Ready' && '🟢 Ready for pickup!'}
                        {order.status === 'Completed' && '✅ Completed'}
                        {order.status === 'In Progress' && '🔄 Processing...'}
                        {order.status === 'Pending' && '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;

// ============================================
// CUSTOMER CAPABILITIES:
// ============================================
// ✅ View their own orders
// ✅ Track order status in real-time
// ✅ See which machines are available
// ✅ View order history
// ❌ Cannot create orders (must visit shop)
// ❌ Cannot see other customers' orders
// ❌ Cannot access staff/admin features