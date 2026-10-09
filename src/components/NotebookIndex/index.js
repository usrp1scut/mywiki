import React, {useEffect, useMemo} from 'react';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';
import SiteSearchForm from '../SiteSearchForm';
import {useDocsSidebar, useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

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
  const searchUrl = useBaseUrl('/search');
  // Keep bookmarks made with the old directory filter useful.
  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q')?.trim();
    if (query) history.replace(`${searchUrl}?${new URLSearchParams({q: query})}`);
  }, [location.search, history, searchUrl]);
  const groups = useMemo(
    () => collectGroups(sidebar?.items ?? [], metadata.id),
    [sidebar, metadata.id],
  );
  const count = groups.reduce((sum, group) => sum + group.docs.length, 0);

  return (
    <div className={styles.index} data-search-exclude>
      <SiteSearchForm id="notebook-search" />
      {count > 0 && <nav aria-label="跳到笔记分类" className={styles.jumpLinks}>
        {groups.map((group) => <a key={group.id} href={`#${group.id}`}>{group.name}<span aria-hidden="true">{group.docs.length}</span></a>)}
      </nav>}
      <p role="status" className={styles.count}>
        共 {count} 篇，按侧栏原有分类排列
      </p>
      <div className={styles.groups}>
        {groups.map((group) => (
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
