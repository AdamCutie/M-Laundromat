import api from './api';

const machineService = {
  // 1. Get All Machines
  getMachines: async () => {
    const response = await api.get('/machines');
    return response.data;
  },
  // 2. Toggle Status (Helper for simple switching)
  toggleStatus: async (id, currentStatus) => {
    const newStatus = currentStatus === 'Available' ? 'In Use' : 'Available';
    const response = await api.put(`/machines/${id}`, { status: newStatus });
    return response.data;
  },
  // 3. Update Machine (Generic update for any field)
  updateMachine: async (id, data) => {
    const response = await api.put(`/machines/${id}`, data);
    return response.data;
  },
  addMachine: async (data) => {
    const response = await api.post('/machines', data);
    return response.data;
  },
  deleteMachine: async (id) => {
    const response = await api.delete(`/machines/${id}`);
    return response.data;
  }
};


export default machineService;