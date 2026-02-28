import React, { type MouseEvent, useState } from 'react';
import { motion } from 'framer-motion';

interface RippleButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled,
  onClick,
}) => {
  const [ripples, setRipples] = useState<
    { x: number; y: number; size: number; id: number }[]
  >([]);

  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const base =
    'relative inline-flex items-center overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 select-none';

  const variants: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-slate-900 shadow-[0_8px_30px_rgba(56,189,248,0.35)] hover:brightness-[1.08] hover:shadow-[0_12px_40px_rgba(56,189,248,0.5)]',
    outline:
      'border border-cyan-400/50 bg-slate-900/60 text-cyan-200 hover:bg-cyan-400/10 hover:border-cyan-400/80',
    danger:
      'bg-gradient-to-r from-rose-500 to-orange-500 text-slate-50 shadow-[0_8px_30px_rgba(248,113,113,0.3)] hover:brightness-[1.08]',
    ghost: 'bg-slate-900/40 text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 border border-slate-700/50',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`${base} ${variants[variant]} ${className}`}
      type={type}
      disabled={disabled}
      onClick={(e) => {
        createRipple(e as unknown as MouseEvent<HTMLButtonElement>);
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </motion.button>
  );
};

export default RippleButton;
