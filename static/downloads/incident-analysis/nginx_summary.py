#!/usr/bin/env python3
"""Offline reuse of incident-analysis methods, not the original production script.
Read local combined access logs only; never emit IPs, URLs, query strings or raw UA.
Counts include duplicate lines and overlapping files; aliases are local to one run.
Absolute hours are omitted unless --include-times is explicitly requested.
"""
import argparse
from collections import Counter
from datetime import datetime, timezone
import gzip
import ipaddress
import json
import re
import zlib

LINE = re.compile(r'^(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<method>[A-Z]+) (?P<target>\S+) HTTP/[0-9.]+" (?P<status>\d{3}) (?:\d+|-) "[^"\n]*" "(?P<ua>[^"\n]*)"')
AUTOMATED = re.compile(r'python-urllib|python-requests|curl/|wget/|sqlmap|go-http-client|libwww-perl|aiohttp|httpx', re.I)
METHODS = {'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'}


def aware_time(value):
    value = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if value.tzinfo is None:
        raise ValueError('explicit timezone required')
    return value.astimezone(timezone.utc)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('files', nargs='+')
    parser.add_argument('--since', help='inclusive ISO timestamp with timezone')
    parser.add_argument('--until', help='exclusive ISO timestamp with timezone')
    parser.add_argument('--include-times', action='store_true',
                        help='include absolute UTC hours for private correlation')
    args = parser.parse_args()
    try:
        since = aware_time(args.since) if args.since else None
        until = aware_time(args.until) if args.until else None
        if since and until and since >= until:
            raise ValueError('since must precede until')
    except ValueError:
        parser.error('Use valid timezone-aware ISO bounds with since < until.')
    totals, hours, sources, aliases, errors = Counter(), Counter(), {}, {}, []
    for number, filename in enumerate(args.files, 1):
        opener = gzip.open if filename.lower().endswith('.gz') else open
        try:
            with opener(filename, 'rt', encoding='utf-8', errors='replace') as handle:
                for line in handle:
                    totals['lines_read'] += 1
                    match = LINE.match(line)
                    try:
                        if not match:
                            raise ValueError('format')
                        item = match.groupdict()
                        source = str(ipaddress.ip_address(item['ip']))
                        stamp = datetime.strptime(item['time'], '%d/%b/%Y:%H:%M:%S %z').astimezone(timezone.utc)
                    except ValueError:
                        totals['parse_failed'] += 1
                        continue
                    totals['parsed_lines'] += 1
                    if (since and stamp < since) or (until and stamp >= until):
                        totals['outside_window'] += 1
                        continue
                    totals['matched_lines'] += 1
                    alias = aliases.setdefault(source, f'SOURCE_{len(aliases) + 1:03d}')
                    row = sources.setdefault(alias, {k: Counter() for k in ('status', 'method', 'path_class', 'ua_class')})
                    path = item['target'].split('?', 1)[0]
                    category = next((p for p in ('/pg/', '/auth/') if path.startswith(p)), 'other')
                    if path == '/api/query':
                        category = '/api/query'
                    ua = item['ua']
                    ua_class = 'empty' if ua in ('', '-') else 'automation_hint' if AUTOMATED.search(ua) else 'browser_hint' if 'mozilla/' in ua.lower() else 'other'
                    method = item['method'] if item['method'] in METHODS else 'other'
                    for key, value in [('status', item['status']), ('method', method), ('path_class', category), ('ua_class', ua_class)]:
                        row[key][value] += 1
                    if args.include_times:
                        hours[stamp.strftime('%Y-%m-%dT%H:00:00Z')] += 1
        except (OSError, EOFError, ValueError, zlib.error) as error:
            errors.append({'input_number': number, 'error_type': type(error).__name__})
    for key in ('lines_read', 'parsed_lines', 'parse_failed', 'outside_window', 'matched_lines'):
        totals.setdefault(key, 0)
    print(json.dumps({'complete': not errors, 'counts': totals, 'sources': sources,
                      'absolute_times_included': args.include_times,
                      'utc_hours': dict(sorted(hours.items())), 'input_errors': errors,
                      'notes': ['No deduplication; duplicate or overlapping inputs are counted again.',
                                'UA classes are hints, not verified identities. IP aliases are per run.',
                                'Exact counts can identify an incident; review before sharing.',
                                'complete means inputs were readable, not that every line parsed.']}, indent=2))
    return 0 if not errors else 2


if __name__ == '__main__':
    raise SystemExit(main())
