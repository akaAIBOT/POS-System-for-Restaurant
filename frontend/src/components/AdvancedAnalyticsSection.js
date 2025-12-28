import React, { useState, useEffect } from 'react';
import { printDailyReport } from '../utils/printUtils';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdvancedAnalyticsSection = () => {
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [timeframe, setTimeframe] = useState('week'); // week, month, year

  useEffect(() => {
    loadOrders();
  }, [dateRange]);

  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const filtered = storedOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      return orderDate >= start && orderDate <= end;
    });
    setOrders(filtered);
  };

  // Calculate statistics
  const stats = {
    totalRevenue: orders.reduce((sum, o) => sum + (o.total_price || 0), 0),
    totalOrders: orders.length,
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total_price || 0), 0) / orders.length : 0,
    cashRevenue: orders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + (o.total_price || 0), 0),
    cardRevenue: orders.filter(o => o.payment_method === 'card').reduce((sum, o) => sum + (o.total_price || 0), 0),
    deliveryOrders: orders.filter(o => o.order_type === 'dostawa' || o.order_type === 'delivery').length,
    takeawayOrders: orders.filter(o => o.order_type === 'odbior' || o.order_type === 'takeaway').length,
    dineInOrders: orders.filter(o => o.order_type === 'namiejscu' || o.order_type === 'dine_in').length
  };

  // Daily revenue chart data
  const dailyData = {};
  orders.forEach(order => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { date, revenue: 0, orders: 0 };
    }
    dailyData[date].revenue += order.total_price || 0;
    dailyData[date].orders += 1;
  });
  const revenueChartData = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Hourly distribution
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, orders: 0 }));
  orders.forEach(order => {
    const hour = new Date(order.created_at).getHours();
    hourlyData[hour].orders += 1;
  });

  // Order type distribution
  const orderTypeData = [
    { name: 'Dostawa', value: stats.deliveryOrders, color: '#ef4444' },
    { name: 'Odbiór', value: stats.takeawayOrders, color: '#f59e0b' },
    { name: 'Na miejscu', value: stats.dineInOrders, color: '#10b981' }
  ];

  // Payment method distribution
  const paymentData = [
    { name: 'Gotówka', value: stats.cashRevenue, color: '#8b5cf6' },
    { name: 'Karta', value: stats.cardRevenue, color: '#3b82f6' }
  ];

  // Top products
  const productStats = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      if (!productStats[item.name]) {
        productStats[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productStats[item.name].quantity += item.quantity;
      productStats[item.name].revenue += item.price * item.quantity;
    });
  });
  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const setQuickRange = (type) => {
    const end = new Date();
    let start = new Date();
    
    switch (type) {
      case 'today':
        start = new Date();
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
    setTimeframe(type);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Zaawansowana analityka</h2>
        <p className="text-gray-600 mt-1">Szczegółowe raporty i wykresy sprzedaży</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Zakres dat</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <span className="flex items-center text-gray-500">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Szybki wybór</label>
            <div className="flex gap-2">
              <button
                onClick={() => setQuickRange('today')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeframe === 'today' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dziś
              </button>
              <button
                onClick={() => setQuickRange('week')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeframe === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tydzień
              </button>
              <button
                onClick={() => setQuickRange('month')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeframe === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Miesiąc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Całkowity przychód</div>
          <div className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)} zł</div>
          <div className="text-sm opacity-75 mt-2">💰 {stats.totalOrders} zamówień</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Średnia wartość zamówienia</div>
          <div className="text-3xl font-bold">{stats.avgOrderValue.toFixed(2)} zł</div>
          <div className="text-sm opacity-75 mt-2">📊 AOV</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Gotówka</div>
          <div className="text-3xl font-bold">{stats.cashRevenue.toFixed(2)} zł</div>
          <div className="text-sm opacity-75 mt-2">💵 {((stats.cashRevenue / stats.totalRevenue) * 100 || 0).toFixed(1)}%</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <div className="text-sm opacity-90 mb-1">Karta</div>
          <div className="text-3xl font-bold">{stats.cardRevenue.toFixed(2)} zł</div>
          <div className="text-sm opacity-75 mt-2">💳 {((stats.cardRevenue / stats.totalRevenue) * 100 || 0).toFixed(1)}%</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Przychód dzienny</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Przychód (zł)" />
            <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Zamówienia" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Rozkład zamówień według godzin</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#8b5cf6" name="Zamówienia" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Types */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Typy zamówień</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {orderTypeData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Metody płatności</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {paymentData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value.toFixed(2)} zł</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 produktów</h3>
        <div className="space-y-3">
          {topProducts.map((product, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600">{product.quantity} szt.</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{product.revenue.toFixed(2)} zł</div>
                <div className="text-xs text-gray-500">{((product.revenue / stats.totalRevenue) * 100).toFixed(1)}%</div>
              </div>
              <div className="w-32">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(product.revenue / topProducts[0].revenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsSection;
