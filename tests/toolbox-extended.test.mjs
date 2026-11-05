import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash, X509Certificate} from 'node:crypto';
import {convertYaml, compareText, parseJwt, parsePermissions, permissionDetails, umaskPermissions, buildCron, wifiPayload, hashFile} from '../src/components/Toolbox/extended.mjs';
import {dockerToCompose, shellWords} from '../src/components/Toolbox/docker.mjs';
import {parseCertificates} from '../src/components/Toolbox/certificate.mjs';
import {describeNetwork, rangeToCidrs, compareNetworks, dnsName, queryDns, queryPublicIp} from '../src/components/Toolbox/network.mjs';
import {parse} from 'yaml';

test('YAML converts exact integers, nested objects, booleans and Unicode', async () => {
  const input = 'service: 运维\nports: [80, 443]\nenabled: true\nid: 900719925474099312345\n';
  const json = await convertYaml(input, 'yaml-json');
  assert.match(json, /900719925474099312345/);
  const yaml = await convertYaml(json, 'json-yaml');
  assert.match(yaml, /900719925474099312345/);
  assert.equal((await convertYaml(yaml, 'yaml-json')), json);
  assert.match(await convertYaml('# note\na: 1\n', 'format'), /# note/);
  assert.match(await convertYaml('a: true', 'validate'), /有效/);
});

test('YAML rejects duplicates, cycles, unknown tags and non-JSON numeric values', async () => {
  for (const source of ['a: 1\na: 2', 'a: .inf', 'a: .nan', 'a: !unknown foo', 'a: &a [*a]', '---\na: 1\n---\nb: 2']) await assert.rejects(convertYaml(source, 'yaml-json'));
  await assert.rejects(convertYaml('{oops}', 'json-yaml'));
  await assert.rejects(convertYaml('a: [1,', 'validate'));
});

test('diff normalizes JSON key order without losing integer differences or array order', async () => {
  const same = await compareText('{"b":2,"a":1}', '{"a":1,"b":2}', 'json');
  assert.equal(same.added + same.removed, 0);
  const big = await compareText('{"id":900719925474099312345}', '{"id":900719925474099312346}', 'json');
  assert.ok(big.added && big.removed);
  const array = await compareText('[1,2]', '[2,1]', 'json');
  assert.ok(array.added);
  const plain = await compareText('a\nb\n', 'a\nc\n');
  assert.equal(plain.added, 1); assert.equal(plain.removed, 1);
  assert.equal((await compareText(' a \n', 'a\n', 'text', true)).added, 0);
  await assert.rejects(compareText('a'.repeat(200001), 'b'), /20 万/);
});

test('JWT decodes Unicode and reports time claims without claiming authenticity', () => {
  const segment = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = segment({alg: 'HS256'}) + '.' + segment({sub: '运维', exp: 1000, nbf: 500, iat: 100}) + '.YWJj';
  const result = parseJwt(token, 2000000);
  assert.equal(result.payload.sub, '运维'); assert.equal(result.signed, true);
  assert.match(result.timing, /已过期/); assert.equal(result.claims.length, 3);
  assert.match(parseJwt(token, 400000).timing, /尚未生效/);
  assert.throws(() => parseJwt('abc.def'), /三段/);
  assert.throws(() => parseJwt(segment([]) + '.' + segment({}) + '.'), /JSON 对象/);
});

test('permissions round-trip every Unix permission including SUID/SGID/Sticky', () => {
  for (let n = 0; n <= 0o7777; n++) {
    const detail = permissionDetails(n);
    assert.equal(parsePermissions(detail.symbolic).value, n);
    assert.equal(parsePermissions(detail.octal).value, n);
  }
  assert.equal(parsePermissions('-rwsr-xr-x').octal, '4755');
  assert.equal(parsePermissions('rwxrwxrwt').octal, '1777');
  const mask = umaskPermissions('027');
  assert.equal(mask.file.octal, '640'); assert.equal(mask.directory.octal, '750');
  assert.throws(() => parsePermissions('888'));
  assert.throws(() => umaskPermissions('099'));
});

test('Docker translates quoted values, command arrays, mounts and external networks', async () => {
  const command = "docker run -dit --name wiki -p8080:80 -e 'GREETING=hello world' -v data:/data --network internal --cpus 0.5 --restart unless-stopped nginx:alpine sh -c 'echo hello'";
  const result = await dockerToCompose(command);
  const config = parse(result.yaml);
  assert.equal(config.services.wiki.image, 'nginx:alpine');
  assert.deepEqual(config.services.wiki.ports, ['8080:80']);
  assert.deepEqual(config.services.wiki.environment, ['GREETING=hello world']);
  assert.deepEqual(config.services.wiki.command, ['sh', '-c', 'echo hello']);
  assert.equal(config.services.wiki.cpus, 0.5);
  assert.deepEqual(config.volumes.data, {external: true});
  assert.deepEqual(config.networks.internal, {external: true});
  assert.ok(result.notes.length);
  const literal = parse((await dockerToCompose("docker run -e 'VALUE=$HOME' alpine echo '$PATH'")).yaml);
  assert.equal(literal.services.app.environment[0], 'VALUE=$$HOME');
  assert.equal(literal.services.app.command[1], '$$PATH');
  assert.deepEqual(shellWords('docker run \\\n -e "VALUE=a b" alpine'), ['docker', 'run', '-e', 'VALUE=a b', 'alpine']);
});

test('Docker refuses unsupported flags and Shell semantics rather than silently dropping them', async () => {
  for (const command of ['docker run --rm alpine', 'docker run -e VALUE=$HOME alpine', 'docker run alpine; whoami', 'docker run alpine | cat', 'docker run -p', 'docker run --name "oops', 'docker run -v ~/data:/data alpine']) await assert.rejects(dockerToCompose(command));
  const protectedKeys = parse((await dockerToCompose('docker run -v constructor:/data --network __proto__ alpine')).yaml);
  assert.equal(protectedKeys.volumes.constructor.external, true);
  assert.equal(protectedKeys.networks.__proto__.external, true);
});

test('certificate parsing agrees with Node on PEM, DER, SAN, dates and fingerprint', async () => {
  const pem = readFileSync(new URL('./fixtures/toolbox-certificate.pem', import.meta.url), 'utf8');
  const reference = new X509Certificate(pem);
  const [result] = await parseCertificates(pem, 0);
  assert.match(result.subject, /wiki.example/);
  assert.match(result.san, /dns: example.com/); assert.match(result.san, /ip: 192.0.2.1/);
  assert.equal(result.fingerprint, reference.fingerprint256);
  assert.equal(result.notAfter, new Date(reference.validTo).toISOString());
  assert.equal(result.status, '尚未生效');
  const [der] = await parseCertificates(reference.raw, Date.now());
  assert.equal(der.fingerprint, result.fingerprint);
  assert.equal((await parseCertificates(pem + '\n' + pem)).length, 2);
  await assert.rejects(parseCertificates('-----BEGIN PRIVATE KEY-----abc'), /不是私钥/);
  await assert.rejects(parseCertificates('not a certificate'));
});

test('IP calculations cover IPv6 /0, endpoints, normalized networks and exact ranges', () => {
  const v6 = describeNetwork('2001:db8::abcd/64');
  assert.equal(v6.cidr, '2001:db8::/64');
  assert.equal(v6.last, '2001:db8::ffff:ffff:ffff:ffff');
  assert.equal(v6.total, '18446744073709551616');
  assert.equal(v6.broadcast, '不适用');
  assert.equal(describeNetwork('::/0').total, (1n << 128n).toString());
  assert.deepEqual(rangeToCidrs('0.0.0.0', '255.255.255.255'), ['0.0.0.0/0']);
  assert.deepEqual(rangeToCidrs('192.168.1.1', '192.168.1.6'), ['192.168.1.1/32', '192.168.1.2/31', '192.168.1.4/31', '192.168.1.6/32']);
  assert.deepEqual(rangeToCidrs('2001:db8::', '2001:db8::ffff'), ['2001:db8::/112']);
  assert.equal(compareNetworks('10.0.0.0/8', '10.1.2.3').contains, true);
  assert.equal(compareNetworks('10.0.0.0/8', '11.0.0.0/8').overlaps, false);
  assert.equal(compareNetworks('2001:db8::/32', '2001:db8:1234::/48').contains, true);
  assert.equal(compareNetworks('10.0.0.0/8', '::1').overlaps, false);
  for (const value of ['10.1/8', '010.1.2.3/8', '256.1.2.3/8', '::/129', 'fe80::1%en0/64']) assert.throws(() => describeNetwork(value));
  assert.throws(() => rangeToCidrs('192.0.2.2', '192.0.2.1'));
});

test('Cron builder respects ranges and generates deterministic expressions', () => {
  assert.equal(buildCron({frequency: 'weekly', hour: '9', minute: '15', weekdays: ['5','1','1']}), '15 9 * * 1,5');
  assert.equal(buildCron({frequency: 'minutes', interval: '7'}), '*/7 * * * *');
  assert.equal(buildCron({frequency: 'monthly', day: '31', hour: '2', minute: '0'}), '0 2 31 * *');
  assert.throws(() => buildCron({frequency: 'weekly', weekdays: []}));
  assert.throws(() => buildCron({frequency: 'minutes', interval: '60'}));
});

test('Wi-Fi QR payload escapes reserved characters and generated QR round-trips', async () => {
  const text = wifiPayload({ssid: 'Wiki;Guest', password: 'a:b\\c"', security: 'WPA'});
  assert.equal(text, 'WIFI:T:WPA;S:Wiki\\;Guest;P:a\\:b\\\\c\\";H:false;;');
  assert.equal(wifiPayload({ssid: 'Public', security: 'nopass', password: 'ignored'}), 'WIFI:T:nopass;S:Public;P:;H:false;;');
  const QRCode = await import('qrcode');
  const {PNG} = await import('pngjs');
  const {default: jsQR} = await import('jsqr');
  const png = PNG.sync.read(await QRCode.toBuffer(text, {width: 360, margin: 4}));
  assert.equal(jsQR(new Uint8ClampedArray(png.data), png.width, png.height).data, text);
});

test('file hashes stream chunks, support empty files, progress and cancellation', async () => {
  const content = Buffer.alloc(5 * 1024 * 1024 + 17, 'x');
  const progress = [];
  const result = await hashFile(new Blob([content]), 'sha256', n => progress.push(n));
  assert.equal(result, createHash('sha256').update(content).digest('hex'));
  assert.ok(progress.length >= 3); assert.equal(progress.at(-1), 100);
  assert.equal(await hashFile(new Blob([]), 'md5'), createHash('md5').digest('hex'));
  const controller = new AbortController(); controller.abort();
  await assert.rejects(hashFile(new Blob(['abc']), 'sha256', () => {}, controller.signal), /取消/);
});

test('public queries validate destinations and omit credentials and referrer', async () => {
  assert.equal(dnsName(' 例子.测试. '), 'xn--fsqu00a.xn--0zwm56d');
  assert.equal(dnsName('_acme-challenge.example.com'), '_acme-challenge.example.com');
  for (const v of ['https://example.com', 'example.com/path', 'example.com:443', 'a@b.com', '-bad.example']) assert.throws(() => dnsName(v));
  let called;
  const fetcher = async (url, options) => { called = {url, options}; return {ok: true, json: async () => ({Status: 0, Answer: [{name:'example.com.',type:1,TTL:60,data:'192.0.2.1'}]})}; };
  const data = await queryDns('example.com', 'A', 'cloudflare', fetcher);
  assert.equal(data.Status, 0); assert.match(called.url, /^https:\/\/cloudflare-dns.com\/dns-query\?/);
  assert.equal(called.options.credentials, 'omit'); assert.equal(called.options.referrerPolicy, 'no-referrer');
  assert.equal(await queryPublicIp('ipv4', async url => ({ok:true,json:async () => ({ip:'192.0.2.1'})})), '192.0.2.1');
  await assert.rejects(queryDns('example.com', 'ANY', 'google', fetcher));
  await assert.rejects(queryDns('example.com', 'A', 'google', async () => ({ok:false,status:429})), /429/);
  await assert.rejects(queryDns('example.com', 'A', 'google', async () => { throw new TypeError('Failed to fetch'); }), /跨域/);
  await assert.rejects(queryPublicIp('ipv6', async () => ({ok:true,json:async () => ({ip:'bad'})})));
});
