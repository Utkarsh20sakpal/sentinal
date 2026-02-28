/**
 * Reusable UI primitives for Sentinel
 * -- Badge, Card, Button, Input, Label, Spinner, EmptyState, StatCard, SectionHeader
 */
import React, { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

/* ─── Badge ──────────────────────────────────────────── */
type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'entered' | 'default';
const badgeStyles: Record<BadgeVariant, string> = {
    pending: 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 ring-yellow-400/20',
    approved: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 ring-emerald-400/20',
    rejected: 'bg-red-400/15 text-red-300 border border-red-400/30 ring-red-400/20',
    entered: 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 ring-cyan-400/20',
    default: 'bg-white/10 text-slate-300 border border-white/20',
};
export const Badge = ({ variant = 'default', children, className }: { variant?: BadgeVariant; children: ReactNode; className?: string }) => (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', badgeStyles[variant], className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
        {children}
    </span>
);

/* ─── Card ──────────────────────────────────────────── */
export const Card = ({ children, className, ...props }: { children: ReactNode; className?: string;[k: string]: any }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn('rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm', className)}
        {...props}
    />
);

/* ─── GlowCard ──────────────────────────────────────── */
export const GlowCard = ({ children, className, glowColor = 'cyan' }: { children: ReactNode; className?: string; glowColor?: 'cyan' | 'purple' | 'emerald' | 'rose' }) => {
    const glow: Record<string, string> = {
        cyan: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-500/30',
        purple: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-purple-500/30',
        emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30',
        rose: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] hover:border-rose-500/30',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={cn(
                'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300',
                glow[glowColor],
                className,
            )}
        />
    );
};

/* ─── Button ─────────────────────────────────────────── */
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
const btnBase = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] select-none active:scale-[0.97]';
const btnVariants: Record<BtnVariant, string> = {
    primary: 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_4px_20px_rgba(6,182,212,0.35)] hover:shadow-[0_4px_28px_rgba(6,182,212,0.55)] hover:brightness-110',
    secondary: 'bg-white/10 text-slate-200 border border-white/15 hover:bg-white/15 hover:border-white/25',
    danger: 'bg-red-500/80 text-white border border-red-500/50 hover:bg-red-500 hover:shadow-[0_4px_20px_rgba(239,68,68,0.35)]',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/8',
    outline: 'border border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400/80 hover:shadow-[0_0_16px_rgba(6,182,212,0.2)]',
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: BtnVariant;
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: ReactNode;
    children: ReactNode;
}
export const Button = React.forwardRef<HTMLButtonElement, BtnProps>(({
    variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...rest
}, ref) => {
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5', lg: 'px-6 py-3 text-base' };
    return (
        <motion.button
            ref={ref as any}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
            className={cn(btnBase, btnVariants[variant], sizes[size], className)}
            disabled={disabled || loading}
            {...rest as any}
        >
            {loading ? <Spinner size={16} /> : icon}
            {children}
        </motion.button>
    );
});
Button.displayName = 'Button';

/* ─── Input ──────────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className, id, ...rest }, ref) => (
    <div className="space-y-1.5 w-full">
        {label && (
            <label htmlFor={id} className="block text-sm font-medium text-slate-300">
                {label}
            </label>
        )}
        <div className="relative">
            {icon && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {icon}
                </span>
            )}
            <input
                ref={ref}
                id={id}
                className={cn(
                    'w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500',
                    'border-white/10 outline-none transition-all duration-200',
                    'focus:border-cyan-500/60 focus:bg-white/8 focus:ring-2 focus:ring-cyan-500/20',
                    'hover:border-white/20',
                    icon ? 'pl-9' : '',
                    error ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20' : '',
                    className,
                )}
                {...rest}
            />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
));
Input.displayName = 'Input';

/* ─── Select ─────────────────────────────────────────── */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>((
    { label, className, id, children, ...rest }, ref
) => (
    <div className="space-y-1.5 w-full">
        {label && (
            <label htmlFor={id} className="block text-sm font-medium text-slate-300">{label}</label>
        )}
        <select
            ref={ref}
            id={id}
            className={cn(
                'w-full rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2.5 text-sm text-slate-100',
                'outline-none transition-all duration-200 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20',
                'hover:border-white/20',
                className,
            )}
            {...rest}
        >
            {children}
        </select>
    </div>
));
Select.displayName = 'Select';

/* ─── Spinner ────────────────────────────────────────── */
export const Spinner = ({ size = 20, className }: { size?: number; className?: string }) => (
    <svg
        className={cn('animate-spin', className)}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
    >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

/* ─── EmptyState ─────────────────────────────────────── */
export const EmptyState = ({ icon, title, body }: { icon?: ReactNode; title: string; body?: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-500 border border-white/8">
                {icon}
            </div>
        )}
        <p className="text-sm font-semibold text-slate-300">{title}</p>
        {body && <p className="mt-1 text-xs text-slate-500 max-w-xs">{body}</p>}
    </div>
);

/* ─── StatCard ───────────────────────────────────────── */
export const StatCard = ({
    label, value, sub, icon, color = 'cyan', delay = 0,
}: {
    label: string; value: ReactNode; sub?: string; icon: ReactNode;
    color?: 'cyan' | 'purple' | 'emerald' | 'rose' | 'amber'; delay?: number;
}) => {
    const colors: Record<string, { text: string; bg: string; glow: string }> = {
        cyan: { text: 'text-cyan-300', bg: 'bg-cyan-400/10', glow: 'hover:shadow-[0_0_24px_rgba(6,182,212,0.14)]' },
        purple: { text: 'text-purple-300', bg: 'bg-purple-400/10', glow: 'hover:shadow-[0_0_24px_rgba(139,92,246,0.14)]' },
        emerald: { text: 'text-emerald-300', bg: 'bg-emerald-400/10', glow: 'hover:shadow-[0_0_24px_rgba(16,185,129,0.14)]' },
        rose: { text: 'text-red-300', bg: 'bg-red-400/10', glow: 'hover:shadow-[0_0_24px_rgba(239,68,68,0.14)]' },
        amber: { text: 'text-amber-300', bg: 'bg-amber-400/10', glow: 'hover:shadow-[0_0_24px_rgba(251,191,36,0.14)]' },
    };
    const { text, bg, glow } = colors[color];
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
            className={cn('group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 transition-all duration-300', glow)}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
                    <div className={cn('mt-2.5 text-3xl font-bold', text)}>{value}</div>
                    {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
                </div>
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', bg, text)}>
                    {icon}
                </div>
            </div>
            <div className={cn('pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-40', bg)} />
        </motion.div>
    );
};

/* ─── SectionHeader ──────────────────────────────────── */
export const SectionHeader = ({
    kicker, title, description, action,
}: {
    kicker?: string; title: string; description?: string; action?: ReactNode;
}) => (
    <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
            {kicker && (
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">{kicker}</p>
            )}
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
    </div>
);

/* ─── PageSection ────────────────────────────────────── */
export const PageSection = ({
    children, className, title, titleRight,
}: { children: ReactNode; className?: string; title?: string; titleRight?: ReactNode }) => (
    <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6', className)}
    >
        {(title || titleRight) && (
            <div className="mb-5 flex items-center justify-between gap-3">
                {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
                {titleRight}
            </div>
        )}
        {children}
    </motion.section>
);

/* ─── Skeleton ───────────────────────────────────────── */
export const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />
);

/* ─── RefreshButton ──────────────────────────────────── */
export const RefreshButton = ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
    <Button variant="secondary" size="sm" onClick={onClick} loading={loading} icon={
        !loading ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
        ) : null
    }>
        {loading ? 'Refreshing...' : 'Refresh'}
    </Button>
);
