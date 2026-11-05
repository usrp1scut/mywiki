import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {Button, styles as toolbox} from '../components/Toolbox/shared';
import {groups, lessons} from '../components/ProtocolExplorer/lessons.mjs';
import {Network, Sequence} from '../components/ProtocolExplorer/Diagrams';
import styles from '../components/ProtocolExplorer/styles.module.css';

const progressKey = 'wiki-protocols-learned';
const lessonGroups = groups.map(group => ({group, items: lessons.filter(lesson => lesson.group === group)}));

function Player({lesson, view, setView, learned, onMark}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const last = lesson.steps.length - 1;
  const packet = lesson.steps[index];
  const direction = p => lesson.nodes[p.from].name + ' → ' + lesson.nodes[p.to].name;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setIndex(index + 1);
      if (index + 1 === last) setPlaying(false);
    }, 3000 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, index, last, speed]);

  function seek(next) {
    setPlaying(false);
    setIndex(next);
  }
  function togglePlayback() {
    if (index === last) setIndex(0);
    setPlaying(!playing);
  }

  return <>
    <div className={styles.viewBar}>
      <div role="group" aria-label="演示视图" className={styles.views}>
        <button type="button" aria-pressed={view === 'network'} onClick={() => setView('network')}>网络图</button>
        <button type="button" aria-pressed={view === 'sequence'} onClick={() => setView('sequence')}>时序图</button>
      </div>
      <span>第 {index + 1} / {lesson.steps.length} 步</span>
    </div>
    <div className={styles.diagram}>
      {view === 'network' ? <Network lesson={lesson} index={index} /> : <Sequence lesson={lesson} index={index} />}
    </div>
    <div className={styles.controls}>
      <Button primary onClick={togglePlayback}>{playing ? '暂停' : index === last ? '重新播放' : '播放'}</Button>
      <Button onClick={() => seek(index - 1)} disabled={index === 0}>上一步</Button>
      <Button onClick={() => seek(index + 1)} disabled={index === last}>下一步</Button>
      <label>倍速 <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
        {[0.5, 1, 2].map(s => <option key={s} value={s}>{s}×</option>)}
      </select></label>
    </div>
    <section aria-label="当前报文" aria-live={playing ? 'off' : 'polite'} aria-atomic="true" className={styles.inspector}>
      <div><h2>{packet.label}</h2><span>{direction(packet)}</span></div>
      <code>{packet.wire}</code>
      <p>{packet.detail}</p>
    </section>
    <section className={styles.log} aria-label="报文记录">
      <h2>报文记录</h2>
      <ol>{lesson.steps.map((p, n) => <li key={n}>
        <button type="button" aria-current={n === index ? 'step' : undefined} onClick={() => seek(n)}>
          <span className={styles.number}>{String(n + 1).padStart(2, '0')}</span>
          <strong>{p.label}</strong><span className={styles.direction}>{direction(p)}</span>
        </button>
      </li>)}</ol>
    </section>
    <footer className={styles.lessonFooter}>
      <div>协议规范 {lesson.refs.map(n => <a key={n} href={'https://www.rfc-editor.org/rfc/rfc' + n}>RFC {n}</a>)}</div>
      <Button aria-pressed={learned} onClick={onMark}>{learned ? '已学过 · 撤销标记' : '标记为已学'}</Button>
    </footer>
  </>;
}

export default function ProtocolsPage() {
  const broken = useBrokenLinks();
  lessons.forEach(({id}) => broken.collectAnchor(id));
  const [lesson, setLesson] = useState(lessons[0]);
  const [view, setView] = useState('network');
  const [learned, setLearned] = useState([]);
  useEffect(() => {
    function selectFromUrl() {
      setLesson(lessons.find(item => item.id === window.location.hash.slice(1)) || lessons[0]);
    }
    selectFromUrl();
    window.addEventListener('hashchange', selectFromUrl);
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey));
      if (Array.isArray(saved)) setLearned(lessons.filter(item => saved.includes(item.id)).map(item => item.id));
    } catch { /* Progress remains available for this visit. */ }
    return () => window.removeEventListener('hashchange', selectFromUrl);
  }, []);
  function mark() {
    const next = learned.includes(lesson.id) ? learned.filter(id => id !== lesson.id) : [...learned, lesson.id];
    setLearned(next);
    try { localStorage.setItem(progressKey, JSON.stringify(next)); } catch { /* Storage may be disabled. */ }
  }

  return <Layout title="网络协议演示" description="通过网络图、时序图和逐步报文，学习 TCP、DNS、TLS 等 14 种协议。" noFooter>
    <main className={toolbox.page}>
      <div className={styles.anchors} aria-hidden="true">
        {lessons.map(item => <span key={item.id} id={item.id} />)}
      </div>
      <div className={toolbox.workspace}>
        <header className={toolbox.pageHeader + ' ' + styles.heading}>
          <div className={styles.path}><Link to="/tools">工具箱</Link><span aria-hidden="true"> / </span>网络协议演示</div>
          <h1>{lesson.name} · {lesson.title}</h1>
          <p>{lesson.intro}</p>
        </header>
        <aside className={toolbox.sidebar} aria-label="协议选择">
          <nav className={toolbox.toolNav} aria-label="协议目录">
            <h2 className={styles.menuTitle}>网络协议演示</h2>
            {lessonGroups.map(({group, items}) => <section key={group}><h2>{group}</h2><ul>
              {items.map(item => <li key={item.id}><a href={'#' + item.id} aria-current={lesson.id === item.id ? 'page' : undefined}>
                <strong>{item.name}</strong> <span className={styles.topic}>{item.topic}</span>
                {learned.includes(item.id) && <span className={styles.learned}>已学</span>}
              </a></li>)}
            </ul></section>)}
          </nav>
          <div className={toolbox.mobileSelect + ' ' + styles.mobilePicker}>
            <label htmlFor="lesson-select">选择协议</label>
            <select id="lesson-select" value={lesson.id} onChange={e => { window.location.hash = e.target.value; }}>
              {lessonGroups.map(({group, items}) => <optgroup key={group} label={group}>
                {items.map(item => <option key={item.id} value={item.id}>{item.name} · {item.topic}</option>)}
              </optgroup>)}
            </select>
          </div>
          <p className={styles.progress}>已学 {learned.length} / {lessons.length}</p>
        </aside>
        <div className={toolbox.panel}>
          <Player key={lesson.id} lesson={lesson} view={view} setView={setView} learned={learned.includes(lesson.id)} onMark={mark} />
        </div>
      </div>
    </main>
  </Layout>;
}
