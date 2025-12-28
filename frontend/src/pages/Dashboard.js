import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await orderAPI.getStats(7);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
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
                <h1 className="text-2xl font-bold">Wok'N'Cats - Статистика</h1>
                <p className="text-sm opacity-90">Аналитика продаж за последние 7 дней</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/management')}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition"
            >
              Назад к управлению
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Всего заказов</h3>
            <p className="text-4xl font-bold">{stats?.total_orders || 0}</p>
            <p className="text-sm mt-2 opacity-90">За 7 дней</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Общая выручка</h3>
            <p className="text-4xl font-bold">{stats?.total_revenue?.toFixed(2) || 0} zł</p>
            <p className="text-sm mt-2 opacity-90">За 7 дней</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Выполнено</h3>
            <p className="text-4xl font-bold">{stats?.completed_orders || 0}</p>
            <p className="text-sm mt-2 opacity-90">Завершенных заказов</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Средний чек</h3>
            <p className="text-4xl font-bold">{stats?.average_order_value?.toFixed(2) || 0} zł</p>
            <p className="text-sm mt-2 opacity-90">За 7 дней</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Статистика заказов</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[stats]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_orders" fill="#3b82f6" name="Всего заказов" />
              <Bar dataKey="completed_orders" fill="#10b981" name="Выполнено" />
              <Bar dataKey="cancelled_orders" fill="#ef4444" name="Отменено" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
