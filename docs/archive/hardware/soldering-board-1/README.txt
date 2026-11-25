AGROTECH CLASS SOLDERING PCB

Open soldering_board_1.kicad_pro in KiCad (board format: KiCad 7).
The project contains the schematic and routed PCB. Install KiCad's standard
symbol, footprint and 3D model libraries. The supplied custom FireBeetle
symbol and both custom footprints are included with project-relative tables.

Provenance: copied from the instructor's supplied KiCad folder on 2026-11-25.
Original PCB geometry, routing and electrical design are retained. The custom
switch's footprint library identifier was changed from
Button_Switch_THT:agrotech_button to Agrotech:agrotech_button in the schematic
and PCB so it resolves from the bundled library. Local cache, backups,
personal preferences and absolute-path library tables were omitted.

PCB.png and Schematic.pdf are the original supplied reference exports.
manufacturing/ contains the original BOM, placement CSV and Gerber ZIP.
These exports have not been requalified for a new manufacturing order.
The BOM uses generic R/LED values: use the instructor's parts list.

models/DFR0654.step is the supplied FireBeetle model, retained as a reference;
it is not assigned to U1 in this board. A fully populated 3D assembly is not
included. KiCad's other 3D models depend on its installed standard libraries.

board-dimensions.json records millimetre dimensions extracted from the board.
Origin: component-side bottom-left board corner, X right, Y up.
KiCad drawing coordinates are converted by x = x_KiCad - 104.902 and
 y = 134.112 - y_KiCad. Board: 73.406 x 78.740 x 1.6 mm; 72 drill holes.

The course 3D-printing lesson supplies an editable OpenSCAD stand and a
bare-board mechanical reference STL. The stand has not been physically
printed or fitted. Check real PCB, fastener and solder-joint clearance.
Solder on a heat-resistant surface; fit a PLA stand only after cooling.
