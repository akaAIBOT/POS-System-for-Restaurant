import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import TableManagement from './pages/TableManagement';
import StaffInterface from './pages/StaffInterface';
import Cashier from './pages/Cashier';
import Management from './pages/Management';
import AdminPanel from './pages/AdminPanel';
import MenuEditor from './pages/MenuEditor';
import WorkLogsView from './pages/WorkLogsView';
import StaffManagement from './pages/StaffManagement';
import StaffLogin from './pages/StaffLogin';
import KitchenDisplay from './pages/KitchenDisplay';

const queryClient = new QueryClient();

// Protected route component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Ładowanie...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/staff" replace />;
  }
  
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <div className="min-h-screen bg-gray-100">
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/staff-login" element={<StaffLogin />} />
              
              {/* Cashier Interface - Main POS */}
              <Route
                path="/cashier"
                element={
                  <ProtectedRoute>
                    <Cashier />
                  </ProtectedRoute>
                }
              />
              
              {/* Kitchen Display System */}
              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute>
                    <KitchenDisplay />
                  </ProtectedRoute>
                }
              />
              
              {/* Management Interface - Admin only */}
              <Route
                path="/management"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/management-old"
                element={
                  <ProtectedRoute adminOnly>
                    <Management />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/menu"
                element={
                  <ProtectedRoute adminOnly>
                    <MenuManagement />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/menu-editor"
                element={
                  <ProtectedRoute adminOnly>
                    <MenuEditor />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/work-logs"
                element={
                  <ProtectedRoute adminOnly>
                    <WorkLogsView />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/staff-management"
                element={
                  <ProtectedRoute adminOnly>
                    <StaffManagement />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/orders"
                element={
                  <ProtectedRoute adminOnly>
                    <OrderManagement />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/tables"
                element={
                  <ProtectedRoute adminOnly>
                    <TableManagement />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <StaffInterface />
                  </ProtectedRoute>
                }
              />
              
              {/* Default redirect - authenticated users to management, others to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
