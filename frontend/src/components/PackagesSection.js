import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function PackagesSection() {
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '2.00',
    applyToAll: true,
    selectedProducts: [],
    active: true,
    description: ''
  });

  useEffect(() => {
    loadPackages();
    loadPackagingSettings();
  }, []);

  const loadPackagingSettings = () => {
    const saved = localStorage.getItem('packagingSettings');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  };

  const loadPackages = () => {
    const saved = localStorage.getItem('packages');
    if (saved) {
      setPackages(JSON.parse(saved));
    }
  };

  const savePackages = (data) => {
    localStorage.setItem('packages', JSON.stringify(data));
    setPackages(data);
  };

  const handleCreate = () => {
    setSelectedPackage(null);
    setFormData({
      name: '',
      price: '2.00',
      applyToAll: true,
      selectedProducts: [],
      active: true,
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setFormData(pkg);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Wypełnij wymagane pola');
      return;
    }

    // Zapisujemy ustawienia opakowań w localStorage
    const packagingSettings = {
      name: formData.name,
      price: parseFloat(formData.price),
      applyToAll: formData.applyToAll,
      selectedProducts: formData.selectedProducts,
      active: formData.active,
      description: formData.description,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('packagingSettings', JSON.stringify(packagingSettings));
    toast.success('Ustawienia opakowania zapisane!');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Current Settings Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Opłata za opakowanie</h3>
            <p className="text-blue-100 mb-4">
              {formData.active ? 'Aktywna' : 'Nieaktywna'} • {formData.price} zł za zamówienie
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-3 py-1 rounded-full ${formData.active ? 'bg-green-500' : 'bg-gray-500'}`}>
                {formData.active ? '✓ Włączone' : '✗ Wyłączone'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20">
                {formData.applyToAll ? 'Wszystkie produkty' : `${formData.selectedProducts.length} produktów`}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition shadow-lg flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Konfiguruj</span>
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Cena opakowania</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formData.price} zł</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Typ zastosowania</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formData.applyToAll ? 'Wszystkie' : 'Wybrane'}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Status</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formData.active ? 'Aktywne' : 'Nieaktywne'}
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">{formData.active ? '✅' : '⏸️'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Jak to działa?</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Opłata za opakowanie jest automatycznie dodawana do zamówień <strong>na wynos (Odbior)</strong> i <strong>z dostawą (Dostawa)</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Zamówienia <strong>na miejscu (Na miejscu)</strong> nie mają opłaty za opakowanie</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Możesz ustawić stałą cenę lub wybrać konkretne produkty do których będzie dodawana opłata</span>
          </li>
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>⚙️</span>
                <span>Konfiguracja opakowania</span>
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📦</span>
                  <span>Nazwa</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="np. Opakowanie standardowe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>💰</span>
                  <span>Cena opakowania *</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="2.00"
                />
                <p className="text-xs text-gray-500 mt-1">Ta kwota zostanie dodana do zamówień na wynos i z dostawą</p>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Aktywuj opłatę za opakowanie</span>
                    <p className="text-xs text-gray-500">Włącz/wyłącz dodawanie opłaty do zamówień</p>
                  </div>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.applyToAll}
                    onChange={(e) => setFormData({...formData, applyToAll: e.target.checked})}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Zastosuj do wszystkich produktów</span>
                    <p className="text-xs text-gray-500">Opłata będzie dodawana zawsze przy zamówieniu na wynos/dostawę</p>
                  </div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📝</span>
                  <span>Opis (opcjonalnie)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  rows="3"
                  placeholder="Dodatkowe informacje..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition font-semibold shadow-lg"
                >
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
