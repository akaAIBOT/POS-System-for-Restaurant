import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    full_name: '',
    position: '',
    phone: '',
    pin_code: '',
    role: 'staff'
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/staff-profiles/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      toast.error('Błąd ładowania pracowników');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: '',
      password: '',
      full_name: staffMember.full_name || '',
      position: staffMember.position || '',
      phone: staffMember.phone || '',
      pin_code: '',
      role: staffMember.role
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedStaff(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      full_name: '',
      position: '',
      phone: '',
      pin_code: '',
      role: 'staff'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (selectedStaff) {
        // Update existing staff
        const updateData = {};
        if (formData.full_name) updateData.full_name = formData.full_name;
        if (formData.position) updateData.position = formData.position;
        if (formData.phone) updateData.phone = formData.phone;
        if (formData.password) updateData.password = formData.password;

        const response = await fetch(`http://localhost:8000/api/v1/staff-profiles/${selectedStaff.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Failed to update');

        // Set PIN if provided
        if (formData.pin_code && formData.pin_code.length === 4) {
          await fetch(`http://localhost:8000/api/v1/staff-profiles/${selectedStaff.id}/set-pin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pin_code: formData.pin_code })
          });
        }

        // Upload avatar if selected
        if (avatarFile) {
          const formDataFile = new FormData();
          formDataFile.append('file', avatarFile);
          await fetch(`http://localhost:8000/api/v1/staff-profiles/${selectedStaff.id}/avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataFile
          });
        }

        toast.success('Profil zaktualizowany!');
      } else {
        // Create new staff
        const response = await fetch('http://localhost:8000/api/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to create');

        const newStaff = await response.json();

        // Set PIN if provided
        if (formData.pin_code && formData.pin_code.length === 4) {
          await fetch(`http://localhost:8000/api/v1/staff-profiles/${newStaff.id}/set-pin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pin_code: formData.pin_code })
          });
        }

        // Upload avatar if selected
        if (avatarFile) {
          const formDataFile = new FormData();
          formDataFile.append('file', avatarFile);
          await fetch(`http://localhost:8000/api/v1/staff-profiles/${newStaff.id}/avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataFile
          });
        }

        toast.success('Pracownik utworzony!');
      }

      setShowModal(false);
      setAvatarFile(null);
      fetchStaff();
    } catch (error) {
      toast.error('Błąd zapisu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const filteredStaff = staff.filter(member => 
    (member.full_name || member.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.position || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Zarządzanie pracownikami</h1>
                <p className="text-blue-100 text-sm mt-1">Zarządzaj zespołem restauracji</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/management')}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg flex items-center gap-2"
            >
              <span>←</span>
              <span>Powrót</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Wszyscy pracownicy</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{staff.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Aktywni</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{staff.filter(s => s.is_active).length}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Administratorzy</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{staff.filter(s => s.role === 'admin').length}</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="Szukaj pracownika po nazwisku lub stanowisku..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-xl">➕</span>
              <span>Dodaj pracownika</span>
            </button>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Nie znaleziono pracowników</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Spróbuj innego wyszukiwania' : 'Dodaj swojego pierwszego pracownika'}
              </p>
            </div>
          ) : (
            filteredStaff.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
              <div className="h-32 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 flex items-center justify-center relative">
                <div className="absolute top-3 right-3">
                  {member.is_active ? (
                    <span className="w-3 h-3 bg-green-400 rounded-full block shadow-lg animate-pulse"></span>
                  ) : (
                    <span className="w-3 h-3 bg-gray-400 rounded-full block"></span>
                  )}
                </div>
                {member.avatar_url ? (
                  <img 
                    src={member.avatar_url} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-orange-500 border-4 border-white shadow-lg">
                    {member.full_name ? member.full_name[0].toUpperCase() : member.name[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {member.full_name || member.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                  <span>💼</span>
                  <span>{member.position || 'Pracownik'}</span>
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    member.role === 'admin' 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' 
                      : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700'
                  }`}>
                    {member.role === 'admin' ? '👑 Admin' : '💳 Kasjer'}
                  </span>
                </div>
                <button
                  onClick={() => handleEdit(member)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg transition font-semibold shadow-md flex items-center justify-center gap-2"
                >
                  <span>✏️</span>
                  <span>Edytuj profil</span>
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>{selectedStaff ? '✏️' : '➕'}</span>
                <span>{selectedStaff ? 'Edytuj profil' : 'Nowy pracownik'}</span>
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!selectedStaff && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span>📧</span>
                        <span>Email *</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span>🔒</span>
                        <span>Hasło *</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span>👤</span>
                        <span>Login *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>✍️</span>
                    <span>Pełne imię i nazwisko</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>💼</span>
                    <span>Stanowisko</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Kasjer, Kucharz, Menedżer..."
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📱</span>
                    <span>Telefon</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🔢</span>
                    <span>Kod PIN (4 cyfry)</span>
                  </label>
                  <input
                    type="text"
                    maxLength="4"
                    pattern="[0-9]{4}"
                    placeholder="1234"
                    value={formData.pin_code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, pin_code: value});
                    }}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest transition"
                  />
                  <p className="text-xs text-gray-500 mt-2">Szybki dostęp do kasy</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🖼️</span>
                    <span>Zdjęcie profilowe</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                {selectedStaff && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>🔒</span>
                      <span>Nowe hasło (zostaw puste aby zachować obecne)</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setAvatarFile(null);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition font-semibold shadow-lg"
                  >
                    Zapisz
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
