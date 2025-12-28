import api from './api';

const settingService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  updateSettings: async (newSettings) => {
    const response = await api.put('/settings', newSettings);
    return response.data;
  }
};

export default settingService;