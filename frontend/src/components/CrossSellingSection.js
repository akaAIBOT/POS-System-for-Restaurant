import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function CrossSellingSection() {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Napoje do dań głównych',
      trigger: 'Pad Thai',
      suggestions: ['Coca-Cola', 'Herbata zielona', 'Sok pomarańczowy'],
      active: true,
      conversions: 45
    },
    {
      id: 2,
      name: 'Sosy do Spring Rolls',
      trigger: 'Spring Rolls',
      suggestions: ['Sos słodko-kwaśny', 'Sos sojowy', 'Sos chili'],
      active: true,
      conversions: 32
    },
    {
      id: 3,
      name: 'Desery po obiedzie',
      trigger: 'Any main dish',
      suggestions: ['Lody kokosowe', 'Banany w cieście', 'Mochi'],
      active: false,
      conversions: 18
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    triggerProductId: '',
    recommendedProductIds: [],
    type: 'cross_sell',
    priority: 5,
    discount: 0
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/menu', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania menu:', error);
    }
  };

  const handleToggle = (id) => {
    setRules(rules.map(r => r.id === id ? {...r, active: !r.active} : r));
    toast.success('Status zmieniony');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Usunąć tę regułę?')) return;
    setRules(rules.filter(r => r.id !== id));
    toast.success('Reguła usunięta');
  };

  const handleCreateRule = async () => {
    if (!formData.name || !formData.triggerProductId || formData.recommendedProductIds.length === 0) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Utwórz regułę dla każdego rekomendowanego produktu
      for (const recommendedId of formData.recommendedProductIds) {
        const response = await fetch('http://localhost:8000/api/v1/recommendations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: parseInt(formData.triggerProductId),
            recommended_product_id: parseInt(recommendedId),
            recommendation_type: formData.type,
            priority: formData.priority,
            discount_percentage: formData.discount
          })
        });

        if (!response.ok) {
          throw new Error('Błąd podczas tworzenia reguły');
        }
      }

      toast.success('Reguła cross-sellingu utworzona!');
      setShowModal(false);
      setFormData({
        name: '',
        triggerProductId: '',
        recommendedProductIds: [],
        type: 'cross_sell',
        priority: 5,
        discount: 0
      });
      
      // Odśwież listę reguł (w przyszłości pobierz z API)
    } catch (error) {
      console.error('Błąd:', error);
      toast.error('Nie udało się utworzyć reguły');
    }
  };

  const toggleRecommendedProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      recommendedProductIds: prev.recommendedProductIds.includes(productId)
        ? prev.recommendedProductIds.filter(id => id !== productId)
        : [...prev.recommendedProductIds, productId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Cross-selling</h3>
          <p className="text-sm text-gray-600 mt-1">Sugeruj dodatkowe produkty podczas zamawiania</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition shadow-lg flex items-center gap-2"
        >
          <span>➕</span>
          <span>Dodaj regułę</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-sm opacity-90 mb-1">Aktywne reguły</div>
          <div className="text-3xl font-bold">{rules.filter(r => r.active).length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-sm opacity-90 mb-1">Konwersje</div>
          <div className="text-3xl font-bold">{rules.reduce((sum, r) => sum + r.conversions, 0)}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-sm opacity-90 mb-1">Średnia konwersja</div>
          <div className="text-3xl font-bold">{Math.round(rules.reduce((sum, r) => sum + r.conversions, 0) / rules.length)}%</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-sm opacity-90 mb-1">Dodatkowy przychód</div>
          <div className="text-3xl font-bold">+2,340 zł</div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map(rule => (
          <div 
            key={rule.id}
            className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 hover:border-teal-500 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-lg font-bold text-gray-900">{rule.name}</h4>
                  <button
                    onClick={() => handleToggle(rule.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      rule.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {rule.active ? '✓ Aktywna' : '✕ Nieaktywna'}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-700">Wyzwalacz:</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {rule.trigger}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <span className="font-semibold text-gray-700 mt-1">Sugestie:</span>
                    <div className="flex flex-wrap gap-2">
                      {rule.suggestions.map((item, idx) => (
                        <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                    <span>📊 {rule.conversions} konwersji</span>
                    <span>💰 Dodatkowy przychód: ~{(rule.conversions * 15).toFixed(2)} zł</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toast.info('Funkcja w budowie')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edytuj"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Usuń"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Nowa reguła */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">➕ Nowa reguła cross-sellingu</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Nazwa reguły */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nazwa reguły *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="np. Napoje do dań głównych"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Produkt wyzwalający */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Produkt wyzwalający *
                </label>
                <select
                  value={formData.triggerProductId}
                  onChange={(e) => setFormData({...formData, triggerProductId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                >
                  <option value="">Wybierz produkt...</option>
                  {menuItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.category} ({item.price} zł)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Kiedy klient doda ten produkt do koszyka, pojawią się sugestie
                </p>
              </div>

              {/* Rekomendowane produkty */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rekomendowane produkty * (zaznacz wiele)
                </label>
                <div className="border-2 border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {menuItems
                    .filter(item => item.id !== parseInt(formData.triggerProductId))
                    .map(item => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                          formData.recommendedProductIds.includes(item.id)
                            ? 'bg-teal-50 border-2 border-teal-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.recommendedProductIds.includes(item.id)}
                          onChange={() => toggleRecommendedProduct(item.id)}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.category} • {item.price} zł</div>
                        </div>
                      </label>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Wybrane: {formData.recommendedProductIds.length} produktów
                </p>
              </div>

              {/* Typ rekomendacji */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Typ rekomendacji
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                >
                  <option value="cross_sell">Cross-sell (produkty uzupełniające)</option>
                  <option value="upsell">Upsell (droższy zamiennik)</option>
                  <option value="bundle">Bundle (pakiet produktów)</option>
                </select>
              </div>

              {/* Priorytet i zniżka */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priorytet (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Wyższy = ważniejsza reguła</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zniżka (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = brak zniżki</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleCreateRule}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition shadow-lg"
              >
                ✓ Utwórz regułę
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
