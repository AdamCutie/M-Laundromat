import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  // We don't need the full URL here because we added "proxy" in package.json
  // React will automatically forward this to localhost:5000
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