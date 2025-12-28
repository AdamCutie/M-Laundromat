import api from './api';

const attendanceService = {
  // Check if I am currently clocked in
  getStatus: async () => {
    const response = await api.get('/attendance/status');
    return response.data;
  },

  // Start Shift
  clockIn: async () => {
    const response = await api.post('/attendance/clock-in');
    return response.data;
  },

  // End Shift
  clockOut: async () => {
    const response = await api.post('/attendance/clock-out');
    return response.data;
  }
};

export default attendanceService;