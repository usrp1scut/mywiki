#!/usr/bin/env python3
"""Offline reuse of incident-analysis methods, not the original production script.
Count only sshd Accepted password/publickey records; never print source lines.
IP, fingerprints and non-root users receive per-run aliases. No deduplication.
Absolute times are omitted unless --include-times is explicitly requested.
"""
import argparse
from collections import Counter
from datetime import datetime, timezone
import gzip
import ipaddress
import json
import re
import zlib

PREFIX = r'(?P<time>\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?|[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})'
ACCEPTED = re.compile(r'^' + PREFIX + r'\s+\S+\s+sshd(?:-session)?\[\d+\]: Accepted (?P<auth>password|publickey) for (?P<user>\S+) from (?P<ip>\S+) port \d+(?: ssh2)?(?P<tail>.*)$')
FINGERPRINT = re.compile(r'SHA256:[A-Za-z0-9+/=]+|MD5:(?:[0-9a-fA-F]{2}:){15}[0-9a-fA-F]{2}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+')
    parser.add_argument('--include-times', action='store_true',
                        help='include absolute UTC hours and time samples for private correlation')
    args = parser.parse_args()
    aliases = {'SOURCE': {}, 'USER': {}, 'KEY': {}}
    totals, groups, qualities, hours = Counter(), Counter(), Counter(), Counter()
    errors, unresolved = [], []

    def alias(kind, value):
        mapping = aliases[kind]
        return mapping.setdefault(value, f'{kind}_{len(mapping) + 1:03d}')

    for number, filename in enumerate(args.files, 1):
        opener = gzip.open if filename.lower().endswith('.gz') else open
        try:
            with opener(filename, 'rt', encoding='utf-8', errors='replace') as handle:
                for line in handle:
                    totals['lines_read'] += 1
                    match = ACCEPTED.match(line)
                    if not match:
                        totals['not_matched'] += 1
                        continue
                    item = match.groupdict()
                    try:
                        source = str(ipaddress.ip_address(item['ip']))
                    except ValueError:
                        totals['accepted_invalid_ip'] += 1
                        continue
                    totals['accepted_records'] += 1
                    user = 'root' if item['user'] == 'root' else alias('USER', item['user'])
                    fingerprint = FINGERPRINT.search(item['tail']) if item['auth'] == 'publickey' else None
                    key = alias('KEY', fingerprint.group()) if fingerprint else 'not_recorded'
                    groups[(alias('SOURCE', source), user, item['auth'], key)] += 1
                    text = item['time']
                    quality = 'missing_year_and_timezone' if not text[0].isdigit() else 'missing_timezone'
                    if text[0].isdigit():
                        try:
                            stamp = datetime.fromisoformat(text.replace('Z', '+00:00'))
                            if stamp.tzinfo is not None:
                                quality = 'explicit_timezone'
                                if args.include_times:
                                    hours[stamp.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:00:00Z')] += 1
                        except ValueError:
                            quality = 'invalid_timestamp'
                    qualities[quality] += 1
                    if args.include_times and quality != 'explicit_timezone' and len(unresolved) < 5:
                        unresolved.append({'time_text': text, 'quality': quality})
        except (OSError, EOFError, ValueError, zlib.error) as error:
            errors.append({'input_number': number, 'error_type': type(error).__name__})
    rows = [dict(zip(('source', 'user', 'authentication', 'key'), group), count=count)
            for group, count in sorted(groups.items())]
    for name in ('lines_read', 'not_matched', 'accepted_invalid_ip', 'accepted_records'):
        totals.setdefault(name, 0)
    print(json.dumps({'complete': not errors, 'counts': totals, 'accepted_groups': rows,
                      'absolute_times_included': args.include_times,
                      'time_quality': qualities, 'utc_hours': dict(sorted(hours.items())),
                      'unresolved_time_samples': unresolved, 'input_errors': errors,
                      'notes': ['No deduplication; overlapping files count again.',
                                'Exact counts can identify an incident; review before sharing.',
                                'Missing years/timezones are not inferred. UTC hours exclude unresolved times.',
                                'Accepted authenticates a session; it does not establish the human operator.',
                                'not_matched includes failures, non-sshd lines and unsupported formats.']}, indent=2))
    return 0 if not errors else 2


if __name__ == '__main__':
    raise SystemExit(main())
