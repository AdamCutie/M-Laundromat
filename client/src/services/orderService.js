import api from './api';

// Service to interact with the Order API
const orderService = {
  // Get all orders (Admin/Staff only)
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  // Get order stats (Admin only)
  getStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },

  // Update order status
  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },

  // ✅ FIX: Get customer's own orders (Customer only)
  getCustomerOrders: async () => {
    const response = await api.get('/customers/my-orders');
    return response.data;
  }
};

export default orderService;