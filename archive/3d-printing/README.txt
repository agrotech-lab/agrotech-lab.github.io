AGROTECH OPENSCAD CLASS EXAMPLES

Units: millimetres. Open .scad in OpenSCAD, edit, Preview (F5), then Render
(F6) before exporting a new STL. The included STLs were exported using
OpenSCAD 2021.01. The viewer shows exported meshes; it is not an OpenSCAD editor.

Start with the numbered files in walkthrough/: one PCB stand built in ten steps.
Each .scad is complete and runnable. Steps 9 and 10 make the same shape;
step 10 replaces repeated lines with loops. Intermediate stages are not print jobs.
Then explore block, translate, union, difference, extrude, rotate, intersection.
The file pcb-stand is a proposed stand for the course soldering PCB.
Print screw-fit first; the 3.2, 3.4, 3.6 mm holes run from the notched end.
Neither stand nor coupon has been physically printed or fit-tested.
Verify dimensions, hardware clearance and slicing before printing.

pcb-reference is a bare-board mechanical reference (outline and drill holes
only). It is not an electronic PCB replacement and is not part of the print
job. It omits components, copper, connectors and solder joints.
The viewer's assembly puts this board on the 9 mm-high stand.

The sources use only standard OpenSCAD functions and no external libraries.
See the course lesson for instructions: https://agrotech-lab.github.io/tutorials/3d-printing.html
