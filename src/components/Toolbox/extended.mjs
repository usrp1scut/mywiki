import {checkText, decodeBase64} from './logic.mjs';

function jsonValue(value, sort, depth = 0, seen = new Set()) {
  if (depth > 100) throw new Error('嵌套超过 100 层，请简化数据。');
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('JSON 不支持 Infinity 或 NaN。');
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (seen.has(value)) throw new Error('循环引用无法转换为 JSON。');
  seen.add(value);
  const pad = n => '  '.repeat(n);
  let result;
  if (Array.isArray(value)) result = value.length ? '[\n' + value.map(v => pad(depth + 1) + jsonValue(v, sort, depth + 1, seen)).join(',\n') + '\n' + pad(depth) + ']' : '[]';
  else {
    const keys = Object.keys(value);
    if (sort) keys.sort();
    result = keys.length ? '{\n' + keys.map(k => pad(depth + 1) + JSON.stringify(k) + ': ' + jsonValue(value[k], sort, depth + 1, seen)).join(',\n') + '\n' + pad(depth) + '}' : '{}';
  }
  seen.delete(value);
  return result;
}

async function parseStructured(text, isJson = false) {
  checkText(text);
  if (!text.trim()) throw new Error('请先输入内容。');
  if (isJson) JSON.parse(text);
  const {parseDocument} = await import('yaml');
  const doc = parseDocument(text, {intAsBigInt: true, uniqueKeys: true, stringKeys: true, schema: isJson ? 'json' : 'core'});
  if (doc.errors.length || doc.warnings.length) throw new Error((doc.errors[0] || doc.warnings[0]).message);
  const value = doc.toJS({maxAliasCount: 50});
  // Traversal also rejects cycles, extreme depth and YAML-only numeric values.
  jsonValue(value, false);
  return {value, doc};
}

export async function convertYaml(text, mode) {
  const {value, doc} = await parseStructured(text, mode === 'json-yaml');
  if (mode === 'yaml-json') return jsonValue(value, false);
  if (mode === 'format') return doc.toString({indent: 2, lineWidth: 0});
  if (mode === 'validate') return 'YAML 格式有效（单文档 YAML 1.2）。';
  const {stringify} = await import('yaml');
  return stringify(value, {indent: 2, lineWidth: 0});
}

export async function compareText(left, right, mode = 'text', ignoreWhitespace = false) {
  if (left.length + right.length > 200000) throw new Error('两侧总长度请控制在 20 万字符以内。');
  if (mode === 'json') {
    left = jsonValue((await parseStructured(left, true)).value, true);
    right = jsonValue((await parseStructured(right, true)).value, true);
  }
  const {diffLines} = await import('diff');
  const chunks = diffLines(left, right, {ignoreWhitespace, timeout: 800, maxEditLength: 5000});
  if (!chunks) throw new Error('差异过多或计算超时，请缩短文本后重试。');
  return {chunks, added: chunks.filter(c => c.added).reduce((n, c) => n + c.count, 0), removed: chunks.filter(c => c.removed).reduce((n, c) => n + c.count, 0), report: chunks.map(c => c.value.split(/(?<=\n)/).map(line => (c.added ? '+ ' : c.removed ? '- ' : '  ') + line).join('')).join('')};
}

export function parseJwt(text, now = Date.now()) {
  checkText(text);
  const parts = text.trim().split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1] || parts.some(p => !/^[\w-]*$/.test(p))) throw new Error('请输入三段 Base64URL 组成的 JWT。加密的 JWE 不在此工具范围内。');
  let header, payload;
  try { header = JSON.parse(decodeBase64(parts[0], true)); payload = JSON.parse(decodeBase64(parts[1], true)); } catch { throw new Error('JWT Header 或 Payload 不是有效的 UTF-8 JSON。'); }
  if (!header || !payload || Array.isArray(header) || Array.isArray(payload) || typeof header !== 'object' || typeof payload !== 'object') throw new Error('Header 与 Payload 必须是 JSON 对象。');
  const claims = [];
  for (const [key, label] of [['iat', '签发时间'], ['nbf', '生效时间'], ['exp', '过期时间']]) {
    if (Object.hasOwn(payload, key)) {
      const n = payload[key];
      claims.push([label, typeof n === 'number' && Number.isFinite(n) && Math.abs(n * 1000) <= 8640000000000000 ? new Date(n * 1000).toISOString() : '无效的 NumericDate']);
    }
  }
  const expired = typeof payload.exp === 'number' && payload.exp <= now / 1000;
  const future = typeof payload.nbf === 'number' && payload.nbf > now / 1000;
  const invalid = claims.some(([, value]) => value === '无效的 NumericDate');
  return {header, payload, claims, timing: invalid ? '包含无效的时间声明' : expired ? 'Payload 声明已过期' : future ? 'Payload 声明尚未生效' : '未发现已过期或尚未生效的时间声明', signed: Boolean(parts[2])};
}

export function parsePermissions(input) {
  let value;
  const text = input.trim();
  if (/^[0-7]{3,4}$/.test(text)) value = parseInt(text, 8);
  else {
    const s = /^[d-][rwxstST-]{9}$/.test(text) ? text.slice(1) : text;
    if (!/^[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$/.test(s)) throw new Error('请输入 755、4755 或 rwxr-xr-x 格式的权限。');
    value = 0;
    [...s].forEach((c, i) => { if (c !== '-' && c !== 'S' && c !== 'T') value |= 1 << (8 - i); });
    if (/[sS]/.test(s[2])) value |= 0o4000;
    if (/[sS]/.test(s[5])) value |= 0o2000;
    if (/[tT]/.test(s[8])) value |= 0o1000;
  }
  return permissionDetails(value);
}

export function permissionDetails(value) {
  const chars = Array.from({length: 9}, (_, i) => value & (1 << (8 - i)) ? 'rwx'[i % 3] : '-');
  [[0o4000, 2, 's', 'S'], [0o2000, 5, 's', 'S'], [0o1000, 8, 't', 'T']].forEach(([mask, i, on, off]) => { if (value & mask) chars[i] = chars[i] === 'x' ? on : off; });
  return {value, octal: value.toString(8).padStart(value > 0o777 ? 4 : 3, '0'), symbolic: chars.join('')};
}

export function umaskPermissions(text) {
  if (!/^[0-7]{3}$/.test(text)) throw new Error('umask 应为 3 位八进制数，例如 022。');
  const mask = parseInt(text, 8);
  return {file: permissionDetails(0o666 & ~mask), directory: permissionDetails(0o777 & ~mask)};
}

export function buildCron({frequency = 'daily', interval = '5', minute = '0', hour = '2', weekdays = ['1', '2', '3', '4', '5'], day = '1'}) {
  const number = (v, min, max, label) => { if (!/^\d+$/.test(String(v)) || +v < min || +v > max) throw new Error(label + '超出范围。'); return String(+v); };
  if (frequency === 'minutes') return '*/' + number(interval, 1, 59, '间隔分钟') + ' * * * *';
  const m = number(minute, 0, 59, '分钟');
  if (frequency === 'hourly') return m + ' * * * *';
  const h = number(hour, 0, 23, '小时');
  if (frequency === 'weekly') {
    if (!weekdays.length) throw new Error('请至少选择一天。');
    return m + ' ' + h + ' * * ' + [...new Set(weekdays.map(v => number(v, 0, 6, '星期')))].sort().join(',');
  }
  if (frequency === 'monthly') return m + ' ' + h + ' ' + number(day, 1, 31, '日期') + ' * *';
  return m + ' ' + h + ' * * *';
}

export function wifiPayload({ssid, password, security = 'WPA', hidden = false}) {
  if (!ssid) throw new Error('请填写 Wi-Fi 名称。');
  if (security !== 'nopass' && !password) throw new Error('请填写 Wi-Fi 密码。');
  const escape = value => value.replace(/[\\;,:\"]/g, '\\$&');
  return 'WIFI:T:' + security + ';S:' + escape(ssid) + ';P:' + escape(security === 'nopass' ? '' : password) + ';H:' + hidden + ';;';
}

export async function hashFile(file, algorithm, onProgress = () => {}, signal) {
  const library = await import('hash-wasm');
  const methods = {md5: 'createMD5', sha1: 'createSHA1', sha256: 'createSHA256', sha512: 'createSHA512'};
  if (!methods[algorithm]) throw new Error('不支持的摘要算法。');
  const hash = await library[methods[algorithm]]();
  hash.init();
  for (let offset = 0; offset < file.size; offset += 2 * 1024 * 1024) {
    if (signal?.aborted) throw new Error('已取消计算。');
    hash.update(new Uint8Array(await file.slice(offset, offset + 2 * 1024 * 1024).arrayBuffer()));
    onProgress(Math.min(100, Math.round((offset + 2 * 1024 * 1024) / file.size * 100)));
  }
  onProgress(100);
  return hash.digest('hex');
}
