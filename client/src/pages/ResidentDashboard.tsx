import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { getSocket, joinFlatRoom } from '../services/socket';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../components/ToastCenter';
import {
  Badge, Button, EmptyState, StatCard, SectionHeader, PageSection, Skeleton,
} from '../components/ui';

interface Visitor {
  _id: string;
  name: string;
  phone: string;
  flatNumber: string;
  purpose: string;
  status: string;
  otp?: string;
  otpPlain?: string;
  createdAt: string;
}

const TimeAgo = ({ date }: { date: string }) => {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  const label = diff < 60 ? `${diff}s ago` : diff < 3600 ? `${Math.floor(diff / 60)}m ago` : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return <span className="text-slate-500">{label}</span>;
};

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [otpReveal, setOtpReveal] = useState<string | null>(null);
  const { push } = useToast();

  const loadVisitors = async () => {
    setLoading(true);
    try {
      const res = await api.get<Visitor[]>('/visitors');
      const myVisitors = user?.flatNumber
        ? res.data.filter((v) => v.flatNumber === user.flatNumber)
        : res.data;
      setVisitors(myVisitors);
    } catch {
      push({ type: 'error', title: 'Failed to load visitor requests' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.flatNumber) joinFlatRoom(user.flatNumber);
    loadVisitors();
    const s = getSocket();
    s.on('visitorRequest', (payload: any) => {
      if (payload.flatNumber === user?.flatNumber) {
        push({ type: 'info', title: `🔔 New visitor: ${payload.name}`, body: payload.purpose });
        loadVisitors();
      }
    });
    s.on('visitorEntered', () => { loadVisitors(); });
    return () => { s.off('visitorRequest'); s.off('visitorEntered'); };
  }, [user?.flatNumber]);

  const decide = async (id: string, action: 'approve' | 'reject') => {
    setDeciding(id);
    try {
      const res = await api.put<{ visitor: Visitor; otp?: string }>(`/visitors/${id}/status`, { action });
      push({
        type: action === 'approve' ? 'success' : 'info',
        title: action === 'approve' ? '✓ Visitor approved — OTP generated' : 'Visitor rejected',
        body: action === 'approve' ? 'The OTP is now shown below. Share it with the guard.' : undefined,
      });
      if (action === 'approve' && res.data?.visitor?._id) {
        setOtpReveal(res.data.visitor._id);
      }
      loadVisitors();
    } catch (err: any) {
      push({ type: 'error', title: 'Could not update visitor', body: err?.response?.data?.message });
    } finally {
      setDeciding(null);
    }
  };

  const pending = visitors.filter((v) => v.status === 'pending');
  const approved = visitors.filter((v) => v.status === 'approved' || v.status === 'entered');
  const history = visitors.filter((v) => v.status === 'rejected' || v.status === 'entered');

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="Resident console"
        title="Visitor Approvals"
        description={user?.flatNumber ? `Managing access for Flat ${user.flatNumber}` : 'Approve or reject gate visitors in real-time'}
        action={
          <Button variant="secondary" size="sm" onClick={loadVisitors} loading={loading}
            icon={!loading ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            ) : undefined}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending" value={pending.length} sub="Needs your decision" color="amber" delay={0}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
        />
        <StatCard label="Approved" value={approved.length} sub="OTP generated" color="emerald" delay={0.06}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
        />
        <StatCard label="Total" value={visitors.length} sub="All time requests" color="purple" delay={0.12}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
        />
      </div>

      {/* Pending section */}
      <PageSection
        title="Pending Approvals"
        titleRight={
          pending.length > 0 ? (
            <span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-bold text-yellow-300 border border-yellow-400/25">
              {pending.length} waiting
            </span>
          ) : null
        }
      >
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : pending.length === 0 ? (
          <EmptyState
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
            title="No pending requests"
            body="You'll be notified when a guard registers a visitor for your flat."
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {pending.map((v) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="rounded-xl border p-4"
                  style={{ borderColor: 'rgba(250,204,21,0.22)', background: 'rgba(250,204,21,0.05)' }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="h-2 w-2 rounded-full bg-yellow-400" style={{ boxShadow: '0 0 8px rgba(250,204,21,0.7)' }} />
                        <span className="text-sm font-bold text-white">{v.name}</span>
                        <span className="text-xs text-slate-500">{v.phone}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Purpose: <span className="text-slate-200">{v.purpose}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Arrived <TimeAgo date={v.createdAt} />
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={deciding === v._id}
                        loading={deciding === v._id}
                        onClick={() => decide(v._id, 'reject')}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        disabled={deciding === v._id}
                        loading={deciding === v._id}
                        onClick={() => decide(v._id, 'approve')}
                      >
                        ✓ Approve & get OTP
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </PageSection>

      {/* Approved with OTP */}
      {approved.length > 0 && (
        <PageSection
          title="Approved Visitors"
          titleRight={<span className="text-sm font-normal text-slate-400">Share OTP with the guard</span>}
        >
          <div className="space-y-3">
            {approved.map((v) => (
              <div
                key={v._id}
                className="rounded-xl border p-4 transition-all"
                style={{ borderColor: 'rgba(16,185,129,0.22)', background: 'rgba(16,185,129,0.05)' }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{v.name}</span>
                      <Badge variant={v.status === 'entered' ? 'entered' : 'approved'}>{v.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{v.purpose} · Flat {v.flatNumber}</p>
                  </div>

                  {/* OTP reveal */}
                  {v.otpPlain && (
                    <div className="text-center">
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Entry OTP</p>
                      <button
                        onClick={() => setOtpReveal((prev) => (prev === v._id ? null : v._id))}
                        className="group flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-200"
                        style={{
                          background: 'rgba(16,185,129,0.10)',
                          border: '1px solid rgba(16,185,129,0.28)',
                        }}
                      >
                        {otpReveal === v._id ? (
                          <span className="font-mono text-2xl font-bold tracking-[0.35em] text-emerald-300">
                            {v.otpPlain}
                          </span>
                        ) : (
                          <span className="font-mono text-2xl font-bold tracking-[0.35em] text-emerald-400/40">
                            ──────
                          </span>
                        )}
                        <svg className="text-emerald-400/70" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {otpReveal === v._id
                            ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                          }
                        </svg>
                      </button>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {otpReveal === v._id ? 'Tap to hide' : 'Tap to reveal'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      )}

      {/* History */}
      {history.length > 0 && (
        <PageSection title="Visit History">
          <div className="space-y-2">
            {history.map((v) => (
              <div
                key={v._id}
                className="flex items-center justify-between rounded-xl border border-white/6 bg-white/3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-200">{v.name}</span>
                  <span className="text-xs text-slate-500">{v.purpose}</span>
                </div>
                <Badge variant={v.status === 'entered' ? 'entered' : 'rejected'}>{v.status}</Badge>
              </div>
            ))}
          </div>
        </PageSection>
      )}
    </div>
  );
};

export default ResidentDashboard;
