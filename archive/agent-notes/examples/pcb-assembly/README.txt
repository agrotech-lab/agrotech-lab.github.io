Rebuilding the assembled PCB visualization

1. Run export-board.py --out /your/temp/folder using KiCad 7's bundled Python
   (pcbnew). It exports native board surfaces and copies only the standard
   component WRLs used in this design, plus component-placements.json for the
   five teaching components. Adjust the local library path if needed.
2. Run tessellate-module.py --out the same folder using FreeCAD 1.0's bundled
   Python. It meshes the instructor's original STEP and adds illustrative colors.
3. In that temp folder, copy assemble.js and teaching-components.js, then serve
   an HTML page loading assemble.js as a module.
   Supply Three.js r180 three.module.js, three.core.js, VRMLLoader.js,
   GLTFExporter.js and chevrotain.module.min.js. The latter three are build-only
   tools from the official Three.js r180 examples/jsm tree. Adjust their imports
   to adjacent local files, as with the repository's vendored Three.js modules.
4. Call window.build() in a browser. Decode its returned base64 string into
   archive/3d-printing/pcb-assembly.glb. The export has a 0.001 root scale so
   GLB units are metres; the course viewer restores millimetres with scale 1000.
5. Render the soldering page, inspect top/underside views and component alignment,
   and capture the viewer canvas as archive/figures/3d-printing/pcb-assembly.png.

The source native PCB is never rewritten. Review the PCB-ASSEMBLY-CREDITS.txt
limitations after any change. teaching-components.js replaces placeholder
headers with OLED/SHT31 modules and the two leaded sensors, and adds SW2's
pushbutton. Exact module/package drawings were not supplied: their bodies,
lead heights and colors are illustrative. All five groups retain their KiCad
reference and pad coordinates in GLB extras for checking alignment.
Keep textured MeshBasicMaterials when exporting; converting them without their
maps replaces the OLED text and module markings with white rectangles.
Lead/connector centres and the FireBeetle mounting holes must align with the
source PCB before publishing. The browser camera near plane is 5 mm to resolve the
very small copper/mask layer spacing without z-fighting.
