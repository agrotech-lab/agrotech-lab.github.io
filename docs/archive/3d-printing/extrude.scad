linear_extrude(height=6)
  difference() {
    square([30, 20]);
    translate([15, 10])
      circle(d=8, $fn=64);
  }
