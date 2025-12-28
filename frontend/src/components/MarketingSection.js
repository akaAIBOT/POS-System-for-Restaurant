import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function MarketingSection() {
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'sms',
    trigger_type: 'manual',
    subject: '',
    message_template: '',
    target_segment: 'all',
    min_order_count: 0,
    min_total_spent: 0,
    coupon_code: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const campaignsRes = await axios.get(`${API_URL}/marketing/campaigns`, {
        headers: getAuthHeader()
      });
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Error loading marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/marketing/campaigns`, formData, {
        headers: getAuthHeader()
      });
      toast.success('Kampania utworzona');
      setShowCampaignModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Błąd tworzenia kampanii');
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!window.confirm('Czy na pewno wysłać kampanię do wszystkich klientów?')) return;
    try {
      const response = await axios.post(
        `${API_URL}/marketing/campaigns/${campaignId}/send`,
        {},
        { headers: getAuthHeader() }
      );
      toast.success(response.data.message);
      loadData();
    } catch (error) {
      toast.error('Błąd wysyłania kampanii');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      campaign_type: 'sms',
      trigger_type: 'manual',
      subject: '',
      message_template: '',
      target_segment: 'all',
      min_order_count: 0,
      min_total_spent: 0,
      coupon_code: ''
    });
  };

  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case 'sms': return '📱';
      case 'email': return '📧';
      case 'push': return '🔔';
      default: return '📨';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'scheduled': return 'bg-yellow-100 text-yellow-700';
      case 'paused': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🤖 Marketing Automatyczny</h2>
          <p className="text-gray-600 mt-1">Zarządzaj kampaniami SMS, Email i programem lojalnościowym</p>
        </div>
        <button
          onClick={() => setShowCampaignModal(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold flex items-center gap-2"
        >
          <span>+</span>
          Nowa Kampania
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Wszystkie
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
          <div className="text-sm text-gray-600">Kampanii</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">✅</span>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Aktywne
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {campaigns.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Aktywnych</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📨</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {campaigns.reduce((sum, c) => sum + c.sent_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Wysłanych wiadomości</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🎯</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {campaigns.reduce((sum, c) => sum + c.converted_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Konwersji</div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Lista Kampanii</h3>
        
        {campaigns.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl">🤖</span>
            <h3 className="text-xl font-semibold text-gray-700 mt-4">
              Brak kampanii marketingowych
            </h3>
            <p className="text-gray-600 mt-2">
              Utwórz pierwszą kampanię aby zacząć komunikację z klientami
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCampaignTypeIcon(campaign.campaign_type)}</span>
                      <div>
                        <h4 className="font-bold text-gray-900">{campaign.name}</h4>
                        {campaign.description && (
                          <p className="text-sm text-gray-600">{campaign.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        📨 Wysłano: <span className="font-semibold">{campaign.sent_count}</span>
                      </span>
                      <span className="text-sm text-gray-600">
                        👁️ Otwarto: <span className="font-semibold">{campaign.opened_count}</span>
                      </span>
                      <span className="text-sm text-gray-600">
                        🎯 Konwersje: <span className="font-semibold">{campaign.converted_count}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => handleSendCampaign(campaign.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                      >
                        📤 Wyślij
                      </button>
                    )}
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
                      📊 Szczegóły
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Nowa Kampania Marketingowa</h2>
              <button
                onClick={() => { setShowCampaignModal(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa Kampanii *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Weekend Promotion"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="2"
                  placeholder="Promocja weekendowa z 15% zniżką"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ Kampanii *
                  </label>
                  <select
                    value={formData.campaign_type}
                    onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="sms">📱 SMS</option>
                    <option value="email">📧 Email</option>
                    <option value="push">🔔 Push Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger
                  </label>
                  <select
                    value={formData.trigger_type}
                    onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="manual">Manualna</option>
                    <option value="new_customer">Nowy klient</option>
                    <option value="birthday">Urodziny</option>
                    <option value="inactive_customer">Nieaktywny klient</option>
                    <option value="order_threshold">Próg zamówień</option>
                  </select>
                </div>
              </div>

              {formData.campaign_type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temat Email
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Specjalna oferta weekend!"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treść Wiadomości *
                </label>
                <textarea
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="4"
                  placeholder="Cześć {name}! Mamy dla Ciebie specjalną ofertę..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Użyj {'{name}'} aby wstawić imię klienta
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kod Kuponu (opcjonalnie)
                </label>
                <input
                  type="text"
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="WEEKEND15"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Liczba Zamówień
                  </label>
                  <input
                    type="number"
                    value={formData.min_order_count}
                    onChange={(e) => setFormData({ ...formData, min_order_count: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Wydane (zł)
                  </label>
                  <input
                    type="number"
                    value={formData.min_total_spent}
                    onChange={(e) => setFormData({ ...formData, min_total_spent: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCampaignModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold"
                >
                  Utwórz Kampanię
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program Lojalnościowy Info */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">🏆 Program Lojalnościowy</h3>
            <p className="text-purple-100 mt-1">System punktów i nagród dla stałych klientów</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
            <span className="font-bold">Aktywny</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-2xl font-bold">🥉</div>
            <div className="text-sm mt-2">Bronze</div>
            <div className="text-xs text-purple-100">0 - 499 zł</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-2xl font-bold">🥈</div>
            <div className="text-sm mt-2">Silver</div>
            <div className="text-xs text-purple-100">500 - 1999 zł</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-2xl font-bold">🥇</div>
            <div className="text-sm mt-2">Gold</div>
            <div className="text-xs text-purple-100">2000 - 4999 zł</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="text-2xl font-bold">💎</div>
            <div className="text-sm mt-2">Platinum</div>
            <div className="text-xs text-purple-100">5000+ zł</div>
          </div>
        </div>
      </div>
    </div>
  );
}

