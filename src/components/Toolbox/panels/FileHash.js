import React, {useEffect, useRef, useState} from 'react';
import {Button, Field, Output, styles} from '../shared';

export default function FileHash({algorithm}) {
  const [file, setFile] = useState(null);
  const [expected, setExpected] = useState('');
  const [state, setState] = useState({value: null, error: '', busy: false, progress: 0});
  const worker = useRef(null);
  const sequence = useRef(0);
  const stop = () => { sequence.current++; worker.current?.terminate(); worker.current = null; };
  useEffect(() => { stop(); setState({value: null, error: '', busy: false, progress: 0}); return stop; }, [file, algorithm]);
  function calculate() {
    stop();
    if (!file) return setState({value: null, error: '请先选择文件。', busy: false, progress: 0});
    const id = sequence.current;
    setState({value: null, error: '', busy: true, progress: 0});
    try {
      const task = new Worker(new URL('../file-hash.worker.js', import.meta.url)); worker.current = task;
      task.onmessage = ({data}) => {
        if (id !== sequence.current) return;
        if (data.progress !== undefined) setState(previous => ({...previous, progress: data.progress}));
        else { setState({value: data.value ?? null, error: data.error || '', busy: false, progress: 100}); stop(); }
      };
      task.onerror = () => { if (id === sequence.current) { setState({value: null, error: '文件计算线程加载失败，请刷新页面重试。', busy: false, progress: 0}); stop(); } };
      task.postMessage({file, algorithm});
    } catch { setState({value: null, error: '当前浏览器无法启动文件计算线程。', busy: false, progress: 0}); }
  }
  const target = expected.trim().toLowerCase();
  const validExpected = new RegExp('^[a-f0-9]{' + ({md5:32,sha1:40,sha256:64,sha512:128})[algorithm] + '}$').test(target);
  return <>
    <div className={styles.dropzone} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); setFile(event.dataTransfer.files?.[0] || null); }}>
      <Field label="选择文件或拖到此处"><input type="file" onChange={event => setFile(event.target.files?.[0] || null)} /></Field>
      <p className={styles.hint}>{file ? file.name + ' · ' + file.size.toLocaleString() + ' 字节' : '文件分块读取，不上传；计算期间可以取消。'}</p>
    </div>
    <div className={styles.actions}><Button primary disabled={state.busy || !file} onClick={calculate}>计算文件摘要</Button>{state.busy && <Button onClick={() => { stop(); setState({value: null, error: '已取消计算。', busy: false, progress: 0}); }}>取消计算</Button>}</div>
    {state.busy && <div className={styles.progress}><label htmlFor="file-hash-progress">正在计算 {state.progress}%</label><progress id="file-hash-progress" value={state.progress} max="100" /></div>}
    {state.error && <p className={styles.error} role="alert">{state.error}</p>}
    <Output value={state.value} label="文件摘要" filename={(file?.name || 'file') + '.' + algorithm} rows={3} />
    <Field label="预期摘要（可选）" hint="粘贴下载来源提供的十六进制摘要，与本地计算结果比较。"><input className={styles.mono} value={expected} onChange={e => setExpected(e.target.value)} spellCheck={false} /></Field>
    {target && <p className={styles.notice} role="status">{!validExpected ? '预期摘要的长度或格式不符合所选算法。' : !state.value ? '计算后将自动比较。' : target === state.value ? '摘要一致。' : '摘要不一致，请检查文件和摘要算法。'}</p>}
  </>;
}
