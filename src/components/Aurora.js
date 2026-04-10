import React, {useEffect, useRef} from 'react';

/**
 * Soft aurora / northern lights band that drifts across the top of the viewport.
 * Pure canvas — no DOM paint, light on GPU.
 */
export default function Aurora() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W, H;
    let t = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = 260; // only top strip
    };
    resize();
    window.addEventListener('resize', resize);

    // Aurora consists of several overlapping sine-wave ribbons
    const ribbons = [
      {hue: 180, sat: 70, light: 50, alpha: 0.04, freq: 0.0015, amp: 30, yBase: 0.35, speed: 0.3, phase: 0},
      {hue: 200, sat: 60, light: 55, alpha: 0.035, freq: 0.002, amp: 25, yBase: 0.4, speed: 0.4, phase: 2},
      {hue: 270, sat: 55, light: 50, alpha: 0.025, freq: 0.0018, amp: 35, yBase: 0.45, speed: 0.25, phase: 4},
      {hue: 160, sat: 65, light: 48, alpha: 0.03, freq: 0.0012, amp: 20, yBase: 0.3, speed: 0.35, phase: 1},
    ];

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      for (const r of ribbons) {
        ctx.beginPath();
        const baseY = H * r.yBase;
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          const y =
            baseY +
            Math.sin(x * r.freq + t * r.speed + r.phase) * r.amp +
            Math.sin(x * r.freq * 0.6 + t * r.speed * 1.4 + r.phase * 0.5) * r.amp * 0.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, `hsla(${r.hue}, ${r.sat}%, ${r.light}%, 0)`);
        grad.addColorStop(0.3, `hsla(${r.hue}, ${r.sat}%, ${r.light}%, ${r.alpha})`);
        grad.addColorStop(0.6, `hsla(${r.hue}, ${r.sat}%, ${r.light}%, ${r.alpha * 0.7})`);
        grad.addColorStop(1, `hsla(${r.hue}, ${r.sat}%, ${r.light}%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '260px',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.85,
      }}
    />
  );
}
