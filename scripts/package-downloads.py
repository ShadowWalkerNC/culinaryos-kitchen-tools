"""Build portable release ZIPs with Python's standard library after npm run package."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, sys, hashlib

root = Path(__file__).resolve().parent.parent
stage = root / 'package-out'
assert (stage / '.package-generated').is_file(), 'Run npm run package first'
version = json.loads((stage / 'package.json').read_text())['version']
destination = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parent / 'outputs'
assert destination != stage and stage not in destination.parents
destination.mkdir(parents=True, exist_ok=True)
server = json.loads((stage / 'mcp.json').read_text())['mcpServers']['kitchen-tools']
assert server == {'type': 'streamable-http', 'url': 'https://culinaryos-kitchen-tools-production.up.railway.app/mcp'}
remote_files = [stage / n for n in ['plugin.json', 'mcp.json', 'LICENSE', 'CONTRIBUTING.md', 'docs/INSTALL.md', 'docs/GETTING_STARTED.md', 'docs/ROSS_MANOR_INTEGRATION.md']]
remote_files += [p for p in (stage / 'skills').rglob('*') if p.is_file()]
receipts = []
for filename, files, prefix in [('open-kitchen-toolkit-' + version + '.zip', [p for p in stage.rglob('*') if p.is_file()], 'kitchen-tools/'), ('kitchen-tools-remote-plugin-' + version + '.zip', remote_files, '')]:
    output = destination / filename
    assert not output.exists(), 'Inspect existing release artifact before replacing: ' + str(output)
    with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
        for file in sorted(files):
            assert not file.is_symlink()
            relative = file.relative_to(stage)
            assert not any(part == 'node_modules' or part.startswith('.env') or '.sqlite' in part or part.endswith('.private.json') for part in relative.parts)
            archive.write(file, prefix + relative.as_posix())
    with ZipFile(output) as archive:
        names = archive.namelist()
        assert all('\\' not in name and not name.startswith('/') and '..' not in name.split('/') for name in names)
        assert len([name for name in names if name.endswith('/SKILL.md')]) == 105
        assert archive.testzip() is None
    receipts.append({'name': filename, 'bytes': output.stat().st_size, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'skills': 105, 'portablePaths': 'PASS', 'remoteManifest': 'hosted'})
(destination / ('archive-check-' + version + '.json')).write_text(json.dumps(receipts, indent=2) + '\n')
print(json.dumps(receipts, indent=2))
