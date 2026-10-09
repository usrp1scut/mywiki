// Decode a precompressed build asset in the worker. Static hosts need no special
// Content-Encoding configuration; older browsers retain the raw JSON fallback.
export async function loadSearchIndex(url, fetcher = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    if (typeof DecompressionStream !== 'undefined') {
      const compressedUrl = new URL(url);
      compressedUrl.pathname += '.gz';
      const response = await fetcher(compressedUrl, {signal: controller.signal});
      if (response.ok) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        // A host may already have decoded Content-Encoding: gzip.
        if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
          return await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json();
        }
        return JSON.parse(new TextDecoder().decode(bytes));
      }
      if (response.status !== 404) throw new Error('搜索索引暂时无法加载');
    }
    const response = await fetcher(url, {signal: controller.signal});
    if (!response.ok) throw new Error('搜索索引暂时无法加载');
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
