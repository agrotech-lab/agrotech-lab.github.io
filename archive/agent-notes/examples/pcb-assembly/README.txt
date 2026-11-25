Rebuilding the assembled PCB visualization

1. Run export-board.py --out /your/temp/folder using KiCad 7's bundled Python
   (pcbnew). It exports native board surfaces and copies only the standard
   component WRLs used in this design. Adjust the local library path if needed.
2. Run tessellate-module.py --out the same folder using FreeCAD 1.0's bundled
   Python. It meshes the instructor's original STEP and adds illustrative colors.
3. In that temp folder, serve an HTML page with a module script assemble.js.
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
limitations after any change. No exact switch body or external sensor/display
modules were supplied. Socket height and module colors are illustrative.
All header pin and module mounting-hole positions must align with the source
PCB before publishing. The browser camera near plane is 5 mm to resolve the
very small copper/mask layer spacing without z-fighting.
