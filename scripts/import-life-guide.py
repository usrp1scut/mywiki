#!/usr/bin/env python3
"""Import only the pinned book text and content license, never upstream code.

python3 scripts/import-life-guide.py --source-dir /tmp/howtolivebetter --fetch
python3 scripts/import-life-guide.py --source-dir /tmp/howtolivebetter --check

The manifest pins every input. --fetch only downloads this allowlist; --check
compares regenerated chapters, attribution, navigation targets and license bytes.
"""

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
META = json.loads((ROOT / 'life/_meta/upstream.json').read_text())
COMMIT = META['commit']
REPO = META['repository']
ENTRY = re.compile(r'^(###\s+)(\d+)(\. .+)$', re.M)
NUMBERS = r'\d+(?:\s*[、，,和及至到—–-]\s*\d+)*'
REFERENCE = re.compile(
    rf'第\s*(?P<chapter>\d+)\s*节(?:第\s*(?P<entries>{NUMBERS})\s*条)?'
    rf'|(?P<local>(?:见(?:本节)?|本节))第\s*(?P<local_entries>{NUMBERS})\s*条'
)
# Do not rewrite citations, existing links, code, or HTML comments.
PROTECTED = re.compile(r'<!--.*?-->|`[^`\n]*`|!?\[[^\]\n]*\]\([^\n]*?\)|<https?://[^>]+>', re.S)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_sources(directory, fetch):
    sources = {}
    for item in META['sources']:
        name = item['path']
        assert name in ('README.md', 'LICENSE', 'LICENSE-CODE') or re.fullmatch(r'book/\d{2}-[^/]+\.md', name), name
        path = directory / name
        if fetch:
            url = f'https://raw.githubusercontent.com/eternity4719/HowToLiveBetter/{COMMIT}/{quote(name)}'
            data = urlopen(url, timeout=45).read()
        else:
            data = path.read_bytes()
        assert len(data) == item['bytes'] and digest(data) == item['sha256'], f'Source mismatch: {name}'
        assert hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest() == item['git_blob_sha'], name
        if fetch:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        sources[name] = data
    return sources


def render_chapter(name, source, chapters):
    number = int(name.split('/')[1][:2])
    title = re.search(r'^# (.+)$', source, re.M).group(1)
    entry_numbers = [int(m.group(2)) for m in ENTRY.finditer(source)]
    assert entry_numbers == list(range(1, len(entry_numbers) + 1)), name
    # Reject executable HTML, unexpected images or ad sections instead of silently
    # deleting text that could be part of the original advice or a risk warning.
    assert not re.search(r'<\/?[a-zA-Z][\w-]*(?=[\s/>])|!\[|javascript:', source), name
    assert not re.search(r'^#+.*(?:广告位|赞赏|赞助位|推广位)', source, re.M), name
    assert source.count('```') == 0 and source.count('~~~') == 0, name
    references = []
    unresolved = []

    def link(match):
        text = match.group(0)
        target = int(match.group('chapter') or number)
        entries = match.group('entries') or match.group('local_entries')
        nums = [int(n) for n in re.findall(r'\d+', entries)] if entries else []
        if target not in chapters or any(n not in chapters[target]['entries'] for n in nums):
            unresolved.append(text)
            return text
        filename = Path(chapters[target]['source']).name
        base = '' if target == number else f'./{filename}'
        if not nums:
            url = f'./{filename}'
            references.append(url)
            return f'[{text}]({url})'
        if len(nums) == 1:
            url = f'{base}#entry-{nums[0]}'
            references.append(url)
            return f'[{text}]({url})'
        # Preserve the visible text of multi-entry and range references, linking
        # each printed endpoint/number. Never guess unprinted chapter numbers.
        start, end = match.span('entries' if match.group('entries') else 'local_entries')
        start -= match.start()
        end -= match.start()

        def entry_link(item):
            url = f'{base}#entry-{int(item.group())}'
            references.append(url)
            return f'[{item.group()}]({url})'

        return text[:start] + re.sub(r'\d+', entry_link, entries) + text[end:]

    def link_plain(text):
        # Source lines may quote numbered legal provisions rather than book items.
        return ''.join(line if line.startswith('- 来源：') else REFERENCE.sub(link, line)
                       for line in text.splitlines(keepends=True))

    # Keep exact punctuation, whitespace, statements, comments and citation URLs.
    parts = []
    offset = 0
    for match in PROTECTED.finditer(source):
        parts.extend((link_plain(source[offset:match.start()]), match.group()))
        offset = match.end()
    parts.append(link_plain(source[offset:]))
    body = ''.join(parts)
    body = ENTRY.sub(lambda m: f'{m.group(1)}{m.group(2)}{m.group(3)} {{#entry-{m.group(2)}}}', body)
    externalized = []

    def local_url(match):
        label, url = match.groups()
        if url == '../README.md':
            return f'[{label}](../高性价比人生指南.md)'
        if url == '../LICENSE':
            return f'[{label}](/life/LICENSE-CC-BY-4.0.txt)'
        # Supplementary essays and the MIT code license are intentionally external.
        assert url == '../LICENSE-CODE' or url.startswith('../docs/'), url
        target = f'{REPO}/blob/{COMMIT}/{url[3:]}'
        externalized.append(target)
        return f'[{label}（上游外链）]({target})'

    body = re.sub(r'\[([^\]\n]+)\]\((\.\./[^)\n]+)\)', local_url, body)
    # Independently undo only the permitted presentation/link edits. This proves
    # that every original sentence, warning and citation survives the import.
    def undo_link(match):
        label, url = match.groups()
        if re.fullmatch(r'(?:\./\d{2}-[^/]+\.md)?#entry-\d+', url) or re.fullmatch(r'\./\d{2}-[^/]+\.md', url):
            return label
        if url == '../高性价比人生指南.md':
            return f'[{label}](../README.md)'
        if url == '/life/LICENSE-CC-BY-4.0.txt':
            return f'[{label}](../LICENSE)'
        if url in externalized:
            assert label.endswith('（上游外链）')
            return f'[{label[:-6]}](../{url.split(f"/blob/{COMMIT}/", 1)[1]})'
        return match.group()

    restored = re.sub(r'\[([^\]\n]+)\]\(([^)\n]+)\)', undo_link, body)
    restored = re.sub(r' \{#entry-\d+\}(?=\n|$)', '', restored)
    assert restored == source, f'Original text was altered: {name}'
    transformed_hash = digest(body.encode())
    notice = (
        '\n<!-- wiki-attribution:start -->\n'
        f'> 原作：eternity4719 及项目贡献者《高性价比人生指南》；[本章上游原文（外链）]({REPO}/blob/{COMMIT}/{name})。'
        '内容许可：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。\n>\n'
        f'> 导入：{META["imported_on"]}（Asia/Shanghai）；版本：`{COMMIT[:7]}`。'
        '本站仅增加署名、导航及条目锚点，并转换站内交叉引用；[完整版本与改动说明](../收录说明.md)。\n>\n'
        '> 原文可能有错或过时；法律、医保、社保等制度内容主要适用中国大陆，各地执行可能不同。'
        '医疗、法律、财务及境外政策内容须核对原文条件和最新资料；本站收录不构成专业建议或背书。\n'
        '<!-- wiki-attribution:end -->\n'
    )
    body = body.replace(f'# {title}\n', f'# {title}\n{notice}', 1)
    sidebar_label = f'{number:02} · {title.split(". ", 1)[1]}'
    description = f'《高性价比人生指南》第 {number} 章全文。作者 eternity4719 及项目贡献者，CC BY 4.0；固定版本 {COMMIT[:7]}，保留原文来源与风险提示。'
    front = (
        '---\n'
        f'id: chapter-{number:02}\n'
        f'title: {json.dumps(title, ensure_ascii=False)}\n'
        f'sidebar_label: {json.dumps(sidebar_label, ensure_ascii=False)}\n'
        f'slug: /{number:02}\n'
        f'description: {json.dumps(description, ensure_ascii=False)}\n'
        'mdx:\n  format: md\n'
        f'last_update:\n  date: {META["imported_on"]}\n  author: eternity4719 及项目贡献者（本站收录）\n'
        '---\n\n'
    )
    report = {'source': name, 'destination': f'life/chapters/{Path(name).name}',
              'source_sha256': digest(source.encode()), 'transformed_body_sha256': transformed_hash,
              'chapter_entries': len(entry_numbers), 'linked_references': len(references),
              'externalized_links': externalized, 'unresolved_references': unresolved,
              'removed_ad_blocks': 0}
    return (front + body).encode(), report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', required=True, type=Path)
    parser.add_argument('--fetch', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    sources = read_sources(args.source_dir, args.fetch)
    books = {p: data.decode() for p, data in sources.items() if p.startswith('book/')}
    assert len(books) == 34
    chapters = {int(Path(p).name[:2]): {'source': p, 'entries': {int(m.group(2)) for m in ENTRY.finditer(s)}}
                for p, s in books.items()}
    assert set(chapters) == set(range(1, 35))
    generated = {}
    reports = []
    for name, source in sorted(books.items()):
        data, report = render_chapter(name, source, chapters)
        generated[report['destination']] = data
        reports.append(report)
    report = {'commit': COMMIT, 'imported_on': META['imported_on'], 'chapters': reports,
              'total_chapters': len(reports), 'total_entries': sum(r['chapter_entries'] for r in reports),
              'total_linked_references': sum(r['linked_references'] for r in reports),
              'ads_policy': 'Only book/*.md imported; no advertising blocks found in these 34 sources. README promotions, ads/, code, skills and downloads excluded.'}
    assert report['total_entries'] == 765
    generated['life/_meta/import-report.json'] = (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode()
    generated['static/life/LICENSE-CC-BY-4.0.txt'] = sources['LICENSE']
    for name, data in generated.items():
        path = ROOT / name
        if args.check:
            assert path.read_bytes() == data, f'Imported file differs: {name}'
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
    actual = {str(p.relative_to(ROOT)) for p in (ROOT / 'life/chapters').glob('*.md')}
    assert actual == {r['destination'] for r in reports}, 'Unexpected/missing chapter file'
    unresolved = [(r['source'], ref) for r in reports for ref in r['unresolved_references']]
    print(json.dumps({'mode': 'check' if args.check else 'import', 'chapters': 34,
                      'entries': 765, 'linked_references': report['total_linked_references'],
                      'unresolved_references': unresolved}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
