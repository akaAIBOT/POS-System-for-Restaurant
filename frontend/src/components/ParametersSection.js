import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ParametersSection() {
  const [parameters, setParameters] = useState([
    {
      id: 1,
      name: 'Rozmiar porcji',
      values: ['Mała', 'Średnia', 'Duża'],
      priceModifiers: [0, 5, 10]
    },
    {
      id: 2,
      name: 'Typ makaronu',
      values: ['Ryżowy', 'Pszeniczny', 'Soba', 'Udon'],
      priceModifiers: [0, 0, 2, 3]
    },
    {
      id: 3,
      name: 'Stopień wysmażenia',
      values: ['Lekko', 'Średnio', 'Mocno'],
      priceModifiers: [0, 0, 0]
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [newParam, setNewParam] = useState({
    name: '',
    values: [''],
    priceModifiers: [0]
  });

  const handleAddValue = () => {
    setNewParam({
      ...newParam,
      values: [...newParam.values, ''],
      priceModifiers: [...newParam.priceModifiers, 0]
    });
  };

  const handleRemoveValue = (index) => {
    setNewParam({
      ...newParam,
      values: newParam.values.filter((_, i) => i !== index),
      priceModifiers: newParam.priceModifiers.filter((_, i) => i !== index)
    });
  };

  const handleUpdateValue = (index, value) => {
    const newValues = [...newParam.values];
    newValues[index] = value;
    setNewParam({ ...newParam, values: newValues });
  };

  const handleUpdatePrice = (index, price) => {
    const newPrices = [...newParam.priceModifiers];
    newPrices[index] = parseFloat(price) || 0;
    setNewParam({ ...newParam, priceModifiers: newPrices });
  };

  const handleSave = () => {
    if (!newParam.name || newParam.values.some(v => !v)) {
      toast.error('Wypełnij wszystkie pola');
      return;
    }

    const param = {
      id: Date.now(),
      name: newParam.name,
      values: newParam.values,
      priceModifiers: newParam.priceModifiers
    };

    setParameters([...parameters, param]);
    setShowModal(false);
    setNewParam({ name: '', values: [''], priceModifiers: [0] });
    toast.success('Parametr dodany');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Usunąć ten parametr?')) return;
    setParameters(parameters.filter(p => p.id !== id));
    toast.success('Parametr usunięty');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Parametry produktów</h3>
          <p className="text-sm text-gray-600 mt-1">Definiuj zmienne opcje dla dań - rozmiary, typy składników</p>
        </div>
        <button 
          onClick={() => {
            setEditingParam(null);
            setNewParam({ name: '', values: [''], priceModifiers: [0] });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition shadow-lg flex items-center gap-2"
        >
          <span>➕</span>
          <span>Dodaj parametr</span>
        </button>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parameters.map(param => (
          <div 
            key={param.id}
            className="bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-indigo-500 transition overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">{param.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{param.values.length} opcji</p>
                </div>
                <button
                  onClick={() => handleDelete(param.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Usuń"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                {param.values.map((value, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{value}</span>
                    <span className="font-bold text-indigo-600">
                      {param.priceModifiers[idx] === 0 ? 'Gratis' : `+${param.priceModifiers[idx]} zł`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {parameters.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Brak parametrów</h3>
          <p className="text-gray-600 mb-6">Dodaj pierwszy parametr produktu</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition shadow-lg"
          >
            Dodaj parametr
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingParam ? 'Edytuj parametr' : 'Nowy parametr'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa parametru</label>
                <input 
                  type="text"
                  value={newParam.name}
                  onChange={(e) => setNewParam({...newParam, name: e.target.value})}
                  placeholder="np. Rozmiar porcji, Typ makaronu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Wartości</label>
                  <button
                    onClick={handleAddValue}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
                  >
                    + Dodaj wartość
                  </button>
                </div>

                <div className="space-y-3">
                  {newParam.values.map((value, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input 
                        type="text"
                        value={value}
                        onChange={(e) => handleUpdateValue(idx, e.target.value)}
                        placeholder="Wartość"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <input 
                        type="number"
                        step="0.5"
                        value={newParam.priceModifiers[idx]}
                        onChange={(e) => handleUpdatePrice(idx, e.target.value)}
                        placeholder="Cena"
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      {newParam.values.length > 1 && (
                        <button
                          onClick={() => handleRemoveValue(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Anuluj
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition font-semibold"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Przykłady parametrów</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• <strong>Rozmiar porcji:</strong> Mała, Średnia, Duża (z różnymi cenami)</li>
              <li>• <strong>Typ makaronu:</strong> Ryżowy, Pszeniczny, Soba, Udon</li>
              <li>• <strong>Stopień wysmażenia:</strong> Lekko, Średnio, Mocno (bez dopłaty)</li>
              <li>• <strong>Rodzaj ryżu:</strong> Biały, Brązowy, Jaśminowy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
