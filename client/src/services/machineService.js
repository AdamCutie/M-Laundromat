import api from './api';

const machineService = {
  getMachines: async () => {
    const response = await api.get('/machines');
    return response.data;
  },

  toggleStatus: async (id, currentStatus) => {
    // If it's Available, we switch to "In Use". If "In Use", switch to "Available".
    const newStatus = currentStatus === 'Available' ? 'In Use' : 'Available';
    
    const response = await api.put(`/machines/${id}`, { status: newStatus });
    return response.data;
  }
};

export default machineService;