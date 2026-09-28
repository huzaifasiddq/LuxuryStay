import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/Layout';
import { FRONT_OFFICE, MANAGEMENT, getDefaultRoute } from './utils/roles';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Guests from './pages/Guests';
import Reservations from './pages/Reservations';
import Invoices from './pages/Invoices';
import Housekeeping from './pages/Housekeeping';
import StaffManagement from './pages/StaffManagement';
import SettingsPage from './pages/SettingsPage';
import FeedbackPage from './pages/FeedbackPage';
import ServiceRequestsPage from './pages/ServiceRequestsPage';
import ReportsPage from './pages/ReportsPage';

// Wrapper that requires login AND (optionally) a specific set of allowed roles.
// If allowedRoles is omitted, any logged-in user may view the page.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-5">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Front-office / management-only pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={FRONT_OFFICE}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guests"
            element={
              <ProtectedRoute allowedRoles={FRONT_OFFICE}>
                <Guests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute allowedRoles={FRONT_OFFICE}>
                <Reservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute allowedRoles={FRONT_OFFICE}>
                <Invoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute allowedRoles={FRONT_OFFICE}>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-requests"
            element={
              <ProtectedRoute allowedRoles={[...FRONT_OFFICE, 'Housekeeping', 'Kitchen', 'Laundry']}>
                <ServiceRequestsPage />
              </ProtectedRoute>
            }
          />

          {/* Management-only pages */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={MANAGEMENT}>
                <StaffManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={MANAGEMENT}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Shared pages — everyone logged in can view (view-only enforced
              inside the page/backend for non-front-office roles) */}
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <Rooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Housekeeping />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task"
            element={
              <ProtectedRoute>
                <Housekeeping />
              </ProtectedRoute>
            }
          />

          {/* Root & Catch-all Fallback (Always at the bottom) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
