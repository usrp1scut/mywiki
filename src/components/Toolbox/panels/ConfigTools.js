import React from 'react';
import {convertYaml, compareText} from '../extended.mjs';
import {dockerToCompose} from '../docker.mjs';
import {Button, Checkbox, Feedback, Field, Output, TextInput, useDraft, useResult, styles} from '../shared';

export function YamlTool() {
  const [form, update] = useDraft('yaml', {text: '', mode: 'yaml-json'});
  const [state, run] = useResult([form.text, form.mode]);
  return <>
    <div className={styles.toolbar}>
      <Field label="转换方向"><select value={form.mode} onChange={e => update({mode: e.target.value})}><option value="yaml-json">YAML → JSON</option><option value="json-yaml">JSON → YAML</option><option value="format">格式化 YAML</option></select></Field>
      <Button onClick={() => update({text: form.mode === 'json-yaml' ? '{"service":"wiki","ports":[80,443],"enabled":true}' : 'service: wiki\nports: [80, 443]\nenabled: true\n'})}>载入示例</Button>
      <Button onClick={() => update({text: ''})}>清空</Button>
    </div>
    <div className={styles.editors}><div className={styles.editorColumn}>
      <Field label="输入内容" hint="按单文档 YAML 1.2 处理；拒绝重复键、循环别名和无法表示为 JSON 的值。"><TextInput value={form.text} onChange={text => update({text})} rows={14} placeholder="粘贴 YAML / JSON，或导入配置文件" /></Field>
      <div className={styles.actions}><Button primary disabled={state.busy} onClick={() => run(() => convertYaml(form.text, form.mode))}>{form.mode === 'format' ? '格式化' : '转换'}</Button>{form.mode !== 'json-yaml' && <Button disabled={state.busy} onClick={() => run(() => convertYaml(form.text, 'validate'))}>校验 YAML</Button>}</div>
      <Feedback state={state} />
    </div><Output value={state.value} rows={14} filename={form.mode === 'yaml-json' ? 'result.json' : 'result.yaml'} /></div>
    <p className={styles.hint}>大整数按原值保留；转成 JSON 会去除 YAML 注释。校验范围为语法，不包含 Kubernetes 或 Compose 的业务规则。</p>
  </>;
}

export function DiffTool() {
  const [form, update] = useDraft('diff', {left: '', right: '', mode: 'text', whitespace: false});
  const [state, run] = useResult([form.left, form.right, form.mode, form.whitespace]);
  return <>
    <div className={styles.toolbar}>
      <Field label="比较方式"><select value={form.mode} onChange={e => update({mode: e.target.value})}><option value="text">逐行比较文本</option><option value="json">JSON（忽略对象键顺序）</option></select></Field>
      {form.mode === 'text' && <Checkbox label="忽略行首尾空白" checked={form.whitespace} onChange={whitespace => update({whitespace})} />}
      <Button onClick={() => update({left: form.mode === 'json' ? '{"port":80,"service":"wiki"}' : 'host=wiki\nport=80\n', right: form.mode === 'json' ? '{"service":"wiki","port":443}' : 'host=wiki\nport=443\ntls=true\n'})}>载入示例</Button>
    </div>
    <div className={styles.formRow}><Field label="原始内容"><TextInput value={form.left} onChange={left => update({left})} rows={9} placeholder="粘贴修改前的配置" /></Field><Field label="修改后的内容"><TextInput value={form.right} onChange={right => update({right})} rows={9} placeholder="粘贴修改后的配置" /></Field></div>
    <div className={styles.actions}><Button primary disabled={state.busy} onClick={() => run(() => compareText(form.left, form.right, form.mode, form.mode === 'text' && form.whitespace))}>比较差异</Button><Button onClick={() => update({left: form.right, right: form.left})}>交换两侧</Button></div>
    <Feedback state={state} />
    {state.value && <><p role="status">{state.value.added || state.value.removed ? '新增 ' + state.value.added + ' 行，删除 ' + state.value.removed + ' 行。' : '内容一致。'}</p><pre className={styles.diffResult} aria-label="差异内容">{state.value.chunks.map((chunk, i) => <span key={i} className={chunk.added ? styles.diffAdded : chunk.removed ? styles.diffRemoved : undefined}>{chunk.value.split(/(?<=\n)/).map(line => (chunk.added ? '+ ' : chunk.removed ? '- ' : '  ') + line).join('')}</span>)}</pre><Output value={state.value.report} label="差异报告" filename="comparison.diff" rows={5} /></>}
  </>;
}

export function DockerTool() {
  const [form, update] = useDraft('docker', {text: ''});
  const [state, run] = useResult([form.text]);
  return <>
    <p className={styles.notice}>解析单条 POSIX Shell 风格的 docker run 命令，仅生成配置，不执行命令。变量需先替换为实际值。</p>
    <div className={styles.toolbar}><Button onClick={() => update({text: 'docker run -d --name wiki --restart unless-stopped -p 8080:80 -e TZ=Asia/Shanghai -v ./html:/usr/share/nginx/html:ro nginx:alpine'})}>载入示例</Button><Button onClick={() => update({text: ''})}>清空</Button></div>
    <Field label="docker run 命令"><TextInput value={form.text} onChange={text => update({text})} rows={7} placeholder="docker run -d --name web -p 8080:80 nginx:alpine" /></Field>
    <div className={styles.actions}><Button primary disabled={state.busy} onClick={() => run(() => dockerToCompose(form.text))}>生成 Compose</Button></div>
    <Feedback state={state} />
    {state.value?.notes.map(note => <p key={note} className={styles.hint}>{note}</p>)}
    <Output value={state.value?.yaml ?? null} label="compose.yaml" filename="compose.yaml" rows={14} />
    <details className={styles.disclosure}><summary>支持的常用参数</summary><p>名称、端口、环境变量与 env-file、卷挂载、重启策略、网络、工作目录、用户、主机名、entrypoint、平台、内存、CPU、共享内存、DNS、extra_hosts、labels、cap-add/drop、交互终端、只读、privileged 和 init。其他参数会报错，不会静默丢弃。</p><p>相对挂载路径以 compose.yaml 所在目录为基准；命名卷与已有自定义网络使用 external。</p></details>
  </>;
}
