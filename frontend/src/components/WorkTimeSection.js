import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function WorkTimeSection() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [workSessions, setWorkSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', role: 'staff' });

  // Load from localStorage
  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    const savedSessions = localStorage.getItem('workSessions');
    
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    } else {
      // Default employees
      const defaultEmployees = [
        { id: 1, name: 'Jan Kowalski', email: 'jan@restaurant.com', role: 'staff', active: true },
        { id: 2, name: 'Anna Nowak', email: 'anna@restaurant.com', role: 'chef', active: true }
      ];
      setEmployees(defaultEmployees);
      localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }

    if (savedSessions) {
      setWorkSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem('employees', JSON.stringify(employees));
    }
  }, [employees]);

  useEffect(() => {
    if (workSessions.length > 0) {
      localStorage.setItem('workSessions', JSON.stringify(workSessions));
    }
  }, [workSessions]);

  const handleClockIn = (employeeId) => {
    const now = new Date();
    const newSession = {
      id: Date.now(),
      employeeId,
      clockIn: now.toISOString(),
      clockOut: null,
      date: now.toISOString().split('T')[0]
    };
    setWorkSessions([...workSessions, newSession]);
    toast.success('Pracownik zalogowany na zmianę');
  };

  const handleClockOut = (sessionId) => {
    const now = new Date();
    setWorkSessions(workSessions.map(session => 
      session.id === sessionId ? { ...session, clockOut: now.toISOString() } : session
    ));
    toast.success('Zmiana zakończona');
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmployee.name.trim() || !newEmployee.email.trim()) {
      toast.error('Wypełnij wszystkie pola');
      return;
    }

    const employee = {
      id: Date.now(),
      ...newEmployee,
      active: true
    };
    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', email: '', role: 'staff' });
    setShowAddEmployee(false);
    toast.success('Pracownik dodany');
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('Czy na pewno usunąć pracownika?')) {
      setEmployees(employees.filter(e => e.id !== id));
      toast.success('Pracownik usunięty');
    }
  };

  const getActiveSession = (employeeId) => {
    return workSessions.find(s => s.employeeId === employeeId && !s.clockOut);
  };

  const getTodaySessions = () => {
    return workSessions.filter(s => s.date === selectedDate);
  };

  const calculateWorkTime = (clockIn, clockOut) => {
    if (!clockOut) return 'W trakcie';
    const diff = new Date(clockOut) - new Date(clockIn);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  const roleLabels = {
    staff: 'Kelner',
    chef: 'Kucharz',
    manager: 'Menedżer',
    admin: 'Administrator'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Czas pracy pracowników</h3>
          <p className="text-sm text-gray-600 mt-1">Zarządzaj obecnością i czasem pracy personelu</p>
        </div>
        <button
          onClick={() => setShowAddEmployee(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg flex items-center gap-2"
        >
          <span>➕</span>
          <span>Dodaj pracownika</span>
        </button>
      </div>

      {/* Active Employees */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Aktywni pracownicy</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.filter(e => e.active).map(employee => {
            const activeSession = getActiveSession(employee.id);
            return (
              <div key={employee.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-bold text-gray-900">{employee.name}</h5>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                      {roleLabels[employee.role]}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>

                {activeSession ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rozpoczęto:</span>
                      <span className="font-semibold">{formatTime(activeSession.clockIn)}</span>
                    </div>
                    <button
                      onClick={() => handleClockOut(activeSession.id)}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                    >
                      Zakończ zmianę
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleClockIn(employee.id)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                  >
                    Rozpocznij zmianę
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Report */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-900">Raport dzienny</h4>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pracownik</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stanowisko</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rozpoczęcie</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Zakończenie</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Czas pracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getTodaySessions().map(session => {
                const employee = employees.find(e => e.id === session.employeeId);
                if (!employee) return null;
                return (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{employee.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{roleLabels[employee.role]}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatTime(session.clockIn)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.clockOut ? formatTime(session.clockOut) : <span className="text-green-600 font-semibold">W trakcie</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {calculateWorkTime(session.clockIn, session.clockOut)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {getTodaySessions().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Brak wpisów dla wybranej daty
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Dodaj pracownika</h3>
              <button onClick={() => setShowAddEmployee(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Imię i nazwisko *</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Jan Kowalski"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="jan@restaurant.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stanowisko *</label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">Kelner</option>
                  <option value="chef">Kucharz</option>
                  <option value="manager">Menedżer</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddEmployee(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold"
                >
                  Dodaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
