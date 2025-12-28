import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      // Sort: Newest orders first
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Failed to fetch orders");
    }
  };

  // The Magic Workflow Logic
  const handleNextStep = async (order) => {
    const workflow = ['Pending', 'In Progress', 'Ready', 'Completed'];
    const currentIndex = workflow.indexOf(order.status);
    const nextStatus = workflow[currentIndex + 1];

    if (nextStatus) {
      if(window.confirm(`Move order #${order._id.slice(-4)} to "${nextStatus}"?`)) {
        try {
          await orderService.updateStatus(order._id, nextStatus);
          fetchOrders(); // Refresh the list
        } catch (err) {
          alert("Error updating status");
        }
      }
    }
  };

  // Helper for Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffeaa7'; // Yellow
      case 'In Progress': return '#74b9ff'; // Blue
      case 'Ready': return '#55efc4'; // Green
      case 'Completed': return '#b2bec3'; // Grey
      default: return '#fff';
    }
  };

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>📜 Active Orders</h3>
        <button onClick={fetchOrders} style={{ padding: '5px 15px', cursor: 'pointer' }}>🔄 Refresh</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Order ID</th>
            <th style={{ padding: '10px' }}>Customer</th>
            <th style={{ padding: '10px' }}>Service</th>
            <th style={{ padding: '10px' }}>Total</th>
            <th style={{ padding: '10px' }}>Status</th>
            <th style={{ padding: '10px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} style={{ borderBottom: '1px solid #f1f1f1' }}>
              <td style={{ padding: '10px', fontFamily: 'monospace' }}>#{order._id.slice(-6).toUpperCase()}</td>
              <td style={{ padding: '10px' }}>
                <strong>{order.customerName}</strong>
                <div style={{ fontSize: '12px', color: '#888' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
              </td>
              <td style={{ padding: '10px' }}>{order.serviceType}</td>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>₱{order.totalPrice}</td>
              
              {/* Status Badge */}
              <td style={{ padding: '10px' }}>
                <span style={{ 
                  padding: '5px 10px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  backgroundColor: getStatusColor(order.status),
                  color: '#2d3436'
                }}>
                  {order.status}
                </span>
              </td>

              {/* Workflow Button */}
              <td style={{ padding: '10px' }}>
                {order.status !== 'Completed' ? (
                  <button 
                    onClick={() => handleNextStep(order)}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: '#0984e3',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    Next ➡
                  </button>
                ) : (
                  <span style={{ color: 'green' }}>✔ Done</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {orders.length === 0 && <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No orders yet.</p>}
    </div>
  );
};

export default OrderList;