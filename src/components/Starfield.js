import React, {useEffect, useRef, useCallback} from 'react';

/**
 * Full-screen canvas starfield with twinkling stars, drifting nebula clouds,
 * and occasional shooting stars.  Only rendered in dark mode.
 */
export default function Starfield() {
  const canvasRef = useRef(null);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W, H;

    /* ---- responsive sizing ---- */
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ---- stars ---- */
    const STAR_COUNT = Math.min(320, Math.floor((W * H) / 3200));
    const stars = Array.from({length: STAR_COUNT}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      alpha: Math.random(),
      dAlpha: (Math.random() * 0.008 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
      // subtle colour tint
      hue: Math.random() < 0.3 ? 200 + Math.random() * 40 : 50 + Math.random() * 20,
      sat: Math.random() < 0.3 ? 60 + Math.random() * 40 : 10 + Math.random() * 20,
    }));

    /* ---- shooting stars ---- */
    const shooters = [];
    const maybeSpawnShooter = () => {
      if (shooters.length >= 2 || Math.random() > 0.003) return;
      const angle = Math.PI / 6 + Math.random() * Math.PI / 6;
      const speed = 6 + Math.random() * 6;
      shooters.push({
        x: Math.random() * W * 0.8,
        y: Math.random() * H * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        len: 60 + Math.random() * 80,
      });
    };

    /* ---- nebula clouds (soft blobs) ---- */
    const nebulaCount = 4;
    const nebulae = Array.from({length: nebulaCount}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      rx: 200 + Math.random() * 300,
      ry: 120 + Math.random() * 200,
      hue: [220, 260, 180, 300][Math.floor(Math.random() * 4)],
      alpha: 0.012 + Math.random() * 0.018,
      drift: (Math.random() - 0.5) * 0.15,
    }));

    /* ---- draw loop ---- */
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      /* nebula */
      for (const n of nebulae) {
        n.x += n.drift;
        if (n.x > W + n.rx) n.x = -n.rx;
        if (n.x < -n.rx) n.x = W + n.rx;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
        g.addColorStop(0, `hsla(${n.hue}, 70%, 55%, ${n.alpha * 1.5})`);
        g.addColorStop(0.5, `hsla(${n.hue}, 60%, 40%, ${n.alpha})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(n.x, n.y, n.rx, n.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      /* stars */
      for (const s of stars) {
        s.alpha += s.dAlpha;
        if (s.alpha >= 1 || s.alpha <= 0.15) s.dAlpha *= -1;
        s.alpha = Math.max(0.15, Math.min(1, s.alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, ${s.sat}%, 92%, ${s.alpha})`;
        ctx.fill();
        // glow for brighter stars
        if (s.r > 1) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue}, ${s.sat}%, 80%, ${s.alpha * 0.15})`;
          ctx.fill();
        }
      }

      /* shooting stars */
      maybeSpawnShooter();
      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= 0.012;
        if (sh.life <= 0 || sh.x > W + 60 || sh.y > H + 60) {
          shooters.splice(i, 1);
          continue;
        }
        const tailX = sh.x - (sh.vx / Math.hypot(sh.vx, sh.vy)) * sh.len;
        const tailY = sh.y - (sh.vy / Math.hypot(sh.vx, sh.vy)) * sh.len;
        const grad = ctx.createLinearGradient(tailX, tailY, sh.x, sh.y);
        grad.addColorStop(0, `rgba(140, 200, 255, 0)`);
        grad.addColorStop(0.6, `rgba(180, 220, 255, ${sh.life * 0.3})`);
        grad.addColorStop(1, `rgba(220, 240, 255, ${sh.life * 0.8})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(sh.x, sh.y);
        ctx.stroke();
        // head glow
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 240, 255, ${sh.life * 0.9})`;
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

  useEffect(() => {
    return init();
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
