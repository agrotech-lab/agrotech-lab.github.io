"""Publish the personal Sensor Workshop viewer as a classroom snapshot.

Run with Python + Playwright and Chrome installed:
  python archive/agent-notes/examples/import-sensor-workshop.py ../sensor-workshop

Reads the sibling repository without modifying it. Keeps its geometry/viewer,
adds course navigation and the shared blackout control, preserves credits, and
renders two screenshots directly from the WebGL canvas (no screenshot editing).
The full model loads only when a student opens its separate page.
"""
import argparse
import base64
import json
from pathlib import Path
import re
import subprocess

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('repository', type=Path)
args = parser.parse_args()
source = args.repository.resolve()
revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
assert not subprocess.check_output(['git', '-C', str(source), 'status', '--porcelain'], text=True).strip(), 'Use a clean, committed source snapshot.'
project = 'https://github.com/erezfeuer/sensor-workshop'
pinned = f'{project}/blob/{revision}'
model_path = 'enclosure/variants/bare-scd30/model.html'
html = (source / model_path).read_text()
data = json.loads(re.search(r'<script id="model-data" type="application/json">(.*?)</script>', html, re.S)[1])
assert 'personal-scd30' in data['version'], 'Use the personal bare-SCD30 model.'
dest = ROOT / 'archive/3d-printing/sensor-workshop'
figures = ROOT / 'archive/figures/3d-printing'
dest.mkdir(parents=True, exist_ok=True)

# Reuse the course control inline so the downloadable HTML remains standalone.
blackout = (ROOT / '_includes/projector-mode.html').read_text()
blackout = blackout.replace('<link rel="stylesheet" href="/assets/projector-mode.css">', '<style>' + (ROOT / 'assets/projector-mode.css').read_text() + '</style>')
blackout = blackout.replace('<script src="/assets/projector-mode.js" defer></script>', '<script>' + (ROOT / 'assets/projector-mode.js').read_text() + '</script>')
nav = f'''<nav class="course-links" aria-label="Course and project links">
<a href="../../../tutorials/3d-printing.html#sensor-workshop">← 3D-printing lesson</a>
<a href="{project}" target="_blank" rel="noopener noreferrer">Project on GitHub</a>
<a href="CREDITS.txt" target="_blank" rel="noopener noreferrer">Model credits</a>
</nav>'''
css = '''<style>
body{display:flex;flex-direction:column;height:100dvh}
header{flex-shrink:0}
.course-links{display:flex;flex-wrap:wrap;align-items:center;gap:10px 20px;padding:9px 20px;background:#edf4f0;border-bottom:1px solid #d5e1db;font-size:13px;flex-shrink:0}
.layout{flex:1;min-height:0;height:auto}
.info{bottom:75px}
@media(max-width:760px){body{height:auto;min-height:100dvh}.layout{flex:none}.course-links{padding:10px 16px;gap:9px 16px}.info{bottom:20px}.hint{display:none}}
</style>'''
html = html.replace('</head>', css + '</head>')
html = html.replace('</header>', '</header>' + nav)
credit_links = f'<p>Classroom snapshot: {data["version"]}. <a href="{pinned}/{model_path}" target="_blank" rel="noopener noreferrer">Original viewer</a> · <a href="{pinned}/hardware/reference/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">Source attribution</a>. Follow the GitHub project for later revisions.</p>'
html = html.replace('</footer>', credit_links + '</footer>')
html = html.replace('Enable hardware acceleration in your browser, or open design-review.pdf for the static views.', 'Return to the 3D-printing lesson for assembled and exploded images, or open the GitHub project for drawings.')
html = html.replace('The accompanying design-review.pdf contains static views and sections.', 'Return to the 3D-printing lesson for assembled and exploded images.')
html = html.replace('</body>', blackout + '</body>')
(dest / 'model.html').write_text(html)

credits = [f'Sensor Workshop classroom model\nProject: {project}\nSource revision: {revision}\nVariant: {data["version"]}\nOriginal model: {pinned}/{model_path}\n\nCourse adaptation: navigation, classroom blackout control and fallback text. Geometry and model controls are unchanged. Preview images are rendered from this model.\n\nThe following upstream notices are preserved verbatim. Relative paths in those notices refer to the Sensor Workshop repository at the revision above.\n']
notice_paths = ['hardware/reference/ATTRIBUTION.md'] + [str(p.relative_to(source)) for p in sorted((source / 'hardware/reference/notices').glob('*.txt'))]
for name in notice_paths:
    credits.append('\n\n' + name + '\n' + '=' * len(name) + '\n' + (source / name).read_text())
(dest / 'CREDITS.txt').write_text(''.join(credits))
(dest / 'snapshot.json').write_text(json.dumps({'project': project, 'revision': revision, 'variant': data['version'], 'source_model': model_path, 'source_attribution': 'hardware/reference/ATTRIBUTION.md', 'adaptations': ['course links', 'projector blackout', 'fallback text'], 'images': ['sensor-workshop-assembled.png', 'sensor-workshop-exploded.png']}, indent=2) + '\n')

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True, args=['--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width': 1500, 'height': 1000})
    page.goto((dest / 'model.html').as_uri())
    page.wait_for_selector('#model[data-rendered="true"]')
    assert page.locator('#error').is_hidden()
    for view in ['assembled', 'exploded']:
        page.locator('#reset').click()
        if view == 'exploded':
            page.locator('#explode-all').click()
        page.locator('#fit').click()
        page.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
        assert page.evaluate('sensorWorkshop.state().glError') == 0
        png = page.locator('#model').evaluate("canvas => canvas.toDataURL('image/png').split(',')[1]")
        (figures / f'sensor-workshop-{view}.png').write_bytes(base64.b64decode(png))
    browser.close()
print(f'Imported {data["version"]} from {revision}')
