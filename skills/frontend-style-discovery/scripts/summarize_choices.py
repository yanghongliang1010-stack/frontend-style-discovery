#!/usr/bin/env python3
"""Export factual preference evidence without inferring acceptance or a style."""
import argparse
import json
import sys
from pathlib import Path
from discovery_data import read_manifest, read_choices


def summarize(manifest, decisions):
    data = read_manifest(manifest)
    choices, unmatched = read_choices(decisions, data)
    return {'schema_version': 1, 'project_id': data['project_id'], 'round': data.get('round', 1),
            'stage': 'interpret-feedback', 'acceptance': None,
            'liked': [c for c in choices if c['value'] == 'like'],
            'rejected': [c for c in choices if c['value'] == 'skip'],
            'notes_only': [c for c in choices if not c['value']],
            'unmatched_ids': unmatched,
            'next_step': 'Interpret notes by property; ask only about the unresolved choice. Likes do not approve a design or implementation.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('decisions', type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    try:
        result = summarize(args.manifest, args.decisions)
        if args.output.exists():
            raise ValueError('Output already exists; choose a new evidence filename')
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'Evidence saved to {args.output}; acceptance remains unset.')
        return 0
    except (ValueError, OSError) as error:
        print(f'Cannot summarize: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
