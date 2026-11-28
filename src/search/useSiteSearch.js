import {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {searchSite} from './client.mjs';

const empty = {items: [], limited: false};
export default function useSiteSearch(query, enabled = true, scope = '') {
  const baseUrl = useBaseUrl('/');
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({query: '', scope: '', attempt: 0, status: 'idle', ...empty});
  const completed = useRef(null);
  const value = query.trim();
  useEffect(() => {
    if (!value || !enabled) return undefined;
    // Reopening a completed query must preserve the result array and keyboard selection.
    const cached = completed.current;
    if (cached?.query === value && cached.baseUrl === baseUrl && cached.scope === scope && cached.attempt === attempt) {
      setState(cached);
      return undefined;
    }
    let active = true;
    const timer = setTimeout(() => {
      setState({query: value, baseUrl, scope, attempt, status: 'loading', ...empty});
      searchSite(value, baseUrl, scope).then((result) => {
        if (active) {
          const next = {query: value, baseUrl, scope, attempt, status: 'ready', ...result};
          completed.current = next;
          setState(next);
        }
      }).catch(() => {
        if (active) setState({query: value, baseUrl, scope, attempt, status: 'error', ...empty});
      });
    }, 120);
    return () => { active = false; clearTimeout(timer); };
  }, [value, enabled, baseUrl, scope, attempt]);
  const current = !value ? {status: 'idle', ...empty}
    : state.query === value && state.baseUrl === baseUrl && state.scope === scope && state.attempt === attempt ? state
    : {status: 'loading', ...empty};
  return {...current, retry: () => setAttempt((previous) => previous + 1)};
}
