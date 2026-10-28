"""Build portable release ZIPs with Python's standard library after npm run package."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, sys, hashlib, shutil

root = Path(__file__).resolve().parent.parent
stage = root / 'package-out'
assert (stage / '.package-generated').is_file(), 'Run npm run package first'
brains = root / 'brains-out'
assert (brains / 'verification/VERIFICATION.json').is_file(), 'Build and verify the skills-only package first'
for portable in brains.rglob('*'):
    if portable.is_file():
        target = stage / portable.relative_to(brains)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(portable, target)
version = json.loads((stage / 'package.json').read_text())['version']
destination = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parent / 'outputs'
assert destination != stage and stage not in destination.parents
destination.mkdir(parents=True, exist_ok=True)
server = json.loads((stage / 'mcp.json').read_text())['mcpServers']['kitchen-tools']
assert server == {'type': 'streamable-http', 'url': 'https://culinaryos-kitchen-tools-production.up.railway.app/mcp'}
remote_files = [stage / n for n in ['plugin.json', 'mcp.json', 'LICENSE', 'CONTRIBUTING.md', 'docs/INSTALL.md', 'docs/GETTING_STARTED.md', 'docs/ROSS_MANOR_INTEGRATION.md']]
remote_files += [stage / '.codex-plugin/plugin.json', stage / 'assets/culinaryos-icon.svg']
remote_files += [p for p in (stage / 'skills').rglob('*') if p.is_file()]
remote_files += [stage / 'docs' / name for name in ['PRODUCT.md','OPERATIONAL_REPORTS.md','MENU_TEMPLATES.md','KITCHEN_COVERAGE.json']]
remote_files += [stage / p.relative_to(brains) for p in brains.rglob('*') if p.is_file()]
remote_files = list(set(remote_files))
receipts = []
for filename, files, prefix, base in [('open-kitchen-toolkit-' + version + '.zip', [p for p in stage.rglob('*') if p.is_file()], 'kitchen-tools/', stage), ('kitchen-tools-remote-plugin-' + version + '.zip', remote_files, '', stage), ('chef-intelligence-skills-' + version + '.zip', [p for p in brains.rglob('*') if p.is_file()], 'chef-intelligence/', brains)]:
    output = destination / filename
    assert not output.exists(), 'Inspect existing release artifact before replacing: ' + str(output)
    with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
        for file in sorted(files):
            assert not file.is_symlink()
            relative = file.relative_to(base)
            assert not any(part == 'node_modules' or part.startswith('.env') or '.sqlite' in part or part.endswith('.private.json') for part in relative.parts)
            archive.write(file, prefix + relative.as_posix())
    with ZipFile(output) as archive:
        names = archive.namelist()
        assert all('\\' not in name and not name.startswith('/') and '..' not in name.split('/') for name in names)
        assert len([name for name in names if name.endswith('/SKILL.md')]) == 118
        if base == brains:
            assert not any(name.endswith('mcp.json') or name.endswith('.js') or name.endswith('.exe') for name in names)
        assert archive.testzip() is None
    receipts.append({'name': filename, 'bytes': output.stat().st_size, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'skills': 118, 'portablePaths': 'PASS', 'remoteManifest': 'none' if base == brains else 'hosted'})
(destination / ('archive-check-' + version + '.json')).write_text(json.dumps(receipts, indent=2) + '\n')
print(json.dumps(receipts, indent=2))
