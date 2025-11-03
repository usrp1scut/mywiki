import React from 'react';
import clsx from 'clsx';
import {useColorMode} from '@docusaurus/theme-common';
import ColorModeToggle from '@theme-original/ColorModeToggle';
import styles from './styles.module.css';

export default function ColorModeToggleWrapper({className, ...props}) {
  const {colorMode, setColorMode} = useColorMode();

  const isDarkMode = colorMode === 'dark';

  return (
    <button
      className={clsx('clean-btn', className)}
      type="button"
      onClick={() => setColorMode(isDarkMode ? 'light' : 'dark')}
      {...props}>
      {isDarkMode ? (
        <span title="切换到明亮模式" className={styles.icon}>
          ☯ {/* 明亮模式图标 */}
        </span>
      ) : (
        <span title="切换到暗黑模式" className={styles.icon}>
          ☯ {/* 暗黑模式图标 */}
        </span>
      )}
    </button>
  );
}
