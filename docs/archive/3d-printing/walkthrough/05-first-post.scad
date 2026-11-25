// Units: mm. PCB stand worked example.
union() {
  difference() {
    translate([-4, -4, 0])
      cube([81.406, 86.740, 3]);
    translate([10, 12, -0.1])
      cube([53.406, 54.740, 3.2]);
  }
  translate([4.318, 4.572, 2.8])
    cylinder(h=6.2, d1=12, d2=8, $fn=64);
}
