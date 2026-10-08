import React, {useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Starfield from './Starfield';


/**
 * Observes the data-theme attribute on <html> and only renders
 * dark-mode-exclusive effects outside document and blog reading pages.
 * This component must only be rendered on the client (via BrowserOnly).
 */
export default function StarfieldLoader() {
  const {pathname} = useLocation();
  const docsPath = useBaseUrl('/docs');
  const blogPath = useBaseUrl('/blog');
  const reading = pathname === docsPath
    || pathname.startsWith(`${docsPath}/`)
    || pathname === blogPath
    || pathname.startsWith(`${blogPath}/`);
  const [dark, setDark] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark',
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  if (!dark || reading || reducedMotion) return null;
  return (
    <>
      <Starfield />
    </>
  );
}
