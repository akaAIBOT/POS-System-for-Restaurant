import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Restaurant POS</h1>
            
            <nav className="flex items-center space-x-6">
              {user?.role === 'admin' && (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary">
                    Dashboard
                  </Link>
                  <Link to="/menu" className="text-gray-600 hover:text-primary">
                    Menu
                  </Link>
                  <Link to="/orders" className="text-gray-600 hover:text-primary">
                    Orders
                  </Link>
                  <Link to="/tables" className="text-gray-600 hover:text-primary">
                    Tables
                  </Link>
                </>
              )}
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger text-sm"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {title && (
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
        )}
        {children}
      </main>
    </div>
  );
}
