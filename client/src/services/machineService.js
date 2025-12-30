import api from './api';

// 1. Get All Machines
const getMachines = async () => {
  const response = await api.get('/machines');
  return response.data;
};

// 2. Toggle Status (Helper for simple switching)
const toggleStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'Available' ? 'In Use' : 'Available';
  const response = await api.put(`/machines/${id}`, { status: newStatus });
  return response.data;
};

// 3. Update Machine (Generic update for any field)
const updateMachine = async (id, data) => {
  const response = await api.put(`/machines/${id}`, data);
  return response.data;
};


const machineService = { 
  getMachines, 
  toggleStatus, 
  updateMachine
};

export default machineService;