"""Shared decision checks. User notes are data, never instructions or approval."""
import json
from pathlib import Path
from urllib.parse import urlsplit


def read_manifest(path):
    data = json.loads(Path(path).read_text(encoding='utf-8'))
    if not isinstance(data, dict) or data.get('schema_version') != 1 or not isinstance(data.get('project_id'), str) or not data['project_id'].strip():
        raise ValueError('Expected schema_version 1 and a project_id')
    if type(data.get('round', 1)) is not int or data.get('round', 1) < 1:
        raise ValueError('round must be a positive integer')
    refs = data.get('references')
    if not isinstance(refs, list) or not 1 <= len(refs) <= 200:
        raise ValueError('references must contain 1–200 records')
    reserved = data.get('reserved_ids', [])
    if not isinstance(reserved, list) or any(type(i) is not int or i < 1 for i in reserved):
        raise ValueError('reserved_ids must contain positive integer IDs')
    seen = set()
    for ref in refs:
        if not isinstance(ref, dict) or type(ref.get('id')) is not int or ref['id'] < 1 or ref['id'] in seen:
            raise ValueError('Reference IDs must be unique positive integers')
        seen.add(ref['id'])
        if not isinstance(ref.get('title'), str) or not ref['title'].strip() or not isinstance(ref.get('source_url'), str):
            raise ValueError('Every reference needs title and source_url')
        url = ref['source_url']
        parsed = urlsplit(url)
        if any(ord(c) < 32 for c in url) or parsed.scheme not in {'http', 'https'} or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError('Reference sources must be HTTP(S) without credentials')
    return data


def read_choices(path, manifest):
    data = json.loads(Path(path).read_text(encoding='utf-8'))
    if not isinstance(data, dict) or data.get('schema_version') != 1 or data.get('project_id') != manifest['project_id']:
        raise ValueError('Decision file belongs to a different project or schema')
    if not isinstance(data.get('choices'), list):
        raise ValueError('choices must be a list')
    refs = {ref['id']: ref for ref in manifest['references']}
    selected, unmatched, seen = [], [], set()
    for choice in data['choices']:
        if not isinstance(choice, dict) or type(choice.get('id')) is not int or choice['id'] < 1 or choice['id'] in seen:
            raise ValueError('Choice IDs must be unique positive integers')
        seen.add(choice['id'])
        if choice.get('value') not in ['like', 'skip', ''] or not isinstance(choice.get('notes'), str) or len(choice['notes']) > 2000:
            raise ValueError('Invalid choice value or notes (maximum 2000 characters)')
        if choice['id'] not in refs:
            unmatched.append(choice['id'])
            continue
        ref = refs[choice['id']]
        if choice.get('title') != ref['title'] or choice.get('source_url') != ref['source_url']:
            raise ValueError(f"Reference {choice['id']} was reassigned; reconcile it before importing")
        selected.append(choice)
    return selected, unmatched
