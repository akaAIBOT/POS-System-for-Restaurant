import React, { useState, useEffect } from 'react';
import { printDailyReport } from '../utils/printUtils';
import { orderAPI } from '../services/api';
import { toast } from 'react-toastify';

const ReportsSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    cashPayments: 0,
    cardPayments: 0,
    splitPayments: 0,
    averageOrder: 0,
    totalTips: 0,
    totalDiscounts: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, dateRange, startDate, endDate, orderTypeFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getAll();
      let allOrders = Array.isArray(response.data) ? response.data : [];
      
      // Filter by date range
      let filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        if (dateRange === 'today') {
          return orderDate === selectedDate;
        } else if (dateRange === 'custom') {
          return orderDate >= startDate && orderDate <= endDate;
        } else if (dateRange === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(order.created_at) >= weekAgo;
        } else if (dateRange === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return new Date(order.created_at) >= monthAgo;
        }
        return true;
      });

      // Filter by order type
      if (orderTypeFilter !== 'all') {
        filteredOrders = filteredOrders.filter(o => o.order_type === orderTypeFilter);
      }

      setOrders(filteredOrders);
      calculateStats(filteredOrders);
      calculateTopProducts(filteredOrders);
      calculateHourlyData(filteredOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Błąd wczytywania zamówień');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (dayOrders) => {
    const totalOrders = dayOrders.length;
    const totalRevenue = dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const cashPayments = dayOrders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const cardPayments = dayOrders.filter(o => o.payment_method === 'card').reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const splitPayments = dayOrders.filter(o => o.payment_method === 'split').reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalTips = dayOrders.reduce((sum, order) => sum + (order.tip_amount || 0), 0);
    const totalDiscounts = dayOrders.reduce((sum, order) => sum + (order.discount_amount || 0), 0);
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalOrders,
      totalRevenue,
      cashPayments,
      cardPayments,
      splitPayments,
      averageOrder,
      totalTips,
      totalDiscounts
    });
  };

  const calculateTopProducts = (orders) => {
    const productCount = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = item.name || 'Unknown';
          if (!productCount[name]) {
            productCount[name] = { name, quantity: 0, revenue: 0 };
          }
          productCount[name].quantity += item.quantity || 1;
          productCount[name].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });
    
    const sorted = Object.values(productCount)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    setTopProducts(sorted);
  };

  const calculateHourlyData = (orders) => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: 0,
      revenue: 0
    }));

    orders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hours[hour].orders += 1;
      hours[hour].revenue += order.total_amount || 0;
    });

    setHourlyData(hours.filter(h => h.orders > 0));
  };

  const handlePrintReport = () => {
    printDailyReport(orders, new Date(selectedDate));
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Nr zamówienia', 'Data', 'Godzina', 'Typ', 'Płatność', 'Kwota'],
      ...orders.map(order => [
        order.order_number || order.id,
        new Date(order.created_at).toLocaleDateString('pl-PL'),
        new Date(order.created_at).toLocaleTimeString('pl-PL'),
        order.order_type === 'dostawa' ? 'Dostawa' : order.order_type === 'odbior' ? 'Odbiór' : 'Na miejscu',
        order.payment_method === 'card' ? 'Karta' : 'Gotówka',
        (order.total_price || 0).toFixed(2)
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `raport_${selectedDate}.csv`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📊 Raporty sprzedaży</h2>
        <p className="text-gray-600 mt-1">Szczegółowe raporty i analiza sprzedaży</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Zakres danych
        </label>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              dateRange === 'today'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dziś
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              dateRange === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ostatnie 7 dni
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              dateRange === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ostatni miesiąc
          </button>
          <button
            onClick={() => setDateRange('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              dateRange === 'custom'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Własny zakres
          </button>
        </div>

        {dateRange === 'today' && (
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {dateRange === 'custom' && (
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-500">do</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Order Type Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Typ zamówienia
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setOrderTypeFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                orderTypeFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setOrderTypeFilter('dine_in')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                orderTypeFilter === 'dine_in'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Na miejscu
            </button>
            <button
              onClick={() => setOrderTypeFilter('takeaway')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                orderTypeFilter === 'takeaway'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Odbiór
            </button>
            <button
              onClick={() => setOrderTypeFilter('delivery')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                orderTypeFilter === 'delivery'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dostawa
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Main Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-blue-100 text-sm font-medium mb-2">Zamówienia</div>
              <div className="text-3xl font-bold">{stats.totalOrders}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-green-100 text-sm font-medium mb-2">Przychód ogółem</div>
              <div className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)} zł</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-purple-100 text-sm font-medium mb-2">Średnie zamówienie</div>
              <div className="text-3xl font-bold">{stats.averageOrder.toFixed(2)} zł</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-orange-100 text-sm font-medium mb-2">Napiwki</div>
              <div className="text-3xl font-bold">{stats.totalTips.toFixed(2)} zł</div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">💵 Gotówka</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.cashPayments.toFixed(2)} zł
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.cashPayments / stats.totalRevenue) * 100 || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {((stats.cashPayments / stats.totalRevenue) * 100 || 0).toFixed(1)}% przychodów
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">💳 Karta</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.cardPayments.toFixed(2)} zł
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(stats.cardPayments / stats.totalRevenue) * 100 || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {((stats.cardPayments / stats.totalRevenue) * 100 || 0).toFixed(1)}% przychodów
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">💳💵 Dzielona</h3>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.splitPayments.toFixed(2)} zł
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${(stats.splitPayments / stats.totalRevenue) * 100 || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {((stats.splitPayments / stats.totalRevenue) * 100 || 0).toFixed(1)}% przychodów
              </p>
            </div>
          </div>

          {/* Top Products and Hourly Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Najpopularniejsze produkty</h3>
              <div className="space-y-3">
                {topProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Brak danych</p>
                ) : (
                  topProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.quantity} szt.</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{product.revenue.toFixed(2)} zł</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Hourly Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">⏰ Rozkład godzinowy</h3>
              <div className="space-y-2">
                {hourlyData.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Brak danych</p>
                ) : (
                  hourlyData.map((data) => (
                    <div key={data.hour} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-16">
                        {data.hour}:00
                      </span>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{
                              width: `${(data.orders / Math.max(...hourlyData.map(h => h.orders))) * 100}%`
                            }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {data.orders}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                        {data.revenue.toFixed(2)} zł
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Discounts Summary */}
          {stats.totalDiscounts > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">🎟️ Zniżki i kupony</h3>
                  <p className="text-sm text-gray-600 mt-1">Łączna wartość udzielonych zniżek</p>
                </div>
                <div className="text-3xl font-bold text-red-600">
                  -{stats.totalDiscounts.toFixed(2)} zł
                </div>
              </div>
            </div>
          )}          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">📤 Eksport danych</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
              >
                <span>🖨️</span>
                <span>Drukuj raport</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <span>📊</span>
                <span>Eksportuj CSV</span>
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                📋 Lista zamówień ({orders.length})
              </h3>
              <span className="text-sm text-gray-600">
                Suma: {stats.totalRevenue.toFixed(2)} zł
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nr
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Godzina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Typ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Płatność
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kwota
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Brak zamówień w wybranym okresie
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.order_number || order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('pl-PL')}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.order_type === 'delivery' ? 'bg-red-100 text-red-800' :
                            order.order_type === 'takeaway' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.order_type === 'delivery' ? '🚗 Dostawa' : 
                             order.order_type === 'takeaway' ? '🥡 Odbiór' : 
                             '🍽️ Na miejscu'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.payment_method === 'card' ? '💳 Karta' : 
                           order.payment_method === 'cash' ? '💵 Gotówka' : 
                           order.payment_method === 'split' ? '💳💵 Dzielona' : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.payment_status === 'paid' ? '✓ Opłacone' :
                             order.payment_status === 'pending' ? '⏳ Oczekuje' :
                             '✗ Anulowane'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right">
                          <div className="text-gray-900">{(order.total_amount || 0).toFixed(2)} zł</div>
                          {order.discount_amount > 0 && (
                            <div className="text-xs text-red-600">-{order.discount_amount.toFixed(2)} zł</div>
                          )}
                          {order.tip_amount > 0 && (
                            <div className="text-xs text-green-600">+{order.tip_amount.toFixed(2)} zł</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsSection;
