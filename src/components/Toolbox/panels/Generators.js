import React from 'react';
import {generatePasswords, generateUuids, hashText} from '../logic.mjs';
import {Button, Checkbox, Feedback, Field, Output, TextInput, useDraft, useResult, styles} from '../shared';

export function HashTool() {
  const [form, update] = useDraft('hash', {text: '', algorithm: 'sha256'});
  const [state, run] = useResult([form.text, form.algorithm]);
  return <>
    <div className={styles.toolbar}>
      <Field label="摘要算法"><select value={form.algorithm} onChange={e => update({algorithm: e.target.value})}><option value="sha256">SHA-256</option><option value="sha512">SHA-512</option><option value="sha1">SHA-1</option><option value="md5">MD5</option></select></Field>
      <Button onClick={() => update({text: 'hello wiki'})}>载入示例</Button>
      <Button onClick={() => update({text: ''})} disabled={!form.text}>清空</Button>
    </div>
    <Field label="输入文本" hint="按 UTF-8 计算，空格和换行也会参与计算；留空可以计算空字符串的摘要。"><TextInput value={form.text} onChange={text => update({text})} rows={7} placeholder="输入需要校验的文本" /></Field>
    <div className={styles.actions}><Button primary disabled={state.busy} onClick={() => run(() => hashText(form.text, form.algorithm))}>计算摘要</Button></div>
    <Feedback state={state} />
    <Output value={state.value} label="十六进制摘要" rows={3} />
    {['md5', 'sha1'].includes(form.algorithm) && <p className={styles.hint}>MD5 / SHA-1 用于兼容已有校验值，不适合密码存储或安全签名。</p>}
  </>;
}

export function UuidTool() {
  const [form, update] = useDraft('uuid', {count: '5', uppercase: false});
  const [state, run] = useResult([form.count, form.uppercase]);
  return <>
    <div className={styles.formRow}>
      <Field label="生成数量" hint="每次最多 100 个。"><input type="number" min="1" max="100" value={form.count} onChange={e => update({count: e.target.value})} /></Field>
      <Checkbox label="使用大写字母" checked={form.uppercase} onChange={uppercase => update({uppercase})} />
    </div>
    <div className={styles.actions}><Button primary onClick={() => run(() => { const result = generateUuids(+form.count).join('\n'); return form.uppercase ? result.toUpperCase() : result; })}>生成 UUID v4</Button></div>
    <Feedback state={state} />
    <Output value={state.value} label="UUID 列表" rows={10} placeholder="每行一个 UUID，点击生成后可复制。" />
    <p className={styles.hint}>使用浏览器的安全随机数生成，每次点击都会产生新结果。</p>
  </>;
}

export function PasswordTool() {
  const [form, update] = useDraft('password', {length: '20', count: '3', lower: true, upper: true, digits: true, symbols: true, excludeSimilar: true});
  const [state, run] = useResult(Object.values(form));
  return <>
    <div className={styles.formRow}>
      <Field label="密码长度"><input type="number" min="8" max="128" value={form.length} onChange={e => update({length: e.target.value})} /></Field>
      <Field label="生成数量"><input type="number" min="1" max="20" value={form.count} onChange={e => update({count: e.target.value})} /></Field>
    </div>
    <fieldset className={styles.options}><legend>包含的字符</legend><div className={styles.optionRow}>
      {[['lower', '小写字母 a–z'], ['upper', '大写字母 A–Z'], ['digits', '数字 0–9'], ['symbols', '符号 !@#…']].map(([key, label]) => <Checkbox key={key} label={label} checked={form[key]} onChange={value => update({[key]: value})} />)}
    </div></fieldset>
    <Checkbox label="排除易混淆字符 I、l、1、O、0、o" checked={form.excludeSimilar} onChange={excludeSimilar => update({excludeSimilar})} />
    <div className={styles.actions}><Button primary onClick={() => run(() => generatePasswords({...form, length: +form.length, count: +form.count}).join('\n'))}>生成密码</Button></div>
    <Feedback state={state} />
    <Output value={state.value} label="生成的密码" rows={7} placeholder="生成的密码不会保存到浏览器存储或写入网址。" />
    <p className={styles.hint}>每个密码至少包含每种已选类型的一个字符；使用安全随机数生成。</p>
  </>;
}
