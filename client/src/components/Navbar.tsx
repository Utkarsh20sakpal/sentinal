import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../services/AuthContext';

const Logo = () => (
  <Link to="/" className="flex items-center gap-3 group">
    <div
      className="flex h-9 w-9 items-center justify-center rounded-xl"
      style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">Sentinel</span>
      <span className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">Smart Security</span>
    </div>
  </Link>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isDashboard = ['/guard', '/resident', '/admin'].includes(location.pathname);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const landingLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
  ];

  return (
    <>
      <header
        className="navbar"
        style={{
          backdropFilter: scrolled ? 'blur(24px)' : 'blur(16px)',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'blur(16px)',
        }}
      >
        <div
          className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300"
          style={{
            background: scrolled
              ? 'rgba(15,23,42,0.92)'
              : 'rgba(15,23,42,0.70)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          <Logo />

          {/* Desktop center links */}
          {!isDashboard && (
            <nav className="hidden items-center gap-1 sm:flex">
              {landingLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="relative rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-cyan-300 group"
                >
                  {l.label}
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-cyan-400 transition-all duration-300 group-hover:w-3/4" />
                </a>
              ))}
            </nav>
          )}

          {/* Desktop right */}
          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                {/* User pill */}
                <div
                  className="flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                  <span className="pulse h-2 w-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.8)' }} />
                  <span className="text-sm font-medium text-slate-200">{user.name}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold capitalize"
                    style={{ background: 'rgba(6,182,212,0.18)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.25)' }}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-xl px-5 py-2 text-sm font-bold text-white transition-all duration-200 hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  boxShadow: '0 4px 20px rgba(6,182,212,0.35)',
                }}
              >
                Launch Console →
              </Link>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:text-slate-200 sm:hidden"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[#0f172a]/70 backdrop-blur-sm sm:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="fixed left-4 right-4 top-20 z-50 rounded-2xl p-4 sm:hidden"
              style={{
                background: 'rgba(15,23,42,0.96)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div className="flex flex-col gap-2">
                {!isDashboard && landingLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-cyan-300"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="my-1 h-px bg-white/8" />
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 pulse" />
                      <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold capitalize text-cyan-300" style={{ background: 'rgba(6,182,212,0.18)' }}>
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}
                  >
                    Launch Console →
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
