import { useEffect, useRef } from 'react';

/**
 * Striking canvas background:
 *  - Bright perspective grid with strong cyan horizon glow
 *  - Animated radar-style horizontal scan sweep
 *  - Glowing dot intersections on the grid
 *  - Large, vibrant drifting orbs with blur-style glow
 *  - Subtle shooting stars / data streams
 */
const SceneBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let t = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // ── Shooting stars (data streams) ──────────────────────────────
        const STAR_COUNT = 8;
        const stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight * 0.6,
            len: 80 + Math.random() * 120,
            speed: 1.5 + Math.random() * 2.5,
            alpha: 0,
            delay: Math.random() * 180,
            timer: Math.random() * 180,
        }));

        const drawFrame = () => {
            const W = canvas.width;
            const H = canvas.height;
            t += 1;

            ctx.clearRect(0, 0, W, H);

            /* ─── 1. Large glowing orbs ─────────────────────────────────── */
            const orbs = [
                { x: W * 0.18, y: H * 0.18, r: W * 0.38, c0: 'rgba(6,182,212,0.32)', c1: 'transparent' },
                { x: W * 0.82, y: H * 0.22, r: W * 0.32, c0: 'rgba(139,92,246,0.28)', c1: 'transparent' },
                { x: W * 0.50, y: H * 0.80, r: W * 0.34, c0: 'rgba(59,130,246,0.22)', c1: 'transparent' },
                { x: W * (0.5 + 0.08 * Math.sin(t * 0.012)), y: H * (0.1 + 0.05 * Math.cos(t * 0.009)), r: W * 0.20, c0: 'rgba(6,182,212,0.20)', c1: 'transparent' },
            ];

            for (const orb of orbs) {
                const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
                grad.addColorStop(0, orb.c0);
                grad.addColorStop(1, orb.c1);
                ctx.save();
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            /* ─── 2. Perspective grid ───────────────────────────────────── */
            const horizon = H * 0.52;
            const vanishX = W * 0.50;
            const gridCols = 16;
            const gridRows = 12;
            const gridW = W * 1.6;
            const gridH = H * 0.52;

            // Vertical perspective lines
            for (let i = 0; i <= gridCols; i++) {
                const frac = i / gridCols;
                const tx = -gridW / 2 + gridW * frac;
                const alpha = 0.04 + 0.18 * Math.min(1, Math.abs(frac - 0.5) < 0.08 ? 1.0 : 0.4);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(vanishX, horizon);
                ctx.lineTo(vanishX + tx, horizon + gridH);
                ctx.strokeStyle = '#06b6d4';
                ctx.lineWidth = i === gridCols / 2 ? 1.2 : 0.7;
                ctx.stroke();
                ctx.restore();
            }

            // Horizontal receding lines
            for (let j = 0; j <= gridRows; j++) {
                const frac = j / gridRows;
                const y = horizon + gridH * (frac ** 1.7);
                const halfW = (gridW / 2) * frac;
                const alpha = 0.05 + 0.22 * frac;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(vanishX - halfW, y);
                ctx.lineTo(vanishX + halfW, y);
                ctx.strokeStyle = '#06b6d4';
                ctx.lineWidth = 0.75;
                ctx.stroke();
                ctx.restore();

                // ── Glowing intersection dots ──────────────────────────────
                if (j > 1 && j < gridRows) {
                    for (let i = 0; i <= gridCols; i++) {
                        const frac_h = i / gridCols;
                        const tx_h = -gridW / 2 + gridW * frac_h;
                        // Interpolate x between vanish point and ground
                        const dotX = vanishX + tx_h * frac;
                        const dotY = y;
                        const dotAlpha = 0.15 + 0.50 * frac * (1 - Math.abs(frac_h - 0.5) * 1.2);
                        ctx.save();
                        ctx.globalAlpha = Math.max(0, dotAlpha);
                        const dotGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 3.5);
                        dotGrad.addColorStop(0, '#67e8f9');
                        dotGrad.addColorStop(1, 'transparent');
                        ctx.fillStyle = dotGrad;
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, 3.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                }
            }

            // ── Bright horizon glow line ────────────────────────────────────
            const hGrad = ctx.createLinearGradient(vanishX - gridW / 2, 0, vanishX + gridW / 2, 0);
            hGrad.addColorStop(0, 'transparent');
            hGrad.addColorStop(0.15, 'rgba(6,182,212,0.25)');
            hGrad.addColorStop(0.4, 'rgba(6,182,212,0.90)');
            hGrad.addColorStop(0.5, '#67e8f9');
            hGrad.addColorStop(0.6, 'rgba(6,182,212,0.90)');
            hGrad.addColorStop(0.85, 'rgba(6,182,212,0.25)');
            hGrad.addColorStop(1, 'transparent');

            // glow halo below horizon
            const hGlow = ctx.createLinearGradient(0, horizon - 6, 0, horizon + 18);
            hGlow.addColorStop(0, 'rgba(6,182,212,0.30)');
            hGlow.addColorStop(1, 'transparent');
            ctx.save();
            ctx.fillStyle = hGlow;
            ctx.fillRect(vanishX - gridW / 2, horizon - 6, gridW, 24);
            ctx.restore();

            // crisp horizon line
            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.beginPath();
            ctx.moveTo(vanishX - gridW / 2, horizon);
            ctx.lineTo(vanishX + gridW / 2, horizon);
            ctx.strokeStyle = hGrad;
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.restore();

            /* ─── 3. Radar scan sweep ────────────────────────────────────── */
            const scanY = horizon + gridH * ((((t * 0.8) % 120) / 120) ** 1.7);
            const scanFrac = ((t * 0.8) % 120) / 120;
            const scanHalfW = (gridW / 2) * (scanFrac ** 1.7);
            const scanAlpha = 0.55 * Math.sin(Math.PI * scanFrac);

            const scanGrad = ctx.createLinearGradient(vanishX - scanHalfW, 0, vanishX + scanHalfW, 0);
            scanGrad.addColorStop(0, 'transparent');
            scanGrad.addColorStop(0.1, 'rgba(6,182,212,0.0)');
            scanGrad.addColorStop(0.5, 'rgba(6,182,212,0.9)');
            scanGrad.addColorStop(0.9, 'rgba(6,182,212,0.0)');
            scanGrad.addColorStop(1, 'transparent');

            ctx.save();
            ctx.globalAlpha = scanAlpha;
            ctx.beginPath();
            ctx.moveTo(vanishX - scanHalfW, scanY);
            ctx.lineTo(vanishX + scanHalfW, scanY);
            ctx.strokeStyle = scanGrad;
            ctx.lineWidth = 2;
            ctx.stroke();
            // glow strip above scan line
            const scanFill = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 4);
            scanFill.addColorStop(0, 'rgba(6,182,212,0.12)');
            scanFill.addColorStop(1, 'transparent');
            ctx.globalAlpha = scanAlpha * 0.7;
            ctx.fillStyle = scanFill;
            ctx.fillRect(vanishX - scanHalfW, scanY - 12, scanHalfW * 2, 16);
            ctx.restore();

            /* ─── 4. Shooting stars / data streams ──────────────────────── */
            for (const s of stars) {
                s.timer++;
                if (s.timer < s.delay) continue;
                const progress = (s.timer - s.delay) / 60;
                if (progress > 1) {
                    s.timer = 0;
                    s.delay = 10 + Math.random() * 120;
                    s.x = Math.random() * W;
                    s.y = 60 + Math.random() * H * 0.45;
                    s.len = 80 + Math.random() * 140;
                    s.speed = 1.2 + Math.random() * 2.5;
                }
                const alpha = Math.sin(Math.PI * Math.min(progress, 1));
                const tailX0 = s.x + s.len * progress - s.len;
                const tailX1 = s.x + s.len * progress;
                const sGrad = ctx.createLinearGradient(tailX0, s.y, tailX1, s.y);
                sGrad.addColorStop(0, 'transparent');
                sGrad.addColorStop(0.7, `rgba(6,182,212,${alpha * 0.6})`);
                sGrad.addColorStop(1, `rgba(255,255,255,${alpha * 0.9})`);
                ctx.save();
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.moveTo(tailX0, s.y);
                ctx.lineTo(tailX1, s.y);
                ctx.strokeStyle = sGrad;
                ctx.lineWidth = 1.2;
                ctx.stroke();
                // bright tip dot
                ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
                ctx.beginPath();
                ctx.arc(tailX1, s.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            /* ─── 5. Vignette ───────────────────────────────────────────── */
            const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
            vig.addColorStop(0, 'transparent');
            vig.addColorStop(1, 'rgba(10,22,40,0.65)');
            ctx.save();
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
            ctx.restore();

            animId = requestAnimationFrame(drawFrame);
        };

        drawFrame();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div
            className="pointer-events-none fixed inset-0"
            style={{ zIndex: -1, background: 'linear-gradient(180deg, #070e1f 0%, #0a1628 60%, #07101f 100%)' }}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
            />
        </div>
    );
};

export default SceneBackground;
