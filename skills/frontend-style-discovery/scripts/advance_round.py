#!/usr/bin/env python3
"""Pin liked references, preserve IDs, and relocate previews for the next round."""
import argparse
import json
import shutil
import sys
from pathlib import Path
from discovery_data import read_manifest, read_choices


def advance(previous, additions, decisions, output):
    previous, additions, output = map(lambda p: Path(p).resolve(), [previous, additions, output])
    old, new = read_manifest(previous), read_manifest(additions)
    if old['project_id'] != new['project_id']:
        raise ValueError('Both manifests must belong to the same project')
    choices, unmatched = read_choices(decisions, old)
    if unmatched:
        raise ValueError('Reconcile unmatched decisions before advancing')
    reserved = set(old.get('reserved_ids', [])) | {r['id'] for r in old['references']}
    if any(ref['id'] in reserved for ref in new['references']):
        raise ValueError('New references must use new IDs; never reuse earlier IDs')
    pinned_ids = {c['id'] for c in choices if c['value'] == 'like'}
    sources = [(r, previous.parent) for r in old['references'] if r['id'] in pinned_ids]
    sources += [(r, additions.parent) for r in new['references']]
    prepared, copies = [], []
    for ref, root in sources:
        ref = dict(ref)
        ref['pinned'] = ref['id'] in pinned_ids
        if ref.get('image'):
            if not isinstance(ref['image'], str) or Path(ref['image']).is_absolute():
                raise ValueError('Preview must be a relative path')
            src = (root / ref['image']).resolve()
            if not src.is_relative_to(root) or not src.is_file() or src.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp', '.gif'}:
                raise ValueError('Preview must exist within its source manifest directory')
            target = Path('media') / f"{ref['id']}{src.suffix.lower()}"
            ref['image'] = target.as_posix()
            copies.append((src, output / target))
        prepared.append(ref)
    if output.exists():
        raise ValueError('Output already exists; use a new round directory')
    if any(output == p.parent or output in p.parents for p in [previous, additions, Path(decisions).resolve()]):
        raise ValueError('Output must not overwrite inputs or their ancestors')
    result = {**new, 'round': old.get('round', 1) + 1, 'references': prepared,
              'reserved_ids': sorted(reserved | {r['id'] for r in prepared})}
    output.mkdir(parents=True)
    for src, dest in copies:
        dest.parent.mkdir(exist_ok=True)
        shutil.copy2(src, dest)
    (output / 'references.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    shutil.copy2(decisions, output / 'previous-decisions.json')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('previous', type=Path)
    parser.add_argument('additions', type=Path)
    parser.add_argument('--decisions', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    try:
        result = advance(args.previous, args.additions, args.decisions, args.output)
        print(json.dumps({'round': result['round'], 'references': len(result['references'])}))
        return 0
    except (ValueError, OSError) as error:
        print(f'Cannot advance round: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
