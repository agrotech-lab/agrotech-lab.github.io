union() {
  cube([30, 20, 6]);
  translate([15, 10, 5])
    cylinder(h=10, d=12, $fn=64);
}
