import React, { useState } from 'react';
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

  const handleToggle = (id) => {
    setRules(rules.map(r => r.id === id ? {...r, active: !r.active} : r));
    toast.success('Status zmieniony');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Usunąć tę regułę?')) return;
    setRules(rules.filter(r => r.id !== id));
    toast.success('Reguła usunięta');
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
          onClick={() => toast.warning('Funkcja dostępna wkrótce - użyj API: POST /api/v1/recommendations')}
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

    </div>
  );
}
