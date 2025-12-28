import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI, orderAPI, tableAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function StaffInterface() {
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menuResponse, tablesResponse, categoriesResponse] = await Promise.all([
        menuAPI.getAll({ available_only: true }),
        tableAPI.getAll(),
        menuAPI.getCategories(),
      ]);
      
      setMenuItems(Array.isArray(menuResponse.data) ? menuResponse.data : []);
      setTables(Array.isArray(tablesResponse.data) ? tablesResponse.data : []);
      setCategories(['all', ...(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [])]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
      setMenuItems([]);
      setTables([]);
      setCategories(['all']);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find((i) => i.item_id === item.id);
    
    if (existingItem) {
      setCart(
        cart.map((i) =>
          i.item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((i) => i.item_id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((i) => (i.item_id === itemId ? { ...i, quantity: newQuantity } : i))
      );
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      await orderAPI.create({
        table_id: selectedTable,
        items: cart,
      });
      
      toast.success('Order placed successfully!');
      setCart([]);
      setSelectedTable(null);
      loadData();
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Staff Interface</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <button onClick={handleLogout} className="btn btn-danger text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Table Selection */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-4">Select Table</h2>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {Array.isArray(tables) && tables.length > 0 ? (
                  tables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      disabled={table.status === 'occupied'}
                      className={`p-4 rounded-lg font-semibold ${
                        selectedTable === table.id
                          ? 'bg-primary text-white'
                          : table.status === 'occupied'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {table.number}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-4">
                    No tables available
                  </div>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-4 flex space-x-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`btn ${
                    selectedCategory === category ? 'btn-primary' : 'bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="card cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {item.image_url && (
                    <img
                      src={`${process.env.REACT_APP_API_URL}${item.image_url}`}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-primary font-bold">${item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div>
            <div className="card sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Current Order</h2>
              
              {selectedTable && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold">Table: {selectedTable}</p>
                </div>
              )}

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.item_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">${item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.item_id)}
                        className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                
                {cart.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Cart is empty</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold mb-4">
                  <span>Total:</span>
                  <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0}
                  className="w-full btn btn-success text-lg"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
