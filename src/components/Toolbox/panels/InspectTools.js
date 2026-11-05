import React from 'react';
import {calculateSubnet} from '../logic.mjs';
import {Button, Details, Feedback, Field, Output, TextInput, useDraft, useResult, styles} from '../shared';

function runRegex(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../regex.worker.js', import.meta.url));
    const timeout = setTimeout(() => { worker.terminate(); reject(new Error('匹配超过 1.5 秒，已停止。请简化表达式或缩短测试文本。')); }, 1500);
    const finish = () => { clearTimeout(timeout); worker.terminate(); };
    worker.onmessage = ({data: result}) => { finish(); result.error ? reject(new Error(result.error)) : resolve(result.value); };
    worker.onerror = () => { finish(); reject(new Error('正则测试线程加载失败，请刷新页面后重试。')); };
    worker.postMessage(data);
  });
}

export function RegexTool() {
  const [form, update] = useDraft('regex', {pattern: '', flags: 'g', text: ''});
  const [state, run] = useResult([form.pattern, form.flags, form.text]);
  return <>
    <div className={styles.formRow}>
      <Field label="正则表达式" hint="直接输入表达式，不需要两侧的 /。"><input className={styles.mono} value={form.pattern} onChange={e => update({pattern: e.target.value})} placeholder="(?<key>\w+)=(\w+)" spellCheck={false} /></Field>
      <Field label="标志" hint="g 全局 · i 忽略大小写 · m 多行 · s 点匹配换行 · u Unicode · y 粘连"><input className={styles.mono} value={form.flags} onChange={e => update({flags: e.target.value})} placeholder="g" spellCheck={false} /></Field>
    </div>
    <Field label="测试文本"><TextInput value={form.text} onChange={text => update({text})} rows={8} placeholder="在这里输入要匹配的文本" /></Field>
    <div className={styles.actions}>
      <Button primary disabled={state.busy} onClick={() => run(() => runRegex(form))}>测试匹配</Button>
      <Button onClick={() => update({pattern: '(?<key>\\w+)=(\\w+)', flags: 'g', text: 'host=wiki port=443 status=ok'})}>载入示例</Button>
      <Button onClick={() => update({pattern: '', text: ''})}>清空</Button>
    </div>
    <Feedback state={state} />
    {state.value && <><p className={styles.hint}>{state.value.truncated ? '仅显示前 1000 个匹配。' : `找到 ${state.value.matches.length} 个匹配。`} 位置从 0 开始，按 JavaScript UTF-16 计数。</p>
      {state.value.matches.length ? <div className={styles.matchList}>{state.value.matches.map((match, index) => <section key={`${index}-${match.index}`}><h3>匹配 {index + 1}<span>位置 {match.index}</span></h3><pre>{match.text === '' ? '（空匹配）' : match.text}</pre>{(match.groups.length > 0 || Object.keys(match.namedGroups).length > 0) && <p>捕获组：<code>{JSON.stringify(match.groups)}</code>{Object.keys(match.namedGroups).length > 0 && <><br />命名组：<code>{JSON.stringify(match.namedGroups)}</code></>}</p>}</section>)}</div> : <p className={styles.empty}>没有匹配。可检查表达式、标志或测试文本。</p>}
    </>}
  </>;
}

export function SubnetTool() {
  const [form, update] = useDraft('subnet', {input: ''});
  const [state, run] = useResult([form.input]);
  const data = state.value;
  const items = data && [['网段 / CIDR', data.cidr], ['子网掩码', data.mask], ['通配掩码', data.wildcard], ['网络地址', data.network], ['广播地址', data.broadcast], ['首个可用地址', data.first], ['最后可用地址', data.last], ['地址总数', data.total], ['可用地址数', data.usable]];
  return <>
    <Field label="IPv4 地址 / 前缀长度" hint="前缀支持 /0–/32；此工具只计算 IPv4。"><input className={styles.mono} value={form.input} onChange={e => update({input: e.target.value})} placeholder="192.168.1.42/24" spellCheck={false} /></Field>
    <div className={styles.actions}><Button primary onClick={() => run(() => calculateSubnet(form.input))}>计算子网</Button><Button onClick={() => update({input: '192.168.1.42/24'})}>载入示例</Button><Button onClick={() => update({input: ''})} disabled={!form.input}>清空</Button></div>
    <Feedback state={state} />
    {data ? <><Details items={items} /><p className={styles.hint}>{data.note}</p><Output value={items.map(([label, value]) => `${label}: ${value}`).join('\n')} label="子网信息" rows={9} /></> : <p className={styles.empty}>输入带前缀长度的地址，查看网段与可用地址范围。</p>}
  </>;
}
