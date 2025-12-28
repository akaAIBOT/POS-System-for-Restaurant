import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, dostawa, odbior, namiejscu

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadOrders, 10000);
    
    // Play sound on new orders
    const soundInterval = setInterval(() => {
      checkNewOrders();
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(soundInterval);
    };
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      const ordersData = Array.isArray(response.data) ? response.data : [];
      
      // Filter only active orders (not completed/cancelled)
      const activeOrders = ordersData.filter(order => 
        order.status === 'pending' || order.status === 'preparing'
      );
      
      setOrders(activeOrders);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setLoading(false);
    }
  };

  const checkNewOrders = () => {
    // Check localStorage for new order flag
    const hasNewOrder = localStorage.getItem('newKitchenOrder');
    if (hasNewOrder) {
      playNotificationSound();
      localStorage.removeItem('newKitchenOrder');
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZURE');
    audio.play().catch(e => console.log('Sound play failed:', e));
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.update(orderId, { status: newStatus });
      toast.success(`Status zmieniony na: ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error('Nie udało się zmienić statusu');
    }
  };

  const getTimeElapsed = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / 60000);
    return diffMinutes;
  };

  const getTimerColor = (minutes) => {
    if (minutes < 10) return 'text-green-600';
    if (minutes < 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => {
        if (filter === 'dostawa') return order.order_type === 'delivery';
        if (filter === 'odbior') return order.order_type === 'takeaway';
        if (filter === 'namiejscu') return order.order_type === 'dine_in';
        return true;
      });

  // Sort by priority: dostawa first, then by time
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a.order_type === 'delivery' && b.order_type !== 'delivery') return -1;
    if (a.order_type !== 'delivery' && b.order_type === 'delivery') return 1;
    return new Date(a.created_at) - new Date(b.created_at);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Ładowanie zamówień...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl">👨‍🍳</div>
              <div className="text-white">
                <h1 className="text-4xl font-bold">KUCHNIA</h1>
                <p className="text-xl opacity-90">Aktywne zamówienia: {sortedOrders.length}</p>
              </div>
            </div>
            <div className="text-white text-right">
              <div className="text-5xl font-bold">{new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-lg opacity-90">{new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-xl font-bold text-lg transition ${
            filter === 'all'
              ? 'bg-white text-gray-900 shadow-lg'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          Wszystkie ({orders.length})
        </button>
        <button
          onClick={() => setFilter('dostawa')}
          className={`px-6 py-3 rounded-xl font-bold text-lg transition ${
            filter === 'dostawa'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          🚗 Dostawa ({orders.filter(o => o.order_type === 'delivery').length})
        </button>
        <button
          onClick={() => setFilter('odbior')}
          className={`px-6 py-3 rounded-xl font-bold text-lg transition ${
            filter === 'odbior'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          🛍️ Odbiór ({orders.filter(o => o.order_type === 'takeaway').length})
        </button>
        <button
          onClick={() => setFilter('namiejscu')}
          className={`px-6 py-3 rounded-xl font-bold text-lg transition ${
            filter === 'namiejscu'
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          🍽️ Na miejscu ({orders.filter(o => o.order_type === 'dine_in').length})
        </button>
      </div>

      {/* Orders Grid */}
      {sortedOrders.length === 0 ? (
        <div className="bg-gray-800 rounded-2xl p-20 text-center">
          <div className="text-8xl mb-6">✅</div>
          <div className="text-white text-3xl font-bold mb-2">Brak aktywnych zamówień</div>
          <div className="text-gray-400 text-xl">Wszystkie zamówienia zostały zrealizowane</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedOrders.map(order => {
            const timeElapsed = getTimeElapsed(order.created_at);
            const timerColor = getTimerColor(timeElapsed);
            const orderTypeConfig = {
              delivery: { label: 'DOSTAWA', color: 'bg-red-600', icon: '🚗' },
              takeaway: { label: 'ODBIÓR', color: 'bg-orange-500', icon: '🛍️' },
              dine_in: { label: 'NA MIEJSCU', color: 'bg-green-600', icon: '🍽️' }
            };
            const config = orderTypeConfig[order.order_type] || orderTypeConfig.dine_in;

            return (
              <div
                key={order.id}
                className={`rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform ${
                  order.order_type === 'delivery' ? 'ring-4 ring-red-500 ring-opacity-50' : ''
                }`}
              >
                {/* Header */}
                <div className={`${config.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-5xl font-black">#{order.order_number || order.id}</div>
                    <div className={`text-5xl font-black ${timerColor} bg-white rounded-full px-4 py-2`}>
                      {timeElapsed}'
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{config.icon} {config.label}</div>
                    {order.table_number && (
                      <div className="text-xl font-bold bg-white bg-opacity-20 px-4 py-1 rounded-full">
                        Stolik {order.table_number}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white p-6 space-y-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-xl text-gray-900">{item.name}</div>
                        <div className="text-3xl font-black text-blue-600">{item.quantity}x</div>
                      </div>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="text-sm text-gray-600 mb-1">
                          + {item.selectedAddons.map(a => a.name).join(', ')}
                        </div>
                      )}
                      {item.selectedParameters && item.selectedParameters.length > 0 && (
                        <div className="text-sm text-gray-600 mb-1">
                          {item.selectedParameters.map(p => `${p.name}: ${p.selectedOption}`).join(', ')}
                        </div>
                      )}
                      {item.comment && (
                        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-2 mt-2">
                          <div className="text-sm font-bold text-yellow-800">⚠️ {item.comment}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="bg-gray-100 p-4 flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-lg transition"
                    >
                      🔥 Rozpocznij
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg transition"
                    >
                      ✅ Gotowe
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
