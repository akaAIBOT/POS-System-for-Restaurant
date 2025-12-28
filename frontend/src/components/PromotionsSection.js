import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function PromotionsSection() {
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount: '',
    type: 'percentage',
    active: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minOrderValue: '',
    maxDiscount: '',
    applicableCategories: [],
    daysOfWeek: [],
    timeStart: '',
    timeEnd: ''
  });

  // Load promotions from localStorage on mount
  useEffect(() => {
    const savedPromotions = localStorage.getItem('promotions');
    if (savedPromotions) {
      setPromotions(JSON.parse(savedPromotions));
    } else {
      // Default promotions
      const defaultPromotions = [
        {
          id: 1,
          name: 'Happy Hour',
          description: 'Zniżka 20% na wszystkie dania 15:00-17:00',
          discount: 20,
          type: 'percentage',
          active: true,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          minOrderValue: 30,
          maxDiscount: null,
          timeStart: '15:00',
          timeEnd: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5]
        },
        {
          id: 2,
          name: 'Weekend Special',
          description: 'Stała zniżka 15 zł na zamówienia powyżej 100 zł',
          discount: 15,
          type: 'fixed',
          active: true,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          minOrderValue: 100,
          daysOfWeek: [6, 0]
        }
      ];
      setPromotions(defaultPromotions);
      localStorage.setItem('promotions', JSON.stringify(defaultPromotions));
    }
  }, []);

  // Save to localStorage whenever promotions change
  useEffect(() => {
    if (promotions.length > 0) {
      localStorage.setItem('promotions', JSON.stringify(promotions));
    }
  }, [promotions]);

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        name: promo.name,
        description: promo.description,
        discount: promo.discount,
        type: promo.type,
        active: promo.active,
        startDate: promo.startDate,
        endDate: promo.endDate,
        minOrderValue: promo.minOrderValue || '',
        maxDiscount: promo.maxDiscount || '',
        applicableCategories: promo.applicableCategories || [],
        daysOfWeek: promo.daysOfWeek || [],
        timeStart: promo.timeStart || '',
        timeEnd: promo.timeEnd || ''
      });
    } else {
      setEditingPromo(null);
      setFormData({
        name: '',
        description: '',
        discount: '',
        type: 'percentage',
        active: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minOrderValue: '',
        maxDiscount: '',
        applicableCategories: [],
        daysOfWeek: [],
        timeStart: '',
        timeEnd: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Podaj nazwę promocji');
      return;
    }
    if (!formData.discount || formData.discount <= 0) {
      toast.error('Podaj prawidłową wartość zniżki');
      return;
    }
    if (formData.type === 'percentage' && formData.discount > 100) {
      toast.error('Zniżka procentowa nie może być większa niż 100%');
      return;
    }

    const promoData = {
      ...formData,
      discount: parseFloat(formData.discount),
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null
    };

    if (editingPromo) {
      // Update existing
      setPromotions(promotions.map(p => 
        p.id === editingPromo.id ? { ...promoData, id: editingPromo.id } : p
      ));
      toast.success('Promocja zaktualizowana');
    } else {
      // Add new
      const newPromo = {
        ...promoData,
        id: Date.now()
      };
      setPromotions([...promotions, newPromo]);
      toast.success('Promocja dodana');
    }

    handleCloseModal();
  };

  const handleToggleActive = (id) => {
    setPromotions(promotions.map(promo => 
      promo.id === id ? { ...promo, active: !promo.active } : promo
    ));
    toast.success('Status promocji zmieniony');
  };

  const handleDelete = (id) => {
    if (window.confirm('Czy na pewno usunąć tę promocję?')) {
      setPromotions(promotions.filter(p => p.id !== id));
      toast.success('Promocja usunięta');
    }
  };

  const handleDayToggle = (day) => {
    const days = formData.daysOfWeek;
    if (days.includes(day)) {
      setFormData({ ...formData, daysOfWeek: days.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, daysOfWeek: [...days, day] });
    }
  };

  const dayNames = ['Nie', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Zarządzaj promocjami</h3>
          <p className="text-sm text-gray-600 mt-1">Twórz i edytuj promocje, rabaty i oferty specjalne</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-lg flex items-center gap-2"
        >
          <span>➕</span>
          <span>Dodaj promocję</span>
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map(promo => (
          <div 
            key={promo.id}
            className={`bg-white rounded-xl shadow-sm p-6 border-2 transition ${
              promo.active ? 'border-green-200 hover:border-green-400' : 'border-gray-200 hover:border-gray-300 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-1">{promo.name}</h4>
                <p className="text-sm text-gray-600">{promo.description}</p>
              </div>
              <button
                onClick={() => handleToggleActive(promo.id)}
                className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  promo.active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {promo.active ? 'Aktywna' : 'Nieaktywna'}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Typ:</span>
                <span className="font-semibold text-gray-900">
                  {promo.type === 'percentage' && 'Procent'}
                  {promo.type === 'fixed' && 'Stała kwota'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Zniżka:</span>
                <span className="font-bold text-green-600">
                  {promo.type === 'percentage' && `${promo.discount}%`}
                  {promo.type === 'fixed' && `${promo.discount} zł`}
                </span>
              </div>
              {promo.minOrderValue && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Min. zamówienie:</span>
                  <span className="text-gray-900">{promo.minOrderValue} zł</span>
                </div>
              )}
              {promo.maxDiscount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Maks. zniżka:</span>
                  <span className="text-gray-900">{promo.maxDiscount} zł</span>
                </div>
              )}
              {promo.timeStart && promo.timeEnd && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Godziny:</span>
                  <span className="text-gray-900">{promo.timeStart} - {promo.timeEnd}</span>
                </div>
              )}
              {promo.daysOfWeek && promo.daysOfWeek.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Dni:</span>
                  <span className="text-gray-900">{promo.daysOfWeek.map(d => dayNames[d]).join(', ')}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Okres:</span>
                <span className="text-gray-900 text-xs">{promo.startDate} / {promo.endDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button 
                onClick={() => handleOpenModal(promo)}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                ✏️ Edytuj
              </button>
              <button 
                onClick={() => handleDelete(promo.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {promotions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Brak promocji</h3>
          <p className="text-gray-600 mb-6">Dodaj pierwszą promocję dla swoich klientów</p>
          <button 
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-lg"
          >
            Dodaj promocję
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingPromo ? 'Edytuj promocję' : 'Dodaj promocję'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nazwa promocji *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="np. Happy Hour"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Opisz promocję dla klientów"
                />
              </div>

              {/* Discount Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Typ zniżki *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">Procent (%)</option>
                    <option value="fixed">Stała kwota (zł)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wartość zniżki *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.type === 'percentage' ? 100 : undefined}
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.type === 'percentage' ? '0-100' : '0.00'}
                    required
                  />
                </div>
              </div>

              {/* Conditions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min. wartość zamówienia (zł)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {formData.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maks. kwota zniżki (zł)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              {/* Time Restrictions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Godzina rozpoczęcia
                  </label>
                  <input
                    type="time"
                    value={formData.timeStart}
                    onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Godzina zakończenia
                  </label>
                  <input
                    type="time"
                    value={formData.timeEnd}
                    onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dni tygodnia
                </label>
                <div className="flex gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        formData.daysOfWeek.includes(index)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Pozostaw puste dla wszystkich dni</p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Data rozpoczęcia *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Data zakończenia *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-sm font-semibold text-gray-700">
                  Aktywuj promocję od razu
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
                >
                  {editingPromo ? 'Zapisz zmiany' : 'Dodaj promocję'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
