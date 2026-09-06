"""Exercise the packaged learner workflow in a fresh temporary directory."""
from pathlib import Path
from zipfile import ZipFile
import os
import re
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
workspace = Path(tempfile.mkdtemp(prefix='paper-trail-course-')).resolve()
downloads = root / 'public' / 'downloads'

with ZipFile(downloads / 'paper-trail-demo.zip') as bundle:
    assert not any('/tests/' in name or '/node_modules/' in name or '/dist/' in name for name in bundle.namelist())
    bundle.extractall(workspace)
app = workspace / 'demo-store'
npm = 'npm.cmd' if os.name == 'nt' else 'npm'

def command(args, expected=0):
    result = subprocess.run(args, cwd=app, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if result.returncode != expected:
        raise AssertionError(result.stdout + result.stderr)
    return result.stdout

command([npm, 'ci', '--no-audit', '--no-fund'])
print('Clean npm ci: passed', flush=True)
command([npm, 'run', 'build'])
print('Extracted starter production build: passed', flush=True)

with ZipFile(downloads / 'chapter-02-unit-tests.zip') as bundle:
    for name, count in [('shipping', 2), ('pricing', 8), ('boundaries', 21), ('coupons', 28)]:
        filename = 'tests/unit/' + name + '.test.js'
        bundle.extract(filename, app)
        output = command(['node', '--test'])
        assert re.search(r'\btests ' + str(count) + r'\b', output), output
        assert re.search(r'\bfail 0\b', output), output
        print(f'After {name}: {count} tests passed', flush=True)
        if name == 'boundaries':
            production = app / 'src' / 'domain' / 'pricing.js'
            original = production.read_text(encoding='utf-8')
            assert 'subtotalAfterDiscountCents >= 10000' in original
            production.write_text(original.replace('subtotalAfterDiscountCents >= 10000', 'subtotalAfterDiscountCents > 10000'), encoding='utf-8')
            output = command(['node', '--test'], expected=1)
            assert re.search(r'\bpass 20\b', output) and re.search(r'\bfail 1\b', output), output
            print('Intentional > defect: 20 pass, 1 fail', flush=True)
            production.write_text(original, encoding='utf-8')
            output = command(['node', '--test'])
            assert re.search(r'\bfail 0\b', output), output
            print('Restored >= fix: 21 pass', flush=True)

command(['node', '--test', 'tests/unit/coupons.test.js'])
print('Individual coupon file: passed', flush=True)
print(f'Verified extracted app retained at {app}', flush=True)
