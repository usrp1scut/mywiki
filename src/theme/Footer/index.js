import React, {useMemo} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import useGlobalData from '@docusaurus/useGlobalData';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useHistory, useLocation} from '@docusaurus/router';
import styles from './styles.module.css';

const GITHUB_URL = 'https://github.com/usrp1scut/mywiki';

function collectNotePaths(globalData) {
  const docsPlugin = globalData?.['docusaurus-plugin-content-docs'];
  const paths = new Set();

  if (docsPlugin && typeof docsPlugin === 'object') {
    Object.values(docsPlugin).forEach((instance) => {
      const versions = instance?.versions ?? [];
      const current = versions.find((v) => v.isLast) ?? versions[0];
      (current?.docs ?? []).forEach((doc) => {
        if (!doc?.path) return;
        const normalized = doc.path.replace(/\/+$/, '');
        // 排除目录首页，优先跳转到具体笔记正文
        if (normalized === '/docs' || normalized === '/life' || normalized === '') return;
        paths.add(doc.path);
      });
    });
  }

  // 兜底：若 docs 元数据不可用，回退到技能树索引中的笔记
  if (paths.size === 0) {
    const branches = globalData?.['skill-tree']?.default?.branches ?? [];
    branches.forEach((branch) => {
      (branch.skills ?? []).forEach((skill) => {
        (skill.notes ?? []).forEach((note) => {
          if (note?.permalink) paths.add(note.permalink);
        });
      });
    });
  }

  return Array.from(paths);
}

export default function Footer() {
  const {footer} = useThemeConfig();
  const globalData = useGlobalData();
  const rssUrl = useBaseUrl('/blog/rss.xml');
  const history = useHistory();
  const {pathname} = useLocation();

  const notePaths = useMemo(() => collectNotePaths(globalData), [globalData]);

  if (!footer) {
    return null;
  }

  const handleRandomNote = () => {
    if (notePaths.length === 0) return;
    const normalizedCurrent = pathname.replace(/\/+$/, '');
    const candidates = notePaths.filter((p) => p.replace(/\/+$/, '') !== normalizedCurrent);
    const pool = candidates.length > 0 ? candidates : notePaths;
    const target = pool[Math.floor(Math.random() * pool.length)];
    history.push(target);
  };

  return (
    <footer className={`footer ${styles.footer}`}>
      <div className={styles.inner}>
        <nav className={styles.actions} aria-label="页脚快捷入口">
          {notePaths.length > 0 && (
            <button
              type="button"
              className={styles.randomButton}
              onClick={handleRandomNote}
              title={`从 ${notePaths.length} 篇站内笔记中随机翻开一页`}
              aria-label="随手翻一页，随机跳转到一篇站内笔记">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                <path d="M9 8h6M9 12h4" />
              </svg>
              <span>随手翻一页</span>
            </button>
          )}

          <span className={styles.sep} aria-hidden="true">·</span>

          <a
            className={styles.actionLink}
            href={rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="订阅博客 RSS">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span>RSS 订阅</span>
          </a>

          <span className={styles.sep} aria-hidden="true">·</span>

          <a
            className={styles.actionLink}
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="访问 GitHub 仓库">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
            </svg>
            <span>GitHub</span>
          </a>
        </nav>

        {footer.copyright && (
          <div
            className={`footer__copyright ${styles.copyright}`}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{__html: footer.copyright}}
          />
        )}
      </div>
    </footer>
  );
}
