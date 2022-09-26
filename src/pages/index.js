import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout

      title="Jacob's wiki"
      description="Be yourself"
      keywords={['运维', '知识库','devops']}>
        <header className={styles.hero}>
          <div className="container">
            <div className="row">
              <div className="col">
                <h1 >
                <br /><br />
                Life is boring,<br />But learning is interesting.
                </h1>
                <Link
                className={clsx(
                    "button button--outline button--primary button--lg",
                )}
                to="/docs"
                >
                我的笔记
                </Link>

                <p className="padding-top--md">
                便于查询，避免遗忘<br /><br /><br />
                </p>
              </div>
              <div className="col">
                <img
                className={styles.logo}
                src={useBaseUrl("img/logo.png")}
                alt="my Logo"
                />
              </div>
            </div>
          </div>
        </header>
      
    </Layout>
  );
}

export default Home;