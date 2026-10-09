import test from 'node:test';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import {createSearchClient} from '../src/search/client.mjs';
import {loadSearchIndex} from '../src/search/load-index.mjs';

const url = new URL('https://wiki.example/search-index.json?_=version');
const index = [{documents: [{t: '中文与 nginx'}], index: {invertedIndex: []}}];

test('compressed index round-trips all Unicode content and retains cache version', async () => {
  const result = await loadSearchIndex(url, async (requested) => {
    assert.equal(requested.href, 'https://wiki.example/search-index.json.gz?_=version');
    return new Response(gzipSync(JSON.stringify(index)));
  });
  assert.deepEqual(result, index);
});

test('hosts that decode Content-Encoding do not trigger double decompression', async () => {
  assert.deepEqual(await loadSearchIndex(url, async () => Response.json(index)), index);
});

test('missing compressed assets fall back to raw JSON during deployment', async () => {
  const requests = [];
  const result = await loadSearchIndex(url, async (requested) => {
    requests.push(requested.href);
    return requests.length === 1 ? new Response('', {status: 404}) : Response.json(index);
  });
  assert.deepEqual(result, index);
  assert.equal(requests[1], url.href);
});

test('failed requests can be retried after the connection recovers', async () => {
  await assert.rejects(loadSearchIndex(url, async () => { throw new TypeError('Offline'); }));
  assert.deepEqual(await loadSearchIndex(url, async () => Response.json(index)), index);
});

test('HTTP errors are rejected rather than interpreted as an empty index', async () => {
  await assert.rejects(loadSearchIndex(url, async () => new Response('Unavailable', {status: 503})));
});

function workerFactory() {
  const workers = [];
  const create = () => {
    const worker = {messages: [], terminated: false,
      postMessage(message) { this.messages.push(message); },
      terminate() { this.terminated = true; },
      respond(message, data) { this.onmessage({data: {id: message.id, ...data}}); },
    };
    workers.push(worker);
    return worker;
  };
  return {workers, create};
}

test('an empty query never starts a worker or downloads the index', async () => {
  const {workers, create} = workerFactory();
  assert.deepEqual(await createSearchClient(create)('  ', '/'), {items: [], limited: false});
  assert.equal(workers.length, 0);
});

test('concurrent navbar/page queries receive their own results even out of order', async () => {
  const {workers, create} = workerFactory();
  const search = createSearchClient(create);
  const first = search('nginx', '/');
  const second = search('变量', '/');
  workers[0].respond(workers[0].messages[1], {result: 'variables'});
  workers[0].respond(workers[0].messages[0], {result: 'nginx'});
  assert.deepEqual(await Promise.all([first, second]), ['nginx', 'variables']);
  assert.equal(workers.length, 1);
});

test('index failure is surfaced and a fresh attempt succeeds without reloading', async () => {
  const {workers, create} = workerFactory();
  const search = createSearchClient(create);
  const failed = search('nginx', '/');
  workers[0].respond(workers[0].messages[0], {error: 'Offline'});
  await assert.rejects(failed, /Offline/);
  const retry = search('nginx', '/');
  workers[0].respond(workers[0].messages[1], {result: 'found'});
  assert.equal(await retry, 'found');
});

test('a crashed worker is replaced on retry', async () => {
  const {workers, create} = workerFactory();
  const search = createSearchClient(create);
  const failed = search('nginx', '/');
  workers[0].onerror();
  await assert.rejects(failed);
  assert.equal(workers[0].terminated, true);
  const retry = search('nginx', '/');
  workers[1].respond(workers[1].messages[0], {result: 'recovered'});
  assert.equal(await retry, 'recovered');
});

test('timeouts release the loading state and permit a new worker', async () => {
  const {workers, create} = workerFactory();
  const search = createSearchClient(create, 10);
  await assert.rejects(search('nginx', '/'), /超时/);
  assert.equal(workers[0].terminated, true);
  const retry = search('nginx', '/');
  workers[1].respond(workers[1].messages[0], {result: 'recovered'});
  assert.equal(await retry, 'recovered');
});
