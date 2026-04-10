import React, {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

/* ── Mini inline starfield just for the 404 page ── */
function MiniStarfield({canvasRef}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W, H;

    const resize = () => {
      W = canvas.width = canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({length: 120}, () => ({
      x: Math.random() * (W || 800),
      y: Math.random() * (H || 600),
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      da: (Math.random() * 0.01 + 0.004) * (Math.random() < 0.5 ? 1 : -1),
      hue: Math.random() < 0.3 ? 200 + Math.random() * 30 : 40 + Math.random() * 20,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.a += s.da;
        if (s.a > 1 || s.a < 0.15) s.da *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 60%, 85%, ${s.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);

  return null;
}

export default function NotFound() {
  const canvasRef = useRef(null);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout title="404 - 迷航中">
      <div style={styles.wrapper}>
        <canvas ref={canvasRef} style={styles.canvas} />
        <MiniStarfield canvasRef={canvasRef} />

        <div style={styles.content}>
          {/* 大号 404 */}
          <h1
            style={{
              ...styles.code404,
              ...(glitch ? styles.glitch : {}),
            }}>
            404
          </h1>

          {/* 信号图标 */}
          <div style={styles.signalIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2" />
              <path d="M16.24 7.76a6 6 0 010 8.49" />
              <path d="M7.76 16.24a6 6 0 010-8.49" />
              <path d="M19.07 4.93a10 10 0 010 14.14" style={{opacity: 0.35}} />
              <path d="M4.93 19.07a10 10 0 010-14.14" style={{opacity: 0.35}} />
              <line x1="2" y1="2" x2="22" y2="22" stroke="rgba(255,80,80,0.6)" />
            </svg>
          </div>

          <p style={styles.subtitle}>
            <span style={styles.tag}>SIGNAL LOST</span>
          </p>
          <p style={styles.desc}>
            星舰导航系统未能定位此坐标。
            <br />
            目标页面可能已被星际尘埃掩埋，或从未存在于这片星域。
          </p>

          <div style={styles.coords}>
            <span style={styles.coordLabel}>请求坐标：</span>
            <code style={styles.coordValue}>
              {typeof window !== 'undefined' ? window.location.pathname : '/unknown'}
            </code>
          </div>

          <div style={styles.actions}>
            <Link className="button button--primary button--lg" to="/" style={styles.btn}>
              返回主星港
            </Link>
            <Link className="button button--outline button--lg" to="/docs" style={styles.btnOutline}>
              进入知识库
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ── Inline styles (no module.css needed for a single page) ── */
const styles = {
  wrapper: {
    position: 'relative',
    minHeight: 'calc(100vh - 60px - 80px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'linear-gradient(160deg, #020410, #060d1f, #0a0f2e)',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '2rem',
    maxWidth: '560px',
  },
  code404: {
    fontSize: 'clamp(5rem, 14vw, 10rem)',
    fontWeight: 900,
    margin: 0,
    lineHeight: 1,
    background: 'linear-gradient(135deg, #00d4ff, #8a2be2, #00d4ff)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 0 30px rgba(0, 212, 255, 0.3))',
    animation: 'titleGlow 5s ease infinite',
    letterSpacing: '0.05em',
  },
  glitch: {
    textShadow: '3px 0 rgba(255,0,80,0.7), -3px 0 rgba(0,212,255,0.7)',
    transform: 'skewX(-2deg)',
  },
  signalIcon: {
    margin: '1.2rem 0 0.5rem',
    opacity: 0.8,
  },
  subtitle: {
    margin: '0.5rem 0',
  },
  tag: {
    display: 'inline-block',
    padding: '0.2rem 0.9rem',
    borderRadius: '999px',
    border: '1px solid rgba(255, 80, 80, 0.4)',
    color: 'rgba(255, 120, 120, 0.9)',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textShadow: '0 0 8px rgba(255, 80, 80, 0.3)',
  },
  desc: {
    color: '#a8bdd4',
    lineHeight: 1.8,
    fontSize: '1.05rem',
    margin: '1rem 0 1.5rem',
  },
  coords: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(0, 212, 255, 0.04)',
    border: '1px solid rgba(0, 212, 255, 0.12)',
    borderRadius: '8px',
    marginBottom: '2rem',
  },
  coordLabel: {
    color: 'rgba(0, 212, 255, 0.6)',
    fontSize: '0.85rem',
  },
  coordValue: {
    color: '#00d4ff',
    fontSize: '0.85rem',
    textShadow: '0 0 6px rgba(0, 212, 255, 0.3)',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btn: {},
  btnOutline: {
    color: '#88ddff',
  },
};
