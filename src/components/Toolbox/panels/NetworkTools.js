import React from 'react';
import {describeNetwork, rangeToCidrs, compareNetworks, dnsTypes, queryDns, queryPublicIp} from '../network.mjs';
import {Button, Details, Feedback, Field, Output, useDraft, useResult, styles} from '../shared';

export function IpTool() {
  const [form, update] = useDraft('ip', {mode: 'network', first: '', second: ''});
  const [state, run] = useResult([form.mode, form.first, form.second]);
  const data = state.value;
  return <>
    <div className={styles.toolbar}><Field label="计算方式"><select value={form.mode} onChange={e => update({mode: e.target.value})}><option value="network">IPv4 / IPv6 网段信息</option><option value="range">IP 范围 → CIDR</option><option value="compare">网段包含与重叠</option></select></Field><Button onClick={() => update(form.mode === 'range' ? {first: '192.168.1.1', second: '192.168.1.254'} : {first: '2001:db8::1/64', second: '2001:db8::80'})}>载入示例</Button></div>
    <div className={form.mode === 'network' ? undefined : styles.formRow}>
      <Field label={form.mode === 'range' ? '起始 IP' : '第一个网段 / CIDR'}><input className={styles.mono} value={form.first} onChange={e => update({first: e.target.value})} placeholder={form.mode === 'range' ? '192.168.1.1' : '2001:db8::1/64'} spellCheck={false} /></Field>
      {form.mode !== 'network' && <Field label={form.mode === 'range' ? '结束 IP' : '第二个 IP 或网段'}><input className={styles.mono} value={form.second} onChange={e => update({second: e.target.value})} placeholder={form.mode === 'range' ? '192.168.1.254' : '2001:db8::80'} spellCheck={false} /></Field>}
    </div>
    <div className={styles.actions}><Button primary onClick={() => run(() => form.mode === 'range' ? rangeToCidrs(form.first, form.second) : form.mode === 'compare' ? compareNetworks(form.first, form.second) : describeNetwork(form.first))}>计算</Button></div><Feedback state={state} />
    {data && (form.mode === 'network' ? <><Details items={[["IP 版本", data.version], ['规范网段', data.cidr], ['范围首地址', data.first], ['范围末地址', data.last], ['地址总数', data.total], ['网络掩码', data.mask], ['广播地址', data.broadcast]]} /><p className={styles.hint}>范围包含网段内所有地址；IPv6 没有广播地址。IPv4 可用主机范围请使用「IPv4 子网计算」。</p><Output value={JSON.stringify(data, null, 2)} filename="network.json" /></> : form.mode === 'range' ? <><p className={styles.hint}>精确覆盖此范围，共 {data.length} 个 CIDR。</p><Output value={data.join('\n')} filename="cidr.txt" /></> : <><Details items={[["包含关系", data.contains ? '第一个包含第二个' : '第一个不包含第二个'], ['是否重叠', data.overlaps ? '是' : '否']]} /><Output value={data.relation} rows={3} filename="network-comparison.txt" /></>)}
  </>;
}

export function DnsTool() {
  const [form, update] = useDraft('dns', {domain: '', type: 'A', provider: 'cloudflare'});
  const [state, run] = useResult([form.domain, form.type, form.provider]);
  const data = state.value;
  const records = data?.Answer || [];
  return <>
    <p className={styles.notice}>联网查询：点击后，域名会发送给所选公共 DNS 服务。结果是该服务看到的记录，不代表内网 DNS 或所有地区的结果。</p>
    <Field label="查询域名"><input value={form.domain} onChange={e => update({domain: e.target.value})} placeholder="example.com" spellCheck={false} /></Field>
    <div className={styles.formRow}><Field label="记录类型"><select value={form.type} onChange={e => update({type: e.target.value})}>{dnsTypes.map(type => <option key={type}>{type}</option>)}</select></Field><Field label="公共 DNS 服务"><select value={form.provider} onChange={e => update({provider: e.target.value})}><option value="cloudflare">Cloudflare</option><option value="google">Google Public DNS</option></select></Field></div>
    <div className={styles.actions}><Button primary disabled={state.busy} onClick={() => run(() => queryDns(form.domain, form.type, form.provider))}>查询 DNS</Button><Button onClick={() => update({domain: 'example.com'})}>填入示例域名</Button></div><Feedback state={state} />
    {data && <><Details items={[["响应状态", ({0: 'NOERROR', 2: 'SERVFAIL', 3: 'NXDOMAIN：域名不存在', 5: 'REFUSED'})[data.Status] || String(data.Status)], ['DNSSEC AD 标志', data.AD ? '服务端报告已验证' : '未声明已验证']]} />{records.length ? <div className={styles.tableScroll}><table className={styles.recordTable}><thead><tr><th>名称</th><th>类型</th><th>TTL（秒）</th><th>记录值</th></tr></thead><tbody>{records.map((r, i) => <tr key={i}><td>{r.name}</td><td>{({1:'A',28:'AAAA',5:'CNAME',15:'MX',16:'TXT',2:'NS',6:'SOA',12:'PTR',257:'CAA',33:'SRV'})[r.type] || r.type}</td><td>{r.TTL}</td><td>{r.data}</td></tr>)}</tbody></table></div> : <p className={styles.empty}>{data.Status === 0 ? '查询成功，但没有返回该类型的 Answer 记录。' : '服务未返回可用记录，请检查域名或更换服务。'}</p>}<Output value={JSON.stringify(data, null, 2)} label="完整 DNS 响应" filename="dns-response.json" rows={8} /></>}
    <p className={styles.hint}>公开 API 的可用性取决于当前网络；无需配置密钥。</p>
  </>;
}

export function PublicIpTool() {
  const [form, update] = useDraft('public-ip', {family: 'auto'});
  const [state, run] = useResult([form.family]);
  return <>
    <p className={styles.notice}>联网查询：点击后请求 ipify，显示该服务看到的出口 IP。使用代理或 VPN 时，结果通常是代理出口地址。</p>
    <Field label="查询类型"><select value={form.family} onChange={e => update({family: e.target.value})}><option value="auto">自动（IPv4 或 IPv6）</option><option value="ipv4">仅 IPv4</option><option value="ipv6">仅 IPv6</option></select></Field>
    <div className={styles.actions}><Button primary disabled={state.busy} onClick={() => run(async () => ({ip: await queryPublicIp(form.family), time: new Date().toISOString()}))}>查询公网 IP</Button></div><Feedback state={state} />
    {state.value && <Details items={[["出口地址", state.value.ip], ['查询时间 UTC', state.value.time], ['服务', 'ipify']]} />}
    <Output value={state.value?.ip ?? null} label="公网 IP" rows={2} filename="public-ip.txt" />
    <p className={styles.hint}>仅 IPv6 查询需要本机网络支持 IPv6。不会请求浏览器定位权限。</p>
  </>;
}
