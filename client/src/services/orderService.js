import api from './api';

// Service to interact with the Order API
const orderService = {
  // Get all orders
  getAllOrders: async () => {
    // This sends a GET request to /api/orders
    const response = await api.get('/orders');
    return response.data; // We only return the data, not the full request object
  },

  // Create a new order
  createOrder: async (orderData) => {
    // This sends a POST request to /api/orders with the data
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  }

};

export default orderService;