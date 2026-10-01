#!/usr/bin/env python3
"""Install only the skill package, without overwriting an existing installation."""
import argparse
import os
import shutil
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--dest', type=Path, default=Path(os.environ.get('CODEX_HOME', Path.home() / '.codex')) / 'skills')
args = parser.parse_args()
source = Path(__file__).resolve().parents[1] / 'skills' / 'frontend-style-discovery'
target = args.dest.expanduser().resolve() / source.name
if target.exists():
    parser.exit(1, f'Installation exists: {target}. Back it up before updating.\n')
target.parent.mkdir(parents=True, exist_ok=True)
shutil.copytree(source, target)
print(f'Installed: {target}')
print('The skill will be available on your next turn in Codex.')
