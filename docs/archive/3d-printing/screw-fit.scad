// Screw-fit test. From left to right: 3.2, 3.4, 3.6 mm nominal holes.
// Printed holes may differ; choose the hole that fits your actual M3 hardware.
$fn=64;
difference() {
  cube([36,12,3]);
  for (i=[0:2])
    translate([6+12*i,6,-0.1])
      cylinder(h=3.2,d=3.2+0.2*i);
  // Corner notch identifies the 3.2 mm end, even after turning the part over.
  translate([-1,-1,-0.1]) cube([4,4,3.2]);
}
