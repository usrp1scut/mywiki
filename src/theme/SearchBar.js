import React, {useEffect, useId, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useHistory, useLocation} from '@docusaurus/router';
import useSiteSearch from '@site/src/search/useSiteSearch';
import styles from './SearchBar.module.css';

export default function SearchBar({handleSearchBarToggle}) {
  const id = useId();
  const input = useRef(null);
  const list = useRef(null);
  const history = useHistory();
  const location = useLocation();
  const searchUrl = useBaseUrl('/search');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const {items, status, retry} = useSiteSearch(query, open);
  const results = items.slice(0, 8);
  const expanded = open && Boolean(query.trim());
  const fullSearchUrl = `${searchUrl}?${new URLSearchParams({q: query.trim()})}`;

  useEffect(() => { setOpen(false); setSelected(-1); }, [location.pathname, location.search]);
  useEffect(() => { setSelected(-1); }, [query, items]);
  useEffect(() => { handleSearchBarToggle?.(open); }, [open, handleSearchBarToggle]);
  useEffect(() => {
    function shortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);
  useEffect(() => {
    if (selected >= 0) list.current?.children[selected]?.scrollIntoView({block: 'nearest'});
  }, [selected]);

  function navigate(href) {
    setOpen(false);
    input.current?.blur();
    history.push(href);
  }
  function keyDown(event) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      setSelected(-1);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (results.length) setSelected((value) => event.key === 'ArrowDown'
        ? (value + 1) % results.length : (value <= 0 ? results.length : value) - 1);
    } else if (event.key === 'Enter' && query.trim()) {
      event.preventDefault();
      navigate(expanded && selected >= 0 ? results[selected]?.href || fullSearchUrl : fullSearchUrl);
    }
  }
  const message = status === 'error' ? '搜索暂时无法加载，请重试。'
    : status === 'loading' ? '正在搜索…'
    : results.length ? `显示 ${results.length} 条建议，使用上下方向键选择。`
    : process.env.NODE_ENV !== 'production' ? '本地开发模式不生成索引，请构建后预览。'
    : '没有找到匹配内容，试试更短的关键词。';

  return (
    <div className={`navbar__search ${styles.search} ${open ? styles.open : ''}`}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <div className={styles.field}>
        <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
        <input ref={input} className={`navbar__search-input ${styles.input}`} type="text" role="combobox"
          aria-label="搜索笔记与博客" aria-expanded={expanded} aria-controls={`${id}-results`}
          aria-autocomplete="list" aria-activedescendant={expanded && selected >= 0 ? `${id}-result-${selected}` : undefined}
          autoComplete="off" spellCheck="false" placeholder="搜索笔记与博客" value={query}
          onChange={(event) => { setQuery(event.target.value); setSelected(-1); setOpen(true); }}
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)} onKeyDown={keyDown} />
        {query && <button type="button" className={styles.clear} aria-label="清空搜索"
          onClick={() => { setQuery(''); setSelected(-1); input.current?.focus(); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>
        </button>}
      </div>
      <div className={styles.panel} hidden={!expanded}>
        <p className={styles.status} role="status">{expanded ? message : ''}</p>
        <ul id={`${id}-results`} ref={list} role="listbox" aria-label="搜索建议" className={styles.results}>
          {results.map((result, index) => <li id={`${id}-result-${index}`} key={result.id} role="option" aria-selected={selected === index}
            className={styles.result} onMouseDown={(event) => event.preventDefault()} onClick={() => navigate(result.href)}>
            <span className={styles.title} dangerouslySetInnerHTML={{__html: result.titleHtml}} />
            <span className={styles.path}>{result.path}</span>
          </li>)}
        </ul>
        <div className={styles.actions}>
          {status === 'error' && <button type="button" onClick={retry}>重新加载</button>}
          <Link to={fullSearchUrl} onClick={() => setOpen(false)}>查看全部结果</Link>
        </div>
      </div>
    </div>
  );
}
