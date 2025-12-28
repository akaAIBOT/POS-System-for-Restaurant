import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { tableAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    capacity: 4,
    status: 'available',
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const response = await tableAPI.getAll();
      setTables(response.data);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await tableAPI.update(editingTable.id, formData);
        toast.success('Table updated successfully');
      } else {
        await tableAPI.create(formData);
        toast.success('Table created successfully');
      }
      setShowModal(false);
      setEditingTable(null);
      setFormData({ number: '', capacity: 4, status: 'available' });
      loadTables();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save table');
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await tableAPI.delete(id);
        toast.success('Table deleted successfully');
        loadTables();
      } catch (error) {
        toast.error('Failed to delete table');
      }
    }
  };

  const updateTableStatus = async (id, newStatus) => {
    try {
      await tableAPI.update(id, { status: newStatus });
      loadTables();
    } catch (error) {
      toast.error('Failed to update table status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-500',
      occupied: 'bg-red-500',
      reserved: 'bg-yellow-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return <Layout title="Table Management"><div>Loading...</div></Layout>;
  }

  return (
    <Layout title="Table Management">
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingTable(null);
            setFormData({ number: '', capacity: 4, status: 'available' });
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          + Add Table
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="card text-center">
            <div className={`w-16 h-16 mx-auto rounded-full ${getStatusColor(table.status)} flex items-center justify-center text-white text-2xl font-bold mb-3`}>
              {table.number}
            </div>
            <p className="font-semibold mb-1">Table {table.number}</p>
            <p className="text-sm text-gray-600 mb-2">Capacity: {table.capacity}</p>
            <p className="text-sm font-medium mb-3 capitalize">{table.status}</p>
            
            <div className="space-y-2">
              {table.status === 'available' && (
                <button
                  onClick={() => updateTableStatus(table.id, 'occupied')}
                  className="btn btn-primary w-full text-sm"
                >
                  Occupy
                </button>
              )}
              {table.status === 'occupied' && (
                <button
                  onClick={() => updateTableStatus(table.id, 'available')}
                  className="btn btn-success w-full text-sm"
                >
                  Free
                </button>
              )}
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(table)}
                  className="btn bg-gray-300 hover:bg-gray-400 flex-1 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="btn btn-danger flex-1 text-sm"
                >
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingTable ? 'Edit Table' : 'Add Table'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Table Number</label>
                <input
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div className="flex space-x-2 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn bg-gray-300 hover:bg-gray-400 flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
