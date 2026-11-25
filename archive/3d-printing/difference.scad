difference() {
  cube([30, 20, 6]);
  translate([15, 10, -1])
    cylinder(h=8, d=8, $fn=64);
}
