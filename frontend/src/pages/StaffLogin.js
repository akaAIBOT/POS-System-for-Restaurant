import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/staff-profiles/');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.filter(s => s.is_active === 1));
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSelect = (staffMember) => {
    if (!staffMember.pin_code) {
      toast.error('Ten pracownik nie ma ustawionego kodu PIN');
      return;
    }
    setSelectedStaff(staffMember);
    setPin('');
  };

  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === 4) {
        handleLogin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleLogin = async (pinCode) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/staff-profiles/pin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: selectedStaff.id,
          pin_code: pinCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        
        // Fetch user data
        const userResponse = await fetch('http://localhost:8000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          toast.success(`Witaj, ${userData.full_name || userData.name}!`);
          navigate('/cashier');
        }
      } else {
        toast.error('Nieprawidłowy kod PIN');
        setPin('');
      }
    } catch (error) {
      toast.error('Błąd logowania');
      setPin('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="http://localhost:8000/uploads/5702e88b-3b17-4bbb-9afe-bbec754dac0f.avif" 
                alt="Wok'N'Cats" 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-bold">Wok'N'Cats</h1>
                <p className="text-sm opacity-90">Wybierz swój profil</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-orange-600 px-6 py-2 rounded-lg font-medium hover:bg-orange-50 transition"
            >
              Logowanie admina
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        {!selectedStaff ? (
          // Staff Selection Screen
          <div className="max-w-6xl w-full">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Kto pracuje?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {staff.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleStaffSelect(member)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 p-6 flex flex-col items-center gap-4"
                >
                  {member.avatar_url ? (
                    <img 
                      src={member.avatar_url} 
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-5xl font-bold text-white border-4 border-orange-200">
                      {member.full_name ? member.full_name[0].toUpperCase() : member.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800">
                      {member.full_name || member.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {member.position || 'Pracownik'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // PIN Entry Screen
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              {selectedStaff.avatar_url ? (
                <img 
                  src={selectedStaff.avatar_url} 
                  alt={selectedStaff.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 mx-auto mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-5xl font-bold text-white border-4 border-orange-200 mx-auto mb-4">
                  {selectedStaff.full_name ? selectedStaff.full_name[0].toUpperCase() : selectedStaff.name[0].toUpperCase()}
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedStaff.full_name || selectedStaff.name}
              </h2>
              <p className="text-gray-600 mt-1">Wprowadź swój kod PIN</p>
            </div>

            {/* PIN Display */}
            <div className="flex justify-center gap-3 mb-8">
              {[0, 1, 2, 3].map(index => (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold transition-all ${
                    pin.length > index
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-300 bg-gray-50 text-gray-300'
                  }`}
                >
                  {pin.length > index ? '●' : ''}
                </div>
              ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  className="h-16 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl font-bold text-2xl transition-all transform hover:scale-105"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setSelectedStaff(null)}
                className="h-16 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-sm transition-all"
              >
                Wstecz
              </button>
              <button
                onClick={() => handlePinInput('0')}
                className="h-16 bg-gray-100 hover:bg-orange-500 hover:text-white rounded-xl font-bold text-2xl transition-all transform hover:scale-105"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-16 bg-red-100 hover:bg-red-500 hover:text-white rounded-xl font-medium transition-all"
              >
                ⌫
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
