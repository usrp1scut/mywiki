import React, { useState, useEffect, useRef } from 'react';
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
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const jsonData = Poetry;
    const randomIndex = Math.floor(Math.random() * jsonData.length);
    const randomItem = jsonData[randomIndex];
    setRandomData(randomItem);
  }, []);

  const refreshPage = () => {
    window.location.reload();
  };

  // 点击logo播放/暂停音乐
  const handleLogoClick = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  // 音乐播放状态同步
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  return (
    <Layout
      title="Jacob's wiki"
      description="Be yourself"
      keywords={['运维', '知识库', 'devops']}
    >
      <header className={styles.hero}>
        {/* 背景音乐播放器 */}
        <audio ref={audioRef} src={useBaseUrl("/audio/bg.mp3")} loop />
        <div className="container">
          <div className={styles.row}>
            <div className={styles.col}>
              <img
                className={clsx(styles.logo, playing && styles.logoSpin)}
                src={useBaseUrl("/img/musical.png")}
                alt="Jacob"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }}
                title={playing ? "点击暂停音乐" : "牛马之歌"}
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
