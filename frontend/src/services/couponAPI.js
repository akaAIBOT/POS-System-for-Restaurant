import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/coupons';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const couponAPI = {
  // Get all coupons
  getAll: async (activeOnly = false) => {
    const response = await axios.get(`${API_URL}?active_only=${activeOnly}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get single coupon
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Create coupon
  create: async (couponData) => {
    const response = await axios.post(API_URL, couponData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Update coupon
  update: async (id, couponData) => {
    const response = await axios.put(`${API_URL}/${id}`, couponData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Delete coupon
  delete: async (id) => {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
  },

  // Validate coupon
  validate: async (code, orderTotal, items) => {
    const response = await axios.post(`${API_URL}/validate`, {
      code,
      order_total: orderTotal,
      items
    });
    return response.data;
  },

  // Use coupon (increment usage count)
  use: async (code) => {
    const response = await axios.post(`${API_URL}/${code}/use`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

export default couponAPI;

