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

export default api;