"""Use synthetic evidence to check the public tools' output boundaries."""
import gzip
import io
import json
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile
import unittest


TOOLS = Path(__file__).resolve().parents[1] / 'static/downloads/incident-analysis'


class IncidentAnalysisTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)

    def run_tool(self, name, *args, code=0):
        result = subprocess.run(
            [sys.executable, str(TOOLS / name), *map(str, args)],
            capture_output=True, text=True, timeout=10,
        )
        self.assertEqual(result.returncode, code, result.stderr)
        self.assertEqual(result.stderr, '')
        return json.loads(result.stdout), result.stdout

    def write_log(self, name, content):
        path = self.root / name
        if name.endswith('.gz'):
            with gzip.open(path, 'wt', encoding='utf-8') as stream:
                stream.write(content)
        else:
            path.write_text(content, encoding='utf-8')
        return path

    def assert_private_values_absent(self, output, *values):
        for value in values:
            self.assertNotIn(value, output)

    def test_nginx_omits_raw_fields_dates_and_unknown_methods(self):
        path = self.write_log('private-name.log',
            '192.0.2.1 - private-user [02/Jan/2000:08:00:00 +0800] '
            '"POST /api/query?token=PRIVATE_QUERY_VALUE HTTP/1.1" 200 20 '
            '"https://private.example/ref" "curl/PRIVATE_UA_VALUE"\n'
            '2001:db8::1 - - [02/Jan/2000:09:00:00 +0800] '
            '"PRIVATEMETHOD /PRIVATE_PATH HTTP/1.1" 403 - "-" "-"\n')
        result, raw = self.run_tool('nginx_summary.py', path)
        self.assertEqual(result['counts']['matched_lines'], 2)
        self.assertEqual(result['utc_hours'], {})
        self.assertFalse(result['absolute_times_included'])
        self.assertEqual(result['sources']['SOURCE_002']['method'], {'other': 1})
        self.assert_private_values_absent(raw, '192.0.2.1', '2001:db8::1', 'private-user',
            'PRIVATE_QUERY_VALUE', 'PRIVATE_UA_VALUE', 'private.example',
            'PRIVATEMETHOD', 'PRIVATE_PATH', '2000', str(path))

    def test_nginx_gzip_bounds_and_explicit_time_output(self):
        lines = ''.join(
            f'192.0.2.1 - - [02/Jan/2000:{hour}:00:00 +0800] '
            '"GET / HTTP/1.1" 200 0 "-" "-"\n'
            for hour in ('08', '09', '10'))
        path = self.write_log('access.log.gz', lines)
        result, _ = self.run_tool('nginx_summary.py', path,
            '--since', '2000-01-02T01:00:00Z', '--until', '2000-01-02T02:00:00Z',
            '--include-times')
        self.assertEqual(result['counts']['matched_lines'], 1)
        self.assertEqual(result['counts']['outside_window'], 2)
        self.assertEqual(result['utc_hours'], {'2000-01-02T01:00:00Z': 1})

    def test_nginx_malformed_and_missing_inputs_are_visible(self):
        path = self.write_log('bad.log', 'PRIVATE_INVALID_LINE\n')
        result, raw = self.run_tool('nginx_summary.py', path, self.root / 'private-missing', code=2)
        self.assertFalse(result['complete'])
        self.assertEqual(result['counts']['parse_failed'], 1)
        self.assertEqual(result['input_errors'][0]['input_number'], 2)
        self.assert_private_values_absent(raw, 'PRIVATE_INVALID_LINE', 'private-missing')

    def test_corrupt_gzip_does_not_report_completion(self):
        path = self.root / 'private-corrupt.gz'
        path.write_bytes(b'not gzip')
        for tool in ('nginx_summary.py', 'ssh_summary.py'):
            with self.subTest(tool=tool):
                result, raw = self.run_tool(tool, path, code=2)
                self.assertFalse(result['complete'])
                self.assert_private_values_absent(raw, 'private-corrupt', 'not gzip')

    def test_ssh_success_only_aliases_and_default_time_suppression(self):
        path = self.write_log('auth.log.gz',
            '2000-01-02T08:00:00+08:00 private-host sshd[1]: Accepted publickey '
            'for private-user from 192.0.2.1 port 1234 ssh2: RSA SHA256:RmFrZUtleQ\n'
            'Jan  2 09:00:00 private-host sshd[2]: Accepted password '
            'for root from 2001:db8::1 port 1235 ssh2\n'
            '2000-01-02T08:00:00+08:00 private-host sshd[3]: Failed password '
            'for root from 192.0.2.2 port 1236 ssh2\n')
        result, raw = self.run_tool('ssh_summary.py', path)
        self.assertEqual(result['counts']['accepted_records'], 2)
        self.assertEqual(result['counts']['not_matched'], 1)
        self.assertEqual(result['time_quality'],
            {'explicit_timezone': 1, 'missing_year_and_timezone': 1})
        self.assertEqual(result['utc_hours'], {})
        self.assertEqual(result['unresolved_time_samples'], [])
        self.assertEqual(result['accepted_groups'][0]['key'], 'KEY_001')
        self.assert_private_values_absent(raw, 'private-user', 'private-host',
            '192.0.2.1', '2001:db8::1', 'RmFrZUtleQ', '2000', 'Jan  2')

    def test_ssh_time_export_requires_flag_and_does_not_infer_year(self):
        path = self.write_log('auth.log',
            '2000-01-02T08:00:00+08:00 host sshd-session[1]: Accepted password '
            'for root from 192.0.2.1 port 1234 ssh2\n'
            'Jan  2 08:00:00 host sshd[2]: Accepted password '
            'for root from 192.0.2.1 port 1234 ssh2\n')
        result, _ = self.run_tool('ssh_summary.py', path, '--include-times')
        self.assertTrue(result['absolute_times_included'])
        self.assertEqual(result['utc_hours'], {'2000-01-02T00:00:00Z': 1})
        self.assertEqual(result['unresolved_time_samples'],
            [{'time_text': 'Jan  2 08:00:00', 'quality': 'missing_year_and_timezone'}])

    def make_archive(self):
        path = self.root / 'private-sample.tar.gz'
        with tarfile.open(path, 'w:gz') as archive:
            member = tarfile.TarInfo('../PRIVATE_MEMBER')
            data = b'PRIVATE_BODY'
            member.size = len(data)
            archive.addfile(member, io.BytesIO(data))
            member = tarfile.TarInfo('PRIVATE_LINK')
            member.type = tarfile.SYMTYPE
            member.linkname = '/PRIVATE_TARGET'
            archive.addfile(member)
        return path

    def test_archive_is_metadata_only_and_flags_paths(self):
        path = self.make_archive()
        result, raw = self.run_tool('archive_inventory.py', path)
        self.assertTrue(result['metadata_scan_completed'])
        self.assertEqual(result['members_scanned'], 2)
        self.assertEqual(result['unsafe_member_paths'], 1)
        self.assertEqual(result['unsafe_link_targets'], 1)
        self.assert_private_values_absent(raw, 'PRIVATE_MEMBER', 'PRIVATE_BODY',
            'PRIVATE_LINK', 'PRIVATE_TARGET', str(path))
        self.assertEqual(list(self.root.iterdir()), [path])

    def test_archive_limit_and_bad_archive_mark_partial_results(self):
        result, _ = self.run_tool('archive_inventory.py', self.make_archive(),
            '--max-members', 1, code=2)
        self.assertFalse(result['metadata_scan_completed'])
        self.assertEqual(result['stop_reason'], 'member_limit')
        self.assertEqual(result['members_scanned'], 1)
        path = self.write_log('private-bad.tar', 'PRIVATE_INVALID_ARCHIVE')
        result, raw = self.run_tool('archive_inventory.py', path, code=2)
        self.assertEqual(result['stop_reason'], 'archive_read_error')
        self.assert_private_values_absent(raw, 'PRIVATE_INVALID_ARCHIVE', str(path))


if __name__ == '__main__':
    unittest.main()
