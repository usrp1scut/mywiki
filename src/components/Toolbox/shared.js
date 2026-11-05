import React, {createContext, useContext, useEffect, useId, useRef, useState} from 'react';
import styles from './styles.module.css';

export const DraftContext = createContext(null);
export {styles};

export function useDraft(key, initial) {
  const {drafts, setDrafts} = useContext(DraftContext);
  return [{...initial, ...drafts[key]}, patch => setDrafts(previous => ({...previous, [key]: {...initial, ...previous[key], ...patch}}))];
}

export function useResult(dependencies) {
  const sequence = useRef(0);
  const [state, setState] = useState({value: null, error: '', busy: false, dependencies: [...dependencies]});
  useEffect(() => {
    sequence.current++;
    setState({value: null, error: '', busy: false, dependencies: [...dependencies]});
    return () => { sequence.current++; };
  }, dependencies);
  async function run(operation) {
    const current = ++sequence.current;
    const inputs = [...dependencies];
    setState({value: null, error: '', busy: true, dependencies: inputs});
    try {
      const value = await operation();
      if (current === sequence.current) setState({value, error: '', busy: false, dependencies: inputs});
    } catch (error) {
      if (current === sequence.current) setState({value: null, error: error.message || '操作失败，请重试。', busy: false, dependencies: inputs});
    }
  }
  // Hide a previous mode's differently shaped result in the render before effects run.
  const matches = state.dependencies.length === dependencies.length && dependencies.every((value, i) => Object.is(value, state.dependencies[i]));
  return [matches ? state : {value: null, error: '', busy: false}, run];
}

export function Field({label, hint, children}) {
  const id = useId();
  return <div className={styles.field}>
    <label htmlFor={id}>{label}</label>
    {React.cloneElement(children, {id, 'aria-describedby': hint ? `${id}-help` : undefined})}
    {hint && <p id={`${id}-help`} className={styles.hint}>{hint}</p>}
  </div>;
}

export function TextInput({value, onChange, ...props}) {
  const sequence = useRef(0);
  const [error, setError] = useState('');
  useEffect(() => { sequence.current++; }, [value]);
  useEffect(() => () => { sequence.current++; }, []);
  return <>
    <textarea spellCheck={false} autoCapitalize="off" autoCorrect="off" value={value} onChange={event => { sequence.current++; setError(''); onChange(event.target.value); }} {...props} />
    <label className={styles.fileImport}>导入文本文件<input type="file" accept=".txt,.json,.yaml,.yml,.pem,.crt,.csv,.log,.conf,.sh,.jwt,text/*" onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = '';
      const current = ++sequence.current;
      if (!file) return;
      try {
        if (file.size > 2 * 1024 * 1024) throw new Error('文件超过 2 MB，请缩小后再导入。');
        const text = new TextDecoder('utf-8', {fatal: true}).decode(await file.arrayBuffer());
        if (current === sequence.current) { onChange(text); setError(''); }
      } catch (e) { if (current === sequence.current) setError(e instanceof TypeError ? '请使用 UTF-8 编码的文本文件。' : e.message); }
    }} /></label>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </>;
}

export function Button({primary, children, ...props}) {
  return <button className={primary ? styles.primary : styles.button} type="button" {...props}>{children}</button>;
}

export function Feedback({state}) {
  return <div className={styles.feedback} aria-live="polite" aria-atomic="true">
    {state.error ? <p className={styles.error} role="alert">{state.error}</p> : state.busy ? '正在处理…' : null}
  </div>;
}

export function downloadFile(value, filename = 'result.txt', type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([value], {type}));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Output({value, label = '结果', placeholder = '结果会显示在这里。', rows = 9, filename = 'result.txt'}) {
  const id = useId();
  const ref = useRef(null);
  const [copied, setCopied] = useState('');
  useEffect(() => { setCopied(''); }, [value]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied('已复制');
    } catch {
      ref.current?.focus();
      ref.current?.select();
      setCopied('已选中结果，请手动复制');
    }
  }
  return <div className={styles.output}>
    <div className={styles.outputHead}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.outputButtons}><Button onClick={copy} disabled={value === null || value === ''}>复制结果</Button><Button onClick={() => downloadFile(value, filename)} disabled={value === null || value === ''}>下载</Button></div>
    </div>
    <textarea ref={ref} id={id} readOnly value={value ?? ''} rows={rows} placeholder={placeholder} spellCheck={false} />
    <span className={styles.copyStatus} role="status">{copied}</span>
  </div>;
}

export function Details({items}) {
  return <dl className={styles.details}>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

export function Checkbox({label, checked, onChange}) {
  return <label className={styles.checkbox}><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />{label}</label>;
}
