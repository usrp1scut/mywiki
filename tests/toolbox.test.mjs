import assert from 'node:assert/strict';
import {createHash, webcrypto} from 'node:crypto';
import test from 'node:test';
import {
  formatJson, encodeBase64, decodeBase64, convertUrl, timestampToDate, parseDate, dateDetails,
  hashText, generateUuids, generatePasswords, matchRegex, nextCronRuns, calculateSubnet,
} from '../src/components/Toolbox/logic.mjs';

test('JSON formatting preserves large numbers, exponent notation, escapes and duplicate keys', () => {
  const source = '{ "id":900719925474099312345, "value":1e400,"x":1,"x":2,"text":"a b \\" c", "list":[true,{},[]] }';
  const compact = formatJson(source, 0);
  assert.ok(compact.includes('900719925474099312345'));
  assert.ok(compact.includes('1e400'));
  assert.ok(compact.includes('"x":1,"x":2'));
  assert.equal(formatJson(formatJson(source, 4), 0), compact);
  assert.equal(formatJson('{}'), '{}');
  assert.equal(formatJson('[[],{}]'), '[\n  [],\n  {}\n]');
  assert.throws(() => formatJson('{"x":}'), /JSON 格式无效/);
  assert.throws(() => formatJson(' '), /请先输入/);
});

test('Base64 round-trips Chinese, emoji, whitespace and URL-safe text', () => {
  const text = '你好，Wiki 👋\nhello / +';
  for (const urlSafe of [false, true]) assert.equal(decodeBase64(encodeBase64(text, urlSafe), urlSafe), text);
  assert.equal(encodeBase64('hello wiki'), 'aGVsbG8gd2lraQ==');
  assert.equal(decodeBase64('aGVsbG8gd2lraQ'), 'hello wiki');
  assert.equal(decodeBase64(' aGVs\nbG8= '), 'hello');
  assert.equal(decodeBase64(''), '');
  assert.throws(() => decodeBase64('a==='), /格式无效/);
  assert.throws(() => decodeBase64('/w=='), /UTF-8/);
});

test('URL conversion distinguishes a parameter from a full URL and rejects malformed escapes', () => {
  const input = 'https://example.com/中文?q=a&b=1';
  assert.equal(convertUrl(input, 'uri'), 'https://example.com/%E4%B8%AD%E6%96%87?q=a&b=1');
  assert.equal(convertUrl(convertUrl(input), 'component', true), input);
  assert.equal(convertUrl('a+b', 'component', true), 'a+b');
  assert.throws(() => convertUrl('%ZZ', 'component', true), /URL 编码无效/);
});

test('Unix timestamps handle zero, negatives, fractions and explicit units', () => {
  assert.equal(timestampToDate('0').toISOString(), '1970-01-01T00:00:00.000Z');
  assert.equal(timestampToDate('-0.001').getTime(), -1);
  assert.equal(timestampToDate('1234', 'milliseconds').getTime(), 1234);
  assert.equal(timestampToDate('0.029').getTime(), 29);
  assert.throws(() => timestampToDate('abc'), /数字时间戳/);
  assert.throws(() => timestampToDate('1.5', 'milliseconds'), /整数/);
  assert.throws(() => timestampToDate('99999999999999999999999'), /超出/);
});

test('ISO date parsing requires explicit offsets and rejects nonexistent dates', () => {
  assert.equal(parseDate('2026-11-04T12:00:00+08:00').toISOString(), '2026-11-04T04:00:00.000Z');
  assert.equal(parseDate('2024-02-29T00:00:00Z').toISOString(), '2024-02-29T00:00:00.000Z');
  assert.equal(parseDate('0099-01-01T00:00:00Z').getUTCFullYear(), 99);
  assert.throws(() => parseDate('2025-02-29T00:00:00Z'), /日期不存在/);
  assert.throws(() => parseDate('2026-11-04T24:00:00Z'), /日期不存在/);
  assert.throws(() => parseDate('2026-11-04 12:00:00'), /带时区/);
  assert.throws(() => parseDate('2026-11-04T00:00:00+08:99'), /偏移无效/);
  assert.match(dateDetails(new Date(0), 'Asia/Shanghai').zoned, /1970-01-01 08:00:00 GMT\+08:00/);
});

test('hashes match Node reference implementations including empty and Unicode inputs', async () => {
  for (const algorithm of ['md5', 'sha1', 'sha256', 'sha512']) {
    for (const input of ['', 'hello wiki', '中文👋\n']) {
      assert.equal(await hashText(input, algorithm), createHash(algorithm).update(input).digest('hex'));
    }
  }
});

test('UUIDs have v4 and RFC variant bits and validate generation bounds', () => {
  const values = generateUuids(100, webcrypto);
  assert.equal(new Set(values).size, 100);
  for (const value of values) assert.match(value, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  for (const count of [0, 101, 1.2, NaN]) assert.throws(() => generateUuids(count, webcrypto));
});

test('passwords honor length, enabled groups and confusing-character exclusion', () => {
  const passwords = generatePasswords({length: 20, count: 20}, webcrypto);
  for (const password of passwords) {
    assert.equal(password.length, 20);
    assert.match(password, /[a-z]/);
    assert.match(password, /[A-Z]/);
    assert.match(password, /[2-9]/);
    assert.match(password, /[^A-Za-z0-9]/);
    assert.doesNotMatch(password, /[Il1O0o]/);
  }
  assert.match(generatePasswords({lower: false, upper: false, symbols: false, excludeSimilar: false}, webcrypto)[0], /^\d{20}$/);
  assert.throws(() => generatePasswords({lower: false, upper: false, digits: false, symbols: false}, webcrypto), /至少选择/);
  assert.throws(() => generatePasswords({length: 7}, webcrypto), /密码长度/);
});

test('secure sampling rejects biased values instead of using modulo directly', () => {
  let calls = 0;
  const random = {getRandomValues(buffer) { buffer[0] = calls++ % 2 === 0 ? 0xffffffff : 2; return buffer; }};
  const value = generatePasswords({length: 8, lower: false, upper: false, symbols: false, excludeSimilar: false}, random)[0];
  assert.equal(value, '22222222');
  assert.ok(calls > 15);
});

test('regex returns positions, capture groups, empty matches and Unicode-safe progress', () => {
  const result = matchRegex('(?<key>\\w+)=(\\w+)', 'g', 'host=wiki port=443');
  assert.equal(result.matches.length, 2);
  assert.equal(result.matches[1].index, 10);
  assert.deepEqual(result.matches[0].groups, ['host', 'wiki']);
  assert.equal(result.matches[0].namedGroups.key, 'host');
  assert.deepEqual(matchRegex('(?:)', 'gu', '👋').matches.map(m => m.index), [0, 2]);
  assert.equal(matchRegex('a', '', 'aaa').matches.length, 1);
  assert.equal(matchRegex('z', 'g', 'abc').matches.length, 0);
  assert.equal(matchRegex('a', 'g', 'a'.repeat(1001)).truncated, true);
  assert.throws(() => matchRegex('[', 'g', ''), /正则表达式无效/);
  assert.throws(() => matchRegex('a', 'gg', ''), /正则表达式无效/);
});

test('Cron uses timezone, excludes the starting instant and supports seconds', async () => {
  const runs = await nextCronRuns('0 9 * * 1-5', 'Asia/Shanghai', new Date('2026-11-06T01:00:00Z'));
  assert.equal(runs.length, 5);
  assert.equal(runs[0].utc, '2026-11-09T01:00:00.000Z');
  const seconds = await nextCronRuns('*/10 * * * * *', 'UTC', new Date('2026-11-04T00:00:00Z'));
  assert.equal(seconds[0].utc, '2026-11-04T00:00:10.000Z');
  await assert.rejects(nextCronRuns(' ', 'UTC'), /5 段/);
  await assert.rejects(nextCronRuns('99 * * * *', 'UTC'), /Cron 表达式/);
  await assert.rejects(nextCronRuns('* * * * *', 'Not/AZone'), /时区/);
});

test('IPv4 subnet math handles unsigned addresses, /0, /31 and /32', () => {
  const normal = calculateSubnet('192.168.1.42/24');
  assert.equal(normal.cidr, '192.168.1.0/24');
  assert.equal(normal.mask, '255.255.255.0');
  assert.equal(normal.broadcast, '192.168.1.255');
  assert.equal(normal.first, '192.168.1.1');
  assert.equal(normal.last, '192.168.1.254');
  assert.equal(normal.usable, '254');
  assert.equal(calculateSubnet('255.255.255.255/0').total, '4294967296');
  const point = calculateSubnet('10.0.0.1/31');
  assert.equal(point.first, '10.0.0.0');
  assert.equal(point.last, '10.0.0.1');
  assert.equal(point.usable, '2');
  assert.equal(point.broadcast, '不适用');
  assert.equal(calculateSubnet('255.255.255.255/32').usable, '1');
  for (const invalid of ['256.1.1.1/24', '192.168.01.1/24', '192.168.1.1/33', '::1/128', '10.0.0.1']) {
    assert.throws(() => calculateSubnet(invalid));
  }
});
