#!/usr/bin/env python3
"""Offline reuse of incident-analysis methods, not the original production script.
Read tar metadata only: never extract, execute, or print member names/content.
Logical size is not unique data, transfer volume, or a confirmed disclosure amount.
"""
import argparse
from collections import Counter
import json
from pathlib import PurePosixPath
import re
import tarfile
import zlib


def unsafe_path(value):
    normalized = value.replace('\\', '/')
    return (normalized.startswith('/') or bool(re.match(r'^[A-Za-z]:', normalized))
            or '..' in PurePosixPath(normalized).parts)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive')
    parser.add_argument('--max-members', type=int, default=100000)
    args = parser.parse_args()
    if args.max_members < 1:
        parser.error('--max-members must be positive')
    types = Counter()
    summary = {'members_scanned': 0, 'total_logical_bytes': 0,
               'regular_file_logical_bytes': 0, 'unsafe_member_paths': 0,
               'unsafe_link_targets': 0, 'negative_sizes': 0}
    completed, stop_reason, error_type = True, None, None
    try:
        with tarfile.open(args.archive, mode='r|*') as archive:
            for member in archive:
                if summary['members_scanned'] >= args.max_members:
                    completed, stop_reason = False, 'member_limit'
                    break
                summary['members_scanned'] += 1
                kind = ('regular_file' if member.isfile() else 'directory' if member.isdir()
                        else 'symbolic_link' if member.issym() else 'hard_link' if member.islnk()
                        else 'device' if member.isdev() else 'other')
                types[kind] += 1
                summary['total_logical_bytes'] += max(0, member.size)
                summary['negative_sizes'] += int(member.size < 0)
                if member.isfile():
                    summary['regular_file_logical_bytes'] += max(0, member.size)
                summary['unsafe_member_paths'] += int(unsafe_path(member.name))
                if member.issym() or member.islnk():
                    summary['unsafe_link_targets'] += int(unsafe_path(member.linkname))
    except (OSError, EOFError, tarfile.TarError, ValueError, OverflowError, zlib.error) as error:
        completed, stop_reason, error_type = False, 'archive_read_error', type(error).__name__
    for kind in ('regular_file', 'directory', 'symbolic_link', 'hard_link', 'device', 'other'):
        types.setdefault(kind, 0)
    print(json.dumps({'metadata_scan_completed': completed, 'stop_reason': stop_reason,
                      'error_type': error_type, 'member_types': types, **summary,
                      'notes': ['No extraction, execution, file body output, or member path output.',
                                'Counts stop at a limit or read error; read errors may indicate truncation.',
                                'Path checks are conservative lexical checks, not a safe-extraction guarantee.',
                                'Metadata traversal is not full archive integrity or payload validation.',
                                'Logical sizes may include duplicates and sparse-file expansion.']}, indent=2))
    return 0 if completed else 2


if __name__ == '__main__':
    raise SystemExit(main())
