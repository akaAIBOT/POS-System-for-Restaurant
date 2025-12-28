import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    // Podstawowe
    restaurantName: "Wok'N'Cats",
    address: 'ul. Przykładowa 123, 00-001 Warszawa',
    phone: '+48 123 456 789',
    email: 'kontakt@wokncats.pl',
    website: 'https://wokncats.pl',
    nip: '1234567890',
    
    // Godziny otwarcia
    workingHours: {
      monday: { open: '10:00', close: '22:00', closed: false },
      tuesday: { open: '10:00', close: '22:00', closed: false },
      wednesday: { open: '10:00', close: '22:00', closed: false },
      thursday: { open: '10:00', close: '22:00', closed: false },
      friday: { open: '10:00', close: '23:00', closed: false },
      saturday: { open: '11:00', close: '23:00', closed: false },
      sunday: { open: '11:00', close: '22:00', closed: false }
    },
    
    // Dostawa
    deliveryEnabled: true,
    deliveryFee: 5,
    freeDeliveryFrom: 30,
    minOrderValue: 20,
    maxDeliveryDistance: 10,
    estimatedDeliveryTime: 45,
    
    // Płatności
    cashEnabled: true,
    cardEnabled: true,
    onlinePaymentEnabled: true,
    blikEnabled: true,
    
    // Powiadomienia
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Zaawansowane
    autoAcceptOrders: false,
    printReceipts: true,
    taxRate: 8,
    currency: 'PLN'
  });

  const [activeTab, setActiveTab] = useState('podstawowe');

  const handleSave = () => {
    // Zapisujemy w localStorage do użycia w drukowaniu
    localStorage.setItem('restaurantSettings', JSON.stringify({
      name: settings.restaurantName,
      address: settings.address,
      city: 'Warszawa', // Można dodać osobne pole
      phone: settings.phone,
      nip: settings.nip,
      email: settings.email,
      website: settings.website
    }));
    
    toast.success('Ustawienia zapisane pomyślnie!');
  };

  const days = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela'
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-2 overflow-x-auto">
        {['podstawowe', 'godziny', 'dostawa', 'platnosci', 'powiadomienia', 'zaawansowane', 'konto'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab === 'podstawowe' && '🏪 Podstawowe'}
            {tab === 'godziny' && '🕐 Godziny'}
            {tab === 'dostawa' && '🚗 Dostawa'}
            {tab === 'platnosci' && '💳 Płatności'}
            {tab === 'powiadomienia' && '🔔 Powiadomienia'}
            {tab === 'zaawansowane' && '⚙️ Zaawansowane'}
            {tab === 'konto' && '👤 Konto'}
          </button>
        ))}
      </div>

      {/* Podstawowe */}
      {activeTab === 'podstawowe' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Podstawowe informacje</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa restauracji</label>
              <input 
                type="text" 
                value={settings.restaurantName}
                onChange={(e) => setSettings({...settings, restaurantName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
              <input 
                type="tel" 
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Strona WWW</label>
              <input 
                type="url" 
                value={settings.website}
                onChange={(e) => setSettings({...settings, website: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adres</label>
              <input 
                type="text" 
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">NIP</label>
              <input 
                type="text" 
                value={settings.nip}
                onChange={(e) => setSettings({...settings, nip: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Godziny otwarcia */}
      {activeTab === 'godziny' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Godziny otwarcia</h3>
          
          {Object.entries(days).map(([key, label]) => (
            <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-32">
                <span className="font-semibold text-gray-900">{label}</span>
              </div>
              
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={!settings.workingHours[key].closed}
                  onChange={(e) => setSettings({
                    ...settings,
                    workingHours: {
                      ...settings.workingHours,
                      [key]: { ...settings.workingHours[key], closed: !e.target.checked }
                    }
                  })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Otwarte</span>
              </label>
              
              {!settings.workingHours[key].closed && (
                <>
                  <input 
                    type="time" 
                    value={settings.workingHours[key].open}
                    onChange={(e) => setSettings({
                      ...settings,
                      workingHours: {
                        ...settings.workingHours,
                        [key]: { ...settings.workingHours[key], open: e.target.value }
                      }
                    })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">—</span>
                  <input 
                    type="time" 
                    value={settings.workingHours[key].close}
                    onChange={(e) => setSettings({
                      ...settings,
                      workingHours: {
                        ...settings.workingHours,
                        [key]: { ...settings.workingHours[key], close: e.target.value }
                      }
                    })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </>
              )}
              
              {settings.workingHours[key].closed && (
                <span className="text-red-600 font-semibold">Zamknięte</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dostawa */}
      {activeTab === 'dostawa' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ustawienia dostawy</h3>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="font-semibold text-gray-900">Włącz dostawę</div>
              <div className="text-sm text-gray-600">Umożliw klientom zamawianie z dostawą</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.deliveryEnabled}
                onChange={(e) => setSettings({...settings, deliveryEnabled: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Koszt dostawy (zł)</label>
              <input 
                type="number" 
                value={settings.deliveryFee}
                onChange={(e) => setSettings({...settings, deliveryFee: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Darmowa dostawa od (zł)</label>
              <input 
                type="number" 
                value={settings.freeDeliveryFrom}
                onChange={(e) => setSettings({...settings, freeDeliveryFrom: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min. wartość zamówienia (zł)</label>
              <input 
                type="number" 
                value={settings.minOrderValue}
                onChange={(e) => setSettings({...settings, minOrderValue: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Maks. odległość dostawy (km)</label>
              <input 
                type="number" 
                value={settings.maxDeliveryDistance}
                onChange={(e) => setSettings({...settings, maxDeliveryDistance: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Szacowany czas dostawy (min)</label>
              <input 
                type="number" 
                value={settings.estimatedDeliveryTime}
                onChange={(e) => setSettings({...settings, estimatedDeliveryTime: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Płatności */}
      {activeTab === 'platnosci' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Metody płatności</h3>
          
          <ToggleOption 
            label="Gotówka" 
            description="Płatność gotówką przy odbiorze"
            checked={settings.cashEnabled}
            onChange={(val) => setSettings({...settings, cashEnabled: val})}
          />
          
          <ToggleOption 
            label="Karta płatnicza" 
            description="Płatność kartą w restauracji"
            checked={settings.cardEnabled}
            onChange={(val) => setSettings({...settings, cardEnabled: val})}
          />
          
          <ToggleOption 
            label="Płatności online" 
            description="Przelewy24, PayU, itp."
            checked={settings.onlinePaymentEnabled}
            onChange={(val) => setSettings({...settings, onlinePaymentEnabled: val})}
          />
          
          <ToggleOption 
            label="BLIK" 
            description="Szybkie płatności BLIK"
            checked={settings.blikEnabled}
            onChange={(val) => setSettings({...settings, blikEnabled: val})}
          />
        </div>
      )}

      {/* Powiadomienia */}
      {activeTab === 'powiadomienia' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Powiadomienia</h3>
          
          <ToggleOption 
            label="Email" 
            description="Powiadomienia na adres email"
            checked={settings.emailNotifications}
            onChange={(val) => setSettings({...settings, emailNotifications: val})}
          />
          
          <ToggleOption 
            label="SMS" 
            description="Powiadomienia SMS"
            checked={settings.smsNotifications}
            onChange={(val) => setSettings({...settings, smsNotifications: val})}
          />
          
          <ToggleOption 
            label="Push" 
            description="Powiadomienia push w aplikacji"
            checked={settings.pushNotifications}
            onChange={(val) => setSettings({...settings, pushNotifications: val})}
          />
        </div>
      )}

      {/* Zaawansowane */}
      {activeTab === 'zaawansowane' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Zaawansowane ustawienia</h3>
          
          <ToggleOption 
            label="Auto-akceptacja zamówień" 
            description="Automatycznie akceptuj nowe zamówienia"
            checked={settings.autoAcceptOrders}
            onChange={(val) => setSettings({...settings, autoAcceptOrders: val})}
          />
          
          <ToggleOption 
            label="Automatyczny druk paragonów" 
            description="Drukuj paragony po zamówieniu"
            checked={settings.printReceipts}
            onChange={(val) => setSettings({...settings, printReceipts: val})}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stawka VAT (%)</label>
              <input 
                type="number" 
                value={settings.taxRate}
                onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Waluta</label>
              <select 
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PLN">PLN - Polski złoty</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dolar amerykański</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Konto Section */}
      {activeTab === 'konto' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Konto użytkownika</h3>
          
          {/* Informacje o użytkowniku */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{user?.email || 'Użytkownik'}</div>
                <div className="text-sm text-gray-600">Rola: <span className="font-semibold text-blue-600">{user?.role === 'admin' ? 'Administrator' : 'Kasjer'}</span></div>
              </div>
            </div>
          </div>

          {/* Akcje konta */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Zarządzanie sesją</h4>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/cashier')}
                  className="w-full flex items-center justify-between px-6 py-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Przejdź do kasy</div>
                      <div className="text-sm text-gray-600">Otwórz panel kasowy</div>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">→</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Czy na pewno chcesz się wylogować?')) {
                      logout();
                      navigate('/login');
                    }
                  }}
                  className="w-full flex items-center justify-between px-6 py-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group border-2 border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚪</span>
                    <div className="text-left">
                      <div className="font-semibold text-red-700">Wyloguj się</div>
                      <div className="text-sm text-red-600">Zakończ sesję i wróć do ekranu logowania</div>
                    </div>
                  </div>
                  <span className="text-red-400 group-hover:text-red-600">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition shadow-lg text-lg"
        >
          💾 Zapisz ustawienia
        </button>
      </div>
    </div>
  );
}

function ToggleOption({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <div className="font-semibold text-gray-900">{label}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
}
