import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../services/AuthContext';
import Navbar from '../components/Navbar';

interface Props { children: ReactNode; }

/* ── Icons ── */
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const allLinks = [
  { to: '/admin', label: 'Admin Analytics', icon: <ChartIcon />, roles: ['admin'] },
  { to: '/guard', label: 'Guard Console', icon: <ShieldIcon />, roles: ['guard'] },
  { to: '/resident', label: 'Resident Console', icon: <UserIcon />, roles: ['resident'] },
];

const wingColors: Record<string, string> = {
  A: '#67e8f9', B: '#c4b5fd', C: '#6ee7b7', D: '#fdba74',
};

const SidebarContent = ({
  collapsed, user, links, handleLogout,
}: {
  collapsed: boolean;
  user: any;
  links: typeof allLinks;
  handleLogout: () => void;
}) => (
  <div className="flex h-full flex-col overflow-hidden">
    {/* User block */}
    <div
      className="mb-5 rounded-xl p-3 transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}
        >
          {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="min-w-0 overflow-hidden"
            >
              <div className="truncate text-sm font-semibold text-slate-100">{user?.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="capitalize">{user?.role}</span>
                {user?.wing && (
                  <>
                    <span>·</span>
                    <span className="font-bold" style={{ color: wingColors[user.wing] ?? '#67e8f9' }}>
                      Wing {user.wing}
                    </span>
                  </>
                )}
                {user?.role === 'resident' && user?.flatNumber && (
                  <>
                    <span>·</span>
                    <span>{user.wing}-{user.flatNumber}</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* Nav label */}
    {!collapsed && (
      <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
        Navigation
      </p>
    )}

    {/* Links */}
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          title={collapsed ? link.label : undefined}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
          }
        >
          <span className="nav-icon shrink-0">{link.icon}</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="truncate overflow-hidden"
              >
                {link.label}
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      ))}
    </nav>

    {/* Footer */}
    <div className="mt-4 space-y-2">
      {/* Live indicator */}
      <div
        className={`rounded-xl p-3 transition-all ${collapsed ? 'flex justify-center' : ''}`}
        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
        title={collapsed ? 'Live perimeter active' : undefined}
      >
        <div className="flex items-center gap-2">
          <span className="pulse h-2 w-2 shrink-0 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.9)' }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-xs font-semibold text-emerald-300"
              >
                Live perimeter active
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        title={collapsed ? 'Logout' : undefined}
        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:border-red-400/30 hover:bg-red-400/8 hover:text-red-300 ${collapsed ? 'justify-center' : ''}`}
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <LogoutIcon />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              Sign out
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  </div>
);

const DashboardLayout = ({ children }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = allLinks.filter((l) =>
    !user?.role || l.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SIDEBAR_W = collapsed ? 68 : 240;

  return (
    <div className="relative min-h-screen" style={{ background: '#0f172a' }}>
      <Navbar />

      <div className="flex pt-[4.5rem]">
        {/* ── Desktop Sidebar ── */}
        <motion.aside
          animate={{ width: SIDEBAR_W }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] shrink-0 flex-col overflow-hidden sm:flex"
          style={{
            background: 'rgba(15,23,42,0.85)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex flex-1 flex-col overflow-hidden px-3 py-4">
            <SidebarContent
              collapsed={collapsed}
              user={user}
              links={links}
              handleLogout={handleLogout}
            />
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center justify-center gap-2 border-t py-3 text-xs font-medium text-slate-500 transition hover:text-slate-300"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <CollapseIcon collapsed={collapsed} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.aside>

        {/* ── Mobile sidebar trigger ── */}
        <button
          className="fixed bottom-5 left-4 z-40 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-xl sm:hidden"
          style={{
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
          }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
          Menu
        </button>

        {/* ── Mobile overlay sidebar ── */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="mb-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 sm:hidden"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                key="mb-sidebar"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="fixed bottom-0 left-0 top-0 z-50 w-72 px-4 py-6 sm:hidden"
                style={{
                  background: 'rgba(15,23,42,0.97)',
                  borderRight: '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(24px)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <SidebarContent
                  collapsed={false}
                  user={user}
                  links={links}
                  handleLogout={() => { handleLogout(); setMobileOpen(false); }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <main className="flex min-h-[calc(100vh-4.5rem)] flex-1 flex-col overflow-hidden">
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative flex-1 p-4 sm:p-6"
          >
            {/* Subtle top glow */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-30"
              style={{ background: 'radial-gradient(ellipse 70% 100% at 60% 0%, rgba(6,182,212,0.12), transparent)' }}
            />
            <div className="relative z-10">{children}</div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
