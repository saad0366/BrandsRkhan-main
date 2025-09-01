import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle admin-only endpoints
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only apply role-based restrictions if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Only check admin endpoints for logged-in non-admin users
        if (user.role !== 'admin') {
          // Strict admin-only endpoints that should be blocked
          const strictAdminEndpoints = [
            '/admin/dashboard',
            '/admin/products',
            '/admin/orders',
            '/admin/users',
            '/offers/analytics/export',
            '/offers/create',
            '/offers/update',
            '/offers/delete'
          ];
          
          // Check if the URL contains any strict admin endpoints
          const isStrictAdminRequest = strictAdminEndpoints.some(endpoint => 
            config.url.includes(endpoint)
          );
          
          if (isStrictAdminRequest) {
            // Only block strict admin endpoints
            return Promise.reject(new Error('Unauthorized access'));
          }
        }
      } catch (e) {
        // If JSON parsing fails, continue with the request
        console.error('Error parsing user data:', e);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't show toast for canceled requests (like our admin endpoint blocks)
    if (error.message === 'Unauthorized access' || axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    // Don't show errors for background requests to common endpoints
    const isBackgroundRequest = error.config && (
      error.config.url.includes('/auth/me') ||
      error.config.url.includes('/dashboard-stats') ||
      error.config.url.includes('/admin-stats')
    );
    
    if (isBackgroundRequest) {
      console.log('Background request failed:', error.config.url);
      return Promise.reject(error);
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status } = error.response;
      
      if (status === 401) {
        // Only show login expired message if we have a token
        if (localStorage.getItem('token')) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status === 404) {
        toast.error('Resource not found.');
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.response.data.message || 'An error occurred.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response from server. Please check your internet connection.');
    } else if (error.message !== 'Unauthorized access') {
      // Something happened in setting up the request that triggered an Error
      toast.error(error.message || 'An error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;