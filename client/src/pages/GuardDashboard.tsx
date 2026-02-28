import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useToast } from '../components/ToastCenter';
import { useAuth } from '../services/AuthContext';
import {
  Badge, Button, Input, EmptyState, StatCard, SectionHeader, PageSection, Skeleton, RefreshButton,
} from '../components/ui';

interface Visitor {
  _id: string;
  name: string;
  phone: string;
  flatNumber: string;
  purpose: string;
  status: string;
  riskScore?: number;
  otp?: string;
  checkInTime?: string;
  exitTime?: string;
  createdAt: string;
}

const RiskBadge = ({ score }: { score: number }) => {
  if (score >= 70) return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/12 px-2.5 py-0.5 text-xs font-semibold text-red-300">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
      High Risk · {score}
    </span>
  );
  if (score >= 40) return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/12 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
      Med Risk · {score}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
      Low Risk · {score}
    </span>
  );
};

const VisitorPersonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const GuardDashboard = () => {
  const { user } = useAuth();
  const guardWing = user?.wing ?? '?';
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [otpValues, setOtpValues] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [exiting, setExiting] = useState<string | null>(null);
  const { push } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const loadVisitors = async () => {
    setLoading(true);
    try {
      const res = await api.get<Visitor[]>('/visitors');
      setVisitors(res.data);
    } catch {
      push({ type: 'error', title: 'Failed to load visitors' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
    const s = getSocket();
    s.on('visitorApproved', () => {
      push({ type: 'success', title: '✓ Visitor approved!', body: 'Enter the 6-digit OTP to verify entry.' });
      loadVisitors();
    });
    s.on('visitorRejected', () => {
      push({ type: 'info', title: 'Visitor rejected', body: 'Resident declined this visitor.' });
      loadVisitors();
    });
    s.on('visitorEntered', () => { loadVisitors(); });
    s.on('visitorExited', () => { loadVisitors(); });
    return () => {
      s.off('visitorApproved');
      s.off('visitorRejected');
      s.off('visitorEntered');
      s.off('visitorExited');
    };
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const name = fd.get('name') as string;
    const phone = fd.get('phone') as string;
    const flatNumber = fd.get('flatNumber') as string;
    const purpose = fd.get('purpose') as string;

    setCreating(true);
    try {
      await api.post('/visitors', { name, phone, flatNumber, purpose });
      push({ type: 'success', title: 'Request sent!', body: 'Resident will approve or reject in real-time.' });
      form.reset();
      loadVisitors();
    } catch (err: any) {
      push({ type: 'error', title: 'Could not create entry', body: err?.response?.data?.message });
    } finally {
      setCreating(false);
    }
  };

  const submitOtp = async (visitorId: string) => {
    const otp = otpValues[visitorId] || '';
    if (otp.length !== 6) { push({ type: 'error', title: 'Enter the full 6-digit OTP' }); return; }
    setVerifying(visitorId);
    try {
      await api.post(`/visitors/${visitorId}/verify-otp`, { otp });
      setOtpSuccess(visitorId);
      setTimeout(() => setOtpSuccess(null), 2000);
      push({ type: 'success', title: '✓ OTP verified', body: 'Visitor marked as entered.' });
      setOtpValues((prev) => { const next = { ...prev }; delete next[visitorId]; return next; });
      loadVisitors();
    } catch (err: any) {
      push({ type: 'error', title: 'Invalid or expired OTP', body: err?.response?.data?.message });
    } finally {
      setVerifying(null);
    }
  };

  const submitExit = async (visitorId: string) => {
    setExiting(visitorId);
    try {
      await api.post(`/visitors/${visitorId}/exit`);
      push({ type: 'success', title: '✓ Exit logged', body: 'Visitor departure time recorded.' });
      loadVisitors();
    } catch (err: any) {
      push({ type: 'error', title: 'Could not log exit', body: err?.response?.data?.message });
    } finally {
      setExiting(null);
    }
  };

  const statusOf = (s: string) => s as 'pending' | 'approved' | 'rejected' | 'entered';

  const pendingCount = visitors.filter((v) => v.status === 'pending').length;
  const approvedCount = visitors.filter((v) => v.status === 'approved').length;
  const insideCount = visitors.filter((v) => v.status === 'entered').length;
  const exitedCount = visitors.filter((v) => v.status === 'exited').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker={`Wing ${guardWing} · Guard console`}
        title="Gate Control & OTP Verification"
        description={`You are managing Wing ${guardWing}. Visitor requests are auto-tagged to Wing ${guardWing}.`}
        action={<RefreshButton onClick={loadVisitors} loading={loading} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Pending" value={pendingCount} sub="Awaiting resident" color="amber" delay={0} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
        <StatCard label="Approved" value={approvedCount} sub="Ready to verify" color="emerald" delay={0.06} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>} />
        <StatCard label="Inside" value={insideCount} sub="Currently inside" color="cyan" delay={0.12} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>} />
        <StatCard label="Exited" value={exitedCount} sub="Logged out" color="purple" delay={0.18} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Register Visitor Form */}
        <PageSection title="Register Visitor">
          <p className="-mt-3 mb-5 text-sm text-slate-400">Visitor destination is auto-scoped to <span className="font-bold text-cyan-300">Wing {guardWing}</span>. Enter only the flat number.</p>
          <form ref={formRef} onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input id="gd-name" name="name" label="Visitor name" placeholder="Full name" required />
              <Input id="gd-phone" name="phone" label="Phone number" placeholder="+91 98765 43210" required />
            </div>
            {/* Flat number — wing auto-applied server-side */}
            <div className="space-y-1.5">
              <label htmlFor="gd-flat" className="block text-sm font-medium text-slate-300">Flat number</label>
              <div className="flex gap-2">
                <div
                  className="flex shrink-0 items-center justify-center rounded-xl px-3.5 text-sm font-bold"
                  style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.30)', color: '#67e8f9' }}
                >
                  {guardWing}-
                </div>
                <input
                  id="gd-flat"
                  name="flatNumber"
                  type="text"
                  placeholder="803"
                  className="input flex-1"
                  onInput={(e) => { const t = e.currentTarget; t.value = t.value.replace(/\D/g, ''); }}
                  maxLength={4}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Full address will be <span className="font-medium text-cyan-400">{guardWing}-[flat]</span> (set by your wing assignment)</p>
            </div>
            <Input id="gd-purpose" name="purpose" label="Purpose of visit" placeholder="Delivery / Guest / Maintenance" required />
            <Button type="submit" loading={creating} className="w-full" icon={
              !creating ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              ) : undefined
            }>
              {creating ? 'Sending request...' : 'Send approval request'}
            </Button>
          </form>
        </PageSection>

        {/* Live queue */}
        <PageSection title="Visitor Queue">
          <p className="-mt-3 mb-5 text-sm text-slate-400">Live requests and OTP verification status.</p>
          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 440 }}>
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[88px]" />)}
              </div>
            )}

            {!loading && visitors.length === 0 && (
              <EmptyState
                icon={<VisitorPersonIcon />}
                title="No visitors yet"
                body="Register a visitor using the form on the left to start the approval flow."
              />
            )}

            <AnimatePresence>
              {visitors.map((v) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border p-4 transition-all duration-200"
                  style={{
                    borderColor: v.status === 'approved'
                      ? 'rgba(6,182,212,0.25)'
                      : v.status === 'rejected'
                        ? 'rgba(239,68,68,0.20)'
                        : 'rgba(255,255,255,0.08)',
                    background: v.status === 'approved'
                      ? 'rgba(6,182,212,0.05)'
                      : v.status === 'rejected'
                        ? 'rgba(239,68,68,0.04)'
                        : 'rgba(255,255,255,0.03)',
                  }}
                >
                  {/* Visitor info row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{v.name}</span>
                        <span className="text-xs text-slate-500">{v.phone}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        <span className="font-medium text-slate-300">Flat {v.flatNumber}</span> · {v.purpose}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <Badge variant={statusOf(v.status)}>{v.status}</Badge>
                  </div>

                  {/* Risk badge */}
                  {v.riskScore !== undefined && v.riskScore > 0 && (
                    <div className="mt-2.5">
                      <RiskBadge score={v.riskScore} />
                    </div>
                  )}

                  {/* OTP verification */}
                  {v.status === 'approved' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 overflow-hidden rounded-xl p-3"
                      style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.20)' }}
                    >
                      <p className="mb-2.5 text-xs font-semibold text-cyan-300">
                        ✓ Approved — Enter 6-digit OTP to verify entry
                      </p>
                      <div className="flex gap-2">
                        <input
                          value={otpValues[v._id] || ''}
                          onChange={(e) =>
                            setOtpValues((prev) => ({
                              ...prev,
                              [v._id]: e.target.value.replace(/\D/g, '').slice(0, 6),
                            }))
                          }
                          maxLength={6}
                          placeholder="• • • • • •"
                          className="w-32 rounded-xl border border-cyan-500/30 bg-[#0f172a] px-3 py-2 text-center font-mono text-lg font-bold tracking-[0.35em] text-cyan-200 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                        />
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={verifying === v._id || (otpValues[v._id] || '').length !== 6}
                          onClick={() => submitOtp(v._id)}
                          loading={verifying === v._id}
                        >
                          {otpSuccess === v._id ? (
                            <span className="flex items-center gap-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                              Verified!
                            </span>
                          ) : 'Verify OTP'}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Entered → show check-in time + Log Exit button */}
                  {v.status === 'entered' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.20)' }}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            Inside since {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                          <button
                            onClick={() => submitExit(v._id)}
                            disabled={exiting === v._id}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all duration-150 hover:brightness-110 active:scale-95 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', boxShadow: '0 2px 10px rgba(239,68,68,0.30)' }}
                          >
                            {exiting === v._id ? (
                              <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                            ) : (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                            )}
                            Log Exit
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Exited — show full entry/exit log */}
                  {v.status === 'exited' && (
                    <div className="mt-2.5 rounded-xl px-3 py-2.5" style={{ background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.18)' }}>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          In: {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                        <span className="text-slate-600">→</span>
                        <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                          Out: {v.exitTime ? new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {v.status === 'rejected' && (
                    <div className="mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-300" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      Rejected by resident
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </PageSection>
      </div>
    </div>
  );
};

export default GuardDashboard;
