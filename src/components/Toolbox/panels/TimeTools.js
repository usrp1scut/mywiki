import React from 'react';
import {dateDetails, nextCronRuns, parseDate, timestampToDate} from '../logic.mjs';
import {Button, Details, Feedback, Field, Output, useDraft, useResult, styles} from '../shared';

const zones = ['Asia/Shanghai', 'UTC', 'Asia/Tokyo', 'America/New_York', 'Europe/London'];
function Zone({value, onChange}) {
  return <Field label="显示时区"><select value={value} onChange={e => onChange(e.target.value)}>{zones.map(zone => <option key={zone}>{zone}</option>)}</select></Field>;
}

export function TimestampTool() {
  const [form, update] = useDraft('timestamp', {timestamp: '', date: '', unit: 'seconds', zone: 'Asia/Shanghai'});
  const [state, run] = useResult([form.timestamp, form.date, form.unit, form.zone]);
  const result = state.value;
  return <>
    <div className={styles.toolbar}><Zone value={form.zone} onChange={zone => update({zone})} /></div>
    <div className={styles.sections}>
      <section><h3>时间戳转日期</h3>
        <div className={styles.formRow}>
          <Field label="Unix 时间戳"><input inputMode="decimal" value={form.timestamp} onChange={e => update({timestamp: e.target.value})} placeholder="例如 0" /></Field>
          <Field label="时间戳单位"><select value={form.unit} onChange={e => update({unit: e.target.value})}><option value="seconds">秒</option><option value="milliseconds">毫秒</option></select></Field>
        </div>
        <div className={styles.actions}><Button primary onClick={() => run(() => dateDetails(timestampToDate(form.timestamp, form.unit), form.zone))}>转为日期</Button><Button onClick={() => update({timestamp: String(form.unit === 'seconds' ? Math.floor(Date.now() / 1000) : Date.now())})}>填入当前时间</Button></div>
      </section>
      <section><h3>日期转时间戳</h3>
        <Field label="带时区的日期" hint="使用 ISO 8601，+08:00 表示北京时间，Z 表示 UTC。"><input value={form.date} onChange={e => update({date: e.target.value})} placeholder="2026-11-04T12:00:00+08:00" spellCheck={false} /></Field>
        <div className={styles.actions}><Button primary onClick={() => run(() => dateDetails(parseDate(form.date), form.zone))}>转为时间戳</Button><Button onClick={() => update({date: new Date().toISOString()})}>填入当前日期</Button></div>
      </section>
    </div>
    <Feedback state={state} />
    {result ? <><Details items={[[form.zone, result.zoned], ['UTC / ISO 8601', result.utc], ['Unix 秒', result.seconds], ['Unix 毫秒', result.milliseconds]]} /><Output value={`${result.zoned}\n${result.utc}\n${result.seconds}\n${result.milliseconds}`} label="转换结果" rows={4} /></> : <p className={styles.empty}>输入时间戳或日期后转换，结果会显示在这里。</p>}
  </>;
}

export function CronTool() {
  const [form, update] = useDraft('cron', {expression: '*/5 * * * *', zone: 'Asia/Shanghai', start: ''});
  const [state, run] = useResult([form.expression, form.zone, form.start]);
  const fields = form.expression.trim().split(/\s+/);
  const labels = fields.length === 6 ? ['秒', '分', '时', '日', '月', '星期'] : ['分', '时', '日', '月', '星期'];
  return <>
    <Field label="Cron 表达式" hint="支持标准 5 段，或前置秒字段的 6 段；日与星期同时指定时按「或」匹配。"><input className={styles.mono} value={form.expression} onChange={e => update({expression: e.target.value})} spellCheck={false} /></Field>
    <div className={styles.presets}>{[['每 5 分钟', '*/5 * * * *'], ['每天 02:00', '0 2 * * *'], ['工作日 09:00', '0 9 * * 1-5']].map(([label, expression]) => <Button key={label} onClick={() => update({expression})}>{label}</Button>)}</div>
    <div className={styles.cronFields} aria-label="Cron 字段对照">{labels.map((label, index) => <div key={label}><span>{label}</span><code>{fields[index] || '—'}</code></div>)}</div>
    <div className={styles.formRow}>
      <Zone value={form.zone} onChange={zone => update({zone})} />
      <Field label="起始时间（可选）" hint="留空从点击时刻开始；填写时需带时区。"><input value={form.start} onChange={e => update({start: e.target.value})} placeholder="2026-11-04T12:00:00+08:00" /></Field>
    </div>
    <div className={styles.actions}><Button primary disabled={state.busy} onClick={() => run(() => nextCronRuns(form.expression, form.zone, form.start.trim() ? parseDate(form.start) : new Date()))}>查看接下来 5 次</Button></div>
    <Feedback state={state} />
    {state.value ? <><ol className={styles.schedule}>{state.value.map(date => <li key={date.utc}><time dateTime={date.utc}>{date.zoned}</time><span>{date.utc}</span></li>)}</ol><Output value={state.value.map(date => date.zoned).join('\n')} label="执行时间列表" rows={5} /></> : <p className={styles.empty}>执行时间将按所选时区显示，并同时提供 UTC 时间。</p>}
  </>;
}
