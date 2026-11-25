intersection() {
  translate([0, 0, 10])
    cube([16, 16, 16], center=true);
  translate([0, 0, 10])
    sphere(r=10, $fn=64);
}
