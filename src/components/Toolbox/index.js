import React, {lazy, Suspense, useEffect, useMemo, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {tools, searchTools} from './catalog';
import {DraftContext, styles} from './shared';

const panels = {
  json: lazy(() => import('./panels/TextTools').then(module => ({default: module.JsonTool}))),
  base64: lazy(() => import('./panels/TextTools').then(module => ({default: module.Base64Tool}))),
  url: lazy(() => import('./panels/TextTools').then(module => ({default: module.UrlTool}))),
  timestamp: lazy(() => import('./panels/TimeTools').then(module => ({default: module.TimestampTool}))),
  cron: lazy(() => import('./panels/TimeTools').then(module => ({default: module.CronTool}))),
  hash: lazy(() => import('./panels/Generators').then(module => ({default: module.HashTool}))),
  uuid: lazy(() => import('./panels/Generators').then(module => ({default: module.UuidTool}))),
  password: lazy(() => import('./panels/Generators').then(module => ({default: module.PasswordTool}))),
  regex: lazy(() => import('./panels/InspectTools').then(module => ({default: module.RegexTool}))),
  subnet: lazy(() => import('./panels/InspectTools').then(module => ({default: module.SubnetTool}))),
};

class ToolBoundary extends React.Component {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    return this.state.failed ? <div className={styles.empty} role="alert"><p>工具加载失败，请刷新页面后重试。</p><button className={styles.button} onClick={() => window.location.reload()}>刷新页面</button></div> : this.props.children;
  }
}

function Loading() { return <p className={styles.empty} role="status">正在加载工具…</p>; }

export default function Toolbox() {
  const [active, setActive] = useState('json');
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState({});
  useEffect(() => {
    const change = () => {
      const id = window.location.hash.slice(1);
      setActive(tools.some(tool => tool.id === id) ? id : 'json');
    };
    change();
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const visible = searchTools(query);
  const groups = [...new Set(visible.map(tool => tool.group))];
  const tool = tools.find(item => item.id === active);
  const Panel = panels[active];
  const context = useMemo(() => ({drafts, setDrafts}), [drafts]);

  return <main className={styles.page} data-search-exclude>
    <div className={styles.shell}>
      <header className={styles.pageHeader}><h1>工具箱</h1><p>开发与运维中的小事，在这里顺手完成。</p><span className={styles.localNote}>输入仅在浏览器内处理</span></header>
      <div className={styles.workspace}>
        <aside className={styles.sidebar} aria-label="工具选择">
          <label htmlFor="tool-filter" className={styles.searchLabel}>查找工具</label>
          <div className={styles.searchField}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
            <input id="tool-filter" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="名称或关键词" />
          </div>
          <nav className={styles.toolNav} aria-label="工具分类">
            {groups.map(group => <section key={group}><h2>{group}</h2><ul>{visible.filter(item => item.group === group).map(item => <li key={item.id}><a href={`#${item.id}`} onClick={() => setActive(item.id)} aria-current={active === item.id ? 'page' : undefined}>{item.title}</a></li>)}</ul></section>)}
            {!visible.length && <p className={styles.noTools} role="status">没有找到工具，试试「编码」「时间」或「IP」。</p>}
          </nav>
          <div className={styles.mobileSelect}><label htmlFor="tool-select">选择工具</label><select id="tool-select" value={active} onChange={event => { setActive(event.target.value); window.location.hash = event.target.value; }}>
            {!visible.some(item => item.id === active) && <option value={active}>{tool.title}（当前）</option>}
            {groups.map(group => <optgroup key={group} label={group}>{visible.filter(item => item.group === group).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</optgroup>)}
          </select>{query && <p role="status" className={styles.hint}>{visible.length ? `找到 ${visible.length} 个工具` : '没有找到工具，请调整关键词。'}</p>}</div>
          <p className={styles.sidebarNote}>切换工具保留输入。<br />刷新页面后清空。</p>
        </aside>
        <section className={styles.panel} aria-labelledby="active-tool-title">
          <header className={styles.panelHeader}><h2 id="active-tool-title">{tool.title}</h2><p>{tool.description}</p></header>
          <DraftContext.Provider value={context}>
            <ToolBoundary key={active}><BrowserOnly fallback={<Loading />}>{() => <Suspense fallback={<Loading />}><Panel /></Suspense>}</BrowserOnly></ToolBoundary>
          </DraftContext.Provider>
        </section>
      </div>
    </div>
  </main>;
}
