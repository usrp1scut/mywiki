import ipaddr from 'ipaddr.js';

function address(text) {
  text = text.trim();
  if (text.includes('%')) throw new Error('暂不支持带接口标识的 IPv6 地址。');
  if (!text.includes(':') && !/^(?:0|[1-9]\d{0,2})(?:\.(?:0|[1-9]\d{0,2})){3}$/.test(text)) throw new Error('请输入标准 IPv4 或 IPv6 地址。');
  let parsed;
  try { parsed = ipaddr.parse(text); } catch { throw new Error('IP 地址格式无效。'); }
  const bytes = parsed.toByteArray();
  return {bits: bytes.length * 8, value: bytes.reduce((n, b) => (n << 8n) | BigInt(b), 0n)};
}
function format(value, bits) {
  const bytes = Array.from({length: bits / 8}, (_, i) => Number((value >> BigInt(bits - 8 - i * 8)) & 255n));
  return ipaddr.fromByteArray(bytes).toString();
}
function network(text) {
  const parts = text.trim().split('/');
  if (parts.length !== 2 || !/^(0|[1-9]\d{0,2})$/.test(parts[1])) throw new Error('请输入带前缀的地址，例如 192.168.1.42/24 或 2001:db8::1/64。');
  const {bits, value} = address(parts[0]);
  const prefix = +parts[1];
  if (prefix > bits) throw new Error('前缀长度超出地址范围。');
  const size = 1n << BigInt(bits - prefix);
  const start = value / size * size;
  return {bits, prefix, size, start, end: start + size - 1n};
}
export function describeNetwork(text) {
  const n = network(text);
  const mask = ((1n << BigInt(n.bits)) - 1n) ^ (n.size - 1n);
  return {version: 'IPv' + (n.bits === 32 ? '4' : '6'), cidr: format(n.start, n.bits) + '/' + n.prefix, first: format(n.start, n.bits), last: format(n.end, n.bits), total: n.size.toString(), mask: format(mask, n.bits), broadcast: n.bits === 32 && n.prefix < 31 ? format(n.end, n.bits) : '不适用'};
}
export function rangeToCidrs(first, last) {
  const a = address(first), b = address(last);
  if (a.bits !== b.bits) throw new Error('起止地址必须使用相同的 IP 版本。');
  if (a.value > b.value) throw new Error('起始地址不能大于结束地址。');
  let current = a.value;
  const result = [];
  while (current <= b.value) {
    let hostBits = 0;
    while (hostBits < a.bits && current % (1n << BigInt(hostBits + 1)) === 0n && current + (1n << BigInt(hostBits + 1)) - 1n <= b.value) hostBits++;
    result.push(format(current, a.bits) + '/' + (a.bits - hostBits));
    current += 1n << BigInt(hostBits);
  }
  return result;
}
export function compareNetworks(first, second) {
  const a = network(first);
  const b = second.includes('/') ? network(second) : (() => { const v = address(second); return {bits: v.bits, start: v.value, end: v.value}; })();
  if (a.bits !== b.bits) return {overlaps: false, contains: false, relation: 'IP 版本不同，不存在包含或重叠关系。'};
  const overlaps = a.start <= b.end && b.start <= a.end;
  const contains = a.start <= b.start && a.end >= b.end;
  const equal = a.start === b.start && a.end === b.end;
  return {overlaps, contains, relation: equal ? '两者地址范围相同。' : contains ? '第一个网段包含第二个地址或网段。' : overlaps ? '第二个网段包含第一个网段。' : '两者没有重叠。'};
}

export const dnsTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'PTR', 'CAA', 'SRV'];
export function dnsName(input) {
  const name = input.trim().replace(/\.$/, '');
  if (!/^[\p{L}\p{N}_.-]+$/u.test(name)) throw new Error('请输入域名，不要包含协议、端口或路径。');
  let host;
  try { host = new URL('https://' + name).hostname; } catch { throw new Error('域名格式无效。'); }
  if (host.length > 253 || host.split('.').some(p => !/^[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?$/i.test(p))) throw new Error('域名标签长度或字符无效。');
  return host;
}
async function requestJson(url, options = {}, fetcher = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetcher(url, {...options, signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store'});
    if (!response.ok) throw new Error('公开 API 返回 HTTP ' + response.status + '，请稍后重试。');
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) throw new Error('查询超过 10 秒，请重试或切换服务。');
    if (error instanceof TypeError) throw new Error('无法连接公开 API，可能受到网络或跨域限制。请检查网络或切换服务。');
    throw error;
  } finally { clearTimeout(timer); }
}
export async function queryDns(name, type, provider, fetcher) {
  if (!dnsTypes.includes(type)) throw new Error('不支持的 DNS 记录类型。');
  const base = provider === 'cloudflare' ? 'https://cloudflare-dns.com/dns-query' : 'https://dns.google/resolve';
  const data = await requestJson(base + '?' + new URLSearchParams({name: dnsName(name), type}), {headers: {Accept: 'application/dns-json'}}, fetcher);
  if (!Number.isInteger(data.Status)) throw new Error('DNS 服务返回了无法识别的结果。');
  return data;
}
export async function queryPublicIp(family, fetcher) {
  const endpoint = {auto: 'api64', ipv4: 'api', ipv6: 'api6'}[family];
  if (!endpoint) throw new Error('请选择 IP 类型。');
  const data = await requestJson('https://' + endpoint + '.ipify.org?format=json', {}, fetcher);
  if (typeof data.ip !== 'string') throw new Error('IP 服务返回了无法识别的结果。');
  address(data.ip);
  return data.ip;
}
