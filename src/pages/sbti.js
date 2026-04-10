import React, {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './sbti.module.css';

const MIN_FRAME_HEIGHT = 980;

export default function SbtiPage() {
  const iframeRef = useRef(null);
  const [frameHeight, setFrameHeight] = useState(MIN_FRAME_HEIGHT);
  const [frameSrc, setFrameSrc] = useState('');
  const staticAppUrl = useBaseUrl('/apps/sbti/index.html');

  useEffect(() => {
    setFrameSrc(staticAppUrl);
  }, [staticAppUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    let intervalId;

    const syncHeight = () => {
      try {
        const doc = iframe.contentWindow?.document;
        if (!doc) return;
        const nextHeight = Math.max(
          doc.documentElement?.scrollHeight ?? 0,
          doc.body?.scrollHeight ?? 0,
          MIN_FRAME_HEIGHT,
        );
        setFrameHeight((current) => (current === nextHeight ? current : nextHeight));
      } catch (error) {
        // Same-origin static page: ignore transient load timing issues.
      }
    };

    const handleLoad = () => {
      syncHeight();
      intervalId = window.setInterval(syncHeight, 500);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [frameSrc]);

  const openStandalone = () => {
    window.open(staticAppUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout title="SBTI 测试" description="站内集成的 SBTI 趣味人格测试">
      <main className={styles.page}>
        <div className={styles.inkWash} aria-hidden="true" />

        <section className={styles.hero}>
          <div className={styles.panel}>
            <p className={styles.badge}>站内工具</p>
            <h1>SBTI 测试</h1>
            <p className={styles.subtitle}>
              这是把外部趣味人格测试整理进 wiki 的站内版本。你可以直接在这里完成测试，也可以单独全屏打开。
            </p>
            <div className={styles.actions}>
              <button type="button" className="button button--primary button--lg" onClick={openStandalone}>
                全屏打开测试
              </button>
              <a
                className="button button--secondary button--lg"
                href="https://github.com/UnluckyNinja/SBTI-test"
                target="_blank"
                rel="noreferrer">
                查看原仓库
              </a>
            </div>
          </div>

          <aside className={styles.sideStack}>
            <section className={styles.noteCard}>
              <h2>来源说明</h2>
              <p>
                页面素材与题目逻辑来自
                {' '}
                <a href="https://github.com/UnluckyNinja/SBTI-test" target="_blank" rel="noreferrer">
                  UnluckyNinja/SBTI-test
                </a>
                {' '}
                的镜像整理，原作者署名也保留在测试页面内部。
              </p>
            </section>
            <section className={styles.noteCard}>
              <h2>为什么放站内版</h2>
              <p>
                这样可以保持 wiki 的统一入口和导航体验，同时不需要重写原有的题库脚本与结果海报资源。
              </p>
            </section>
          </aside>
        </section>

        <section className={styles.frameShell}>
          <div className={styles.frameHeader}>
            <div>
              <h2>开始测试</h2>
              <p>下方是同源嵌入的完整测试页，站内导航会一直保留在顶部。</p>
            </div>
            <button type="button" className={styles.inlineButton} onClick={openStandalone}>
              单独打开 →
            </button>
          </div>
          {frameSrc ? (
            <iframe
              ref={iframeRef}
              className={styles.frame}
              src={frameSrc}
              title="SBTI 测试"
              style={{height: `${frameHeight}px`}}
            />
          ) : (
            <div className={styles.framePlaceholder}>测试页加载中...</div>
          )}
        </section>
      </main>
    </Layout>
  );
}
