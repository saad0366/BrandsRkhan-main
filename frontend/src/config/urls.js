// Dynamic URL configuration for deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Export for easy access
export default {
  API_BASE_URL,
  FRONTEND_URL,
  BACKEND_URL
};