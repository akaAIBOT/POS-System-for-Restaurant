import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const DeliveryIntegrationsSection = () => {
  const [integrations, setIntegrations] = useState({
    uberEats: {
      enabled: false,
      apiKey: '',
      storeId: '',
      webhookUrl: '',
      autoAcceptOrders: false,
      lastSync: null
    },
    glovo: {
      enabled: false,
      apiKey: '',
      storeId: '',
      webhookUrl: '',
      autoAcceptOrders: false,
      lastSync: null
    },
    wolt: {
      enabled: false,
      apiKey: '',
      storeId: '',
      webhookUrl: '',
      autoAcceptOrders: false,
      lastSync: null
    }
  });

  const [editingProvider, setEditingProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    const stored = localStorage.getItem('deliveryIntegrations');
    if (stored) {
      setIntegrations(JSON.parse(stored));
    }
  };

  const saveIntegrations = (newIntegrations) => {
    localStorage.setItem('deliveryIntegrations', JSON.stringify(newIntegrations));
    setIntegrations(newIntegrations);
    toast.success('Ustawienia zapisane');
  };

  const handleEdit = (provider) => {
    setEditingProvider(provider);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingProvider) return;

    const updatedIntegrations = {
      ...integrations,
      [editingProvider]: {
        ...integrations[editingProvider],
        lastSync: new Date().toISOString()
      }
    };

    saveIntegrations(updatedIntegrations);
    setShowModal(false);
    setEditingProvider(null);
  };

  const handleToggle = (provider) => {
    const current = integrations[provider];
    
    if (!current.enabled && (!current.apiKey || !current.storeId)) {
      toast.error('Najpierw uzupełnij dane połączenia');
      handleEdit(provider);
      return;
    }

    const updatedIntegrations = {
      ...integrations,
      [provider]: {
        ...current,
        enabled: !current.enabled,
        lastSync: !current.enabled ? new Date().toISOString() : current.lastSync
      }
    };

    saveIntegrations(updatedIntegrations);
  };

  const testConnection = async (provider) => {
    setTestingConnection(true);
    
    // Symulacja testu połączenia
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.3; // 70% success rate for demo
    
    if (success) {
      toast.success(`Połączenie z ${getProviderName(provider)} działa poprawnie!`);
    } else {
      toast.error(`Nie można połączyć z ${getProviderName(provider)}. Sprawdź dane dostępu.`);
    }
    
    setTestingConnection(false);
  };

  const syncMenu = async (provider) => {
    toast.info(`Synchronizacja menu z ${getProviderName(provider)}...`);
    
    // Symulacja synchronizacji
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const updatedIntegrations = {
      ...integrations,
      [provider]: {
        ...integrations[provider],
        lastSync: new Date().toISOString()
      }
    };
    
    saveIntegrations(updatedIntegrations);
    toast.success(`Menu zsynchronizowane z ${getProviderName(provider)}`);
  };

  const getProviderName = (provider) => {
    const names = {
      uberEats: 'Uber Eats',
      glovo: 'Glovo',
      wolt: 'Wolt'
    };
    return names[provider] || provider;
  };

  const getProviderIcon = (provider) => {
    const icons = {
      uberEats: '🚗',
      glovo: '🛵',
      wolt: '⚡'
    };
    return icons[provider] || '📦';
  };

  const getProviderColor = (provider) => {
    const colors = {
      uberEats: 'from-green-500 to-green-600',
      glovo: 'from-yellow-500 to-orange-600',
      wolt: 'from-blue-500 to-cyan-600'
    };
    return colors[provider] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Integracje z dostawą</h2>
        <p className="text-gray-600 mt-1">Zarządzaj integracjami z platformami dostaw</p>
      </div>

      {/* Informacje o integracji */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Jak działa integracja?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatyczny import zamówień z platform dostaw</li>
              <li>• Synchronizacja menu i dostępności produktów</li>
              <li>• Powiadomienia o nowych zamówieniach</li>
              <li>• Automatyczne aktualizacje statusu zamówień</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Karty integracji */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {Object.keys(integrations).map(provider => {
          const integration = integrations[provider];
          return (
            <div key={provider} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className={`bg-gradient-to-r ${getProviderColor(provider)} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getProviderIcon(provider)}</span>
                    <div>
                      <h3 className="font-bold text-xl">{getProviderName(provider)}</h3>
                      <p className="text-sm opacity-90">
                        {integration.enabled ? 'Aktywna' : 'Nieaktywna'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(provider)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      integration.enabled ? 'bg-white' : 'bg-white/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        integration.enabled 
                          ? 'translate-x-6 bg-green-500' 
                          : 'translate-x-1 bg-gray-400'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {/* Status połączenia */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${
                      integration.enabled && integration.apiKey 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                    }`}>
                      {integration.enabled && integration.apiKey ? '✓ Połączono' : '⚠ Brak konfiguracji'}
                    </span>
                  </div>

                  {/* Ostatnia synchronizacja */}
                  {integration.lastSync && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Ostatnia sync:</span>
                      <span className="text-gray-900">
                        {new Date(integration.lastSync).toLocaleString('pl-PL', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  {/* Auto-accept */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Auto-akceptacja:</span>
                    <span className={integration.autoAcceptOrders ? 'text-green-600' : 'text-gray-400'}>
                      {integration.autoAcceptOrders ? 'Włączona' : 'Wyłączona'}
                    </span>
                  </div>

                  {/* Akcje */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(provider)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ⚙️ Konfiguruj
                    </button>
                    {integration.enabled && integration.apiKey && (
                      <button
                        onClick={() => syncMenu(provider)}
                        className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        🔄 Synchronizuj
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal konfiguracji */}
      {showModal && editingProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`bg-gradient-to-r ${getProviderColor(editingProvider)} p-6 text-white`}>
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">{getProviderIcon(editingProvider)}</span>
                <span>Konfiguracja {getProviderName(editingProvider)}</span>
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key *
                </label>
                <input
                  type="password"
                  value={integrations[editingProvider].apiKey}
                  onChange={(e) => setIntegrations({
                    ...integrations,
                    [editingProvider]: {
                      ...integrations[editingProvider],
                      apiKey: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Wprowadź API key z panelu partnera"
                />
              </div>

              {/* Store ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store ID / Restaurant ID *
                </label>
                <input
                  type="text"
                  value={integrations[editingProvider].storeId}
                  onChange={(e) => setIntegrations({
                    ...integrations,
                    [editingProvider]: {
                      ...integrations[editingProvider],
                      storeId: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ID twojej restauracji"
                />
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={integrations[editingProvider].webhookUrl}
                  onChange={(e) => setIntegrations({
                    ...integrations,
                    [editingProvider]: {
                      ...integrations[editingProvider],
                      webhookUrl: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://twoja-domena.pl/webhook"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL do otrzymywania powiadomień o nowych zamówieniach
                </p>
              </div>

              {/* Auto-accept zamówień */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Automatyczna akceptacja zamówień</div>
                  <div className="text-sm text-gray-600">Zamówienia będą automatycznie akceptowane bez potwierdzenia</div>
                </div>
                <button
                  onClick={() => setIntegrations({
                    ...integrations,
                    [editingProvider]: {
                      ...integrations[editingProvider],
                      autoAcceptOrders: !integrations[editingProvider].autoAcceptOrders
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    integrations[editingProvider].autoAcceptOrders ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      integrations[editingProvider].autoAcceptOrders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Test połączenia */}
              <div className="border-t pt-4">
                <button
                  onClick={() => testConnection(editingProvider)}
                  disabled={testingConnection}
                  className="w-full px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingConnection ? '⏳ Testowanie połączenia...' : '🔌 Testuj połączenie'}
                </button>
              </div>

              {/* Przyciski akcji */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProvider(null);
                    loadIntegrations(); // Reset changes
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Zapisz ustawienia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instrukcje */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📚</span>
          <span>Jak uzyskać dane dostępu?</span>
        </h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Uber Eats:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Zaloguj się do Uber Eats Manager</li>
              <li>Przejdź do Settings → Integrations</li>
              <li>Skopiuj API Key i Restaurant ID</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Glovo:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Otwórz Glovo Partner Portal</li>
              <li>Przejdź do Integracje → API</li>
              <li>Wygeneruj nowy API key dla swojej restauracji</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Wolt:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Zaloguj się do Wolt Drive Portal</li>
              <li>Wybierz Ustawienia → Integracje</li>
              <li>Aktywuj API i skopiuj dane dostępu</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryIntegrationsSection;
