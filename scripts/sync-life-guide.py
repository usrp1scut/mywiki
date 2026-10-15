#!/usr/bin/env python3
"""Check the public upstream and import a verified snapshot using local code only."""

import argparse
from datetime import datetime
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
from urllib.parse import quote
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = 'eternity4719/HowToLiveBetter'
SPEC = importlib.util.spec_from_file_location('life_import', ROOT / 'scripts/import-life-guide.py')
IMPORTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(IMPORTER)


def download(url, api=False):
    headers = {'User-Agent': 'mywiki-life-guide-sync'}
    if api:
        headers['Accept'] = 'application/vnd.github+json'
        if os.environ.get('GH_TOKEN'):
            headers['Authorization'] = 'Bearer ' + os.environ['GH_TOKEN']
    with urlopen(Request(url, headers=headers), timeout=45) as response:
        data = response.read(12_000_001)
    assert len(data) <= 12_000_000, 'Unexpectedly large upstream response'
    return data


def api(path):
    return json.loads(download(f'https://api.github.com/repos/{UPSTREAM}/{path}', api=True))


def license_section(readme):
    match = re.search(r'^## 许可\s*\n(.*?)(?=^## |\Z)', readme, re.M | re.S)
    assert match, 'Upstream license declaration is missing'
    return match.group(1).strip().encode()


def source_list(tree):
    assert not tree.get('truncated'), 'Incomplete Git tree'
    selected = []
    for item in tree['tree']:
        name = item['path']
        if name in ('README.md', 'LICENSE', 'LICENSE-CODE') or (name.startswith('book/') and name.endswith('.md')):
            assert IMPORTER.allowed_source(name), f'Unsupported chapter path: {name}'
            assert item['type'] == 'blob' and item['mode'] == '100644', f'Unexpected file type: {name}'
            assert 0 < item['size'] <= 2_000_000, f'Unexpected file size: {name}'
            selected.append(item)
    assert sum(item['size'] for item in selected) <= 20_000_000, 'Unexpected import size'
    assert {'README.md', 'LICENSE', 'LICENSE-CODE'} <= {s['path'] for s in selected}
    assert any(s['path'].startswith('book/') for s in selected), 'No chapters'
    return sorted(selected, key=lambda item: item['path'])


def prepare_update(current, commit, tree, fetch, policy, imported_on):
    """Validate all downloaded data before any tracked wiki file is written."""
    sha = commit['sha']
    assert re.fullmatch(r'[0-9a-f]{40}', sha), 'Invalid commit'
    selected = source_list(tree)
    old_paths = {s['path'] for s in current['sources'] if s['path'].startswith('book/')}
    new_paths = {s['path'] for s in selected if s['path'].startswith('book/')}
    assert old_paths <= new_paths, 'Chapters removed/renamed: review old URLs before syncing'
    # Ignore changes to upstream scripts, skills, generated downloads, etc.
    if {s['path']: s['git_blob_sha'] for s in current['sources']} == {s['path']: s['sha'] for s in selected}:
        return None
    sources, records = {}, []
    for item in selected:
        name = item['path']
        data = fetch(name)
        assert len(data) == item['size'], f'Truncated download: {name}'
        git_sha = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        assert git_sha == item['sha'], f'Git blob mismatch: {name}'
        sources[name] = data
        records.append({'path': name, 'git_blob_sha': git_sha, 'bytes': len(data), 'sha256': IMPORTER.digest(data)})
    for name, expected in policy['license_sha256'].items():
        assert IMPORTER.digest(sources[name]) == expected, f'{name} changed: license review required'
    assert IMPORTER.digest(license_section(sources['README.md'].decode())) == policy['readme_license_sha256'], 'README licensing changed: review required'
    meta = dict(current, commit=sha, upstream_committed_at=commit['commit']['committer']['date'],
                imported_on=imported_on, sources=records)
    generated, report = IMPORTER.generate(sources, meta)
    generated['life/_meta/upstream.json'] = (json.dumps(meta, ensure_ascii=False, indent=2) + '\n').encode()
    return sources, generated, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', required=True, type=Path)
    parser.add_argument('--dry-run', action='store_true', help='Validate an update without changing wiki files')
    args = parser.parse_args()
    current = json.loads((ROOT / 'life/_meta/upstream.json').read_text())
    policy = json.loads((ROOT / 'scripts/life-guide/policy.json').read_text())
    commit = api('commits/HEAD')
    result = None
    if commit['sha'] != current['commit']:
        tree = api(f"git/trees/{commit['commit']['tree']['sha']}?recursive=1")
        result = prepare_update(current, commit, tree,
                                lambda name: download(f"https://raw.githubusercontent.com/{UPSTREAM}/{commit['sha']}/{quote(name)}"),
                                policy, datetime.now(ZoneInfo('Asia/Shanghai')).date().isoformat())
    if result:
        sources, generated, report = result
        if not args.dry_run:
            # These are only allowlisted text inputs, never executable upstream code.
            for name, data in sources.items():
                path = args.source_dir / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data)
            IMPORTER.write_generated(generated)
            IMPORTER.write_generated(generated, check=True)
    changed = result is not None
    print(json.dumps({'changed': changed, 'dry_run': args.dry_run, 'upstream_commit': commit['sha'],
                      'current_commit': current['commit']}, ensure_ascii=False))
    if os.environ.get('GITHUB_OUTPUT'):
        assert not args.dry_run, 'Dry run cannot report a deployable update'
        with open(os.environ['GITHUB_OUTPUT'], 'a') as output:
            output.write(f"changed={str(changed).lower()}\nupstream_sha={commit['sha']}\n")


if __name__ == '__main__':
    main()
