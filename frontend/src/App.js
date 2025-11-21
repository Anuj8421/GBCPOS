import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import OrdersPage from '@/pages/OrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import MenuPage from '@/pages/MenuPage';
import SearchPage from '@/pages/SearchPage';
import StorePage from '@/pages/StorePage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import FinancePage from '@/pages/FinancePage';
import UsersPage from '@/pages/UsersPage';
import SettingsPage from '@/pages/SettingsPage';
import TopDishesPage from '@/pages/TopDishesPage';
import FrequentCustomersPage from '@/pages/FrequentCustomersPage';
import '@/App.css';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="store" element={<StorePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="analytics/top-dishes" element={<TopDishesPage />} />
              <Route path="analytics/frequent-customers" element={<FrequentCustomersPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        
        {/* Toast Notifications */}
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
