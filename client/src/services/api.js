import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  // In development, Vite uses the proxy in vite.config.js
  // In production (Railway), it uses the same domain.
  baseURL: import.meta.env.VITE_API_URL || '/api', 
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
