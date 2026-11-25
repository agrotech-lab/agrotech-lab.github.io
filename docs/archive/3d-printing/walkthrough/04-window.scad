// Units: mm. PCB stand worked example.
difference() {
  translate([-4, -4, 0])
    cube([81.406, 86.740, 3]);
  translate([10, 12, -0.1])
    cube([53.406, 54.740, 3.2]);
}
