import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  // In a Monolith (Railway Only), we use relative paths.
  // This automatically talks to the same domain the frontend is hosted on.
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// INTERCEPTOR: Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
