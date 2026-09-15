"""Build reproducible course downloads from source; no node_modules or dist."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
demo = root / 'demo-store'
output = root / 'public' / 'downloads'
output.mkdir(parents=True, exist_ok=True)

def archive(destination, files):
    with ZipFile(destination, 'w', compression=ZIP_DEFLATED) as bundle:
        for source, name in sorted(files, key=lambda pair: pair[1]):
            info = ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            bundle.writestr(info, source.read_bytes())
    print(f'{destination.name}: {destination.stat().st_size:,} bytes')

starter = []
for source in demo.rglob('*'):
    relative = source.relative_to(demo)
    if source.is_file() and not any(part in {'node_modules', 'dist', 'tests', '.git', '.github', 'playwright-report', 'test-results', '__pycache__'} for part in relative.parts):
        if source.name.endswith('.local') or source.name.startswith('.env'):
            continue
        if source.name == 'playwright.config.js' or source.name.startswith('performance-'):
            continue
        starter.append((source, 'demo-store/' + relative.as_posix()))
archive(output / 'paper-trail-demo.zip', starter)

tests = [(source, source.relative_to(demo).as_posix()) for source in (demo / 'tests' / 'unit').glob('*.test.js')]
tests.append((root / 'course' / 'unit-testing' / 'README.md', 'README-unit-testing.md'))
archive(output / 'chapter-02-unit-tests.zip', tests)

# Later solutions are cumulative, but never replace application source or dependencies.
groups = ['unit', 'helpers']
for number, slug, added in [
    ('03', 'integration', ['integration']),
    ('04', 'e2e', ['e2e']),
    ('05', 'security', ['security']),
    ('06', 'performance', ['performance']),
    ('07', 'regression', ['regression']),
]:
    groups.extend(added)
    files = []
    for group in groups:
        for source in (demo / 'tests' / group).rglob('*'):
            if not source.is_file() or source.suffix not in {'.js', '.mjs'}:
                continue
            if number == '04' and source.name == 'security.spec.js':
                continue
            files.append((source, source.relative_to(demo).as_posix()))
    if number >= '04':
        files.append((demo / 'playwright.config.js', 'playwright.config.js'))
    if number == '07':
        files.append((demo / '.github/workflows/testing.yml', '.github/workflows/testing.yml'))
    files.append((root / 'course' / slug / 'README.md', f'README-chapter-{number}.md'))
    archive(output / f'chapter-{number}-{slug}-tests.zip', files)
