// Units: mm. PCB stand worked example.
difference() {
  union() {
    difference() {
      translate([-4, -4, 0])
        cube([81.406, 86.740, 3]);
      translate([10, 12, -0.1])
        cube([53.406, 54.740, 3.2]);
    }
    translate([4.318, 4.572, 2.8])
      cylinder(h=6.2, d=6, $fn=64);
    translate([4.318, 75.438, 2.8])
      cylinder(h=6.2, d=6, $fn=64);
    translate([69.596, 4.572, 2.8])
      cylinder(h=6.2, d=6, $fn=64);
    translate([69.596, 75.438, 2.8])
      cylinder(h=6.2, d=6, $fn=64);
  }
  translate([4.318, 4.572, -0.1])
    cylinder(h=9.2, d=3.4, $fn=64);
}
