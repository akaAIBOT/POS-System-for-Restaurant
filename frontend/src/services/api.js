import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post('/api/v1/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data) => api.post('/api/v1/auth/register', data),
  getCurrentUser: () => api.get('/api/v1/auth/me'),
};

// Menu API
export const menuAPI = {
  getAll: (params) => api.get('/api/v1/menu', { params }),
  getById: (id) => api.get(`/api/v1/menu/${id}`),
  create: (data) => api.post('/api/v1/menu', data),
  update: (id, data) => api.put(`/api/v1/menu/${id}`, data),
  delete: (id) => api.delete(`/api/v1/menu/${id}`),
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/v1/menu/upload-image/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getCategories: () => api.get('/api/v1/menu/categories'),
};

// Order API
export const orderAPI = {
  getAll: (params) => api.get('/api/v1/orders', { params }),
  getById: (id) => api.get(`/api/v1/orders/${id}`),
  create: (data) => api.post('/api/v1/orders', data),
  update: (id, data) => api.put(`/api/v1/orders/${id}`, data),
  delete: (id) => api.delete(`/api/v1/orders/${id}`),
  getStats: (days) => api.get('/api/v1/orders/stats', { params: { days } }),
};

// Table API
export const tableAPI = {
  getAll: (params) => api.get('/api/v1/tables', { params }),
  getById: (id) => api.get(`/api/v1/tables/${id}`),
  create: (data) => api.post('/api/v1/tables', data),
  update: (id, data) => api.put(`/api/v1/tables/${id}`, data),
  delete: (id) => api.delete(`/api/v1/tables/${id}`),
};

// Payment API
export const paymentAPI = {
  create: (data) => api.post('/api/v1/payments', data),
  getById: (id) => api.get(`/api/v1/payments/${id}`),
  createStripeIntent: (data) => api.post('/api/v1/payments/stripe/create-payment-intent', data),
  createPayPalPayment: (data) => api.post('/api/v1/payments/paypal/create-payment', data),
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/api/v1/users', { params }),
  getById: (id) => api.get(`/api/v1/users/${id}`),
  update: (id, data) => api.put(`/api/v1/users/${id}`, data),
  delete: (id) => api.delete(`/api/v1/users/${id}`),
};

export default api;
