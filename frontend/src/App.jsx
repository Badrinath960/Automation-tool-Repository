import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Guards & Boundaries
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layouts
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ToolsPage from './pages/ToolsPage';
import ToolDetailPage from './pages/ToolDetailPage';
import DashboardsPage from './pages/DashboardsPage';
import DashboardDetailPage from './pages/DashboardDetailPage';
import AdminToolsPage from './pages/AdminToolsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminDashboardsPage from './pages/AdminDashboardsPage';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Standard layout wrapper for authenticated users
const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col animate-in fade-in duration-200">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

// Admin layout wrapper including sidebar
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col animate-in fade-in duration-200">
      <Navbar />
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto animate-in fade-in duration-200">
        <Sidebar />
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'text-sm font-semibold text-gray-900 border border-border shadow-md rounded-lg',
              style: {
                background: '#... ',
                backgroundColor: '#fff',
                color: '#1e293b',
              },
            }}
          />
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Main Routes */}
            <Route element={<PrivateRoute />}>
              {/* Standard directory paths */}
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/tools/:id" element={<ToolDetailPage />} />
                <Route path="/dashboards" element={<DashboardsPage />} />
                <Route path="/dashboards/:id" element={<DashboardDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>

              {/* Admin Management paths */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Navigate to="/admin/tools" replace />} />
                  <Route path="/admin/tools" element={<AdminToolsPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/dashboards" element={<AdminDashboardsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
