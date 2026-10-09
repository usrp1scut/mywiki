import React from 'react';
import {useHistory} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './styles.module.css';

// All full-size inputs lead to the same index used by the navbar suggestions.
export default function SiteSearchForm({id, label = '搜索笔记与博客', query = '', className}) {
  const searchUrl = useBaseUrl('/search');
  const history = useHistory();

  function submit(event) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q').trim();
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    history.push(`${searchUrl}${value ? `?${params}` : ''}`);
  }

  return (
    <form className={clsx(styles.form, className)} action={searchUrl} method="get" role="search" aria-label={label} onSubmit={submit} data-search-exclude>
      <label htmlFor={id}>{label}</label>
      <div className={styles.field}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
        <input key={query} id={id} name="q" type="search" defaultValue={query} placeholder="标题、命令或报错关键词" aria-describedby={`${id}-help`} />
        <button type="submit">搜索</button>
      </div>
      <p id={`${id}-help`} className={styles.hint}>搜索笔记和博客的标题、正文，例如 nginx、端口、Permission denied。</p>
    </form>
  );
}
