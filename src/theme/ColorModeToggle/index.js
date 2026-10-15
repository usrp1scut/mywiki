import React, {useEffect, useRef} from 'react';
import {flushSync} from 'react-dom';
import clsx from 'clsx';
import {useColorMode} from '@docusaurus/theme-common';
import styles from './styles.module.css';

/**
 * SVG 太极图标，所有平台显示一致，不依赖系统字体/emoji。
 * 亮色模式：黑鱼在右（阳中有阴）
 * 暗色模式：反转色
 */
function TaijiIcon({className}) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      width="24"
      height="24"
      aria-hidden="true">
      {/* 外圆 */}
      <circle cx="50" cy="50" r="48" fill="currentColor" />
      {/* 亮半（左） */}
      <path
        d="M50 2 A48 48 0 0 0 50 98 A24 24 0 0 0 50 50 A24 24 0 0 1 50 2"
        fill="var(--taiji-light, #fff)"
      />
      {/* 鱼眼：亮半中的暗点 */}
      <circle cx="50" cy="26" r="8" fill="var(--taiji-light, #fff)" />
      {/* 鱼眼：暗半中的亮点 */}
      <circle cx="50" cy="74" r="8" fill="currentColor" />
    </svg>
  );
}

export default function ColorModeToggleWrapper({className, ...props}) {
  const {colorMode, setColorMode} = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const transitionRef = useRef(null);

  useEffect(() => () => transitionRef.current?.skipTransition(), []);

  const handleClick = (event) => {
    const nextMode = isDarkMode ? 'light' : 'dark';
    transitionRef.current?.skipTransition();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduceMotion) {
      setColorMode(nextMode);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => {
      flushSync(() => setColorMode(nextMode));
    });
    transitionRef.current = transition;
    transition.ready.then(() => {
      document.documentElement.animate(
        {clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]},
        {duration: 480, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)'},
      );
    }).catch(() => {}); // A second toggle can intentionally skip the current transition.
    transition.finished.catch(() => {}).finally(() => {
      if (transitionRef.current === transition) transitionRef.current = null;
    });
  };

  return (
    <button
      className={clsx('clean-btn', styles.toggle, className)}
      type="button"
      title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
      aria-label={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
      data-dark={isDarkMode}
      onClick={handleClick}
      {...props}>
      <TaijiIcon className={styles.icon} />
    </button>
  );
}
