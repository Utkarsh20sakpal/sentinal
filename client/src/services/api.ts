import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// ── Request: attach Bearer token ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: handle 401 / 403 globally ──────────────────────────────────
// If the server returns 401 (invalid/expired token) or 403 (forbidden),
// clear stale credentials and redirect to /auth so the user re-logs-in.
// This handles the common case of a stale token after a backend schema change.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      // Only auto-redirect if we actually had a stored token
      // (avoids redirect loop on the /auth page itself)
      const hasToken = Boolean(sessionStorage.getItem('token'));
      if (hasToken) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // Hard redirect to login — easiest way to reset all React state
        window.location.href = '/auth';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
