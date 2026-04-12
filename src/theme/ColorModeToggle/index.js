import React from 'react';
import clsx from 'clsx';
import {useColorMode} from '@docusaurus/theme-common';
import styles from './styles.module.css';

/**
 * SVG 太极图标，所有平台显示一致，不依赖系统字体/emoji。
 * 亮色模式：黑鱼在右（阳中有阴）
 * 暗色模式：反转色 + 发光
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
      <circle cx="50" cy="26" r="10" fill="currentColor" />
      {/* 鱼眼：暗半中的亮点 */}
      <circle cx="50" cy="74" r="10" fill="var(--taiji-light, #fff)" />
    </svg>
  );
}

export default function ColorModeToggleWrapper({className, ...props}) {
  const {colorMode, setColorMode} = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <button
      className={clsx('clean-btn', styles.toggle, className)}
      type="button"
      title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
      onClick={() => setColorMode(isDarkMode ? 'light' : 'dark')}
      {...props}>
      <TaijiIcon className={styles.icon} />
    </button>
  );
}
