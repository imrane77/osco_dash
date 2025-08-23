import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.VUE_APP_API_URL || 'http://localhost:8000/api') + '/', // Ensure trailing slash
  timeout: 30000, // Increased to 30 seconds
  retry: 3, // Add retry attempts
});

// Add request interceptor to handle Content-Type dynamically
api.interceptors.request.use((config) => {
  // If data is FormData, let browser set Content-Type automatically
  if (config.data instanceof FormData) {
    // Don't set Content-Type for FormData - browser will set it with boundary
    delete config.headers['Content-Type'];
  } else {
    // Set JSON Content-Type for other requests
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});



export default api;
