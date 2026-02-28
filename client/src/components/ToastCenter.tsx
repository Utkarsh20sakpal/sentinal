import { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface Toast { id: number; title: string; body?: string; type: ToastKind; }
interface ToastContextValue { push: (toast: Omit<Toast, 'id'>) => void; }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastConfig: Record<ToastKind, { icon: string; border: string; accent: string; bar: string }> = {
  success: {
    icon: '✓',
    border: 'rgba(16,185,129,0.30)',
    accent: 'rgba(16,185,129,0.14)',
    bar: '#10b981',
  },
  error: {
    icon: '✕',
    border: 'rgba(239,68,68,0.30)',
    accent: 'rgba(239,68,68,0.12)',
    bar: '#ef4444',
  },
  info: {
    icon: 'ℹ',
    border: 'rgba(6,182,212,0.30)',
    accent: 'rgba(6,182,212,0.12)',
    bar: '#06b6d4',
  },
  warning: {
    icon: '⚠',
    border: 'rgba(251,191,36,0.30)',
    accent: 'rgba(251,191,36,0.10)',
    bar: '#fbbf24',
  },
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push: ToastContextValue['push'] = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 4000);
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex max-w-xs flex-col gap-2 sm:right-6 sm:max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            const cfg = toastConfig[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.92 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-auto relative overflow-hidden rounded-xl px-4 py-3 text-sm shadow-2xl"
                style={{
                  background: 'rgba(15,23,42,0.95)',
                  border: `1px solid ${cfg.border}`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                }}
              >
                {/* Accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ background: cfg.bar }}
                />
                <div className="ml-2 flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: cfg.accent, color: cfg.bar }}
                  >
                    {cfg.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-100">{toast.title}</div>
                    {toast.body && <div className="mt-0.5 text-xs text-slate-400">{toast.body}</div>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
