import { useEffect, useRef, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from '../animations/gsapConfig';
import SceneBackground from '../components/SceneBackground';
import Navbar from '../components/Navbar';

/* ─── Reusable fade-in wrapper ────── */
const FadeIn = ({ children, delay = 0, y = 16, className = '' }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Typewriter ──────────────────── */
const phrases = [
  'Stop fake entries before they reach your door.',
  'Give guards superpowers with OTP-secured access.',
  'Detect suspicious behaviour in real time.',
  'Every approval verified. Every risk scored.',
];

const TypeWriter = memo(() => {
  const [idx, setIdx] = useState(0);
  const [txt, setTxt] = useState('');

  useEffect(() => {
    let cancelled = false;
    const type = (text: string, pos = 0) => {
      if (cancelled) return;
      if (pos <= text.length) {
        setTxt(text.slice(0, pos));
        setTimeout(() => type(text, pos + 1), 26);
      } else {
        setTimeout(() => { if (!cancelled) setIdx((i) => (i + 1) % phrases.length); }, 2600);
      }
    };
    type(phrases[idx]);
    return () => { cancelled = true; };
  }, [idx]);

  return (
    <span className="text-slate-300 text-lg sm:text-xl">
      {txt}<span className="ml-0.5 inline-block h-5 w-0.5 translate-y-0.5 animate-pulse bg-cyan-400 align-middle" />
    </span>
  );
});

/* ─── Feature cards ───────────────── */
const features = [
  {
    title: 'OTP-Gated Entry',
    desc: 'Every approval generates a 6-digit, time-bound OTP. Guards verify at the gate — no approval, no entry.',
    border: 'rgba(6,182,212,0.25)',
    glow: 'rgba(6,182,212,0.08)',
    icon: '#06b6d4',
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Suspicious Pattern Detection',
    desc: 'Detect repeat visitors, high rejection counts, and risky behaviour with live risk scoring. Flagged instantly.',
    border: 'rgba(139,92,246,0.25)',
    glow: 'rgba(139,92,246,0.08)',
    icon: '#8b5cf6',
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Role-Based Dashboards',
    desc: 'Dedicated consoles for Admin, Guard, and Resident with real-time Socket.io updates. Each role sees what matters.',
    border: 'rgba(16,185,129,0.25)',
    glow: 'rgba(16,185,129,0.08)',
    icon: '#10b981',
    svg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

/* ─── Flow steps ──────────────────── */
const steps = [
  { n: '01', title: 'Guard registers visitor', desc: 'Guard fills in name, phone, flat & purpose at the gate.' },
  { n: '02', title: 'Resident notified live', desc: 'Resident sees instant in-app notification with full context.' },
  { n: '03', title: 'Approve & get OTP', desc: 'On approval, a unique 6-digit OTP appears for the resident.' },
  { n: '04', title: 'Guard verifies at gate', desc: 'Guard enters OTP — matched, visitor marked "entered". Done.' },
];

/* ─── Landing ─────────────────────── */
const LandingPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-anim', {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out', delay: 0.1,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SceneBackground />
      <Navbar />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-32 sm:pt-40">

        {/* ── Hero ── */}
        <section ref={heroRef} className="grid items-center gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            {/* Live badge */}
            <div className="hero-anim mb-6 inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200"
              style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.35)', boxShadow: '0 0 30px rgba(6,182,212,0.18)' }}>
              <span className="pulse h-2.5 w-2.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 12px rgba(6,182,212,1)' }} />
              Live visitor intelligence for apartments
            </div>

            {/* Headline */}
            <h1 className="hero-anim max-w-2xl font-extrabold leading-[1.04] tracking-tight" style={{ fontSize: 'clamp(2.8rem, 6vw, 5.2rem)' }}>
              <span
                className="block text-white"
                style={{ textShadow: '0 0 80px rgba(6,182,212,0.35), 0 2px 20px rgba(6,182,212,0.1)' }}
              >
                Smart Apartment
              </span>
              <span
                className="block"
                style={{
                  background: 'linear-gradient(120deg, #22d3ee 0%, #818cf8 45%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 40px rgba(6,182,212,0.5))',
                }}
              >
                Visitor Security
              </span>
            </h1>

            {/* Typewriter */}
            <div className="hero-anim mt-6 min-h-[2rem]">
              <TypeWriter />
            </div>

            {/* CTA buttons */}
            <div className="hero-anim mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-base font-bold text-white transition-all duration-200 hover:brightness-115"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  boxShadow: '0 0 0 1px rgba(6,182,212,0.4), 0 8px 32px rgba(6,182,212,0.45), 0 0 60px rgba(6,182,212,0.15)',
                }}
              >
                Get started free
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 0 20px rgba(0,0,0,0.2)' }}
              >
                See how it works
              </a>
            </div>

            {/* Stats row */}
            <div className="hero-anim mt-10 flex flex-wrap gap-8">
              {[
                { v: '3×', l: 'Faster verification', c: '#06b6d4' },
                { v: '6-digit', l: 'OTP-secured entry', c: '#a78bfa' },
                { v: 'Real-time', l: 'Live approvals', c: '#34d399' },
              ].map((s) => (
                <div key={s.v}>
                  <div className="text-2xl font-extrabold" style={{ color: s.c, textShadow: `0 0 20px ${s.c}80` }}>{s.v}</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-400">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live perimeter card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <div
              className="relative overflow-hidden rounded-2xl p-5"
              style={{
                background: 'rgba(15,23,42,0.80)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{ background: 'radial-gradient(circle at 30% 20%, rgba(6,182,212,0.22), transparent 60%)' }}
              />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-100">Live perimeter feed</span>
                  <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-emerald-300" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <span className="pulse h-1.5 w-1.5 rounded-full bg-emerald-400" /> Connected
                  </span>
                </div>
                {[
                  { l: 'Visitors today', v: '18', sub: '2 flagged', subC: 'text-amber-300' },
                  { l: 'Approval accuracy', v: '96%', sub: 'OTP-verified', subC: 'text-slate-400' },
                  { l: 'Avg gate time', v: '32s', sub: 'Request to entry', subC: 'text-slate-400' },
                ].map((r) => (
                  <div key={r.l} className="mb-2.5 flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div>
                      <div className="text-xs font-semibold text-slate-300">{r.l}</div>
                      <div className="mt-0.5 text-xl font-bold text-cyan-300">{r.v}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-semibold ${r.subC}`}>{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mt-24 sm:mt-32">
          <FadeIn className="mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">Core features</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Built for buildings that care about security</h2>
            <p className="mt-2 text-slate-400">Everything you need to manage visitor access at scale.</p>
          </FadeIn>

          <div className="grid gap-5 sm:grid-cols-3">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div
                  className="group h-full rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5"
                  style={{ border: `1px solid ${f.border}`, background: `linear-gradient(135deg, ${f.glow} 0%, rgba(15,23,42,0.7) 100%)`, backdropFilter: 'blur(12px)' }}
                >
                  <div
                    className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${f.icon}18`, color: f.icon, border: `1px solid ${f.icon}30` }}
                  >
                    {f.svg}
                  </div>
                  <h3 className="mb-2 text-base font-bold text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="mt-24 sm:mt-32">
          <FadeIn className="mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-purple-400">How it works</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">4 steps to secure entry</h2>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.08}>
                <div
                  className="relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)' }}
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                    style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(6,182,212,0.25)' }}
                  >
                    {s.n}
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold text-slate-100">{s.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-slate-600 lg:block text-lg">→</div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <FadeIn className="mt-24 sm:mt-32">
          <div
            className="relative overflow-hidden rounded-2xl p-8 text-center sm:p-14"
            style={{
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(6,182,212,0.14), transparent), radial-gradient(ellipse 50% 60% at 50% 100%, rgba(139,92,246,0.10), transparent)' }} />
            <div className="relative">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">Try it now — it's free</p>
              <h2 className="mx-auto mb-4 max-w-lg text-3xl font-extrabold text-white sm:text-4xl">
                Ready to secure your apartment building?
              </h2>
              <p className="mb-8 text-slate-400">Register with any role to explore the full guard, resident, and admin experience.</p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-[0_8px_40px_rgba(6,182,212,0.5)]"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', boxShadow: '0 4px 24px rgba(6,182,212,0.4)' }}
              >
                Launch live demo
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* ── Footer ── */}
        <footer className="mt-16 border-t pt-8 text-center text-sm text-slate-500" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="mb-2 flex items-center justify-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="font-bold text-slate-300">Sentinel</span>
          </div>
          <p>Smart Apartment Visitor Security System.</p>
          <p className="mt-0.5 text-slate-600">Built with React · Node.js · MongoDB · Socket.io</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
