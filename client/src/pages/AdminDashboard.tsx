import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import api from '../services/api';
import { StatCard, SectionHeader, PageSection, Button, Spinner } from '../components/ui';

interface AnalyticsSummary {
  visitorsPerDay: { date: string; count: number }[];
  suspiciousPerDay: { date: string; count: number }[];
  rejectionRate: number;
  totalRequests: number;
  totalRejections: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl"
      style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', fontSize: 12 }}
    >
      <div className="mb-2 font-bold text-slate-200">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize text-slate-400">{p.dataKey}:</span>
          <span className="font-bold text-slate-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const ProgressBar = ({ value, color, delay }: { value: number; color: string; delay?: number }) => (
  <div className="h-2 overflow-hidden rounded-full bg-white/8">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(value, 100)}%` }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: delay ?? 0.3 }}
      className="h-full rounded-full"
      style={{ background: color }}
    />
  </div>
);

const AdminDashboard = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<AnalyticsSummary>('/visitors/analytics/summary');
      setSummary(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const mergedDaily = summary?.visitorsPerDay.map((v) => ({
    date: v.date.slice(5),
    visitors: v.count,
    suspicious: summary.suspiciousPerDay.find((s) => s.date === v.date)?.count ?? 0,
  })) ?? [];

  const totalSuspicious = summary?.suspiciousPerDay.reduce((a, s) => a + s.count, 0) ?? 0;
  const approvalRate = summary
    ? Math.round(((summary.totalRequests - summary.totalRejections) / Math.max(summary.totalRequests, 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="Admin analytics"
        title="Security Command Centre"
        description="Visitor trends, risk patterns, and rejection analysis — last 7 days."
        action={
          <Button variant="secondary" size="sm" onClick={load} loading={loading}
            icon={!loading ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            ) : undefined}
          >
            {loading ? 'Loading...' : 'Refresh data'}
          </Button>
        }
      />

      {error && !loading && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-300">
          ⚠ {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Requests" value={loading ? '—' : summary?.totalRequests ?? 0} sub="Last 7 days" color="cyan" delay={0}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
        />
        <StatCard label="Rejection Rate" value={loading ? '—' : `${summary?.rejectionRate ?? 0}%`} sub={`${summary?.totalRejections ?? 0} rejections`} color="amber" delay={0.07}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>}
        />
        <StatCard label="Suspicious" value={loading ? '—' : totalSuspicious} sub="Risk score ≥ 50" color="rose" delay={0.14}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
        />
        <StatCard label="Approval Rate" value={loading ? '—' : `${approvalRate}%`} sub="OTP-verified check-ins" color="emerald" delay={0.21}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
        />
      </div>

      {/* Chart */}
      <PageSection
        title="Visitor Activity vs. Suspicious Events"
        titleRight={
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />Visitors</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-400" />Suspicious</span>
          </div>
        }
      >
        <div className="h-64">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <Spinner size={28} className="text-cyan-400/60" />
              <span className="text-sm text-slate-400">Loading chart data...</span>
            </div>
          ) : mergedDaily.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No data yet. Create visitor entries to see trends.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mergedDaily} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#334155" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="visitors" stroke="#06b6d4" fill="url(#gV)" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="suspicious" stroke="#fb923c" fill="url(#gS)" strokeWidth={2.5} dot={{ fill: '#fb923c', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </PageSection>

      {/* Bottom panels */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Security breakdown */}
        <PageSection title="Security Breakdown">
          <div className="space-y-4">
            {[
              { label: 'Approval rate', value: approvalRate, color: '#10b981' },
              { label: 'Rejection rate', value: summary?.rejectionRate ?? 0, color: '#ef4444' },
              {
                label: 'Suspicious rate', value: summary?.totalRequests
                  ? Math.round((totalSuspicious / summary.totalRequests) * 100)
                  : 0, color: '#f59e0b'
              },
            ].map((row, i) => (
              <div key={row.label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="font-bold text-slate-200">{row.value}%</span>
                </div>
                <ProgressBar value={row.value} color={row.color} delay={0.3 + i * 0.1} />
              </div>
            ))}
          </div>
        </PageSection>

        {/* System status */}
        <PageSection title="System Status">
          <div className="space-y-2">
            {[
              'Real-time socket feed',
              'OTP generation engine',
              'Risk scoring module',
              'Suspicious pattern detection',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-xl border border-white/6 bg-white/3 px-3.5 py-2.5"
              >
                <span className="text-sm text-slate-300">{item}</span>
                <div className="flex items-center gap-1.5">
                  <span className="pulse h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.9)' }} />
                  <span className="text-xs font-semibold text-emerald-300">active</span>
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      </div>
    </div>
  );
};

export default AdminDashboard;
