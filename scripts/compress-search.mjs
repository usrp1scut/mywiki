import {readdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {gzipSync, gunzipSync} from 'node:zlib';

const output = process.argv[2] || 'build';
let count = 0;
async function compress(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await compress(path);
    else if (/^search-index.*\.json$/.test(entry.name)) {
      const source = await readFile(path);
      const compressed = gzipSync(source, {level: 9});
      if (!gunzipSync(compressed).equals(source)) throw new Error(`Index integrity check failed: ${path}`);
      await writeFile(`${path}.gz`, compressed);
      count++;
      console.log(`${path}: ${source.length} → ${compressed.length} bytes`);
    }
  }
}
await compress(output);
if (!count) throw new Error('No search index was generated');
