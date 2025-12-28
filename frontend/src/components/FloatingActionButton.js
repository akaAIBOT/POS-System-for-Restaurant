import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FloatingActionButton({ onCreateOrder, onCreateMenuItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: '🛒',
      label: 'Nowe zamówienie',
      color: 'from-blue-500 to-blue-600',
      onClick: () => {
        navigate('/cashier');
      }
    },
    {
      icon: '🍜',
      label: 'Nowe danie',
      color: 'from-green-500 to-green-600',
      onClick: onCreateMenuItem
    },
    {
      icon: '👥',
      label: 'Nowy pracownik',
      color: 'from-purple-500 to-purple-600',
      onClick: () => {
        // Will be implemented
        alert('Funkcja w trakcie realizacji');
      }
    },
    {
      icon: '📊',
      label: 'Raport',
      color: 'from-orange-500 to-orange-600',
      onClick: () => {
        // Export report
        alert('Eksport raportu');
      }
    }
  ];

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999 }}>
      {/* Action Items */}
      <div className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center gap-3 group"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
            }}
          >
            <span className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              {action.label}
            </span>
            <button
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center text-2xl`}
            >
              {action.icon}
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center text-white text-3xl hover:scale-105 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
      >
        +
      </button>
    </div>
  );
}
