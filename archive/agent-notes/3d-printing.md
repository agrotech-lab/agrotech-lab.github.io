# Maintaining the 3D-printing lesson

The instructor approved calling the lab printer H2C on 2026-11-25, pending
checking the label. If corrected, update the model/profile guidance in
`tutorials/3d-printing.qmd`. Do not infer the installed nozzle or build plate.

`archive/3d-printing/*.scad` is the source of every generated STL and model
PNG. `models.json` holds viewer choices and a copy of each source for the
read-only code pane: refresh `code` after changing a `.scad` file. The browser
does not execute OpenSCAD. `assembly` uses pcb-stand.stl and pcb-reference.stl,
with the PCB translated to Z=9 (base_h + post_h); update that offset if the
stand changes. Geometry is mm; STL itself does not store units.

Regenerate models with OpenSCAD 2021.01 or later, for example:

```sh
OpenSCAD --hardwarnings --export-format binstl -o archive/3d-printing/pcb-stand.stl archive/3d-printing/pcb-stand.scad
OpenSCAD --render --imgsize=800,600 --autocenter --viewall --projection=o --view=axes -o archive/figures/3d-printing/pcb-stand.png archive/3d-printing/pcb-stand.scad
```

On this Mac, the executable was at
`/Applications/OpenSCAD-2021.01.app/Contents/MacOS/OpenSCAD`.
Rebuild class-examples.zip after changing sources or exports; include the
`.scad`, `.stl` and README.txt files under an agrotech-3d-printing/ directory.
The PCB bundle similarly includes its whole folder except itself/hidden files,
under soldering-board-1/. Include each ZIP only once (avoid nested self-copies).

The PCB project was copied from the instructor's local Drive KiCad folder;
originals were left untouched. See the project README.txt for normalized
library references and limitations. The board rectangle is (104.902,55.372)
to (178.308,134.112) in KiCad drawing coordinates. Mechanical reference uses
x = x_KiCad - 104.902, y = 134.112 - y_KiCad, with 1.6 mm thickness. Extracted
pad drills and mounting holes are saved in board-dimensions.json. There are
72 circular drill holes. The reference omits components, copper and solder;
it is not an electronics model or a complete collision check.

The stand and coupon are unprinted prototypes. Do not change that wording
until there is a real print/fit check. No printer job is supplied: slice with
the lab's confirmed printer, nozzle, plate and material profiles.

The viewer is self-hosted Three.js r180, with LICENSE.txt and NOTICE.txt in
assets/vendor/three-r180/. OpenSCAD screenshot attribution is beside the
images. `_quarto.yml` explicitly copies the model/hardware/vendor resources.
After editing, render with the site's Quarto version (1.6.41 at introduction)
and verify the viewer's presets, local upload, mobile layout and downloads.
Do not hand-edit docs/.
