import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import styles from './news.module.css';

const NEWS_URL = 'https://newsnow.busiyi.world/';

export default function NewsPage() {
  const [frameSrc, setFrameSrc] = useState('');

  useEffect(() => {
    setFrameSrc(NEWS_URL);
  }, []);

  return (
    <Layout title="资讯" description="站内全宽资讯页" noFooter>
      <main className={styles.page}>
        {frameSrc ? (
          <iframe
            className={styles.frame}
            src={frameSrc}
            title="资讯"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className={styles.placeholder}>资讯页加载中...</div>
        )}
      </main>
    </Layout>
  );
}