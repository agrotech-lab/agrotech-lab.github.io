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

## Cumulative worked example

The viewer now defaults to a ten-step PCB stand build. `walkthrough.json`
contains step order, complete code, rendered file paths and 1-based changed
line numbers; the browser never executes OpenSCAD. Steps 1–9 build the part;
step 10 refactors repeated posts/cutters into loops without changing geometry.
Both final stages match the original pcb-stand dimensions and volume.

Rebuild all ten stages, their fixed-camera PNGs, the manifest and both example
ZIPs using `archive/agent-notes/examples/build-printing-walkthrough.py
--openscad /path/to/OpenSCAD`. This script is the source of the staged code.
Its rectangle/post/cutter dimensions must remain consistent with pcb-stand.scad
and the board data. The original parameterized stand is kept as a separate
advanced example. Do not silently round the measured hole positions.

The browser preserves the camera across steps and uses one shared bounding
box, so resizing and moving are visible. Start over resets the camera. The
Other models mode retains the earlier gallery and private local STL upload.
Without WebGL, the same Next/Back controls show the exported PNGs and code.
The code pane uses muted syntax colours on a light background, inspired by
OpenSCAD's light editor theme. The instructor requested restoring change cues
while retaining the syntax colours: use a very pale sage tint and a thin gutter
marker, never the old saturated yellow treatment. Changed-line metadata also
scrolls the new operation into view. Keep the small legend visible only for
worked-example steps; gallery models and uploads have no change markers.
The display-only openscad-code.js lexer
preserves the exact source as text nodes; all complete sources are downloadable.
Failed loads must not pair a new code listing with the previous model.

X/Y/Z letters in the model window are HTML labels projected from the positive
world-axis endpoints on each render. Keep them anchored to the origin axes,
upright and fixed in pixel size when rotating/zooming. The guides render above
the part so they are not hidden inside it; labels stay off in image fallback.

## Reinforced posts and assembly viewer

The stand and all worked-example stages now use tapered posts: d1=12 mm at
the foot, d2=8 mm at the top, with the same 3.4 mm clearance hole and 9 mm
total height. Top radial wall thickness is 2.3 mm. Keep pcb-stand.scad and the
walkthrough builder synchronized; rebuild both ZIPs after any change.

The soldering page uses a separate viewer, assets/pcb-viewer/, and
archive/3d-printing/pcb-assembly.glb. Its origin is the same XY board origin;
KiCad VRML uses the board midplane as Z=0, so the browser lifts the GLB by
9.8 mm to seat the 1.6 mm board on the 9 mm stand. Header and module height
are illustrative. The assembly includes OLED/SHT31 modules, a bead thermistor,
disc photoresistor and pushbutton, replacing the placeholder header geometry.
Their leads match the KiCad pad centres; package bodies are representative.
See PCB-ASSEMBLY-CREDITS.txt for model sources, axis transform and limitations.

Only these two pages opt into _filters/new-tab-links.lua. Resource links open
in a new tab, including code and PDF links; local fragment jumps and viewer
controls stay on the current page. Raw HTML download links need their own
target and rel attributes, since Pandoc's Link filter does not see them.

The OpenSCAD toolbar close-up is SVG displaying the unchanged official PNG,
with numbered boxes over its Preview, Render and STL-export buttons. This
is an older interface, explicitly captioned as such; the menu paths/shortcuts
are the stable directions. Local GUI screenshot automation was unavailable.
