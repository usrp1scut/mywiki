const MAX_TEXT = 2 * 1024 * 1024;

export function checkText(text) {
  if (text.length > MAX_TEXT) throw new Error('文本过长，请控制在 200 万字符以内。');
}

export function formatJson(text, indent = 2) {
  checkText(text);
  if (!text.trim()) throw new Error('请先输入 JSON。');
  try { JSON.parse(text); } catch (error) { throw new Error(`JSON 格式无效：${error.message}`); }
  // Validate with JSON.parse, but format the original tokens so large integers,
  // exponent notation and duplicate keys are never silently rewritten.
  const tokens = text.match(/"(?:\\.|[^"\\])*"|[^\s]/gs);
  if (indent === 0) return tokens.join('');
  let depth = 0;
  let result = '';
  const newline = () => '\n' + ' '.repeat(depth * indent);
  tokens.forEach((token, index) => {
    if (token === '{' || token === '[') {
      result += token;
      depth++;
      if (tokens[index + 1] !== (token === '{' ? '}' : ']')) result += newline();
    } else if (token === '}' || token === ']') {
      depth--;
      if (tokens[index - 1] !== (token === '}' ? '{' : '[')) result += newline();
      result += token;
    } else if (token === ',') result += ',' + newline();
    else if (token === ':') result += ': ';
    else result += token;
  });
  return result;
}

export function encodeBase64(text, urlSafe = false) {
  checkText(text);
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  const encoded = btoa(binary);
  return urlSafe ? encoded.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '') : encoded;
}

export function decodeBase64(text, urlSafe = false) {
  checkText(text);
  let value = text.replace(/\s/g, '');
  if (urlSafe) value = value.replaceAll('-', '+').replaceAll('_', '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 === 1 || (value.includes('=') && value.length % 4 !== 0)) {
    throw new Error('Base64 格式无效，请检查字符、补位或 URL 安全格式选项。');
  }
  try {
    return new TextDecoder('utf-8', {fatal: true}).decode(Uint8Array.from(atob(value), char => char.charCodeAt(0)));
  } catch { throw new Error('无法解码为 UTF-8 文本，请确认内容是文本而非二进制文件。'); }
}

export function convertUrl(text, mode = 'component', decode = false) {
  checkText(text);
  try { return (mode === 'uri' ? (decode ? decodeURI : encodeURI) : (decode ? decodeURIComponent : encodeURIComponent))(text); }
  catch { throw new Error('URL 编码无效，请检查百分号转义或不完整的 Unicode 字符。'); }
}

export function timestampToDate(value, unit = 'seconds') {
  if (!/^-?\d+(?:\.\d{1,3})?$/.test(value.trim())) throw new Error('请输入有效的数字时间戳。');
  const milliseconds = Number(value) * (unit === 'seconds' ? 1000 : 1);
  if (!Number.isSafeInteger(Math.round(milliseconds)) || Math.abs(milliseconds) > 8640000000000000) throw new Error('时间戳超出支持范围。');
  if (unit === 'milliseconds' && !Number.isInteger(milliseconds)) throw new Error('毫秒时间戳必须是整数。');
  return new Date(Math.round(milliseconds));
}

export function parseDate(text) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/i.exec(text.trim());
  if (!parts) throw new Error('请输入带时区的 ISO 日期，例如 2026-11-04T12:00:00+08:00。');
  const [, year, month, day, hour, minute, second, fraction = '', zone] = parts;
  const date = new Date(0);
  date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  date.setUTCHours(Number(hour), Number(minute), Number(second), Number(fraction.padEnd(3, '0')));
  if (date.getUTCFullYear() !== +year || date.getUTCMonth() !== +month - 1 || date.getUTCDate() !== +day || +hour > 23 || +minute > 59 || +second > 59) {
    throw new Error('日期不存在，请检查年月日和时间。');
  }
  if (zone.toUpperCase() !== 'Z') {
    const hours = Number(zone.slice(1, 3));
    const minutes = Number(zone.slice(4));
    if (hours > 23 || minutes > 59) throw new Error('时区偏移无效。');
    date.setTime(date.getTime() - (zone[0] === '+' ? 1 : -1) * (hours * 60 + minutes) * 60000);
  }
  return date;
}

export function dateDetails(date, timeZone = 'Asia/Shanghai') {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZoneName: 'longOffset'}).formatToParts(date);
  const p = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return {seconds: String(date.getTime() / 1000), milliseconds: String(date.getTime()), utc: date.toISOString(), zoned: `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second} ${p.timeZoneName}`};
}

export async function hashText(text, algorithm) {
  checkText(text);
  const hashers = await import('hash-wasm');
  if (!['md5', 'sha1', 'sha256', 'sha512'].includes(algorithm)) throw new Error('不支持的摘要算法。');
  return hashers[algorithm](text);
}

function randomInt(limit, cryptoApi = globalThis.crypto) {
  if (!cryptoApi?.getRandomValues) throw new Error('当前浏览器不支持安全随机数，请使用现代浏览器。');
  const range = 0x100000000;
  const ceiling = Math.floor(range / limit) * limit;
  const buffer = new Uint32Array(1);
  do { cryptoApi.getRandomValues(buffer); } while (buffer[0] >= ceiling);
  return buffer[0] % limit;
}

export function generateUuids(count = 1, cryptoApi = globalThis.crypto) {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('生成数量应为 1–100 的整数。');
  if (!cryptoApi?.getRandomValues) throw new Error('当前浏览器不支持安全随机数。');
  return Array.from({length: count}, () => {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  });
}

export function generatePasswords({length = 20, count = 1, lower = true, upper = true, digits = true, symbols = true, excludeSimilar = true}, cryptoApi = globalThis.crypto) {
  if (!Number.isInteger(length) || length < 8 || length > 128) throw new Error('密码长度应为 8–128 的整数。');
  if (!Number.isInteger(count) || count < 1 || count > 20) throw new Error('生成数量应为 1–20 的整数。');
  const groups = [lower && 'abcdefghijklmnopqrstuvwxyz', upper && 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', digits && '0123456789', symbols && '!@#$%^&*()-_=+[]{}:,.?'].filter(Boolean)
    .map(group => excludeSimilar ? group.replace(/[Il1O0o]/g, '') : group);
  if (!groups.length) throw new Error('请至少选择一种字符类型。');
  const all = groups.join('');
  const pick = group => group[randomInt(group.length, cryptoApi)];
  return Array.from({length: count}, () => {
    const chars = groups.map(pick);
    while (chars.length < length) chars.push(pick(all));
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomInt(i + 1, cryptoApi);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  });
}

export function matchRegex(pattern, flags, text) {
  if (!pattern) throw new Error('请输入正则表达式。');
  if (pattern.length > 10000 || text.length > 100000) throw new Error('正则最多 1 万字符，测试文本最多 10 万字符。');
  if (!/^[gimsuy]*$/.test(flags)) throw new Error('支持的标志为 g、i、m、s、u、y。');
  let regex;
  try { regex = new RegExp(pattern, flags); } catch (error) { throw new Error(`正则表达式无效：${error.message}`); }
  const matches = [];
  let match;
  while ((match = regex.exec(text))) {
    if (matches.length === 1000) return {matches, truncated: true};
    matches.push({index: match.index, text: match[0], groups: match.slice(1), namedGroups: match.groups || {}});
    if (!regex.global) break;
    if (match[0] === '') regex.lastIndex += regex.unicode && (text.codePointAt(regex.lastIndex) || 0) > 0xffff ? 2 : 1;
  }
  return {matches, truncated: false};
}

export async function nextCronRuns(expression, timeZone = 'Asia/Shanghai', start = new Date(), count = 5) {
  const fields = expression.trim().split(/\s+/);
  if (![5, 6].includes(fields.length)) throw new Error('请输入 5 段 Cron 表达式，或包含秒的 6 段表达式。');
  if (/\bH(?:\W|$)/i.test(expression)) throw new Error('此工具不支持随机调度 H，请使用确定的时间字段。');
  try { new Intl.DateTimeFormat('en', {timeZone}).format(start); } catch { throw new Error('时区或起始时间无效。'); }
  const {CronExpressionParser} = await import('cron-parser/dist/CronExpressionParser.js');
  try {
    const interval = CronExpressionParser.parse(expression.trim(), {currentDate: start, tz: timeZone});
    return Array.from({length: count}, () => dateDetails(interval.next().toDate(), timeZone));
  } catch (error) { throw new Error(`Cron 表达式无法执行：${error.message}`); }
}

export function calculateSubnet(input) {
  const parts = input.trim().split('/');
  if (parts.length !== 2 || !/^(?:0|[1-9]\d?)$/.test(parts[1]) || +parts[1] > 32) throw new Error('请输入 IPv4/CIDR，例如 192.168.1.42/24。');
  const octets = parts[0].split('.');
  if (octets.length !== 4 || octets.some(v => !/^(?:0|[1-9]\d{0,2})$/.test(v) || +v > 255)) throw new Error('IPv4 地址无效，每段应为 0–255 的十进制整数。');
  const prefix = +parts[1];
  const ip = octets.reduce((value, part) => (value << 8n) | BigInt(part), 0n);
  const mask = (0xffffffffn << BigInt(32 - prefix)) & 0xffffffffn;
  const network = ip & mask;
  const total = 1n << BigInt(32 - prefix);
  const last = network + total - 1n;
  const format = value => [24n, 16n, 8n, 0n].map(shift => Number((value >> shift) & 255n)).join('.');
  return {
    cidr: `${format(network)}/${prefix}`, mask: format(mask), wildcard: format(0xffffffffn ^ mask),
    network: format(network), broadcast: prefix < 31 ? format(last) : '不适用',
    first: format(prefix < 31 ? network + 1n : network), last: format(prefix < 31 ? last - 1n : last),
    total: total.toString(), usable: (prefix < 31 ? total - 2n : total).toString(),
    note: prefix === 31 ? '/31 按点对点链路计算，两个地址均可使用。' : prefix === 32 ? '/32 表示单个主机地址。' : '可用地址数已扣除网络地址和广播地址。',
  };
}
