import React, {useEffect, useRef} from 'react';
import {useLocation} from '@docusaurus/router';

/** A quiet bookmark along the navbar; only article pages have reading progress. */
export default function ReadingProgress() {
  const {pathname} = useLocation();
  const progressRef = useRef(null);

  useEffect(() => {
    let frame;
    let article;
    const update = () => {
      frame = null;
      article = document.querySelector('.theme-doc-markdown, .blog-article .markdown');
      const bar = progressRef.current;
      if (!bar) return;
      bar.hidden = !article;
      if (!article) return;
      const {top, height} = article.getBoundingClientRect();
      const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ifm-navbar-height')) || 60;
      const distance = Math.max(0, height - (window.innerHeight - navHeight));
      const progress = distance > 0 ? Math.min(1, Math.max(0, (navHeight - top) / distance)) : 1;
      bar.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (frame == null) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    const main = document.querySelector('main');
    if (main) observer.observe(main);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [pathname]);

  return <div ref={progressRef} className="reading-progress" aria-hidden="true" hidden />;
}
