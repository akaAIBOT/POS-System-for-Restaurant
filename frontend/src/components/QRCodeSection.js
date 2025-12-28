import React, { useState } from 'react';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';

export default function QRCodeSection() {
  const [qrCodes, setQrCodes] = useState([
    {
      id: 1,
      name: 'Menu Online',
      url: 'https://wokncats.pl/menu',
      description: 'QR kod do menu online',
      type: 'menu',
      scans: 156
    },
    {
      id: 2,
      name: 'Recenzje Google',
      url: 'https://g.page/wokncats/review',
      description: 'Zostaw nam recenzję',
      type: 'review',
      scans: 89
    },
    {
      id: 3,
      name: 'Wi-Fi Hasło',
      url: 'WIFI:T:WPA;S:WokNCats;P:password123;;',
      description: 'Darmowe Wi-Fi dla gości',
      type: 'wifi',
      scans: 234
    },
    {
      id: 4,
      name: 'Instagram',
      url: 'https://instagram.com/wokncats',
      description: 'Śledź nas na Instagram',
      type: 'social',
      scans: 67
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newQR, setNewQR] = useState({
    name: '',
    url: '',
    description: '',
    type: 'other'
  });
  const [qrPreview, setQrPreview] = useState(null);

  const generateQRPreview = async (url) => {
    if (!url) return;
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrPreview(qrDataUrl);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  const handleCreate = () => {
    if (!newQR.name || !newQR.url) {
      toast.error('Wypełnij nazwę i URL');
      return;
    }

    const qr = {
      id: Date.now(),
      name: newQR.name,
      url: newQR.url,
      description: newQR.description,
      type: newQR.type,
      scans: 0
    };

    setQrCodes([...qrCodes, qr]);
    setShowModal(false);
    setNewQR({ name: '', url: '', description: '', type: 'other' });
    setQrPreview(null);
    toast.success('Kod QR utworzony');
  };

  const handleDownload = async (qr) => {
    try {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, qr.url, { width: 600, margin: 2 });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${qr.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
      toast.success('Kod QR pobrany');
    } catch (err) {
      toast.error('Błąd pobierania');
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Usunąć ten kod QR?')) return;
    setQrCodes(qrCodes.filter(q => q.id !== id));
    toast.success('Kod QR usunięty');
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'menu': return '📱';
      case 'review': return '⭐';
      case 'wifi': return '📶';
      case 'social': return '📸';
      case 'payment': return '💳';
      default: return '🔗';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'menu': return 'Menu';
      case 'review': return 'Recenzja';
      case 'wifi': return 'Wi-Fi';
      case 'social': return 'Social Media';
      case 'payment': return 'Płatność';
      default: return 'Inne';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Kody QR</h3>
          <p className="text-sm text-gray-600 mt-1">Generuj kody QR dla menu, Wi-Fi, social media</p>
        </div>
        <button 
          onClick={() => {
            setNewQR({ name: '', url: '', description: '', type: 'other' });
            setQrPreview(null);
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition shadow-lg flex items-center gap-2"
        >
          <span>➕</span>
          <span>Utwórz QR</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-3xl mb-2">📱</div>
          <div className="text-sm opacity-90 mb-1">Kody QR</div>
          <div className="text-3xl font-bold">{qrCodes.length}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-3xl mb-2">👁️</div>
          <div className="text-sm opacity-90 mb-1">Całkowite skanowania</div>
          <div className="text-3xl font-bold">{qrCodes.reduce((sum, q) => sum + q.scans, 0)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-sm opacity-90 mb-1">Najpopularniejszy</div>
          <div className="text-xl font-bold">{qrCodes.sort((a, b) => b.scans - a.scans)[0]?.name || 'N/A'}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-sm opacity-90 mb-1">Średnio skanowań</div>
          <div className="text-3xl font-bold">{Math.round(qrCodes.reduce((sum, q) => sum + q.scans, 0) / qrCodes.length) || 0}</div>
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map(qr => (
          <QRCard 
            key={qr.id} 
            qr={qr} 
            onDownload={handleDownload}
            onDelete={handleDelete}
            getTypeIcon={getTypeIcon}
            getTypeLabel={getTypeLabel}
          />
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nowy kod QR</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa</label>
                  <input 
                    type="text"
                    value={newQR.name}
                    onChange={(e) => setNewQR({...newQR, name: e.target.value})}
                    placeholder="np. Menu Online"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">URL / Treść</label>
                  <input 
                    type="text"
                    value={newQR.url}
                    onChange={(e) => {
                      setNewQR({...newQR, url: e.target.value});
                      generateQRPreview(e.target.value);
                    }}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Typ</label>
                  <select 
                    value={newQR.type}
                    onChange={(e) => setNewQR({...newQR, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="menu">Menu</option>
                    <option value="review">Recenzja</option>
                    <option value="wifi">Wi-Fi</option>
                    <option value="social">Social Media</option>
                    <option value="payment">Płatność</option>
                    <option value="other">Inne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Opis</label>
                  <textarea 
                    value={newQR.description}
                    onChange={(e) => setNewQR({...newQR, description: e.target.value})}
                    placeholder="Krótki opis"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Podgląd</label>
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  {qrPreview ? (
                    <img src={qrPreview} alt="QR Preview" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-sm">Wpisz URL aby zobaczyć podgląd</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setQrPreview(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Anuluj
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition font-semibold"
              >
                Utwórz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Szybkie szablony</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => {
              setNewQR({
                name: 'Wi-Fi Gości',
                url: 'WIFI:T:WPA;S:NetworkName;P:password;;',
                description: 'QR do Wi-Fi dla gości',
                type: 'wifi'
              });
              generateQRPreview('WIFI:T:WPA;S:NetworkName;P:password;;');
              setShowModal(true);
            }}
            className="p-4 bg-white rounded-lg hover:shadow-lg transition text-left border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-3xl mb-2">📶</div>
            <div className="font-semibold text-gray-900">Wi-Fi QR</div>
            <div className="text-sm text-gray-600">Automatyczne połączenie</div>
          </button>

          <button 
            onClick={() => {
              setNewQR({
                name: 'Menu Online',
                url: 'https://wokncats.pl/menu',
                description: 'Link do menu online',
                type: 'menu'
              });
              generateQRPreview('https://wokncats.pl/menu');
              setShowModal(true);
            }}
            className="p-4 bg-white rounded-lg hover:shadow-lg transition text-left border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-3xl mb-2">📱</div>
            <div className="font-semibold text-gray-900">Menu QR</div>
            <div className="text-sm text-gray-600">Bezkontaktowe menu</div>
          </button>

          <button 
            onClick={() => {
              setNewQR({
                name: 'Recenzja Google',
                url: 'https://g.page/r/YOUR_PLACE/review',
                description: 'Link do recenzji Google',
                type: 'review'
              });
              generateQRPreview('https://g.page/r/YOUR_PLACE/review');
              setShowModal(true);
            }}
            className="p-4 bg-white rounded-lg hover:shadow-lg transition text-left border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-3xl mb-2">⭐</div>
            <div className="font-semibold text-gray-900">Recenzja QR</div>
            <div className="text-sm text-gray-600">Zbieraj opinie</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function QRCard({ qr, onDownload, onDelete, getTypeIcon, getTypeLabel }) {
  const [qrImage, setQrImage] = React.useState(null);

  React.useEffect(() => {
    QRCode.toDataURL(qr.url, { width: 200, margin: 1 }).then(setQrImage);
  }, [qr.url]);

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-purple-500 transition overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-center">
        {qrImage && <img src={qrImage} alt={qr.name} className="w-48 h-48" />}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon(qr.type)}</span>
            <div>
              <h4 className="font-bold text-gray-900">{qr.name}</h4>
              <span className="text-xs text-gray-500">{getTypeLabel(qr.type)}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">{qr.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>👁️</span>
          <span className="font-semibold">{qr.scans} skanowań</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onDownload(qr)}
            className="flex-1 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-medium text-sm"
          >
            ⬇️ Pobierz
          </button>
          <button
            onClick={() => onDelete(qr.id)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
