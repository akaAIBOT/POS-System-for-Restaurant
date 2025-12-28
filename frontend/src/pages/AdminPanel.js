import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { menuAPI } from '../services/api';
import PromotionsSection from '../components/PromotionsSection';
import CouponsSection from '../components/CouponsSection';
import SettingsSection from '../components/SettingsSection';
import AddonsSection from '../components/AddonsSection';
import ReportsSection from '../components/ReportsSection';
import ParametersSection from '../components/ParametersSection';
import QRCodeSection from '../components/QRCodeSection';
import CrossSellingSection from '../components/CrossSellingSection';
import MarketingSection from '../components/MarketingSection';
import WorkTimeSection from '../components/WorkTimeSection';
import StaffSection from '../components/StaffSection';
import PackagesSection from '../components/PackagesSection';
import DeliveryIntegrationsSection from '../components/DeliveryIntegrationsSection';
import TablesSection from '../components/TablesSection';
import AdvancedAnalyticsSection from '../components/AdvancedAnalyticsSection';
import AnimatedCounter from '../components/AnimatedCounter';
import ExportMenu from '../components/ExportMenu';
import SparklineChart from '../components/SparklineChart';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is admin, if not redirect to cashier
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.warning('Nie masz dostępu do panelu administracyjnego');
      navigate('/cashier');
    }
  }, [user, navigate]);
  
  const [activeSection, setActiveSection] = useState('pulpit');
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Trend data for sparklines (mock data)
  const [trendData] = useState({
    revenue: [1200, 1350, 1180, 1450, 1380, 1250, 1400],
    orders: [30, 35, 28, 42, 38, 33, 35]
  });

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);
  
  // Statistics
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    monthRevenue: 0,
    avgOrderValue: 0
  });
  
  // Menu
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Dostęp zabroniony');
      navigate('/cashier');
    }
    loadInitialData();
  }, [user, navigate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load menu items
      const menuResponse = await menuAPI.getAll();
      setMenuItems(menuResponse.data);
      
      // Extract categories
      const cats = [...new Set(menuResponse.data.map(item => item.category))];
      setCategories(cats);
      
      // Load statistics (mock data for now)
      setStats({
        todayRevenue: 1250.50,
        todayOrders: 35,
        monthRevenue: 28450.75,
        avgOrderValue: 42.30
      });
    } catch (error) {
      toast.error('Błąd ładowania danych');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm('Usunąć to danie?')) return;
    
    try {
      await menuAPI.delete(id);
      setMenuItems(menuItems.filter(item => item.id !== id));
      toast.success('Danie usunięte');
    } catch (error) {
      toast.error('Błąd usuwania');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updated = { ...item, available: !item.available };
      await menuAPI.update(item.id, updated);
      setMenuItems(menuItems.map(i => i.id === item.id ? updated : i));
      toast.success(updated.available ? 'Danie dostępne' : 'Danie niedostępne');
    } catch (error) {
      toast.error('Błąd aktualizacji');
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out relative flex-shrink-0`}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-white text-slate-800 rounded-full p-1.5 shadow-lg hover:bg-slate-100 transition z-10"
          title={sidebarCollapsed ? 'Rozwiń menu' : 'Zwiń menu'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>

        {/* Logo */}
        <div className={`p-6 border-b border-slate-700 ${sidebarCollapsed ? 'px-3' : ''}`}>
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <img 
              src={`${process.env.REACT_APP_API_URL || 'http://192.168.100.8:8000'}/uploads/5702e88b-3b17-4bbb-9afe-bbec754dac0f.avif`}
              alt="Wok'N'Cats" 
              className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-orange-400"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect width=%2248%22 height=%2248%22 fill=%22%23f97316%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22white%22%3EW%3C/text%3E%3C/svg%3E';
              }}
            />
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">Wok'N'Cats</h1>
                <p className="text-xs text-slate-400">Panel Administracyjny</p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {!sidebarCollapsed && (
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj sekcji..."
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
              />
              <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {/* Dashboard */}
          {!sidebarCollapsed && (
            <div className="px-4 mb-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Główne</div>
            </div>
          )}
          
          <NavItem 
            icon="📊" 
            label="Pulpit" 
            active={activeSection === 'pulpit'}
            onClick={() => setActiveSection('pulpit')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="📈" 
            label="Raport sprzedaży" 
            active={activeSection === 'raport'}
            onClick={() => setActiveSection('raport')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />

          {/* Products */}
          {!sidebarCollapsed && (
            <div className="px-4 mb-2 mt-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Baza produktów</div>
            </div>
          )}
          
          <NavItem 
            icon="🍜" 
            label="Menu" 
            active={activeSection === 'menu'}
            onClick={() => setActiveSection('menu')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="🔤" 
            label="Grupy dodatków" 
            active={activeSection === 'dodatki'}
            onClick={() => setActiveSection('dodatki')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="⚙️" 
            label="Parametry" 
            active={activeSection === 'parametry'}
            onClick={() => setActiveSection('parametry')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="📦" 
            label="Opakowania zbiorcze" 
            active={activeSection === 'opakowania'}
            onClick={() => setActiveSection('opakowania')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />

          {/* Operational Section */}
          {!sidebarCollapsed && (
            <div className="px-4 mb-2 mt-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Operacje</div>
            </div>
          )}
          <NavItem 
            icon="🪑" 
            label="Stoliki" 
            active={activeSection === 'stoliki'}
            onClick={() => setActiveSection('stoliki')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="👨‍🍳" 
            label="Ekran kuchni" 
            active={activeSection === 'kuchnia'}
            onClick={() => {
              window.open('/kitchen', '_blank');
            }}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="📈" 
            label="Analityka" 
            active={activeSection === 'analityka'}
            onClick={() => setActiveSection('analityka')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />

          {!sidebarCollapsed && (
            <div className="px-4 mb-2 mt-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Optymalizacja sprzedaży</div>
            </div>
          )}
          <NavItem 
            icon="🎁" 
            label="Promocje" 
            active={activeSection === 'promocje'}
            onClick={() => setActiveSection('promocje')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="🎟️" 
            label="Kupony" 
            active={activeSection === 'kupony'}
            onClick={() => setActiveSection('kupony')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="🛍️" 
            label="Cross-selling" 
            active={activeSection === 'cross-selling'}
            onClick={() => setActiveSection('cross-selling')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="🤖" 
            label="Marketing automatyczny" 
            active={activeSection === 'marketing'}
            onClick={() => setActiveSection('marketing')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="📱" 
            label="Kody QR" 
            active={activeSection === 'qr'}
            onClick={() => setActiveSection('qr')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />

          {/* Delivery & Integrations */}
          {!sidebarCollapsed && (
            <div className="px-4 mb-2 mt-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Dostawa</div>
            </div>
          )}
          <NavItem 
            icon="🚗" 
            label="Integracje z dostawą" 
            active={activeSection === 'integracje-dostawa'}
            onClick={() => setActiveSection('integracje-dostawa')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />

          {/* Settings */}
          {!sidebarCollapsed && (
            <div className="px-4 mb-2 mt-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Ustawienia</div>
            </div>
          )}
          
          <NavItem 
            icon="🔧" 
            label="Ustawienia" 
            active={activeSection === 'ustawienia'}
            onClick={() => setActiveSection('ustawienia')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="⏰" 
            label="Czas pracy" 
            active={activeSection === 'czaspracy'}
            onClick={() => setActiveSection('czaspracy')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
          <NavItem 
            icon="👥" 
            label="Pracownicy" 
            active={activeSection === 'pracownicy'}
            onClick={() => setActiveSection('pracownicy')}
            collapsed={sidebarCollapsed}
            searchQuery={searchQuery}
          />
        </div>

        {/* Bottom Actions */}
        <div className={`p-4 border-t border-slate-700 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <button
            onClick={() => navigate('/cashier')}
            className={`w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white ${sidebarCollapsed ? 'px-2' : 'px-4'} py-3 rounded-lg transition font-semibold flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} shadow-lg`}
            title={sidebarCollapsed ? 'Przejdź do kasy' : ''}
          >
            <span>🎯</span>
            {!sidebarCollapsed && <span>Przejdź do kasy</span>}
          </button>
          <button
            onClick={logout}
            className={`w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white ${sidebarCollapsed ? 'px-2' : 'px-4'} py-2 rounded-lg transition font-medium flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'}`}
            title={sidebarCollapsed ? 'Wyloguj' : ''}
          >
            <span>🚪</span>
            {!sidebarCollapsed && <span>Wyloguj</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Enhanced Top Bar */}
        <div className="bg-white shadow-md border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>🏠</span>
                  <span>Panel Administracyjny</span>
                  <span>›</span>
                  <span className="text-gray-900 font-medium">
                    {activeSection === 'pulpit' && 'Pulpit'}
                    {activeSection === 'raport' && 'Raport sprzedaży'}
                    {activeSection === 'menu' && 'Menu'}
                    {activeSection === 'dodatki' && 'Grupy dodatków'}
                    {activeSection === 'parametry' && 'Parametry'}
                    {activeSection === 'opakowania' && 'Opakowania zbiorcze'}
                    {activeSection === 'stoliki' && 'Zarządzanie stolikami'}
                    {activeSection === 'kuchnia' && 'Ekran kuchni'}
                    {activeSection === 'analityka' && 'Zaawansowana analityka'}
                    {activeSection === 'promocje' && 'Promocje'}
                    {activeSection === 'kupony' && 'Kupony'}
                    {activeSection === 'cross-selling' && 'Cross-selling'}
                    {activeSection === 'marketing' && 'Marketing automatyczny'}
                    {activeSection === 'qr' && 'Kody QR'}
                    {activeSection === 'integracje-dostawa' && 'Integracje z dostawą'}
                    {activeSection === 'ustawienia' && 'Ustawienia'}
                    {activeSection === 'czaspracy' && 'Czas pracy pracowników'}
                    {activeSection === 'pracownicy' && 'Zarządzanie pracownikami'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {activeSection === 'pulpit' && 'Pulpit'}
                  {activeSection === 'raport' && 'Raport sprzedaży'}
                  {activeSection === 'menu' && 'Menu'}
                  {activeSection === 'dodatki' && 'Grupy dodatków'}
                  {activeSection === 'parametry' && 'Parametry'}
                  {activeSection === 'opakowania' && 'Opakowania zbiorcze'}
                  {activeSection === 'stoliki' && 'Zarządzanie stolikami'}
                  {activeSection === 'kuchnia' && 'Ekran kuchni'}
                  {activeSection === 'analityka' && 'Zaawansowana analityka'}
                  {activeSection === 'promocje' && 'Promocje'}
                  {activeSection === 'kupony' && 'Kupony'}
                  {activeSection === 'cross-selling' && 'Cross-selling'}
                  {activeSection === 'marketing' && 'Marketing automatyczny'}
                  {activeSection === 'qr' && 'Kody QR'}
                  {activeSection === 'integracje-dostawa' && 'Integracje z dostawą'}
                  {activeSection === 'ustawienia' && 'Ustawienia'}
                  {activeSection === 'czaspracy' && 'Czas pracy pracowników'}
                  {activeSection === 'pracownicy' && 'Zarządzanie pracownikami'}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Zalogowany jako</p>
                  <p className="font-semibold text-gray-900 text-sm">{user?.name || user?.email}</p>
                  <p className="text-xs text-orange-600 font-medium">{user?.role === 'admin' ? 'Administrator' : 'Pracownik'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Ładowanie...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Pulpit - Dashboard */}
              {activeSection === 'pulpit' && (
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Szybkie akcje</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <QuickActionButton 
                        icon="➕" 
                        label="Dodaj danie" 
                        onClick={() => navigate('/menu-editor')}
                      />
                      <QuickActionButton 
                        icon="🎁" 
                        label="Nowa promocja" 
                        onClick={() => setActiveSection('promocje')}
                      />
                      <QuickActionButton 
                        icon="🎟️" 
                        label="Nowy kupon" 
                        onClick={() => setActiveSection('kupony')}
                      />
                      <QuickActionButton 
                        icon="👥" 
                        label="Pracownicy" 
                        onClick={() => setActiveSection('pracownicy')}
                      />
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ostatnia aktywność</h3>
                    <div className="space-y-3">
                      <ActivityItem 
                        icon="✅" 
                        text="Zamówienie #1234 zostało zrealizowane" 
                        time="5 min temu"
                      />
                      <ActivityItem 
                        icon="🍜" 
                        text="Dodano nowe danie: Pad Thai" 
                        time="2 godz. temu"
                      />
                      <ActivityItem 
                        icon="👤" 
                        text="Nowy pracownik: Jan Kowalski" 
                        time="3 godz. temu"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Section */}
              {activeSection === 'menu' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Szukaj dań..." 
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                      />
                      <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        🔍 Filtry
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <ExportMenu 
                        data={menuItems}
                        filename="menu"
                      />
                      <button 
                        onClick={() => navigate('/menu-editor')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg flex items-center gap-2"
                      >
                        <span>➕</span>
                        <span>Dodaj danie</span>
                      </button>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button 
                      onClick={() => setSelectedCategory('Wszystkie')}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                        selectedCategory === 'Wszystkie'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Wszystkie
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                          selectedCategory === cat
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Menu Items Table */}
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Danie</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Kategoria</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cena</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Akcje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {menuItems
                          .filter(item => selectedCategory === 'Wszystkie' || item.category === selectedCategory)
                          .map(item => (
                          <tr key={item.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {item.image_url && (
                                  <img 
                                    src={item.image_url} 
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-semibold text-gray-900">{item.name}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900">{item.price.toFixed(2)} zł</span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleAvailability(item)}
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  item.available 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {item.available ? '✓ Dostępne' : '✕ Niedostępne'}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => navigate('/menu-editor')}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Edytuj"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => handleDeleteMenuItem(item.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Usuń"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Dodatki Section */}
              {activeSection === 'dodatki' && <AddonsSection />}

              {/* Raport Section */}
              {activeSection === 'raport' && <ReportsSection />}

              {/* Parametry Section */}
              {activeSection === 'parametry' && <ParametersSection />}

              {/* Promocje Section */}
              {activeSection === 'promocje' && <PromotionsSection />}

              {/* Kupony Section */}
              {activeSection === 'kupony' && <CouponsSection />}

              {/* QR Section */}
              {activeSection === 'qr' && <QRCodeSection />}

              {/* Cross-selling Section */}
              {activeSection === 'cross-selling' && <CrossSellingSection />}

              {/* Marketing Section */}
              {activeSection === 'marketing' && <MarketingSection />}

              {/* Ustawienia Section */}
              {activeSection === 'ustawienia' && <SettingsSection />}

              {/* Work Time Section */}
              {activeSection === 'czaspracy' && <WorkTimeSection />}

              {/* Staff Section */}
              {activeSection === 'pracownicy' && <StaffSection />}

              {/* Packages Section */}
              {activeSection === 'opakowania' && <PackagesSection />}

              {/* Delivery Integrations Section */}
              {activeSection === 'integracje-dostawa' && <DeliveryIntegrationsSection />}

              {/* Tables Section */}
              {activeSection === 'stoliki' && <TablesSection />}

              {/* Advanced Analytics Section */}
              {activeSection === 'analityka' && <AdvancedAnalyticsSection />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function NavItem({ icon, label, active, onClick, collapsed, searchQuery = '' }) {
  // Filter by search query
  if (searchQuery && !label.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`w-full ${collapsed ? 'px-3 justify-center' : 'px-6'} py-3 flex items-center gap-3 transition group relative ${
        active 
          ? 'bg-slate-700 text-white border-l-4 border-orange-500' 
          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
      }`}
      title={collapsed ? label : ''}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span className="font-medium text-sm">{label}</span>}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
          {label}
        </div>
      )}
    </button>
  );
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  // Extract numeric value if string contains numbers
  const numericValue = typeof value === 'string' ? 
    parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  const suffix = typeof value === 'string' ? 
    value.replace(/[0-9.,]/g, '').trim() : '';

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl animate-pulse-subtle">{icon}</span>
        <div className="bg-white bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center">
          <span className="text-sm">📈</span>
        </div>
      </div>
      <div className="text-sm opacity-90 mb-1">{title}</div>
      <div className="text-3xl font-bold">
        <AnimatedCounter value={numericValue} suffix={suffix ? ` ${suffix}` : ''} />
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition border-2 border-transparent hover:border-blue-500"
    >
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </button>
  );
}

function ActivityItem({ icon, text, time }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{text}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
