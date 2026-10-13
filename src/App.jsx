import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import CustomerMenu from './pages/CustomerMenu';
import ToastContainer from './components/common/Toast';

// Code-split routes so customers don't download heavy Admin/QR tools on initial load
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
      <p className="text-stone-400 text-sm font-medium tracking-wide">लोड हो रहा है...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<CustomerMenu />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Admin routes */}
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
