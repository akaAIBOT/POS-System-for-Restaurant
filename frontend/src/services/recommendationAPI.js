import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const recommendationAPI = {
  // Get smart recommendations based on cart
  getSmartSuggestions: async (cartItems) => {
    const itemIds = cartItems.map(item => item.id).join(',');
    const response = await axios.get(
      `${API_URL}/recommendations/smart-suggestions?cart_items=${itemIds}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Get recommendations for specific product
  getForProduct: async (productId) => {
    const response = await axios.get(
      `${API_URL}/recommendations/${productId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Create recommendation
  createRecommendation: async (data) => {
    const response = await axios.post(
      `${API_URL}/recommendations`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Update customer preferences
  updatePreferences: async (phone, cartItems, totalSpent) => {
    const response = await axios.post(
      `${API_URL}/recommendations/preferences`,
      {
        customer_phone: phone,
        cart_items: cartItems,
        total_spent: totalSpent
      },
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

export default recommendationAPI;
