// Agrotech soldering-board stand. Units: mm. Prototype: verify on the actual PCB.
// Origin: PCB bottom-left corner, X right, Y up.
board_w = 73.406;
board_d = 78.740;
margin = 4;
base_h = 3;
post_h = 6;       // clearance above the base for trimmed solder joints
post_d = 6;
screw_d = 3.4;    // printed clearance hole: test with your M3 hardware first
holes = [[4.318,4.572], [4.318,75.438],
         [69.596,4.572], [69.596,75.438]];
$fn = 64;

difference() {
  union() {
    // Open frame keeps the underside accessible and saves material.
    difference() {
      translate([-margin,-margin,0])
        cube([board_w+2*margin, board_d+2*margin, base_h]);
      translate([10,12,-0.1])
        cube([board_w-20, board_d-24, base_h+0.2]);
    }
    for (p = holes)
      translate([p[0],p[1],base_h-0.2])
        cylinder(h=post_h+0.2, d=post_d);
  }
  for (p = holes)
    translate([p[0],p[1],-0.1])
      cylinder(h=base_h+post_h+0.2, d=screw_d);
}
