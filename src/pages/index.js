import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import { Poetry } from './诗词表';

function Home() {
  const { siteConfig = {} } = useDocusaurusContext();
  const [randomData, setRandomData] = useState(null);

  useEffect(() => {
    const jsonData = Poetry;
    const randomIndex = Math.floor(Math.random() * jsonData.length);
    const randomItem = jsonData[randomIndex];
    setRandomData(randomItem);
  }, []);
const refreshPage = () => {
  window.location.reload();
};
  return (
    <Layout
      title="Jacob's wiki"
      description="Be yourself"
      keywords={['运维', '知识库', 'devops']}
    >
      <header className={styles.hero}>
        <div className="container">
          <div className={styles.row}>
            <div className={styles.col}>
              <img
                className={styles.logo}
                src={useBaseUrl("/img/logo.png")}
                alt="Jacob"
              />
            </div>
            <div className={styles.col}>
              {randomData ? (
                <div className={styles.poetry}>
                  <h2>{randomData.title}</h2>
                  <p>{randomData.author}</p>
                  <p dangerouslySetInnerHTML={{ __html: randomData.content.replace(/\n/g, '<br />') }} />
                  <button
                    className={clsx(
                      "button button--outline button--primary button--lg",
                    )}
                    onClick={refreshPage}
                  >
                    换一首
                  </button>
                </div>
              ) : (
                <p>加载中...</p>               
              )}
            </div>
          </div>
        </div>
      </header>
    </Layout>
  );
}

export default Home;
