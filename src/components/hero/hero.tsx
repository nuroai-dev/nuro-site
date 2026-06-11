'use client';

import { useEffect, useRef } from 'react';
import styles from './hero.module.css';

/**
 * Nuro hero — holographic, clean, apple-esque, with cursor magic.
 *
 * Three cursor-reactive layers:
 *
 *   1. **Orb cloud-push (subtle)** — layered blurred gradients drift
 *      slightly away from the pointer. Kept low-amplitude so it's ambient,
 *      not the star.
 *   2. **Drifting motes** — 40 tiny pastel specks with independent
 *      sine-wave drift. When the cursor is active, nearby motes catch
 *      its draft and pull toward it. When you stop, they release and
 *      resume wandering. Managed on one canvas — 40 particles at 60fps
 *      is basically free.
 *   3. **Prism cursor** — an iridescent glass disc following the pointer
 *      with backdrop-blur + conic holographic edge (chromatic aberration).
 *      Trails with 0.18 spring easing, fades in on motion and out on idle.
 *
 * Everything respects prefers-reduced-motion.
 */
export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const orbAR = useRef<HTMLDivElement>(null);
  const orbBR = useRef<HTMLDivElement>(null);
  const orbCR = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prismR = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── State ────────────────────────────────────────────────────────
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let px = mx; // prism eased position
    let py = my;
    let active = 0;
    let targetActive = 0;
    let lastMoveAt = 0;

    // ─── Orb push state ───────────────────────────────────────────────
    const orbCenters = [
      { el: orbAR.current, cx: 0.22, cy: 0.28, strength: 0.35 },
      { el: orbBR.current, cx: 0.78, cy: 0.72, strength: 0.35 },
      { el: orbCR.current, cx: 0.5, cy: 0.55, strength: 0.25 },
    ];
    const pushes = orbCenters.map(() => ({ x: 0, y: 0 }));

    // ─── Canvas sizing + DPR ──────────────────────────────────────────
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ─── Motes ────────────────────────────────────────────────────────
    // Palette drawn from Nuro's holographic stops.
    const palette = [
      [167, 199, 255], // sky
      [201, 184, 255], // lavender
      [232, 191, 230], // rose
      [255, 201, 227], // pink
      [255, 217, 194], // peach
    ];
    const MOTE_COUNT = 40;
    type Mote = {
      // Home position (drift orbit center) in viewport px
      hx: number;
      hy: number;
      // Current offset from home
      ox: number;
      oy: number;
      // Drift oscillation params
      ampX: number;
      ampY: number;
      speedX: number;
      speedY: number;
      phaseX: number;
      phaseY: number;
      // Visual
      size: number;
      color: number[];
      alpha: number;
    };
    const motes: Mote[] = [];
    for (let i = 0; i < MOTE_COUNT; i++) {
      motes.push({
        hx: Math.random() * window.innerWidth,
        hy: Math.random() * window.innerHeight,
        ox: 0,
        oy: 0,
        ampX: 40 + Math.random() * 120,
        ampY: 40 + Math.random() * 120,
        speedX: 0.00015 + Math.random() * 0.00035,
        speedY: 0.00015 + Math.random() * 0.00035,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        size: 1.4 + Math.random() * 3.2,
        color: palette[(Math.random() * palette.length) | 0],
        alpha: 0.4 + Math.random() * 0.45,
      });
    }

    // ─── Listeners ────────────────────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      lastMoveAt = performance.now();
      targetActive = 1;
    };
    const onLeave = () => {
      targetActive = 0;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);

    // ─── Frame loop ──────────────────────────────────────────────────
    let raf = 0;
    const frame = (t: number) => {
      const now = performance.now();
      const idleMs = now - lastMoveAt;
      if (idleMs > 300) targetActive = Math.max(0, 1 - (idleMs - 300) / 900);

      active += (targetActive - active) * 0.06;

      // Prism follows with spring easing
      px += (mx - px) * 0.18;
      py += (my - py) * 0.18;
      if (prismR.current) {
        prismR.current.style.setProperty('--prism-x', px.toFixed(1) + 'px');
        prismR.current.style.setProperty('--prism-y', py.toFixed(1) + 'px');
        prismR.current.style.setProperty('--prism-opacity', active.toFixed(3));
      }

      // Orb push — very subtle now
      const W = window.innerWidth;
      const H = window.innerHeight;
      const r = Math.min(W, H) * 0.5;
      for (let i = 0; i < orbCenters.length; i++) {
        const c = orbCenters[i];
        if (!c.el) continue;
        const ocx = c.cx * W;
        const ocy = c.cy * H;
        const dx = ocx - mx;
        const dy = ocy - my;
        const d = Math.hypot(dx, dy) || 1;
        const nx = dx / d;
        const ny = dy / d;
        const fall = 1 / ((d * d) / (r * r) + 0.5);
        const maxPush = 60 * c.strength;
        const tx = nx * fall * maxPush * active;
        const ty = ny * fall * maxPush * active;
        pushes[i].x += (tx - pushes[i].x) * 0.06;
        pushes[i].y += (ty - pushes[i].y) * 0.06;
        c.el.style.setProperty('--push-x', pushes[i].x.toFixed(2) + 'px');
        c.el.style.setProperty('--push-y', pushes[i].y.toFixed(2) + 'px');
      }

      // Motes — clear and redraw
      ctx.clearRect(0, 0, W, H);
      // "Additive-ish" drawing: soft multiply-ready pastels on the cream bg
      ctx.globalCompositeOperation = 'source-over';

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        // Natural drift (sine waves)
        const dx = Math.cos(t * m.speedX + m.phaseX) * m.ampX;
        const dy = Math.sin(t * m.speedY + m.phaseY) * m.ampY;
        // Target offset = drift + cursor attraction
        let tx = dx;
        let ty = dy;
        if (active > 0.01) {
          const vx = mx - (m.hx + dx);
          const vy = my - (m.hy + dy);
          const dist = Math.hypot(vx, vy) || 1;
          // Attraction falloff — only nearby motes feel the draft
          const pull = Math.max(0, 1 - dist / 380) ** 1.6;
          tx += (vx / dist) * pull * 60 * active;
          ty += (vy / dist) * pull * 60 * active;
        }
        // Ease toward target offset — lag creates the "catching a draft" feel
        m.ox += (tx - m.ox) * 0.05;
        m.oy += (ty - m.oy) * 0.05;

        const x = m.hx + m.ox;
        const y = m.hy + m.oy;
        // Wrap home positions gently at edges so long drifts don't accumulate
        if (m.hx < -50) m.hx = W + 50;
        else if (m.hx > W + 50) m.hx = -50;
        if (m.hy < -50) m.hy = H + 50;
        else if (m.hy > H + 50) m.hy = -50;

        // Soft blurred dot via radial gradient — cheap way to fake glow
        const [cr, cg, cb] = m.color;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, m.size * 4);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${m.alpha.toFixed(3)})`);
        grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${(m.alpha * 0.3).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, m.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    if (!reduced) raf = requestAnimationFrame(frame);
    else {
      // Render a static field for reduced-motion users so it's still pretty
      for (const m of motes) {
        const [cr, cg, cb] = m.color;
        const grad = ctx.createRadialGradient(m.hx, m.hy, 0, m.hx, m.hy, m.size * 4);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${m.alpha.toFixed(3)})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.hx, m.hy, m.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className={styles.hero} ref={rootRef}>
      <svg className={styles.svgDefs} aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0.04 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </svg>

      <div className={styles.orbs}>
        <div className={`${styles.orb} ${styles.orbA}`} ref={orbAR} />
        <div className={`${styles.orb} ${styles.orbB}`} ref={orbBR} />
        <div className={`${styles.orb} ${styles.orbC}`} ref={orbCR} />
      </div>

      {/* Motes canvas — drifting pastel specks */}
      <canvas ref={canvasRef} className={styles.motes} aria-hidden="true" />

      {/* Prism cursor — iridescent glass disc */}
      <div ref={prismR} className={styles.prism} aria-hidden="true">
        <div className={styles.prismRing} />
        <div className={styles.prismCore} />
      </div>

      <div className={styles.grain} />

      <div className={styles.content}>
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          Nuro
        </div>
        <h1 className={styles.headline}>
          Learning that meets <br />
          <span className={styles.shimmer}>every mind</span> where it is.
        </h1>
        <p className={styles.sub}>
          A calm, adaptive workspace for neurodiverse learners, teachers, and families.
        </p>
        <div className={styles.ctaRow}>
          <a href="#" className={styles.ctaPrimary}>
            Get started
          </a>
          <a href="#" className={styles.ctaGhost}>
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
