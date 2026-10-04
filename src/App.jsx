import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import CustomerMenu from './pages/CustomerMenu';
import AboutPage from './pages/AboutPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
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
  );
}
