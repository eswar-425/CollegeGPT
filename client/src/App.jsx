import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import Documents from './pages/admin/Documents';
import UploadDocument from './pages/admin/UploadDocument';
import Feedback from './pages/admin/Feedback';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-[#08100D] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
              <Navbar />
              <div className="flex-1 flex flex-col">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Student / User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:conversationId" element={<Chat />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute requireAdmin={true} />}>
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/documents" element={<Documents />} />
                  <Route path="/admin/documents/upload" element={<UploadDocument />} />
                  <Route path="/admin/feedback" element={<Feedback />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </Router>
);
}
