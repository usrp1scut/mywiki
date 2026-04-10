import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './mbti.module.css';

export default function MbtiPage() {
  const staticAppUrl = useBaseUrl('/apps/mbti/index.html');
  const [frameSrc, setFrameSrc] = useState('');

  useEffect(() => {
    setFrameSrc(staticAppUrl);
  }, [staticAppUrl]);

  return (
    <Layout title="MBTI 测试" description="站内全屏 MBTI 测试" noFooter>
      <main className={styles.page}>
        {frameSrc ? (
          <iframe className={styles.frame} src={frameSrc} title="MBTI 测试" />
        ) : (
          <div className={styles.placeholder}>测试页加载中...</div>
        )}
      </main>
    </Layout>
  );
}