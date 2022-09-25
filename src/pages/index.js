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
      keywords={['111', '222','333']}>
        <header className={styles.hero}>
          <div className="container">
            <div className="row">
              <div className="col col--6">
                <h1>
                <br /><br />
                Life is boring<br />But learning is interesting <br />
                </h1>
                <Link
                className={clsx(
                    "button button--primary button--lg",
                    styles.getStartedButton
                )}
                to="/docs"
                >
                我的笔记
                </Link>

                <p className="padding-top--md">
                搞不懂前端， <strong>手动换行符居中</strong><br /><br /><br />
                </p>
              </div>
              <div className="col col--6">
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