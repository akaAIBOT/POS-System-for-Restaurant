import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function AddonsSection() {
  const [addonGroups, setAddonGroups] = useState([
    {
      id: 1,
      name: 'Sosy',
      description: 'Wybór sosów do dań',
      items: [
        { id: 1, name: 'Sos sojowy', price: 2 },
        { id: 2, name: 'Sos słodko-kwaśny', price: 2.5 },
        { id: 3, name: 'Sos ostry', price: 2 }
      ],
      multiSelect: true,
      required: false
    },
    {
      id: 2,
      name: 'Dodatki',
      description: 'Dodatkowe składniki',
      items: [
        { id: 4, name: 'Kurczak', price: 8 },
        { id: 5, name: 'Krewetki', price: 12 },
        { id: 6, name: 'Tofu', price: 6 },
        { id: 7, name: 'Warzywa', price: 5 }
      ],
      multiSelect: true,
      required: false
    },
    {
      id: 3,
      name: 'Poziom ostrości',
      description: 'Stopień pikantności dania',
      items: [
        { id: 8, name: 'Łagodne', price: 0 },
        { id: 9, name: 'Średnie', price: 0 },
        { id: 10, name: 'Ostre', price: 0 },
        { id: 11, name: 'Extra ostre', price: 1 }
      ],
      multiSelect: false,
      required: true
    }
  ]);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    multiSelect: true,
    required: false
  });

  const [newItem, setNewItem] = useState({
    name: '',
    price: 0
  });

  const handleCreateGroup = () => {
    if (!newGroup.name) {
      toast.error('Podaj nazwę grupy');
      return;
    }

    const group = {
      id: Date.now(),
      name: newGroup.name,
      description: newGroup.description,
      multiSelect: newGroup.multiSelect,
      required: newGroup.required,
      items: []
    };

    setAddonGroups([...addonGroups, group]);
    setShowGroupModal(false);
    setNewGroup({ name: '', description: '', multiSelect: true, required: false });
    toast.success('Grupa utworzona');
  };

  const handleDeleteGroup = (id) => {
    if (!window.confirm('Usunąć tę grupę dodatków?')) return;
    setAddonGroups(addonGroups.filter(g => g.id !== id));
    toast.success('Grupa usunięta');
  };

  const handleAddItem = () => {
    if (!newItem.name || !selectedGroup) {
      toast.error('Wypełnij wszystkie pola');
      return;
    }

    const item = {
      id: Date.now(),
      name: newItem.name,
      price: parseFloat(newItem.price)
    };

    setAddonGroups(addonGroups.map(g => 
      g.id === selectedGroup.id 
        ? { ...g, items: [...g.items, item] }
        : g
    ));

    setShowItemModal(false);
    setNewItem({ name: '', price: 0 });
    toast.success('Dodatek dodany');
  };

  const handleDeleteItem = (groupId, itemId) => {
    if (!window.confirm('Usunąć ten dodatek?')) return;
    
    setAddonGroups(addonGroups.map(g => 
      g.id === groupId 
        ? { ...g, items: g.items.filter(i => i.id !== itemId) }
        : g
    ));
    toast.success('Dodatek usunięty');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Grupy dodatków</h3>
          <p className="text-sm text-gray-600 mt-1">Zarządzaj dodatkami do dań - sosy, składniki, opcje</p>
        </div>
        <button 
          onClick={() => {
            setEditingGroup(null);
            setShowGroupModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg flex items-center gap-2"
        >
          <span>➕</span>
          <span>Dodaj grupę</span>
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addonGroups.map(group => (
          <div 
            key={group.id}
            className="bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-blue-500 transition overflow-hidden"
          >
            {/* Group Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Usuń grupę"
                >
                  🗑️
                </button>
              </div>
              
              <div className="flex gap-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  group.multiSelect 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {group.multiSelect ? '☑️ Wielokrotny wybór' : '⚪ Pojedynczy wybór'}
                </span>
                {group.required && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    ⚠️ Wymagane
                  </span>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Dodatki ({group.items.length})
                </span>
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowItemModal(true);
                  }}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                >
                  + Dodaj
                </button>
              </div>

              {group.items.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <div className="text-3xl mb-2">📦</div>
                  <p className="text-sm">Brak dodatków</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {group.items.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm font-bold text-blue-600">
                          {item.price === 0 ? 'Gratis' : `+${item.price.toFixed(2)} zł`}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(group.id, item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {addonGroups.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍜</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Brak grup dodatków</h3>
          <p className="text-gray-600 mb-6">Dodaj pierwszą grupę dodatków do dań</p>
          <button 
            onClick={() => setShowGroupModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
          >
            Dodaj grupę
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingGroup ? 'Edytuj grupę' : 'Nowa grupa dodatków'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa grupy</label>
                <input 
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  placeholder="np. Sosy, Dodatki, Poziom ostrości"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Opis</label>
                <textarea 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  placeholder="Krótki opis grupy"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">Wielokrotny wybór</div>
                  <div className="text-sm text-gray-600">Pozwól wybrać wiele opcji</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={newGroup.multiSelect}
                    onChange={(e) => setNewGroup({...newGroup, multiSelect: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">Wymagane</div>
                  <div className="text-sm text-gray-600">Klient musi wybrać opcję</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={newGroup.required}
                    onChange={(e) => setNewGroup({...newGroup, required: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setNewGroup({ name: '', description: '', multiSelect: true, required: false });
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Anuluj
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showItemModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Dodaj dodatek do "{selectedGroup.name}"
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa dodatku</label>
                <input 
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="np. Kurczak, Sos sojowy"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cena dodatku (zł)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Wpisz 0 jeśli dodatek jest darmowy</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowItemModal(false);
                  setNewItem({ name: '', price: 0 });
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Anuluj
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold"
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Jak używać grup dodatków?</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Wielokrotny wybór</strong> - pozwala wybrać wiele opcji (np. kilka sosów)</li>
              <li>• <strong>Pojedynczy wybór</strong> - tylko jedna opcja (np. poziom ostrości)</li>
              <li>• <strong>Wymagane</strong> - klient musi wybrać przynajmniej jedną opcję</li>
              <li>• Ustaw cenę 0 zł dla darmowych dodatków</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
