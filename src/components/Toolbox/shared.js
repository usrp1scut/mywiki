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
  const [state, setState] = useState({value: null, error: '', busy: false});
  useEffect(() => {
    sequence.current++;
    setState({value: null, error: '', busy: false});
    return () => { sequence.current++; };
  }, dependencies);
  async function run(operation) {
    const current = ++sequence.current;
    setState({value: null, error: '', busy: true});
    try {
      const value = await operation();
      if (current === sequence.current) setState({value, error: '', busy: false});
    } catch (error) {
      if (current === sequence.current) setState({value: null, error: error.message || '操作失败，请重试。', busy: false});
    }
  }
  return [state, run];
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
  return <textarea spellCheck={false} autoCapitalize="off" autoCorrect="off" value={value} onChange={event => onChange(event.target.value)} {...props} />;
}

export function Button({primary, children, ...props}) {
  return <button className={primary ? styles.primary : styles.button} type="button" {...props}>{children}</button>;
}

export function Feedback({state}) {
  return <div className={styles.feedback} aria-live="polite" aria-atomic="true">
    {state.error ? <p className={styles.error} role="alert">{state.error}</p> : state.busy ? '正在处理…' : null}
  </div>;
}

export function Output({value, label = '结果', placeholder = '结果会显示在这里。', rows = 9}) {
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
      <Button onClick={copy} disabled={value === null || value === ''}>复制结果</Button>
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
