import React, {useEffect, useRef} from 'react';

/**
 * Mouse-follow star particle trail — renders a small canvas that
 * spawns tiny luminous particles at the cursor position.
 * Only active in dark mode (caller is responsible for gating).
 */
export default function StarCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let mouseX = -100;
    let mouseY = -100;
    const particles = [];
    const MAX = 50;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // spawn 1-2 particles per move event
      const count = 1 + (Math.random() > 0.5 ? 1 : 0);
      for (let i = 0; i < count && particles.length < MAX; i++) {
        particles.push({
          x: mouseX + (Math.random() - 0.5) * 8,
          y: mouseY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6 - 0.3,
          r: Math.random() * 2 + 0.5,
          life: 1,
          decay: 0.015 + Math.random() * 0.02,
          hue: Math.random() < 0.6 ? 190 + Math.random() * 30 : 270 + Math.random() * 30,
        });
      }
    };
    window.addEventListener('mousemove', onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.life * 0.7})`;
        ctx.fill();
        // glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.life * 0.12})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    />
  );
}
