import api from './api';

const inventoryService = {
  // Get all items
  getInventory: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  // Add a new item
  addItem: async (itemData) => {
    const response = await api.post('/inventory', itemData);
    return response.data;
  }
};

export default inventoryService;