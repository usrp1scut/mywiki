import React, {useEffect, useState} from 'react';
import Starfield from './Starfield';
import StarCursor from './StarCursor';


/**
 * Observes the data-theme attribute on <html> and only renders
 * dark-mode-exclusive effects when dark mode is active.
 * This component must only be rendered on the client (via BrowserOnly).
 */
export default function StarfieldLoader() {
  const [dark, setDark] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark',
  );

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

  if (!dark) return null;
  return (
    <>
      <Starfield />
      <StarCursor />
    </>
  );
}
