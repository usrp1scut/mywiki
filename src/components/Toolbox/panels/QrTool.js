import React, {useEffect, useRef, useState} from 'react';
import {wifiPayload} from '../extended.mjs';
import {Button, Checkbox, Feedback, Field, Output, TextInput, downloadFile, useDraft, useResult, styles} from '../shared';

export default function QrTool() {
  const [form, update] = useDraft('qrcode', {mode: 'text', text: '', ssid: '', password: '', security: 'WPA', hidden: false, correction: 'M'});
  const [state, run] = useResult(Object.values(form));
  const [file, setFile] = useState(null);
  const [decoded, decode] = useResult([file]);
  const workerRef = useRef(null);
  useEffect(() => () => workerRef.current?.terminate(), [file]);
  async function generate() {
    const text = form.mode === 'wifi' ? wifiPayload(form) : form.text;
    if (!text) throw new Error('请输入二维码内容。');
    if (new TextEncoder().encode(text).length > 2900) throw new Error('内容超过二维码容量，请缩短文本。');
    const QRCode = await import('qrcode');
    try { return await QRCode.toDataURL(text, {width: 360, margin: 4, errorCorrectionLevel: form.correction}); }
    catch { throw new Error('当前纠错级别无法容纳这些内容，请缩短文本或降低纠错级别。'); }
  }
  async function readQr() {
    if (!file) throw new Error('请先选择二维码图片。');
    if (file.size > 10 * 1024 * 1024) throw new Error('图片不能超过 10 MB。');
    const bitmap = await createImageBitmap(file).catch(() => { throw new Error('无法读取图片，请使用 PNG、JPEG 或 WebP。'); });
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../qr.worker.js', import.meta.url)); workerRef.current = worker;
      const timer = setTimeout(() => { worker.terminate(); reject(new Error('识别超时，请裁剪图片后重试。')); }, 5000);
      const finish = () => { clearTimeout(timer); worker.terminate(); if (workerRef.current === worker) workerRef.current = null; };
      worker.onmessage = ({data}) => { finish(); data.error ? reject(new Error(data.error)) : resolve(data.value); };
      worker.onerror = () => { finish(); reject(new Error('二维码识别线程加载失败，请刷新页面后重试。')); };
      worker.postMessage({pixels: pixels.buffer, width: canvas.width, height: canvas.height}, [pixels.buffer]);
    });
  }
  return <div className={styles.sections}>
    <section><div className={styles.formRow}><Field label="二维码内容类型"><select value={form.mode} onChange={e => update({mode: e.target.value})}><option value="text">文本 / 链接</option><option value="wifi">Wi-Fi 配置</option></select></Field><Field label="纠错级别"><select value={form.correction} onChange={e => update({correction: e.target.value})}>{['L', 'M', 'Q', 'H'].map((v, i) => <option key={v} value={v}>{v} · {['7%', '15%', '25%', '30%'][i]}</option>)}</select></Field></div>
      {form.mode === 'text' ? <Field label="二维码文本"><TextInput value={form.text} onChange={text => update({text})} rows={5} placeholder="https://example.com 或任意文本" /></Field> : <>
        <Field label="Wi-Fi 名称 SSID"><input value={form.ssid} onChange={e => update({ssid: e.target.value})} /></Field>
        <div className={styles.formRow}><Field label="Wi-Fi 安全类型"><select value={form.security} onChange={e => update({security: e.target.value})}><option value="WPA">WPA / WPA2</option><option value="WEP">WEP</option><option value="nopass">开放网络</option></select></Field>{form.security !== 'nopass' && <Field label="Wi-Fi 密码"><input type="password" autoComplete="off" value={form.password} onChange={e => update({password: e.target.value})} /></Field>}</div><Checkbox label="隐藏网络" checked={form.hidden} onChange={hidden => update({hidden})} />
      </>}
      <div className={styles.actions}><Button primary disabled={state.busy} onClick={() => run(generate)}>生成二维码</Button></div><Feedback state={state} />
      {state.value && <div className={styles.qrResult}><img src={state.value} alt="生成的二维码" width="360" height="360" /><Button onClick={() => { const bytes = Uint8Array.from(atob(state.value.split(',')[1]), c => c.charCodeAt(0)); downloadFile(bytes, 'qrcode.png', 'image/png'); }}>下载 PNG</Button></div>}
    </section>
    <section><h3>从图片识别二维码</h3><Field label="二维码图片"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { setFile(e.target.files?.[0] || null); }} /></Field><div className={styles.actions}><Button disabled={decoded.busy || !file} onClick={() => decode(readQr)}>识别图片</Button></div><Feedback state={decoded} /><Output value={decoded.value} label="识别内容" rows={4} filename="qr-content.txt" /><p className={styles.hint}>图片在本地处理；识别到的链接只显示为文本，不会自动打开。</p></section>
  </div>;
}
