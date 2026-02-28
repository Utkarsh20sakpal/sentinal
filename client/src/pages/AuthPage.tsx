import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../services/AuthContext';
import { Button, Input, Select } from '../components/ui';

const ROLE_ROUTES: Record<string, string> = {
  guard: '/guard',
  resident: '/resident',
  admin: '/admin',
};

const WINGS = ['A', 'B', 'C', 'D'] as const;

const EyeIcon = ({ closed }: { closed: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {closed ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="m6.72 13.18a3 3 0 1 0 4.1 4.1" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

/* Wing badge helper */
const wingColors: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.30)', text: '#67e8f9' },
  B: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.30)', text: '#c4b5fd' },
  C: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.30)', text: '#6ee7b7' },
  D: { bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.30)', text: '#fdba74' },
};

const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'guard',
    wing: 'A',
    flatNumber: '',   // only used by residents (just the number, e.g. "803")
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isResident = form.role === 'resident';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    if (mode === 'register') {
      if (!form.name) { setError('Full name is required.'); return; }
      if (!form.wing) { setError('Please select your wing.'); return; }
      if (isResident && !form.flatNumber) { setError('Residents must enter their flat number.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role as 'guard' | 'resident' | 'admin',
          wing: form.wing,
          flatNumber: isResident ? form.flatNumber : '',
        });
      }
      const storedUser = localStorage.getItem('user');
      const role: string = storedUser ? JSON.parse(storedUser).role : 'guard';
      navigate(ROLE_ROUTES[role] ?? '/guard');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-20"
      style={{
        background: '#0f172a',
        backgroundImage:
          'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(6,182,212,0.15) 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 85% 100%, rgba(139,92,246,0.12) 0%, transparent 60%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow: '0 0 32px rgba(6,182,212,0.4)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">Sentinel</p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'login' ? 'Sign in to your Sentinel console' : 'Join Sentinel Smart Security'}
          </p>
        </div>

        {/* Card */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: 'rgba(15,23,42,0.85)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top gradient stripe */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5" style={{ background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)' }} />

          {/* Mode switcher */}
          <div className="mb-6 flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all duration-200"
                style={mode === m
                  ? { background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: 'white', boxShadow: '0 2px 12px rgba(6,182,212,0.35)' }
                  : { color: '#64748b' }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Register-only fields ── */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden space-y-4"
                >
                  <Input id="auth-name" label="Full name" placeholder="Your name" value={form.name} onChange={set('name')} />

                  {/* Role + Wing row */}
                  <div className="grid grid-cols-2 gap-3">
                    <Select id="auth-role" label="Role" value={form.role} onChange={set('role')}>
                      <option value="guard">Guard</option>
                      <option value="resident">Resident</option>
                      <option value="admin">Admin</option>
                    </Select>

                    {/* Wing selector */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">Wing</label>
                      <div className="grid grid-cols-4 gap-1">
                        {WINGS.map((w) => {
                          const c = wingColors[w];
                          const active = form.wing === w;
                          return (
                            <button
                              type="button"
                              key={w}
                              onClick={() => setForm((p) => ({ ...p, wing: w }))}
                              className="rounded-lg py-2 text-sm font-bold transition-all duration-150"
                              style={{
                                background: active ? c.bg : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${active ? c.border : 'rgba(255,255,255,0.08)'}`,
                                color: active ? c.text : '#475569',
                                boxShadow: active ? `0 0 12px ${c.border}` : 'none',
                              }}
                            >
                              {w}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Flat number — only for residents */}
                  <AnimatePresence>
                    {isResident && (
                      <motion.div
                        key="flat-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5">
                          <label htmlFor="auth-flat" className="block text-sm font-medium text-slate-300">
                            Flat number
                            <span className="ml-2 text-xs text-slate-500">
                              (e.g. 803 — wing is auto-prefixed: <span style={{ color: wingColors[form.wing].text }}>Wing {form.wing}</span>)
                            </span>
                          </label>
                          <div className="flex gap-2">
                            {/* Wing prefix badge */}
                            <div
                              className="flex shrink-0 items-center justify-center rounded-xl px-3.5 text-sm font-bold"
                              style={{ background: wingColors[form.wing].bg, border: `1px solid ${wingColors[form.wing].border}`, color: wingColors[form.wing].text }}
                            >
                              {form.wing}-
                            </div>
                            <input
                              id="auth-flat"
                              type="text"
                              placeholder="803"
                              value={form.flatNumber}
                              onChange={(e) => setForm((p) => ({ ...p, flatNumber: e.target.value.replace(/\D/g, '') }))}
                              className="input flex-1"
                              maxLength={4}
                            />
                          </div>
                          {form.flatNumber && (
                            <p className="text-xs text-slate-500">
                              Your full address: <span className="font-bold" style={{ color: wingColors[form.wing].text }}>{form.wing}-{form.flatNumber}</span>
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Common fields ── */}
            <Input id="auth-email" type="email" label="Email address" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoComplete="email" />

            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="input w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                >
                  <EyeIcon closed={showPassword} />
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm text-red-300"
                  style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={loading} className="w-full text-base py-3" size="lg">
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Sign in to console' : 'Create account')}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Wing system</p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {WINGS.map((w) => (
                <span key={w} className="font-semibold" style={{ color: wingColors[w].text }}>Wing {w}</span>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Guards & admins see only their wing's visitors. Residents get a unique flat address like <span className="text-cyan-400">A-803</span>.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
