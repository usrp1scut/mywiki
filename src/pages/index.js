import React, { useState,useEffect } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import { Poetry } from './诗词表';

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const [randomData, setRandomData] = useState(null);
  useEffect(() => {
    // 获取包含 JSON 数据的文件或定义 JSON 对象
    const jsonData = Poetry;

    // 随机抽取 JSON 数据项
    const randomIndex = Math.floor(Math.random() * jsonData.length);
    const randomItem = jsonData[randomIndex];

    // 设置随机抽取到的数据项
    setRandomData(randomItem);
  }, []);
  return (
    <Layout

      title="Jacob's wiki"
      description="Be yourself"
      keywords={['运维', '知识库','devops']}>
        <header className={styles.hero}>
          <div className="container">
            <div className="row">
              <div className="col">
                <img
                className={styles.logo}
                src={useBaseUrl("img/logo.png")}
                alt="my Logo"
                />
                <br />
                <Link
                className={clsx(
                    "button button--outline button--primary button--lg",
                )}
                to="/docs"
                >
                我的笔记
                </Link>
              </div>
              <div className="col" >
                {randomData && (
                  <h2 >{randomData.title}</h2>
                )}
                {randomData && (
                  <p>{randomData.author}</p>
                )}
                {randomData && (
                  <p dangerouslySetInnerHTML={{ __html: randomData.content.replace(/\n/g, '<br />') }} />
                )}
              </div>
            </div>
          </div>
        </header>
      
    </Layout>
  );
}

export default Home;