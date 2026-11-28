import React from 'react';
import {useHistory} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './styles.module.css';

// All full-size inputs lead to the same index used by the navbar suggestions.
export default function SiteSearchForm({id, label = '搜索笔记与博客', query = '', scope = '', className}) {
  const searchUrl = useBaseUrl('/search');
  const history = useHistory();
  const isLife = scope === 'life';

  function submit(event) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('q').trim();
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    if (scope) params.set('scope', scope);
    history.push(`${searchUrl}${params.size ? `?${params}` : ''}`);
  }

  return (
    <form className={clsx(styles.form, className)} action={searchUrl} method="get" role="search" aria-label={label} onSubmit={submit} data-search-exclude>
      <label htmlFor={id}>{label}</label>
      {scope && <input type="hidden" name="scope" value={scope} />}
      <div className={styles.field}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
        <input key={`${scope}:${query}`} id={id} name="q" type="search" defaultValue={query} placeholder={isLife ? '输入生活指南关键词，如 医保、租房、体检' : '标题、命令或报错关键词'} aria-describedby={`${id}-help`} />
        <button type="submit">搜索</button>
      </div>
      <p id={`${id}-help`} className={styles.hint}>
        {isLife
          ? '搜索《高性价比人生指南》34 章正文内容。'
          : '搜索笔记、博客和开源周报的标题与正文，例如 nginx、端口、Permission denied。'}
      </p>
    </form>
  );
}
