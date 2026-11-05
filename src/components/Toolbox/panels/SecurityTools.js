import React, {useEffect, useRef, useState} from 'react';
import {parseJwt, parsePermissions, permissionDetails, umaskPermissions} from '../extended.mjs';
import {parseCertificates} from '../certificate.mjs';
import {Button, Checkbox, Details, Feedback, Field, Output, TextInput, useDraft, useResult, styles} from '../shared';

export function JwtTool() {
  const [form, update] = useDraft('jwt', {text: ''});
  const [state, run] = useResult([form.text]);
  const result = state.value;
  return <>
    <p className={styles.notice}>仅解码，未验证签名。任何人都可以构造这些声明；解析成功不代表令牌可信。</p>
    <Field label="JWT"><TextInput value={form.text} onChange={text => update({text})} rows={5} placeholder="eyJ… . eyJ… . 签名" /></Field>
    <div className={styles.actions}><Button primary onClick={() => run(() => parseJwt(form.text))}>解析 JWT</Button><Button onClick={() => update({text: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDM2MDB9.'})}>载入演示令牌</Button><Button onClick={() => update({text: ''})}>清空</Button></div>
    <Feedback state={state} />
    {result && <><Details items={[["签名状态", result.signed ? '存在签名段，但未验证' : '没有签名'], ['时间声明', result.timing], ...result.claims]} /><div className={styles.formRow}><Output value={JSON.stringify(result.header, null, 2)} label="Header" filename="jwt-header.json" rows={10} /><Output value={JSON.stringify(result.payload, null, 2)} label="Payload" filename="jwt-payload.json" rows={10} /></div></>}
  </>;
}

export function ChmodTool() {
  const [form, update] = useDraft('chmod', {text: '755', umask: '022'});
  let permission, error, mask, maskError;
  try { permission = parsePermissions(form.text); } catch (e) { error = e.message; }
  try { mask = umaskPermissions(form.umask); } catch (e) { maskError = e.message; }
  const bits = permission?.value || 0;
  const toggle = (bit, checked) => update({text: permissionDetails(checked ? bits | bit : bits & ~bit).octal});
  return <div className={styles.sections}>
    <section><Field label="数字或符号权限" hint="输入 755、4755、rwxr-xr-x 或完整 ls 权限字符串。"><input value={form.text} onChange={e => update({text: e.target.value})} spellCheck={false} /></Field>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.permissions}>{['属主', '属组', '其他人'].map((name, group) => <fieldset key={name}><legend>{name}</legend>{[['读 r', 4], ['写 w', 2], ['执行 x', 1]].map(([label, bit]) => <Checkbox key={label} label={name + ' ' + label} checked={Boolean(bits & (bit << ((2 - group) * 3)))} onChange={checked => toggle(bit << ((2 - group) * 3), checked)} />)}</fieldset>)}</div>
      <fieldset className={styles.options}><legend>特殊权限</legend><div className={styles.optionRow}>{[['SUID', 0o4000], ['SGID', 0o2000], ['Sticky', 0o1000]].map(([label, bit]) => <Checkbox key={label} label={label} checked={Boolean(bits & bit)} onChange={checked => toggle(bit, checked)} />)}</div></fieldset>
      {permission && <><Details items={[["八进制", permission.octal], ['符号权限', permission.symbolic]]} /><Output value={'chmod ' + permission.octal + ' <文件或目录>'} label="命令示意" rows={2} filename="chmod.txt" /></>}
    </section>
    <section><h3>umask 计算</h3><Field label="umask" hint="新建普通文件默认 666，目录默认 777，再按位清除 umask。"><input value={form.umask} onChange={e => update({umask: e.target.value})} inputMode="numeric" /></Field>{maskError ? <p role="alert" className={styles.error}>{maskError}</p> : <Details items={[["新建文件", mask.file.octal + ' / ' + mask.file.symbolic], ['新建目录', mask.directory.octal + ' / ' + mask.directory.symbolic]]} />}</section>
  </div>;
}

export function CertificateTool() {
  const [form, update] = useDraft('certificate', {text: ''});
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [state, run] = useResult([form.text, fileData]);
  const readSequence = useRef(0);
  useEffect(() => () => { readSequence.current++; }, []);
  return <>
    <p className={styles.notice}>证书内容仅在本地解析；不连接证书中的域名，也不验证信任链或吊销状态。</p>
    <Field label="选择 PEM / CRT / CER / DER 文件"><input type="file" accept=".pem,.crt,.cer,.der" onChange={async e => {
      const file = e.target.files?.[0]; e.target.value = ''; const id = ++readSequence.current;
      if (!file) return;
      setFileData(null); setFileName(''); setFileError('');
      try {
        if (file.size > 1024 * 1024) throw new Error('证书文件请控制在 1 MB 以内。');
        const bytes = await file.arrayBuffer(); if (id !== readSequence.current) return;
        const text = new TextDecoder().decode(bytes);
        setFileData(text.includes('-----BEGIN') ? text : bytes); setFileName(file.name); update({text: ''});
      } catch (error) { setFileError(error.message); }
    }} /></Field>
    {fileName && <p className={styles.hint}>已选择：{fileName}</p>}{fileError && <p role="alert" className={styles.error}>{fileError}</p>}
    <Field label="或粘贴 PEM 证书" hint="支持粘贴多张 PEM 证书，按输入顺序分别展示。"><TextInput value={form.text} onChange={text => { readSequence.current++; setFileData(null); setFileName(''); update({text}); }} rows={7} placeholder={'-----BEGIN CERTIFICATE-----\n…\n-----END CERTIFICATE-----'} /></Field>
    <div className={styles.actions}><Button primary disabled={state.busy} onClick={() => run(() => parseCertificates(fileData || form.text))}>解析证书</Button><Button onClick={() => { readSequence.current++; update({text: ''}); setFileData(null); setFileName(''); setFileError(''); }}>清空</Button></div><Feedback state={state} />
    {state.value?.map((cert, i) => <section key={i}><h3 className={styles.resultTitle}>证书 {i + 1}</h3><Details items={[["主题", cert.subject], ['颁发者', cert.issuer], ['域名 / SAN', cert.san], ['序列号', cert.serial], ['开始时间 UTC', cert.notBefore], ['结束时间 UTC', cert.notAfter], ['有效期状态', cert.status], ['签名算法', cert.algorithm], ['SHA-256 指纹', cert.fingerprint]]} /></section>)}
    {state.value && <Output value={JSON.stringify(state.value, null, 2)} label="证书报告" filename="certificates.json" rows={8} />}
  </>;
}
