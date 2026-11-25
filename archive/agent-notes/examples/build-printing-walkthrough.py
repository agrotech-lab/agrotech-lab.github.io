"""Build the cumulative PCB-stand lesson with real OpenSCAD exports.
Run from any directory; supply --openscad if OpenSCAD is not on PATH.
"""
from pathlib import Path
import argparse, concurrent.futures, difflib, json, subprocess, zipfile

ROOT = Path(__file__).resolve().parents[3]
MODELS = ROOT / 'archive/3d-printing'
IMAGES = ROOT / 'archive/figures/3d-printing'


def indent(code):
    return '\n'.join('  ' + line if line else '' for line in code.splitlines())


def block(name, children):
    return name + ' {\n' + '\n'.join(indent(c) for c in children) + '\n}'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--openscad', default='openscad')
    args = parser.parse_args()
    (MODELS / 'walkthrough').mkdir(exist_ok=True)
    (IMAGES / 'walkthrough').mkdir(exist_ok=True)
    small = 'cube([20, 20, 20]);'
    base = 'cube([81.406, 86.740, 3]);'
    moved = 'translate([-4, -4, 0])\n  ' + base
    frame = block('difference()', [moved, 'translate([10, 12, -0.1])\n  cube([53.406, 54.740, 3.2]);'])
    holes = [(4.318, 4.572), (4.318, 75.438), (69.596, 4.572), (69.596, 75.438)]
    posts = [f'translate([{x}, {y}, 2.8])\n  cylinder(h=6.2, d1=12, d2=8, $fn=64);' for x, y in holes]
    cuts = [f'translate([{x}, {y}, -0.1])\n  cylinder(h=9.2, d=3.4, $fn=64);' for x, y in holes]
    raised = block('union()', [frame, *posts])
    loop = '''holes = [[4.318, 4.572], [4.318, 75.438],
         [69.596, 4.572], [69.596, 75.438]];
$fn = 64;

''' + block('difference()', [block('union()', [frame, 'for (p = holes)\n  translate([p[0], p[1], 2.8])\n    cylinder(h=6.2, d1=12, d2=8);']), 'for (p = holes)\n  translate([p[0], p[1], -0.1])\n    cylinder(h=9.2, d=3.4);'])
    stages = [
        ('cube', 'Start with a cube', 'Make one solid: a cube, 20 mm on each side. The three numbers are X, Y and Z. Everything we add later will build on this starting point.', small, [20, 20, 20]),
        ('resize', 'Resize it into a flat base', 'Change the three dimensions. cube() can make a rectangular block too. Our base is now 81.406 × 86.740 mm and only 3 mm thick: the PCB outline plus 4 mm on each edge.', base, [81.406, 86.740, 3]),
        ('move', 'Move the base around the board origin', 'Add translate([-4, -4, 0]). The whole base moves 4 mm in negative X and Y; its size stays the same. The origin will be the bottom-left corner of our PCB. Compare the base with the red and green axes.', moved, [81.406, 86.740, 3]),
        ('window', 'Subtract a block to open the middle', 'Wrap the base in difference(), then add a second block as the cutter. The first shape stays; the second is removed. The cutter starts below the base and ends above it, so the window goes all the way through.', frame, [81.406, 86.740, 3]),
        ('first-post', 'Add the first mounting post', 'Use union() to join a cylinder to the frame. translate() places it at the first PCB hole. The post tapers from a wide 12 mm foot to an 8 mm top. d1 sets the bottom diameter; d2 sets the top. Starting at Z=2.8 overlaps the 3 mm base by 0.2 mm; the top is at Z=9.', block('union()', [frame, posts[0]]), [81.406, 86.740, 9]),
        ('second-post', 'Add a second post', 'Keep the first post. Add another cylinder at X=4.318, Y=75.438. Only its Y position changes. These coordinates come from the real board, so we do not guess the distance from the corners.', block('union()', [frame, *posts[:2]]), [81.406, 86.740, 9]),
        ('four-posts', 'Add the two posts on the other side', 'Add two more cylinders at X=69.596, using the same two Y coordinates. Now all four mounting positions have supports. The posts are still solid.', raised, [81.406, 86.740, 9]),
        ('first-hole', 'Cut a screw hole through the first post', 'Put the whole frame-and-posts shape inside a new difference(). A 3.4 mm cylinder removes material through the first post AND the base, from Z=-0.1 to Z=9.1. Try Top view to see the hole.', block('difference()', [raised, cuts[0]]), [81.406, 86.740, 9]),
        ('four-holes', 'Cut the other three screw holes', 'Keep the first cutter and add three more at the remaining mounting positions. The stand now has four through-holes. This is the finished shape; check the actual screw fit with the small test piece before printing it.', block('difference()', [raised, *cuts]), [81.406, 86.740, 9]),
        ('loop', 'Make the repeated code shorter', 'The shape stays exactly the same. Store the four positions in holes, then use for (p = holes) to repeat the post and cutter. p[0] is X and p[1] is Y. Go Back to compare this with the four separate copies.', loop, [81.406, 86.740, 9]),
    ]
    entries = []
    previous = []
    for i, (slug, title, description, code, size) in enumerate(stages, 1):
        code = '// Units: mm. PCB stand worked example.\n' + code + '\n'
        lines = code.splitlines()
        matcher = difflib.SequenceMatcher(None, previous, [l.strip() for l in lines], autojunk=False)
        changed = [j + 1 for tag, _, _, b1, b2 in matcher.get_opcodes() if tag in ('insert', 'replace') for j in range(b1, b2) if lines[j].strip()]
        previous = [l.strip() for l in lines]
        name = f'{i:02}-{slug}'
        (MODELS / 'walkthrough' / f'{name}.scad').write_text(code)
        entries.append(dict(id=f'step-{i}', title=title, description=description, code=code, changedLines=changed, size=size,
                            file=f'walkthrough/{name}.stl', scad=f'walkthrough/{name}.scad', image=f'walkthrough/{name}.png'))
    def render(entry):
        src = MODELS / entry['scad']
        for options, dest in [(['--hardwarnings', '--export-format', 'binstl'], MODELS / entry['file']),
                              (['--render', '--imgsize=800,600', '--camera=38.703,41.370,10,55,0,25,250', '--projection=o', '--view=axes'], IMAGES / entry['image'])]:
            result = subprocess.run([args.openscad, *options, '-o', str(dest), str(src)], capture_output=True, text=True)
            if result.returncode: raise RuntimeError(src.name + '\n' + result.stderr)
        print(entry['id'], entry['title'], flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(render, entries))
    (MODELS / 'walkthrough.json').write_text(json.dumps(entries, indent=2) + '\n')
    with zipfile.ZipFile(MODELS / 'worked-example.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted((MODELS / 'walkthrough').iterdir()):
            z.write(f, Path('pcb-stand-step-by-step') / f.name)
        z.writestr('pcb-stand-step-by-step/README.txt', 'Open the numbered .scad files in order. Each is complete and standalone.\nUnits: mm. Preview (F5), Render (F6), then export STL.\nSteps 9 and 10 make the same finished stand; step 10 replaces repeated code with loops.\nIntermediate models are teaching stages, not parts to print.\nThe stand is a prototype: test screw fit and real PCB clearance before use.\n')
    with zipfile.ZipFile(MODELS / 'class-examples.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(MODELS.rglob('*')):
            if f.is_file() and (f.suffix in ('.scad', '.stl') or f.name == 'README.txt'):
                z.write(f, Path('agrotech-3d-printing') / f.relative_to(MODELS))

if __name__ == '__main__': main()
