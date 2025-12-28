import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { menuAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await menuAPI.getAll();
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await menuAPI.update(editingItem.id, formData);
        toast.success('Item updated successfully');
      } else {
        await menuAPI.create(formData);
        toast.success('Item created successfully');
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', category: '', available: true });
      loadItems();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      available: item.available,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await menuAPI.delete(id);
        toast.success('Item deleted successfully');
        loadItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  if (loading) {
    return <Layout title="Menu Management"><div>Loading...</div></Layout>;
  }

  return (
    <Layout title="Menu Management">
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({ name: '', description: '', price: '', category: '', available: true });
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          + Add Menu Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="card">
            {item.image_url && (
              <img
                src={`${process.env.REACT_APP_API_URL}${item.image_url}`}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
            <p className="text-2xl font-bold text-primary mb-2">${item.price}</p>
            <p className="text-sm text-gray-500 mb-4">Category: {item.category}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="btn btn-secondary flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="btn btn-danger flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Available</label>
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
