import React, { useState, useEffect } from 'react';
import couponAPI from '../services/couponAPI';
import { toast } from 'react-toastify';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: null,
    usage_limit: null,
    valid_until: '',
    is_active: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponAPI.getAll();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Błąd wczytywania kuponów');
      console.error('Load coupons error:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await couponAPI.update(editingCoupon.id, formData);
        toast.success('Kupon zaktualizowany');
      } else {
        await couponAPI.create(formData);
        toast.success('Kupon utworzony');
      }
      setShowModal(false);
      resetForm();
      loadCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Błąd zapisu kuponu');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Czy na pewno usunąć ten kupon?')) return;
    try {
      await couponAPI.delete(id);
      toast.success('Kupon usunięty');
      loadCoupons();
    } catch (error) {
      toast.error('Błąd usuwania kuponu');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount,
      usage_limit: coupon.usage_limit,
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      is_active: coupon.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      max_discount_amount: null,
      usage_limit: null,
      valid_until: '',
      is_active: true
    });
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    } else if (coupon.discount_type === 'fixed') {
      return `${coupon.discount_value} zł`;
    } else {
      return 'Darmowy produkt';
    }
  };

  const getUsageDisplay = (coupon) => {
    if (!coupon.usage_limit) return `${coupon.usage_count} / ∞`;
    return `${coupon.usage_count} / ${coupon.usage_limit}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🎟️ Kupony i Promocje</h1>
          <p className="text-gray-600 mt-1">Zarządzaj kodami rabatowymi</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Nowy Kupon
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
              coupon.is_active ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-orange-600 font-mono">
                    {coupon.code}
                  </span>
                  {coupon.is_active ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Aktywny
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      Nieaktywny
                    </span>
                  )}
                </div>
                {coupon.description && (
                  <p className="text-sm text-gray-600">{coupon.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Zniżka:</span>
                <span className="font-bold text-lg text-green-600">
                  {getDiscountDisplay(coupon)}
                </span>
              </div>

              {coupon.min_order_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Min. zamówienie:</span>
                  <span className="font-semibold">{coupon.min_order_amount} zł</span>
                </div>
              )}

              {coupon.max_discount_amount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Maks. zniżka:</span>
                  <span className="font-semibold">{coupon.max_discount_amount} zł</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Użycia:</span>
                <span className="font-semibold">{getUsageDisplay(coupon)}</span>
              </div>

              {coupon.valid_until && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Ważny do:</span>
                  <span className="font-semibold">
                    {new Date(coupon.valid_until).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => handleEdit(coupon)}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-medium"
              >
                Edytuj
              </button>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-medium"
              >
                Usuń
              </button>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <span className="text-6xl">🎟️</span>
          <h3 className="text-xl font-semibold text-gray-700 mt-4">
            Brak kuponów
          </h3>
          <p className="text-gray-600 mt-2">
            Utwórz pierwszy kupon rabatowy dla swoich klientów
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingCoupon ? 'Edytuj Kupon' : 'Nowy Kupon'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kod Kuponu *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-lg"
                  placeholder="WELCOME10"
                  required
                  maxLength={20}
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
                  placeholder="10% zniżki dla nowych klientów"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ Zniżki *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="percentage">Procentowa (%)</option>
                    <option value="fixed">Stała kwota (zł)</option>
                    <option value="free_item">Darmowy produkt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wartość Zniżki *
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Kwota Zamówienia (zł)
                  </label>
                  <input
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maks. Zniżka (zł)
                  </label>
                  <input
                    type="number"
                    value={formData.max_discount_amount || ''}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    step="0.01"
                    min="0"
                    placeholder="Brak limitu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limit Użyć
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit || ''}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="1"
                    placeholder="Nieograniczone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ważny Do
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Kupon aktywny
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold"
                >
                  {editingCoupon ? 'Zapisz Zmiany' : 'Utwórz Kupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
