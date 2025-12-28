import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Management() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('statistics');
  const [deliverySettings, setDeliverySettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Доступ запрещен');
      navigate('/cashier');
    }
    loadSettings();
  }, [user, navigate]);

  const loadSettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/settings/delivery');
      const data = await response.json();
      setDeliverySettings(data);
    } catch (error) {
      toast.error('Ошибка загрузки настроек');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliverySettings = async (settings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/settings/delivery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeliverySettings(data);
        toast.success('Настройки обновлены');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast.error('Ошибка обновления настроек');
    }
  };

  const toggleDelivery = () => {
    updateDeliverySettings({
      ...deliverySettings,
      delivery_enabled: !deliverySettings.delivery_enabled
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="http://localhost:8000/uploads/5702e88b-3b17-4bbb-9afe-bbec754dac0f.avif" 
                alt="Wok'N'Cats" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
              />
              <div>
                <h1 className="text-2xl font-bold">Административная панель</h1>
                <p className="text-sm opacity-90">Управление рестораном Wok'N'Cats</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/cashier')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-orange-50 transition shadow-lg flex items-center gap-2 text-lg"
              >
                <span>🎯</span>
                Перейти в режим кассы
              </button>
              <button
                onClick={logout}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'statistics'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Статистика
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🍜 Настройка меню
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'tables'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🪑 Столы
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Сотрудники
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'delivery'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🚚 Доставка
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Настройки
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'delivery' && deliverySettings && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Настройки доставки</h2>
                  <p className="text-gray-600 text-sm mt-1">Управление параметрами доставки</p>
                </div>
                <button
                  onClick={toggleDelivery}
                  className={`relative inline-flex h-10 w-20 items-center rounded-full transition ${
                    deliverySettings.delivery_enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white transition ${
                      deliverySettings.delivery_enabled ? 'translate-x-11' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {deliverySettings.delivery_enabled ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Стоимость доставки (zł)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={deliverySettings.delivery_fee}
                      onChange={(e) => updateDeliverySettings({
                        ...deliverySettings,
                        delivery_fee: parseFloat(e.target.value)
                      })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Бесплатная доставка от (zł)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={deliverySettings.free_delivery_threshold}
                      onChange={(e) => updateDeliverySettings({
                        ...deliverySettings,
                        free_delivery_threshold: parseFloat(e.target.value)
                      })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Минимальная сумма заказа (zł)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={deliverySettings.min_order_amount}
                      onChange={(e) => updateDeliverySettings({
                        ...deliverySettings,
                        min_order_amount: parseFloat(e.target.value)
                      })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Время доставки (минуты)
                    </label>
                    <input
                      type="number"
                      value={deliverySettings.estimated_delivery_time}
                      onChange={(e) => updateDeliverySettings({
                        ...deliverySettings,
                        estimated_delivery_time: parseInt(e.target.value)
                      })}
                      className="input"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">Доставка отключена</p>
                  <p className="text-sm mt-2">Включите доставку для настройки параметров</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Редактор меню</h2>
            <p className="text-gray-600 mb-4">Управление позициями меню - добавление, редактирование, удаление блюд</p>
            <button
              onClick={() => navigate('/menu-editor')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              Открыть редактор меню
            </button>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Управление сотрудниками</h2>
            <p className="text-gray-600 mb-4">Создание профилей, установка PIN-кодов, загрузка аватаров</p>
            <button
              onClick={() => navigate('/staff-management')}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition"
            >
              Управление сотрудниками
            </button>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Управление столами</h2>
            <p className="text-gray-600 mb-4">План зала, количество столов, статусы столов</p>
            <button
              onClick={() => navigate('/tables')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Перейти к управлению столами
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Общие настройки</h2>
              <p className="text-gray-600 mb-4">График работы, настройки печати чеков, оплаты</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-800 mb-2">⏰ График работы</h3>
                  <p className="text-sm text-gray-600">Настройка часов работы ресторана</p>
                </div>
                <div className="border rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-800 mb-2">🖨️ Печать чеков</h3>
                  <p className="text-sm text-gray-600">Настройка принтеров и формата чеков</p>
                </div>
                <div className="border rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-800 mb-2">💳 Оплата</h3>
                  <p className="text-sm text-gray-600">Способы оплаты, интеграции</p>
                </div>
                <div className="border rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-800 mb-2">🔧 Настройка кассы</h3>
                  <p className="text-sm text-gray-600">Параметры работы POS-системы</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Статистика ресторана</h2>
              <p className="text-gray-600 mb-4">Заказы, продажи, средний чек за день/месяц</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
              >
                Открыть статистику продаж
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Рабочее время сотрудников</h2>
              <p className="text-gray-600 mb-4">Просмотр логов рабочего времени, статистика смен</p>
              <button
                onClick={() => navigate('/work-logs')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
              >
                Просмотр рабочего времени
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
