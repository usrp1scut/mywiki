import React from 'react';
import {formatJson, encodeBase64, decodeBase64, convertUrl} from '../logic.mjs';
import {Button, Checkbox, Feedback, Field, Output, TextInput, useDraft, useResult, styles} from '../shared';

export function JsonTool() {
  const [form, update] = useDraft('json', {text: '', indent: '2'});
  const [state, run] = useResult([form.text, form.indent]);
  return <>
    <div className={styles.toolbar}>
      <Field label="缩进"><select value={form.indent} onChange={e => update({indent: e.target.value})}><option value="2">2 个空格</option><option value="4">4 个空格</option></select></Field>
      <Button onClick={() => update({text: '{"service":"wiki","port":443,"healthy":true,"tags":["Linux","运维"]}'})}>载入示例</Button>
      <Button onClick={() => update({text: ''})} disabled={!form.text}>清空</Button>
    </div>
    <div className={styles.editors}>
      <div className={styles.editorColumn}>
        <Field label="输入 JSON" hint="数字与字符串按原样保留，不会将大整数转换成浮点数。"><TextInput value={form.text} onChange={text => update({text})} rows={15} placeholder={'{\n  "service": "wiki"\n}'} /></Field>
        <div className={styles.actions}>
          <Button primary onClick={() => run(() => formatJson(form.text, +form.indent))}>格式化</Button>
          <Button onClick={() => run(() => formatJson(form.text, 0))}>压缩</Button>
          <Button onClick={() => run(() => { formatJson(form.text, 0); return 'JSON 格式有效。'; })}>校验</Button>
        </div>
        <Feedback state={state} />
      </div>
      <Output value={state.value} label="处理结果" rows={15} placeholder="格式化或压缩后的 JSON 会显示在这里。" />
    </div>
  </>;
}

export function Base64Tool() {
  const [form, update] = useDraft('base64', {text: '', urlSafe: false});
  const [state, run] = useResult([form.text, form.urlSafe]);
  return <>
    <div className={styles.toolbar}>
      <Checkbox label="URL 安全格式（- 和 _）" checked={form.urlSafe} onChange={urlSafe => update({urlSafe})} />
      <Button onClick={() => update({text: '你好，Wiki 👋'})}>载入示例</Button>
      <Button onClick={() => update({text: ''})} disabled={!form.text}>清空</Button>
    </div>
    <div className={styles.editors}>
      <div className={styles.editorColumn}>
        <Field label="输入文本或 Base64" hint="使用 UTF-8；此工具处理文本，不处理二进制文件。"><TextInput value={form.text} onChange={text => update({text})} rows={12} placeholder="在这里粘贴文本或 Base64 字符串" /></Field>
        <div className={styles.actions}>
          <Button primary onClick={() => run(() => encodeBase64(form.text, form.urlSafe))}>编码为 Base64</Button>
          <Button onClick={() => run(() => decodeBase64(form.text, form.urlSafe))}>解码为文本</Button>
          <Button disabled={state.value === null || Boolean(state.error)} onClick={() => update({text: state.value})}>结果用作输入</Button>
        </div>
        <Feedback state={state} />
      </div>
      <Output value={state.value} rows={12} />
    </div>
  </>;
}

export function UrlTool() {
  const [form, update] = useDraft('url', {text: '', mode: 'component'});
  const [state, run] = useResult([form.text, form.mode]);
  return <>
    <div className={styles.toolbar}>
      <Field label="处理方式"><select value={form.mode} onChange={e => update({mode: e.target.value})}><option value="component">参数值 / URL 组件</option><option value="uri">完整 URL（保留 /、?、& 等）</option></select></Field>
      <Button onClick={() => update({text: '运维笔记 & Linux/网络'})}>载入示例</Button>
      <Button onClick={() => update({text: ''})} disabled={!form.text}>清空</Button>
    </div>
    <div className={styles.editors}>
      <div className={styles.editorColumn}>
        <Field label="输入内容" hint="按 URI 百分号编码规则处理；+ 保留为加号，不作为表单空格。"><TextInput value={form.text} onChange={text => update({text})} rows={12} placeholder="输入文本、参数值或 URL" /></Field>
        <div className={styles.actions}>
          <Button primary onClick={() => run(() => convertUrl(form.text, form.mode))}>编码</Button>
          <Button onClick={() => run(() => convertUrl(form.text, form.mode, true))}>解码</Button>
          <Button disabled={state.value === null || Boolean(state.error)} onClick={() => update({text: state.value})}>结果用作输入</Button>
        </div>
        <Feedback state={state} />
      </div>
      <Output value={state.value} rows={12} />
    </div>
  </>;
}
