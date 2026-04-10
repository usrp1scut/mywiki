import React, {useEffect, useState, useRef} from 'react';

/**
 * Typewriter effect with blinking cursor.
 * Renders each character one by one, then keeps a blinking cursor.
 *
 * Props:
 *   text      – the full string to type out
 *   speed     – ms per character (default 90)
 *   className – forwarded to the wrapper <span>
 */
export default function TypeWriter({text, speed = 90, className}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    setDone(false);

    const timer = setInterval(() => {
      idx.current += 1;
      if (idx.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(timer);
      } else {
        setDisplayed(text.slice(0, idx.current));
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          background: 'currentColor',
          animation: done ? 'cursorBlink 1s step-end infinite' : 'none',
          opacity: done ? undefined : 1,
        }}
      />
    </span>
  );
}
