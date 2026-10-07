import React, {useMemo} from 'react';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import Heading from '@theme/Heading';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useDocsSidebar, useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

function normalize(text) {
  return text.toLocaleLowerCase().replace(/k8s/g, 'kubernetes');
}

// Use the rendered sidebar as the source of truth for order, labels and URLs.
function collectGroups(items, currentDocId) {
  const groups = new Map();
  function visit(nodes, parents = []) {
    for (const item of nodes) {
      if (item.type === 'category') {
        visit(item.items, [...parents, item.label]);
      } else if (item.type === 'link' && item.docId && item.docId !== currentDocId) {
        const labels = parents.length ? parents : ['站内文档'];
        const name = labels.join(' / ');
        if (!groups.has(name)) {
          groups.set(name, {
            name,
            id: `notes-${labels.join('-').toLocaleLowerCase()}`,
            docs: [],
          });
        }
        groups.get(name).docs.push({label: item.label, href: item.href});
      }
    }
  }
  visit(items.filter((item) => item.type === 'category'));
  visit(items.filter((item) => item.type !== 'category'));
  return [...groups.values()];
}

export default function NotebookIndex() {
  const sidebar = useDocsSidebar();
  const {metadata} = useDoc();
  const location = useLocation();
  const history = useHistory();
  const isBrowser = useIsBrowser();
  // Static HTML and the first client render must agree before reading the URL.
  const query = isBrowser ? new URLSearchParams(location.search).get('q') ?? '' : '';
  function setQuery(value) {
    const params = new URLSearchParams(location.search);
    if (value) params.set('q', value);
    else params.delete('q');
    const search = params.toString();
    history.replace({...location, search: search ? `?${search}` : '', hash: ''});
  }
  const groups = useMemo(
    () => collectGroups(sidebar?.items ?? [], metadata.id),
    [sidebar, metadata.id],
  );
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const matches = groups.map((group) => ({
    ...group,
    docs: group.docs.filter((doc) => {
      const text = normalize(`${group.name} ${doc.label}`);
      return terms.every((term) => text.includes(term));
    }),
  })).filter((group) => group.docs.length);
  const count = matches.reduce((sum, group) => sum + group.docs.length, 0);

  return (
    <div className={styles.index}>
      <label className={styles.label} htmlFor="notebook-filter">按标题或分类找笔记</label>
      <div className={styles.searchRow}>
        <input
          id="notebook-filter"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例如：端口、权限、k8s 内存"
          aria-describedby="notebook-filter-help"
          className={styles.input}
        />
        {query && <button type="button" onClick={() => setQuery('')} className={styles.clear}>清空</button>}
      </div>
      <p id="notebook-filter-help" className={styles.hint}>
        这里只筛选目录；查正文里的命令和报错，可以用顶部的站内搜索。
      </p>
      {count > 0 && <nav aria-label="跳到笔记分类" className={styles.jumpLinks}>
        {matches.map((group) => <a key={group.id} href={`#${group.id}`}>{group.name}<span aria-hidden="true">{group.docs.length}</span></a>)}
      </nav>}
      <p role="status" className={styles.count}>
        {terms.length ? `找到 ${count} 篇笔记` : `共 ${count} 篇，按侧栏原有分类排列`}
      </p>
      {count === 0 && <div className={styles.empty}>
        <p>没有匹配的标题，试试更短的关键词。</p>
        <Link to={`/search?q=${encodeURIComponent(query)}`}>在全文中搜索“{query}” →</Link>
      </div>}
      <div className={styles.groups}>
        {matches.map((group) => (
          <section key={group.id} aria-labelledby={group.id} className={styles.group}>
            <Heading as="h2" id={group.id}>{group.name}<span className={styles.groupCount}>{group.docs.length} 篇</span></Heading>
            <ul>
              {group.docs.map((doc) => <li key={doc.href}><Link to={doc.href}>{doc.label}</Link></li>)}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
