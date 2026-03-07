import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, 'docs');
const write = process.argv.includes('--write');

function walkMarkdown(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  const stack = [dir];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (/\.mdx?$/i.test(entry.name)) {
        files.push(full);
      }
    }
  }

  return files;
}

function toggleFenceState(trimmed, inFence, fenceChar) {
  if (!inFence) {
    const open = trimmed.match(/^(```+|~~~+)/);
    if (open) {
      return {inFence: true, fenceChar: open[1][0]};
    }
    return {inFence, fenceChar};
  }

  if (trimmed.startsWith(fenceChar.repeat(3))) {
    return {inFence: false, fenceChar: ''};
  }

  return {inFence, fenceChar};
}

function normalizeMarkdown(text) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = src.split('\n');

  const pass1 = [];
  let inFrontmatter = lines[0]?.trim() === '---';
  let inFence = false;
  let fenceChar = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    if (!inFence && !inFrontmatter) {
      line = line.replace(/[ \t]+$/g, '');
      line = line.replace(/^(#{1,6})([^#\s])/, '$1 $2');
      line = line.replace(/^(\s*)\*\s+/, '$1- ');
    }

    pass1.push(line);

    if (inFrontmatter) {
      if (i > 0 && trimmed === '---') {
        inFrontmatter = false;
      }
      continue;
    }

    const nextFence = toggleFenceState(trimmed, inFence, fenceChar);
    inFence = nextFence.inFence;
    fenceChar = nextFence.fenceChar;
  }

  const pass2 = [];
  inFrontmatter = pass1[0]?.trim() === '---';
  inFence = false;
  fenceChar = '';
  let blankOutside = 0;

  for (let i = 0; i < pass1.length; i++) {
    const line = pass1[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      if (inFrontmatter || inFence) {
        pass2.push('');
      } else if (blankOutside === 0) {
        pass2.push('');
        blankOutside = 1;
      }
    } else {
      pass2.push(line);
      if (!inFrontmatter && !inFence) {
        blankOutside = 0;
      }
    }

    if (inFrontmatter) {
      if (i > 0 && trimmed === '---') {
        inFrontmatter = false;
      }
      continue;
    }

    const nextFence = toggleFenceState(trimmed, inFence, fenceChar);
    inFence = nextFence.inFence;
    fenceChar = nextFence.fenceChar;
  }

  const pass3 = [];
  inFrontmatter = pass2[0]?.trim() === '---';
  inFence = false;
  fenceChar = '';

  for (let i = 0; i < pass2.length; i++) {
    const line = pass2[i];
    const trimmed = line.trim();
    const isHeading = /^#{1,6}\s+\S/.test(line);

    if (!inFrontmatter && !inFence && isHeading && pass3.length > 0 && pass3[pass3.length - 1].trim() !== '') {
      pass3.push('');
    }

    pass3.push(line);

    if (!inFrontmatter && !inFence && isHeading) {
      const next = pass2[i + 1];
      if (next !== undefined && next.trim() !== '' && !/^(```|~~~)/.test(next.trim())) {
        pass3.push('');
      }
    }

    if (inFrontmatter) {
      if (i > 0 && trimmed === '---') {
        inFrontmatter = false;
      }
      continue;
    }

    const nextFence = toggleFenceState(trimmed, inFence, fenceChar);
    inFence = nextFence.inFence;
    fenceChar = nextFence.fenceChar;
  }

  let output = pass3.join('\n').replace(/\n+$/g, '\n');
  if (eol === '\r\n') {
    output = output.replace(/\n/g, '\r\n');
  }

  return output;
}

function stripNumberPrefix(name) {
  return name.replace(/^\d+[\-_]/, '');
}

function inferDisplayName(filePath) {
  return stripNumberPrefix(path.basename(filePath, path.extname(filePath)));
}

function escapeMarkdownLinkText(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function encodeDocRoute(relPosixPath) {
  const withoutExt = relPosixPath.replace(/\.mdx?$/i, '');
  const encoded = withoutExt
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `./${encoded}`;
}

function makeMiscIndex(docsDir) {
  const miscDirName = '\u5176\u4ed6';
  const indexName = '00-\u96f6\u6563\u6587\u6863\u7d22\u5f15.md';
  const miscDir = path.join(docsDir, miscDirName);
  const indexPath = path.join(miscDir, indexName);

  if (!fs.existsSync(miscDir)) {
    return {indexPath, content: null};
  }

  const all = walkMarkdown(miscDir)
    .filter((f) => path.resolve(f) !== path.resolve(indexPath))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

  const defaultGroup = '\u96f6\u6563\u6761\u76ee';
  const groups = new Map();

  for (const file of all) {
    const rel = path.relative(miscDir, file);
    const relPosix = toPosix(rel);
    const dir = path.posix.dirname(relPosix);
    const group = dir === '.' ? defaultGroup : dir;

    if (!groups.has(group)) {
      groups.set(group, []);
    }

    groups.get(group).push({
      name: escapeMarkdownLinkText(inferDisplayName(file)),
      route: encodeDocRoute(relPosix),
    });
  }

  const groupNames = Array.from(groups.keys()).sort((a, b) => {
    if (a === defaultGroup) return -1;
    if (b === defaultGroup) return 1;
    return a.localeCompare(b, 'zh-CN');
  });

  const lines = [
    '---',
    'title: \u5176\u4ed6\u5206\u7c7b\u7d22\u5f15',
    'description: \u5f52\u6863 docs/\u5176\u4ed6 \u4e0b\u7684\u96f6\u6563\u6587\u6863\u5165\u53e3\uff0c\u539f\u6587\u8def\u5f84\u4fdd\u6301\u4e0d\u53d8\u3002',
    'tags:',
    '  - \u7d22\u5f15',
    '  - \u5bfc\u822a',
    '  - \u6574\u7406',
    '---',
    '',
    '# \u5176\u4ed6\u5206\u7c7b\u7d22\u5f15',
    '',
    '> \u8bf4\u660e\uff1a\u672c\u9875\u805a\u5408 `docs/\u5176\u4ed6` \u4e0b\u7684\u6587\u6863\u5165\u53e3\uff0c\u4e0d\u4f1a\u79fb\u52a8\u6216\u6539\u540d\u539f\u6587\u4ef6\u3002',
    '',
  ];

  for (const group of groupNames) {
    lines.push(`## ${group}`);
    lines.push('');
    const items = groups.get(group) || [];
    for (const item of items) {
      lines.push(`- [${item.name}](${item.route})`);
    }
    lines.push('');
  }

  return {indexPath, content: lines.join('\n').replace(/\n+$/g, '\n')};
}

const files = walkMarkdown(docsRoot);
let changed = 0;
const changedFiles = [];

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = normalizeMarkdown(before);
  if (after !== before) {
    changed += 1;
    changedFiles.push(path.relative(repoRoot, file));
    if (write) {
      fs.writeFileSync(file, after, 'utf8');
    }
  }
}

const misc = makeMiscIndex(docsRoot);
let indexChanged = false;

if (misc.content) {
  const before = fs.existsSync(misc.indexPath) ? fs.readFileSync(misc.indexPath, 'utf8') : '';
  if (before !== misc.content) {
    indexChanged = true;
    if (write) {
      fs.writeFileSync(misc.indexPath, misc.content, 'utf8');
    }
  }
}

console.log(JSON.stringify({
  totalFiles: files.length,
  changedFiles: changed,
  indexChanged,
  write,
}, null, 2));

if (!write && changedFiles.length > 0) {
  console.log('SAMPLE_CHANGES');
  for (const file of changedFiles.slice(0, 20)) {
    console.log(file);
  }
}

