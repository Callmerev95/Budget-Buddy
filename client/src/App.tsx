import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ResetPasswordPage from './pages/ResetPassword';
import ForgotPasswordPage from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './lib/ProtectedRoute';
import Reports from './pages/Reports';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster
        theme="dark"
        position="bottom-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(24, 24, 27, 0.8)', // zinc-900 dengan transparansi
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(39, 39, 42, 0.5)', // zinc-800
            borderRadius: '20px',
            color: '#fff',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Route yang diproteksi */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;