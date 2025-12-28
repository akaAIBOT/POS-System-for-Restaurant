import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI, orderAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CheckoutModal from '../components/CheckoutModal';
import WorkTimeTracker from '../components/WorkTimeTracker';
import TablesSection from '../components/TablesSection';
import { soundManager } from '../utils/soundManager';

export default function Cashier() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState('wszystkie');
  const [activeSection, setActiveSection] = useState('nowe');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadMenuItems();
    loadOrders();
    
    // Auto-refresh orders every 30 seconds
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderAPI.getAll();
      const ordersData = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Nie udało się załadować zamówień');
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      const items = response.data;
      setMenuItems(items);
      
      // Extract unique categories
      const cats = ['All', ...new Set(items.map(item => item.category))];
      setCategories(cats);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item) => {
    soundManager.addToCart();
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} - ${t('itemAdded')}`, {
      position: "bottom-right",
      autoClose: 1000
    });
  };

  const removeFromCart = (itemId) => {
    soundManager.removeFromCart();
    setCart(cart.filter(i => i.id !== itemId));
    toast.info(t('itemRemoved'), {
      position: "bottom-right",
      autoClose: 1000
    });
  };

  const updateQuantity = (itemId, quantity) => {
    soundManager.click();
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      ));
    }
  };

  const clearCart = () => {
    soundManager.removeFromCart();
    setCart([]);
    toast.info(t('clearCart'));
  };

  // Obliczenie kosztu opakowania
  const getPackagingCost = () => {
    // Tylko dla dostawy i odbioru osobistego
    if (activeSection !== 'dostawa' && activeSection !== 'odbior') {
      return 0;
    }

    const packagingSettings = localStorage.getItem('packagingSettings');
    if (!packagingSettings) {
      return 0;
    }

    const settings = JSON.parse(packagingSettings);
    if (!settings.active) {
      return 0;
    }

    return parseFloat(settings.price) || 0;
  };

  const packagingCost = getPackagingCost();
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotal = cartSubtotal + packagingCost;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img 
                src="http://localhost:8000/uploads/5702e88b-3b17-4bbb-9afe-bbec754dac0f.avif" 
                alt="Wok'N'Cats" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-lg font-bold">Wok'N'Cats</h1>
                <p className="text-xs text-slate-400">POS System</p>
              </div>
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <span>{language === 'pl' ? '🇵🇱' : '🇬🇧'}</span>
            <span>{language === 'pl' ? 'Polski' : 'English'}</span>
          </button>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto py-4">
          <button
            onClick={() => setActiveSection('nowe')}
            className={`w-full px-4 py-3 flex items-center gap-3 transition ${
              activeSection === 'nowe' 
                ? 'bg-slate-700 text-white border-l-4 border-blue-500' 
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="text-xl">➕</span>
            <span className="font-medium">{t('newOrder')}</span>
          </button>

          <button
            onClick={() => setActiveSection('dostawa')}
            className={`w-full px-4 py-3 flex items-center gap-3 transition ${
              activeSection === 'dostawa' 
                ? 'bg-slate-700 text-white border-l-4 border-blue-500' 
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="text-xl">🚗</span>
            <span className="font-medium">{t('delivery')}</span>
          </button>

          <button
            onClick={() => setActiveSection('odbior')}
            className={`w-full px-4 py-3 flex items-center gap-3 transition ${
              activeSection === 'odbior' 
                ? 'bg-slate-700 text-white border-l-4 border-blue-500' 
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="text-xl">🛍️</span>
            <span className="font-medium">{t('takeaway')}</span>
          </button>

          <button
            onClick={() => setActiveSection('namiejscu')}
            className={`w-full px-4 py-3 flex items-center gap-3 transition ${
              activeSection === 'namiejscu' 
                ? 'bg-slate-700 text-white border-l-4 border-blue-500' 
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="text-xl">🍽️</span>
            <span className="font-medium">{t('dineIn')}</span>
          </button>

          <div className="my-4 border-t border-slate-700"></div>

          <button
            onClick={() => {
              setActiveSection('biezace');
              loadOrders();
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 transition ${
              activeSection === 'biezace' 
                ? 'bg-slate-700 text-white border-l-4 border-blue-500' 
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="text-xl">📋</span>
            <span className="font-medium">{t('current')}</span>
          </button>

          <button
            onClick={() => setActiveSection('zaplanowane')}
            className={`w-full px-4 py-3 flex items-center gap-3 transition ${
              activeSection === 'zaplanowane' 
                ? 'bg-slate-700 text-white border-l-4 border-blue-500' 
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="text-xl">📅</span>
            <span className="font-medium">Zaplanowane</span>
          </button>

          <button
            onClick={() => setActiveSection('archiwum')}
            className={`w-full px-4 py-3 flex items-center gap-3 transition ${
              activeSection === 'archiwum' 
                ? 'bg-slate-700 text-white border-l-4 border-blue-500' 
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="text-xl">📦</span>
            <span className="font-medium">{t('archive')}</span>
          </button>

          <button
            onClick={() => setActiveSection('stoliki')}
            className={`w-full px-4 py-3 flex items-center gap-3 transition ${
              activeSection === 'stoliki' 
                ? 'bg-slate-700 text-white border-l-4 border-blue-500' 
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <span className="text-xl">🪑</span>
            <span className="font-medium">Stoliki</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {user?.role === 'admin' && (
            activeSection === 'nowe' || activeSection === 'dostawa' || activeSection === 'odbior' || activeSection === 'namiejscu' ? (
              <button
                onClick={() => navigate('/management')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg font-semibold"
              >
                <span>⚙️</span>
                <span className="text-sm">Administracja</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveSection('nowe')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg font-semibold"
              >
                <span>🏪</span>
                <span className="text-sm">Powrót do kasy</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">
              {activeSection === 'nowe' && t('newOrder')}
              {activeSection === 'biezace' && t('current')}
              {activeSection === 'dostawa' && t('delivery')}
              {activeSection === 'odbior' && t('takeaway')}
              {activeSection === 'namiejscu' && t('dineIn')}
              {activeSection === 'zaplanowane' && 'Zaplanowane'}
              {activeSection === 'archiwum' && t('archive')}
              {activeSection === 'stoliki' && 'Stoliki'}
            </h2>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('pl-PL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {activeSection === 'nowe' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Menu Section */}
            <div className="flex-1 flex flex-col p-6">
              {/* Categories - Horizontal Scroll */}
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      soundManager.click();
                      setSelectedCategory(cat);
                    }}
                    className={`px-6 py-3 rounded-xl whitespace-nowrap font-semibold transition shadow-sm ${
                      selectedCategory === cat
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu Items Grid */}
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      disabled={!item.available}
                      className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-200 text-left transform hover:-translate-y-1 ${
                        !item.available ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      <p className="text-xl font-bold text-blue-600">{item.price.toFixed(2)} zł</p>
                      {!item.available && (
                        <span className="text-xs text-red-500 mt-2 block font-semibold">Niedostępne</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Section */}
            <div className="w-96 bg-white shadow-2xl flex flex-col border-l border-gray-200">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <h2 className="text-xl font-bold">{t('cart')}</h2>
                <p className="text-sm text-blue-100">Aktualne zamówienie</p>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="text-6xl mb-4">🛍</div>
                    <p className="text-lg font-semibold">{t('emptyCart')}</p>
                    <p className="text-sm mt-2 text-center">Dodaj dania z menu</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900 flex-1">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-9 h-9 rounded-lg bg-white hover:bg-gray-200 font-bold shadow-sm"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-9 h-9 rounded-lg bg-white hover:bg-gray-200 font-bold shadow-sm"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-lg text-blue-600">
                            {(item.price * item.quantity).toFixed(2)} zł
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600">Produkty:</span>
                      <span className="text-gray-900 font-semibold">{cartSubtotal.toFixed(2)} zł</span>
                    </div>
                    {packagingCost > 0 && (
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-gray-600 flex items-center gap-2">
                          <span>📦</span>
                          <span>Opakowanie:</span>
                        </span>
                        <span className="text-gray-900 font-semibold">{packagingCost.toFixed(2)} zł</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-2xl font-bold pt-2 border-t border-gray-300">
                    <span className="text-gray-700">{t('total')}:</span>
                    <span className="text-blue-600">{cartTotal.toFixed(2)} zł</span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.checkout();
                      setShowCheckout(true);
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition shadow-lg text-lg"
                  >
                    {t('checkout')}
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition border border-gray-300"
                  >
                    {t('clearCart')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'biezace' && (
          <div className="flex-1 flex flex-col p-6 bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Order Type Tabs */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-2xl shadow-md p-2">
              <div className="flex gap-2">
                {['wszystkie', 'dostawa', 'odbior', 'namiejscu'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      soundManager.click();
                      setActiveTab(tab);
                    }}
                    className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab === 'wszystkie' && '📋 Wszystkie'}
                    {tab === 'dostawa' && '🚗 Dostawa'}
                    {tab === 'odbior' && '🛍️ Odbiór'}
                    {tab === 'namiejscu' && '🍽️ Na miejscu'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  loadOrders();
                  toast.info('Odświeżono listę zamówień');
                }}
                className="px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-bold"
              >
                <span>🔄</span>
                <span>Odśwież</span>
              </button>
            </div>

            {/* Orders List */}
            {loadingOrders ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 font-semibold">Ładowanie zamówień...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                {(() => {
                  const filteredOrders = orders.filter(order => {
                    const normalizedStatus = (order.status || '').toLowerCase();
                    if (normalizedStatus === 'completed' || normalizedStatus === 'cancelled') return false;
                    if (activeTab === 'wszystkie') return true;
                    
                    const normalizedType = (order.order_type || '').toLowerCase();
                    if (activeTab === 'dostawa') return normalizedType === 'delivery';
                    if (activeTab === 'odbior') return normalizedType === 'takeout';
                    if (activeTab === 'namiejscu') return normalizedType === 'dine_in';
                    return false;
                  });

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="flex-1 flex items-center justify-center h-64">
                        <div className="text-center">
                          <div className="mb-6">
                            <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-lg">
                              <svg className="w-32 h-32 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <h3 className="text-3xl font-bold text-gray-800 mb-3">Brak zamówień</h3>
                          <p className="text-lg text-gray-600">Wszystkie zamówienia są obsłużone! 🎉</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredOrders.map(order => {
                        const orderItems = Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items) : []);
                        
                        // Normalizuj wartości do uppercase dla wyświetlania
                        const normalizedOrderType = (order.order_type || 'DINE_IN').toUpperCase();
                        const normalizedStatus = (order.status || 'PENDING').toUpperCase();
                        
                        const orderTypeLabels = {
                          'DINE_IN': { label: 'Na miejscu', icon: '🍽️', color: 'bg-gradient-to-r from-orange-400 to-orange-500', textColor: 'text-white' },
                          'DELIVERY': { label: 'Dostawa', icon: '🚗', color: 'bg-gradient-to-r from-blue-400 to-blue-500', textColor: 'text-white' },
                          'TAKEOUT': { label: 'Odbiór', icon: '🛍️', color: 'bg-gradient-to-r from-green-400 to-green-500', textColor: 'text-white' }
                        };
                        const statusLabels = {
                          'PENDING': { label: 'Oczekujące', color: 'bg-gradient-to-r from-yellow-400 to-yellow-500', icon: '⏳' },
                          'PREPARING': { label: 'W przygotowaniu', color: 'bg-gradient-to-r from-blue-400 to-blue-500', icon: '👨‍🍳' },
                          'READY': { label: 'Gotowe', color: 'bg-gradient-to-r from-green-400 to-green-500', icon: '✅' }
                        };
                        const typeInfo = orderTypeLabels[normalizedOrderType] || orderTypeLabels['DINE_IN'];
                        const statusInfo = statusLabels[normalizedStatus] || statusLabels['PENDING'];

                        return (
                          <div key={order.id} className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                            {/* Header z gradientem */}
                            <div className={`${typeInfo.color} p-5 text-white`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl font-black">#{order.id}</span>
                                <span className="text-sm opacity-90">
                                  {new Date(order.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold flex items-center gap-2">
                                  <span className="text-2xl">{typeInfo.icon}</span>
                                  <span>{typeInfo.label}</span>
                                </span>
                                <div className="text-2xl font-black">
                                  {order.total_price.toFixed(2)} zł
                                </div>
                              </div>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                              {/* Status Badge */}
                              <div className={`${statusInfo.color} text-white px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 mb-4 shadow-md`}>
                                <span className="text-lg">{statusInfo.icon}</span>
                                <span>{statusInfo.label}</span>
                              </div>

                              {/* Informacje o stoliku */}
                              {order.table_id && (
                                <div className="mb-3 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                                  <div className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    <span className="text-xl">🍽️</span>
                                    <span>Stolik #{order.table_id}</span>
                                  </div>
                                </div>
                              )}

                              {/* Dane klienta */}
                              {order.customer_name && (
                                <div className="mb-4 p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                                  <div className="font-bold text-purple-900 flex items-center gap-2 mb-1">
                                    <span className="text-lg">👤</span>
                                    <span>{order.customer_name}</span>
                                  </div>
                                  {order.customer_phone && (
                                    <div className="text-sm text-purple-700 flex items-center gap-2 ml-6">
                                      <span>📞</span>
                                      <span>{order.customer_phone}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Pozycje zamówienia */}
                              <div className="border-t-2 border-gray-100 pt-4 mb-4">
                                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Zamówione dania:</div>
                                <div className="space-y-2">
                                  {orderItems.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                      <span className="text-sm font-semibold text-gray-800">
                                        <span className="inline-block w-7 h-7 bg-blue-500 text-white rounded-full text-center leading-7 mr-2 text-xs font-bold">
                                          {item.quantity}
                                        </span>
                                        {item.name}
                                      </span>
                                      <span className="text-sm font-bold text-blue-600">{(item.price * item.quantity).toFixed(2)} zł</span>
                                    </div>
                                  ))}
                                  {orderItems.length > 4 && (
                                    <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 rounded-lg font-semibold">
                                      + {orderItems.length - 4} więcej pozycji...
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Uwagi */}
                              {order.notes && (
                                <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                                  <div className="flex items-start gap-2">
                                    <span className="text-xl">💬</span>
                                    <div>
                                      <div className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">Uwagi:</div>
                                      <div className="text-sm text-gray-700 font-medium">{order.notes}</div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Przyciski akcji */}
                              <div className="flex gap-2 mt-4">
                                {normalizedStatus === 'PENDING' && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await orderAPI.update(order.id, { status: 'preparing' });
                                      loadOrders();
                                      soundManager.success();
                                      toast.success('Status zmieniony na: W przygotowaniu');
                                    } catch (error) {
                                      toast.error('Błąd zmiany statusu');
                                    }
                                  }}
                                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-sm font-bold"
                                >
                                  🚀 Rozpocznij
                                </button>
                              )}
                                {normalizedStatus === 'PREPARING' && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await orderAPI.update(order.id, { status: 'ready' });
                                      loadOrders();
                                      soundManager.success();
                                      toast.success('Zamówienie gotowe!', { icon: '✅' });
                                    } catch (error) {
                                      toast.error('Błąd zmiany statusu');
                                    }
                                  }}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg text-sm font-bold"
                                >
                                  ✅ Gotowe
                                </button>
                              )}
                                {normalizedStatus === 'READY' && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await orderAPI.update(order.id, { status: 'completed' });
                                      loadOrders();
                                      soundManager.success();
                                      toast.success('Zamówienie zakończone!', { icon: '🎉' });
                                    } catch (error) {
                                      toast.error('Błąd');
                                    }
                                  }}
                                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm font-bold"
                                >
                                  🎉 Zakończ
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  const printWindow = window.open('', '', 'width=300,height=600');
                                  printWindow.document.write(`
                                    <html><head><title>Zamówienie #${order.id}</title>
                                    <style>
                                      body { font-family: 'Courier New', monospace; padding: 20px; }
                                      h2 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                                      .item { margin: 10px 0; }
                                      .total { border-top: 2px solid #000; margin-top: 20px; padding-top: 10px; font-size: 18px; font-weight: bold; }
                                    </style>
                                    </head><body>
                                    <h2>Zamówienie #${order.id}</h2>
                                    <p><strong>${typeInfo.icon} ${typeInfo.label}</strong></p>
                                    <p>${new Date(order.timestamp).toLocaleString('pl-PL')}</p>
                                    ${order.customer_name ? `<p><strong>Klient:</strong> ${order.customer_name}</p>` : ''}
                                    ${order.customer_phone ? `<p><strong>Tel:</strong> ${order.customer_phone}</p>` : ''}
                                    ${order.table_id ? `<p><strong>Stolik:</strong> #${order.table_id}</p>` : ''}
                                    <hr>
                                    ${orderItems.map(item => `<div class="item">${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)} zł</div>`).join('')}
                                    ${order.notes ? `<p><strong>Uwagi:</strong> ${order.notes}</p>` : ''}
                                    <div class="total">RAZEM: ${order.total_price.toFixed(2)} zł</div>
                                    <script>window.print();setTimeout(()=>window.close(),500);</script>
                                    </body></html>
                                  `);
                                  printWindow.document.close();
                                }}
                                className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md text-lg"
                                title="Drukuj"
                              >
                                🖨️
                              </button>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {activeSection === 'stoliki' && (
          <div className="flex-1 p-6">
            <TablesSection />
          </div>
        )}

        {(activeSection === 'dostawa' || activeSection === 'odbior' || activeSection === 'namiejscu' || 
          activeSection === 'zaplanowane' || activeSection === 'archiwum') && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block p-8 bg-blue-50 rounded-full">
                  <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Brak zamówień</h3>
              <p className="text-gray-600">Wszystko obsłużone!</p>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={cartTotal}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setCart([]);
            setShowCheckout(false);
            loadOrders();
            setActiveSection('biezace');
            toast.success('Zamówienie utworzone!');
          }}
        />
      )}
    </div>
  );
}
