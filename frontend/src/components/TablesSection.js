import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const TablesSection = () => {
  const [tables, setTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    capacity: 4,
    x: 100,
    y: 100,
    shape: 'square', // square, round
    zone: 'main' // main, terrace, vip
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = () => {
    const stored = localStorage.getItem('tables');
    if (stored) {
      setTables(JSON.parse(stored));
    } else {
      // Default tables
      const defaultTables = [
        { id: 1, number: '1', capacity: 4, x: 100, y: 100, shape: 'square', zone: 'main', status: 'free' },
        { id: 2, number: '2', capacity: 2, x: 300, y: 100, shape: 'round', zone: 'main', status: 'free' },
        { id: 3, number: '3', capacity: 6, x: 500, y: 100, shape: 'square', zone: 'main', status: 'free' },
        { id: 4, number: '4', capacity: 4, x: 100, y: 300, shape: 'square', zone: 'main', status: 'free' },
        { id: 5, number: '5', capacity: 4, x: 300, y: 300, shape: 'round', zone: 'terrace', status: 'free' },
        { id: 6, number: '6', capacity: 8, x: 500, y: 300, shape: 'square', zone: 'vip', status: 'free' },
      ];
      setTables(defaultTables);
      localStorage.setItem('tables', JSON.stringify(defaultTables));
    }
  };

  const saveTables = (newTables) => {
    localStorage.setItem('tables', JSON.stringify(newTables));
    setTables(newTables);
  };

  const handleCreate = () => {
    setEditingTable(null);
    setFormData({
      number: String(tables.length + 1),
      capacity: 4,
      x: 100,
      y: 100,
      shape: 'square',
      zone: 'main'
    });
    setShowModal(true);
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      capacity: table.capacity,
      x: table.x,
      y: table.y,
      shape: table.shape,
      zone: table.zone
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.number) {
      toast.error('Numer stolika jest wymagany');
      return;
    }

    if (editingTable) {
      const updated = tables.map(t =>
        t.id === editingTable.id
          ? { ...t, ...formData }
          : t
      );
      saveTables(updated);
      toast.success('Stolik zaktualizowany');
    } else {
      const newTable = {
        id: Date.now(),
        ...formData,
        status: 'free'
      };
      saveTables([...tables, newTable]);
      toast.success('Stolik dodany');
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Czy na pewno usunąć stolik?')) {
      saveTables(tables.filter(t => t.id !== id));
      toast.success('Stolik usunięty');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = tables.map(t =>
      t.id === id ? { ...t, status: newStatus } : t
    );
    saveTables(updated);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'free': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'cleaning': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'free': return 'Wolny';
      case 'occupied': return 'Zajęty';
      case 'reserved': return 'Rezerwacja';
      case 'cleaning': return 'Sprzątanie';
      default: return status;
    }
  };

  const getZoneLabel = (zone) => {
    switch (zone) {
      case 'main': return 'Sala główna';
      case 'terrace': return 'Taras';
      case 'vip': return 'VIP';
      default: return zone;
    }
  };

  const groupedTables = tables.reduce((acc, table) => {
    if (!acc[table.zone]) acc[table.zone] = [];
    acc[table.zone].push(table);
    return acc;
  }, {});

  const stats = {
    total: tables.length,
    free: tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Zarządzanie stolikami</h2>
        <p className="text-gray-600 mt-1">Konfiguruj układ stolików i zarządzaj rezerwacjami</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Wszystkie stoliki</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Wolne</div>
          <div className="text-3xl font-bold">{stats.free}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Zajęte</div>
          <div className="text-3xl font-bold">{stats.occupied}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="text-sm opacity-90">Rezerwacje</div>
          <div className="text-3xl font-bold">{stats.reserved}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>Dodaj stolik</span>
        </button>
      </div>

      {/* Tables by Zone */}
      <div className="space-y-6">
        {Object.entries(groupedTables).map(([zone, zoneTables]) => (
          <div key={zone} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {getZoneLabel(zone)} ({zoneTables.length})
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {zoneTables.map(table => (
                  <div
                    key={table.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(table.status)}`}></div>
                        <div className="font-bold text-xl text-gray-900">Stolik {table.number}</div>
                      </div>
                      <div className="text-gray-600">{table.shape === 'round' ? '⭕' : '⬛'}</div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-600">
                        Miejsca: <span className="font-semibold text-gray-900">{table.capacity} osób</span>
                      </div>
                      <div className="text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${getStatusColor(table.status)}`}>
                          {getStatusLabel(table.status)}
                        </span>
                      </div>
                    </div>

                    {/* Status buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => handleStatusChange(table.id, 'free')}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                          table.status === 'free'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Wolny
                      </button>
                      <button
                        onClick={() => handleStatusChange(table.id, 'occupied')}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                          table.status === 'occupied'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Zajęty
                      </button>
                      <button
                        onClick={() => handleStatusChange(table.id, 'reserved')}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                          table.status === 'reserved'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Rezerwacja
                      </button>
                      <button
                        onClick={() => handleStatusChange(table.id, 'cleaning')}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                          table.status === 'cleaning'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Sprzątanie
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(table)}
                        className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition"
                      >
                        ✏️ Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(table.id)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 text-white rounded-t-lg">
              <h3 className="text-2xl font-bold">
                {editingTable ? 'Edytuj stolik' : 'Nowy stolik'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numer stolika *
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liczba miejsc *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kształt
                </label>
                <select
                  value={formData.shape}
                  onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="square">Kwadratowy ⬛</option>
                  <option value="round">Okrągły ⭕</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Strefa
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="main">Sala główna</option>
                  <option value="terrace">Taras</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesSection;
