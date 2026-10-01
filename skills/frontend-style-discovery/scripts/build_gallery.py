#!/usr/bin/env python3
"""Build an offline reference gallery; only local, explicitly provided previews are copied."""
import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path
from urllib.parse import urlsplit

IMAGE_TYPES = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}


def build(manifest_path: Path, output: Path) -> dict:
    manifest_path = manifest_path.resolve()
    root = manifest_path.parent
    data = json.loads(manifest_path.read_text(encoding='utf-8'))
    if not isinstance(data, dict) or data.get('schema_version') != 1:
        raise ValueError('Expected a schema_version: 1 manifest object')
    if not isinstance(data.get('project_id'), str) or not data['project_id'].strip():
        raise ValueError('project_id is required')
    if type(data.get('round', 1)) is not int or data.get('round', 1) < 1:
        raise ValueError('round must be a positive integer')
    reserved = data.get('reserved_ids', [])
    if not isinstance(reserved, list) or any(type(i) is not int or i < 1 for i in reserved):
        raise ValueError('reserved_ids must contain positive integer IDs')
    refs = data.get('references')
    if not isinstance(refs, list) or not 1 <= len(refs) <= 200:
        raise ValueError('references must contain 1–200 records')
    ids, validated, copies = set(), [], []
    for source in refs:
        if not isinstance(source, dict):
            raise ValueError('Every reference must be an object')
        identity = source.get('id')
        if type(identity) is not int or identity < 1 or identity in ids:
            raise ValueError(f'Duplicate or invalid reference ID: {identity}')
        ids.add(identity)
        title = source.get('title')
        url = source.get('source_url', '')
        if not isinstance(title, str) or not title.strip():
            raise ValueError(f'Reference {identity} requires a title')
        if not isinstance(url, str) or any(ord(c) < 32 for c in url):
            raise ValueError(f'Reference {identity} has an invalid source URL')
        parsed = urlsplit(url)
        if parsed.scheme not in {'http', 'https'} or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError(f'Reference {identity} requires an HTTP(S) source without credentials')
        tags = source.get('tags', [])
        if not isinstance(tags, list) or any(not isinstance(tag, str) for tag in tags):
            raise ValueError(f'Reference {identity}: tags must be strings')
        item = {
            'id': identity, 'title': title, 'source_url': url, 'tags': tags,
            'creator': str(source.get('creator', '作者未核验')),
            'kind': str(source.get('kind', 'reference')),
            'note': str(source.get('note', '')),
            'verification': str(source.get('verification', '尚未核验')),
            'license': str(source.get('license', '许可未核验')),
            'pinned': bool(source.get('pinned', False)), 'image': None,
        }
        image = source.get('image')
        if image:
            if not isinstance(image, str) or Path(image).is_absolute():
                raise ValueError(f'Reference {identity}: image must be relative')
            path = (root / image).resolve()
            if not path.is_relative_to(root) or not path.is_file() or path.suffix.lower() not in IMAGE_TYPES:
                raise ValueError(f'Reference {identity}: preview missing, unsupported, or outside manifest directory')
            name = f'{identity}-{hashlib.sha256(path.read_bytes()).hexdigest()[:12]}{path.suffix.lower()}'
            item['image'] = f'images/{name}'
            copies.append((path, name))
        validated.append(item)
    payload = {
        'schema_version': 1, 'project_id': data['project_id'],
        'title': str(data.get('title', '前端参考选图册')),
        'subtitle': str(data.get('subtitle', '选择参考，记录你喜欢的部分。')),
        'round': data.get('round', 1), 'reserved_ids': sorted(set(reserved) | ids), 'references': validated,
    }
    output = output.resolve()
    if output == root or output in manifest_path.parents:
        raise ValueError('Output must not overwrite the manifest directory or its ancestors')
    output.mkdir(parents=True, exist_ok=True)
    (output / 'images').mkdir(exist_ok=True)
    assets = Path(__file__).resolve().parents[1] / 'assets' / 'gallery'
    for name in ['index.html', 'gallery.css', 'gallery.js']:
        shutil.copy2(assets / name, output / name)
    for path, name in copies:
        shutil.copy2(path, output / 'images' / name)
    serialized = json.dumps(payload, ensure_ascii=False, indent=2)
    (output / 'manifest.json').write_text(serialized + '\n', encoding='utf-8')
    (output / 'manifest.js').write_text('export default ' + serialized + ';\n', encoding='utf-8')
    return {'references': len(validated), 'previews': len(copies), 'output': str(output)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(build(args.manifest, args.output), ensure_ascii=False))
        return 0
    except (ValueError, OSError) as error:
        print(f'Gallery build failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
