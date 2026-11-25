import * as THREE from './three.module.js';

// Teaching geometry, in mm. Pad centres come from the actual KiCad board;
// package sizes and installed lead lengths are representative, not fit data.
const metal = new THREE.MeshStandardMaterial({color:0xb8bec5,metalness:.75,roughness:.35});
const gold = new THREE.MeshStandardMaterial({color:0xc5a553,metalness:.55,roughness:.4});
const black = new THREE.MeshStandardMaterial({color:0x242930,roughness:.65});
const material = color => new THREE.MeshStandardMaterial({color,roughness:.65});
function mesh(parent,geometry,appearance,position,name) {
  const m=new THREE.Mesh(geometry,appearance);m.position.fromArray(position);m.name=name;parent.add(m);return m;
}
function box(parent,size,position,appearance,name) {
  return mesh(parent,new THREE.BoxGeometry(...size),appearance,position,name);
}
function cylinder(parent,radius,height,position,appearance,name) {
  const g=new THREE.CylinderGeometry(radius,radius,height,32);g.rotateX(Math.PI/2);
  return mesh(parent,g,appearance,position,name);
}
function wire(parent,points,radius,appearance,name) {
  const path=new THREE.CurvePath();
  for(let i=1;i<points.length;i++)path.add(new THREE.LineCurve3(new THREE.Vector3(...points[i-1]),new THREE.Vector3(...points[i])));
  return mesh(parent,new THREE.TubeGeometry(path,Math.max(8,points.length*8),radius,8,false),appearance,[0,0,0],name);
}
function ring(parent,x,y,z,outer=.95,inner=.55) {
  return mesh(parent,new THREE.RingGeometry(inner,outer,32),gold,[x,y,z],'Plated pad');
}
function board(parent,w,h,center,z,holes,color) {
  const [x,y]=center,c=1,shape=new THREE.Shape();
  const outline=[[-w/2+c,-h/2],[w/2-c,-h/2],[w/2,-h/2+c],[w/2,h/2-c],[w/2-c,h/2],[-w/2+c,h/2],[-w/2,h/2-c],[-w/2,-h/2+c]];
  outline.forEach(([px,py],i)=>i?shape.lineTo(px,py):shape.moveTo(px,py));shape.closePath();
  for(const [hx,hy,r] of holes){const hole=new THREE.Path();hole.absarc(hx-x,hy-y,r,0,Math.PI*2,true);shape.holes.push(hole);}
  return mesh(parent,new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false,curveSegments:24}),material(color),[x,y,z],'Module PCB');
}
function printedText(parent,text,w,h,position,color='#e3e9ed',background=null) {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.max(64,Math.round(512*h/w));
  const ctx=canvas.getContext('2d');
  if(background){ctx.fillStyle=background;ctx.fillRect(0,0,canvas.width,canvas.height);}
  ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${Math.round(canvas.height*.68)}px monospace`;
  ctx.fillText(text,canvas.width/2,canvas.height/2,canvas.width*.95);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return mesh(parent,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:!background,side:THREE.DoubleSide}),position,text);
}
function pins(parent,pads,top) {
  const [cx,cy]=mean(pads);
  box(parent,[10.16,2.54,2.54],[cx,cy,2.07],black,'Four-pin spacer');
  for(const p of pads)box(parent,[.6,.6,top+2.3],[...p.xy,(top-2.3)/2],gold,`Pin ${p.number}: ${p.net}`);
}
function mean(pads) {
  return [0,1].map(i=>pads.reduce((sum,p)=>sum+p.xy[i],0)/pads.length);
}
function part(scene,name,reference,pads) {
  const group=new THREE.Group();group.name=name;
  group.userData={reference,illustrative:true,pads:pads.map(p=>({number:p.number,xy:p.xy,net:p.net}))};scene.add(group);return group;
}

function oled(scene,{pads}) {
  const g=part(scene,'OLED','J1',pads),[cx,headerY]=mean(pads);
  // Four-pin display in the style of archive/figures/OLED.png. Its connector
  // is at the rear edge, so the glass extends into the clear front-left area.
  const w=35.5,h=33,cy=headerY+2.54-h/2,z=6.2;
  const holes=pads.map(p=>[...p.xy,.55]);
  for(const dx of [-w/2+3,w/2-3])for(const dy of [-h/2+2.2,h/2-2.2])holes.push([cx+dx,cy+dy,1.25]);
  board(g,w,h,[cx,cy],z,holes,0x18526c);pins(g,pads,z+1.4);
  for(const p of pads)ring(g,...p.xy,z+1.02);
  box(g,[34,23,.8],[cx,cy-.8,z+1.4],black,'OLED glass');
  box(g,[30.5,15.5,.12],[cx,cy+.4,z+1.86],new THREE.MeshBasicMaterial({color:0x0c1721}),'OLED active area');
  printedText(g,'AGROTECH',25,4.2,[cx,cy+2.3,z+1.94],'#b9ecff');
  printedText(g,'OLED',13,3,[cx,cy-2.6,z+1.94],'#b9ecff');
  // A visible flex tail and a small driver package below the glass.
  box(g,[8,3.6,.12],[cx,cy-h/2+2.1,z+1.07],material(0xb07b2e),'OLED flex tail');
  box(g,[9,1.8,.7],[cx,cy-h/2+3.1,z+1.45],black,'OLED driver');
  for(let i=0;i<12;i++)box(g,[.14,3.1,.03],[cx-3.3+i*.6,cy-h/2+2.0,z+1.15],gold,'Flex contact');
  printedText(g,'VCC GND SCL SDA',11,1.05,[cx,headerY-1.4,z+1.03]);
}

function sht31(scene,{pads}) {
  const g=part(scene,'SHT31','J2',pads),[cx,headerY]=mean(pads);
  const cy=headerY+5,z=4.8,w=13,h=14;
  const holes=[...pads.map(p=>[...p.xy,.55]),[cx-4.5,cy+4.8,1.1],[cx+4.5,cy+4.8,1.1]];
  board(g,w,h,[cx,cy],z,holes,0x235c96);pins(g,pads,z+1.4);
  for(const p of pads)ring(g,...p.xy,z+1.02);
  for(const [x,y] of holes.slice(-2))ring(g,x,y,z+1.02,1.5,1.1);
  // Sensirion specifies the SHT31-DIS-B package as 2.5 x 2.5 x 0.9 mm.
  box(g,[2.5,2.5,.9],[cx,cy+2.3,z+1.45],material(0xa4a7aa),'SHT31 sensor package');
  box(g,[1.15,1.4,.04],[cx,cy+2.3,z+1.92],material(0x2b3033),'Humidity sensing opening');
  for(const dx of [-3.8,3.8])for(const dy of [-1.4,1]){
    box(g,[1.5,.65,.35],[cx+dx,cy+dy,z+1.18],black,'SMD passive');
    for(const end of [-.65,.65])box(g,[.25,.7,.37],[cx+dx+end,cy+dy,z+1.2],metal,'SMD termination');
  }
  printedText(g,'SHT31',7.4,1.7,[cx,cy-.7,z+1.04]);
  printedText(g,'V G C D',9,1,[cx,headerY+1.4,z+1.04]);
}

function thermistor(scene,{pads}) {
  const g=part(scene,'Thermistor','TH1',pads),[cx,cy]=mean(pads);
  // Black epoxy bead with formed leads matching the two actual PCB holes.
  for(const p of pads){
    const dx=(p.xy[0]-cx)*.35,dy=(p.xy[1]-cy)*.35;
    wire(g,[[...p.xy,-2.3],[...p.xy,5.5],[cx+dx,cy+dy,7.5]],.19,metal,`Thermistor lead ${p.number}`);
  }
  const bead=mesh(g,new THREE.SphereGeometry(1,24,16),material(0x222b2b),[cx,cy,8.2],'Epoxy thermistor bead');
  bead.scale.set(1.1,1.25,1.7);
}

function photoresistor(scene,{pads}) {
  const g=part(scene,'Photoresistor','R2',pads),[cx,cy]=mean(pads);
  for(const p of pads)wire(g,[[...p.xy,-2.3],[...p.xy,7.6]],.2,metal,`Photoresistor lead ${p.number}`);
  cylinder(g,2.5,.9,[cx,cy,7.65],material(0xbb6b31),'LDR disc');
  cylinder(g,2.23,.08,[cx,cy,8.14],material(0xe8d6b3),'LDR light-sensitive face');
  // The characteristic serpentine track makes the sensor recognizable.
  const track=[];
  for(let row=0;row<6;row++){
    const y=cy-1.65+row*.66,x0=cx+(row%2?1.35:-1.35),x1=cx+(row%2?-1.35:1.35);
    track.push([x0,y,8.2],[x1,y,8.2]);
  }
  wire(g,track,.1,material(0xaa5830),'LDR serpentine track');
}

function pushbutton(scene,{pads}) {
  const g=part(scene,'Pushbutton','SW2',pads),[cx,cy]=mean(pads);
  for(const p of pads)box(g,[.55,.5,4.1],[...p.xy,-.25],metal,`Button lead ${p.number}`);
  box(g,[6,6.4,2.6],[cx,cy,2.2],black,'Pushbutton body');
  box(g,[5.8,6.2,.3],[cx,cy,3.65],metal,'Pushbutton top plate');
  cylinder(g,1.65,1.5,[cx,cy,4.55],black,'Press actuator');
  for(const dx of [-2.25,2.25])for(const dy of [-2.4,2.4])cylinder(g,.32,.15,[cx+dx,cy+dy,3.87],black,'Top-plate fastener');
}

export function addTeachingComponents(scene,placements) {
  for(const [ref,build] of [['J1',oled],['J2',sht31],['TH1',thermistor],['R2',photoresistor],['SW2',pushbutton]]) {
    if(!placements[ref])throw new Error(`Missing PCB placement: ${ref}`);
    build(scene,placements[ref]);
  }
}
