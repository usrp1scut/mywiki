// Shared worker; discard failed requests so retry never requires a page reload.
export function createSearchClient(createWorker, timeoutMs = 30000) {
  let worker;
  let sequence = 0;
  const pending = new Map();
  function reset(error) {
    worker?.terminate();
    worker = undefined;
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(error);
    }
    pending.clear();
  }
  return function search(query, baseUrl) {
    if (!query.trim()) return Promise.resolve({items: [], limited: false});
    return new Promise((resolve, reject) => {
      try {
        if (!worker) {
          worker = createWorker();
          worker.onmessage = ({data}) => {
            const request = pending.get(data.id);
            if (!request) return;
            clearTimeout(request.timer);
            pending.delete(data.id);
            if (data.error) request.reject(new Error(data.error));
            else request.resolve(data.result);
          };
          worker.onerror = () => reset(new Error('搜索服务加载失败'));
          worker.onmessageerror = () => reset(new Error('搜索结果无法读取'));
        }
        const id = ++sequence;
        const timer = setTimeout(() => reset(new Error('搜索加载超时')), timeoutMs);
        pending.set(id, {resolve, reject, timer});
        worker.postMessage({id, query, baseUrl});
      } catch (error) {
        reset(error);
        reject(error);
      }
    });
  };
}

const workerSearch = createSearchClient(() => new Worker(new URL('./search.worker.js', import.meta.url)));
export async function searchSite(query, baseUrl) {
  if (typeof Worker === 'undefined') {
    const {search} = await import('./engine.js');
    return search(query, baseUrl);
  }
  return workerSearch(query, baseUrl);
}
