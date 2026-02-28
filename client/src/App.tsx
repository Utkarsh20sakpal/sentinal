import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import GuardDashboard from './pages/GuardDashboard';
import ResidentDashboard from './pages/ResidentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './services/AuthContext';
import { ToastProvider } from './components/ToastCenter';

/* ─── Page transition ─────────────────────────────────────────────────────── */
const Fade = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

/* ─── Protected route ─────────────────────────────────────────────────────── */
/**
 * Wraps a route so that:
 *  - Unauthenticated users → /auth
 *  - Wrong role → their own dashboard (e.g. guard trying /admin → /guard)
 *  - Auth loading → blank (avoids flash redirect)
 */
const ROLE_HOME: Record<string, string> = {
  guard: '/guard',
  resident: '/resident',
  admin: '/admin',
};

interface ProtectedProps {
  allowedRole: 'guard' | 'resident' | 'admin';
  children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRole, children }: ProtectedProps) => {
  const { user, loading } = useAuth();

  // Still resolving stored session — don't flash redirect
  if (loading) return null;

  // Not logged in at all
  if (!user) return <Navigate to="/auth" replace />;

  // Wrong role — kick to their own dashboard
  if (user.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/auth'} replace />;
  }

  return <>{children}</>;
};

/* ─── Redirect already-logged-in users away from /auth ───────────────────── */
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={ROLE_HOME[user.role] ?? '/guard'} replace />;
  return <>{children}</>;
};

/* ─── App ─────────────────────────────────────────────────────────────────── */
function AppRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      {/* Public */}
      <Route path="/" element={<Fade><LandingPage /></Fade>} />
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <Fade><AuthPage /></Fade>
          </AuthRoute>
        }
      />

      {/* Guard only */}
      <Route
        path="/guard"
        element={
          <ProtectedRoute allowedRole="guard">
            <DashboardLayout>
              <GuardDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Resident only */}
      <Route
        path="/resident"
        element={
          <ProtectedRoute allowedRole="resident">
            <DashboardLayout>
              <ResidentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
