import React from 'react';
import {buildCron} from '../extended.mjs';
import {Button, Checkbox, Field, useDraft, styles} from '../shared';

export default function CronBuilder({onApply}) {
  const [form, update] = useDraft('cron-builder', {frequency: 'daily', interval: '5', minute: '0', hour: '2', weekdays: ['1','2','3','4','5'], day: '1'});
  let expression, error;
  try { expression = buildCron(form); } catch (e) { error = e.message; }
  return <details className={styles.disclosure}>
    <summary>通过周期生成 Cron 表达式</summary>
    <Field label="执行周期"><select value={form.frequency} onChange={e => update({frequency: e.target.value})}><option value="minutes">每隔若干分钟</option><option value="hourly">每小时</option><option value="daily">每天</option><option value="weekly">每周</option><option value="monthly">每月</option></select></Field>
    <div className={styles.formRow}>{form.frequency === 'minutes' ? <Field label="间隔分钟"><input type="number" min="1" max="59" value={form.interval} onChange={e => update({interval: e.target.value})} /></Field> : <>
      {form.frequency !== 'hourly' && <Field label="小时"><input type="number" min="0" max="23" value={form.hour} onChange={e => update({hour: e.target.value})} /></Field>}<Field label="分钟"><input type="number" min="0" max="59" value={form.minute} onChange={e => update({minute: e.target.value})} /></Field>
    </>}</div>
    {form.frequency === 'weekly' && <fieldset className={styles.options}><legend>执行星期</legend><div className={styles.optionRow}>{['日','一','二','三','四','五','六'].map((day, i) => <Checkbox key={day} label={'周' + day} checked={form.weekdays.includes(String(i))} onChange={checked => update({weekdays: checked ? [...form.weekdays, String(i)] : form.weekdays.filter(v => v !== String(i))})} />)}</div></fieldset>}
    {form.frequency === 'monthly' && <Field label="每月日期" hint="29–31 日在不含该日期的月份不会执行。"><input type="number" min="1" max="31" value={form.day} onChange={e => update({day: e.target.value})} /></Field>}
    {error ? <p className={styles.error}>{error}</p> : <p className={styles.hint}>生成结果：<code>{expression}</code></p>}
    {form.frequency === 'minutes' && <p className={styles.hint}>步长从每小时的第 0 分钟重新开始，不是跨小时连续间隔。</p>}
    <div className={styles.actions}><Button disabled={Boolean(error)} onClick={() => onApply(expression)}>填入表达式</Button></div><p className={styles.hint}>填入后点击「查看接下来 5 次」，按所选时区预览。</p>
  </details>;
}
