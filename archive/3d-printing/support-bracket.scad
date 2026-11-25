// Support demonstration: the same bracket in two print orientations.
// Units: mm. Generate supports in Bambu Studio, not in this source.
// false = long overhang; true = turn the broad face onto the build plate.
flat_face_down = false;
width = 36;
depth = 14;
height = 28;
wall = 4;

module bracket() {
    union() {
        cube([wall, depth, height]);
        translate([0, 0, height-wall])
            cube([width, depth, wall]);
    }
}

if (flat_face_down)
    translate([0, depth, height]) rotate([180, 0, 0]) bracket();
else
    bracket();
