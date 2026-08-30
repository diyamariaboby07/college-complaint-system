import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProfilePage } from './pages/Profile';
import { NotificationsPage } from './pages/Notifications';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentComplaints } from './pages/student/Complaints';
import { StudentNewComplaint } from './pages/student/NewComplaint';
import { StudentComplaintDetails } from './pages/student/ComplaintDetails';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminComplaints } from './pages/admin/Complaints';
import { AdminComplaintDetails } from './pages/admin/ComplaintDetails';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Shared Authenticated Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Student Specific Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints/new"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentNewComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentComplaintDetails />
              </ProtectedRoute>
            }
          />

          {/* Admin Specific Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminComplaintDetails />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
