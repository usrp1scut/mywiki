"""Offline regression tests for auto-publishing only a complete, licensed book."""
import contextlib
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('life_sync', ROOT / 'scripts/sync-life-guide.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


def blob(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def tree_for(sources):
    return {'tree': [{'path': p, 'type': 'blob', 'mode': '100644', 'size': len(data), 'sha': blob(data)}
                     for p, data in sources.items()]}


def chapter(number, text='原有风险提示：只适用于原文地区，可能过时。'):
    return f'[← 回总目录](../README.md)\n\n# {number}. 测试章节\n\n### 1. 第一条\n\n{text}\n'.encode()


class LifeSyncTests(unittest.TestCase):
    def setUp(self):
        self.sources = {'LICENSE': b'CC BY 4.0 test fixture', 'LICENSE-CODE': b'MIT test fixture',
                        'README.md': '## 许可\n\nCC BY 4.0 正文；MIT 代码。\n\n## 广告位\n不会导入\n'.encode(),
                        'book/01-测试.md': chapter(1)}
        self.current = {'repository': 'https://github.com/eternity4719/HowToLiveBetter',
                        'commit': 'a' * 40, 'imported_on': '2026-10-15',
                        'upstream_committed_at': '2026-10-15T00:00:00Z',
                        'sources': [{'path': p, 'git_blob_sha': blob(data), 'bytes': len(data),
                                     'sha256': sync.IMPORTER.digest(data)} for p, data in self.sources.items()]}
        self.policy = {'license_sha256': {p: sync.IMPORTER.digest(self.sources[p]) for p in ('LICENSE', 'LICENSE-CODE')},
                       'readme_license_sha256': sync.IMPORTER.digest(sync.license_section(self.sources['README.md'].decode()))}
        self.commit = {'sha': 'b' * 40, 'commit': {'committer': {'date': '2026-10-16T00:00:00Z'}}}

    def update(self, sources=None, tree=None):
        sources = sources or self.sources
        return sync.prepare_update(self.current, self.commit, tree or tree_for(sources),
                                   sources.__getitem__, self.policy, '2026-10-16')

    def test_code_only_commit_does_not_download_or_republish(self):
        tree = tree_for(self.sources)
        tree['tree'].append({'path': 'skills/evil.py', 'type': 'blob', 'mode': '100755', 'sha': 'c' * 40})
        with patch.object(sync, 'download', side_effect=AssertionError('must not fetch code')):
            result = sync.prepare_update(self.current, self.commit, tree,
                                         lambda _: self.fail('unchanged files need no fetch'), self.policy, '2026-10-16')
        self.assertIsNone(result)

    def test_added_chapter_updates_counts_navigation_version_and_keeps_warning(self):
        self.sources['book/02-新增.md'] = chapter(2, '见第 1 节第 1 条。原有风险提示：可能过时。')
        _, generated, report = self.update()
        self.assertEqual((report['total_chapters'], report['total_entries']), (2, 2))
        self.assertEqual(report['total_linked_references'], 1)
        self.assertIn('原有风险提示：可能过时。', generated['life/chapters/02-新增.md'].decode())
        overview = generated['life/高性价比人生指南.md'].decode()
        self.assertIn('./chapters/02-新增.md', overview)
        self.assertIn('2 章、2 条', overview)
        self.assertIn('bbbbbbb', overview)
        self.assertIn('2026-10-16', overview)
        self.assertNotIn('不会导入', overview)

    def test_partial_or_corrupted_download_is_rejected(self):
        expected = copy.deepcopy(self.sources)
        expected['book/01-测试.md'] += b'update'
        with self.assertRaisesRegex(AssertionError, 'Truncated download'):
            self.update(tree=tree_for(expected))
        corrupt = dict(expected)
        corrupt['book/01-测试.md'] = corrupt['book/01-测试.md'][:-1] + b'x'
        with self.assertRaisesRegex(AssertionError, 'Git blob mismatch'):
            self.update(corrupt, tree_for(expected))

    def test_content_code_or_readme_license_change_requires_review(self):
        for name in ('LICENSE', 'LICENSE-CODE', 'README.md'):
            with self.subTest(name=name):
                changed = dict(self.sources)
                changed[name] = changed[name].replace(b'CC BY 4.0', b'All rights reserved').replace(b'MIT', b'Proprietary')
                with self.assertRaisesRegex(AssertionError, 'review required'):
                    self.update(changed)

    def test_chapter_removal_or_rename_is_rejected(self):
        changed = dict(self.sources)
        changed['book/01-重命名.md'] = changed.pop('book/01-测试.md')
        with self.assertRaisesRegex(AssertionError, 'removed/renamed'):
            self.update(changed)

    def test_incomplete_tree_unsafe_paths_and_symlinks_are_rejected(self):
        tree = tree_for(self.sources)
        tree['truncated'] = True
        with self.assertRaisesRegex(AssertionError, 'Incomplete'):
            self.update(tree=tree)
        for name, mode in [('book/02-../../escape.md', '100644'), ('book/02-link.md', '120000')]:
            tree = tree_for(self.sources)
            tree['tree'].append({'path': name, 'mode': mode, 'type': 'blob', 'sha': 'c' * 40, 'size': 5})
            with self.subTest(name=name), self.assertRaises(AssertionError):
                self.update(tree=tree)

    def test_ad_or_executable_markup_is_not_published(self):
        for content in ['## 广告位\n广告文本', '<script>alert(1)</script>', '[点击](javascript:alert(1))', '![推广](../ads/banner.png)']:
            changed = dict(self.sources)
            changed['book/01-测试.md'] = chapter(1, content)
            with self.subTest(content=content), self.assertRaises(AssertionError):
                self.update(changed)

    def test_broken_book_reference_stops_update(self):
        self.sources['book/01-测试.md'] = chapter(1, '见第 99 节第 1 条')
        with self.assertRaisesRegex(AssertionError, 'Unresolved'):
            self.update()

    def test_missing_entry_or_duplicate_chapter_number_is_rejected(self):
        self.sources['book/01-测试.md'] = chapter(1).replace('### 1.'.encode(), '### 2.'.encode())
        with self.assertRaises(AssertionError):
            self.update()
        self.sources['book/01-测试.md'] = chapter(1)
        self.sources['book/01-重复.md'] = chapter(1)
        with self.assertRaisesRegex(AssertionError, 'Duplicate'):
            self.update()

    def test_modified_wiki_text_fails_reproducibility_check(self):
        self.sources['book/01-测试.md'] = chapter(1, '修正后的风险提示。')
        _, generated, _ = self.update()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            sync.IMPORTER.write_generated(generated, root)
            sync.IMPORTER.write_generated(generated, root, check=True)
            (root / 'life/chapters/01-测试.md').write_text('unexpected local edit')
            with self.assertRaisesRegex(AssertionError, 'differs'):
                sync.IMPORTER.write_generated(generated, root, check=True)

    def test_same_commit_is_a_noop_with_github_output(self):
        meta = json.loads((ROOT / 'life/_meta/upstream.json').read_text())
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / 'output'
            with patch.object(sync, 'api', return_value={'sha': meta['commit']}), \
                    patch('sys.argv', ['sync', '--source-dir', str(Path(tmp) / 'sources')]), \
                    patch.dict('os.environ', {'GITHUB_OUTPUT': str(output)}), contextlib.redirect_stdout(io.StringIO()):
                sync.main()
            self.assertIn('changed=false', output.read_text())
            self.assertFalse((Path(tmp) / 'sources').exists())


if __name__ == '__main__':
    unittest.main()
