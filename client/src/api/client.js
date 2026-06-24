import axios from 'axios';

// In production (Vercel) the frontend and API share the same domain, so we
// use a relative base URL (/api).  In local dev, Vite's proxy forwards /api
// to localhost:4000, so the same relative URL still works — no env var needed.
//
// If you ever deploy the backend separately (e.g. Railway), set
// VITE_API_BASE_URL=https://your-backend.railway.app/api in Vercel's dashboard.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('pantrypal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
