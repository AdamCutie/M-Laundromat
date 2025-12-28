import React, { useState, useEffect } from 'react';
import orderService from './services/orderService'; // Import our new service
import './App.css';

function App() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // useEffect runs once when the page loads
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getAllOrders();
        setOrders(data); // Save the data to state
        console.log("Fetched Orders:", data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to connect to backend");
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="App" style={{ padding: '20px' }}>
      <h1>M-Laundromat System</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Order List (Test)</h2>
      {orders.length === 0 ? (
        <p>No orders found (or loading...)</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              <strong>{order.customerName}</strong> - {order.serviceType} (₱{order.totalPrice})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;