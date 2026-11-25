// Units: mm. PCB stand worked example.
holes = [[4.318, 4.572], [4.318, 75.438],
         [69.596, 4.572], [69.596, 75.438]];
$fn = 64;

difference() {
  union() {
    difference() {
      translate([-4, -4, 0])
        cube([81.406, 86.740, 3]);
      translate([10, 12, -0.1])
        cube([53.406, 54.740, 3.2]);
    }
    for (p = holes)
      translate([p[0], p[1], 2.8])
        cylinder(h=6.2, d=6);
  }
  for (p = holes)
    translate([p[0], p[1], -0.1])
      cylinder(h=9.2, d=3.4);
}
