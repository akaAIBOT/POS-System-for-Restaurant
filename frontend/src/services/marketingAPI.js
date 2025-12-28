import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const marketingAPI = {
  // Campaigns
  getCampaigns: async () => {
    const response = await axios.get(`${API_URL}/marketing/campaigns`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createCampaign: async (data) => {
    const response = await axios.post(`${API_URL}/marketing/campaigns`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  sendCampaign: async (campaignId) => {
    const response = await axios.post(
      `${API_URL}/marketing/campaigns/${campaignId}/send`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Loyalty Program
  getLoyaltyCustomer: async (phone) => {
    const response = await axios.get(`${API_URL}/marketing/loyalty/${phone}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  enrollLoyalty: async (data) => {
    const response = await axios.post(`${API_URL}/marketing/loyalty/enroll`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  addLoyaltyPoints: async (phone, points, orderId) => {
    const response = await axios.post(
      `${API_URL}/marketing/loyalty/${phone}/points`,
      { points, order_id: orderId },
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

export default marketingAPI;
