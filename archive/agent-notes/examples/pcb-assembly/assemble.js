import * as THREE from './three.module.js';
import {VRMLLoader} from './VRMLLoader.js';
import {GLTFExporter} from './GLTFExporter.js';
const loader=new VRMLLoader();
async function load(file){return loader.parse(await (await fetch(file)).text(),'./');}
window.build=async()=>{
 const scene=new THREE.Group();scene.name='Agrotech-assembly';
 const board=await load('board.wrl');board.name='Board';scene.add(board);
 const box=new THREE.Box3().setFromObject(board);console.log('BOARD BOUNDS',box.min.toArray(),box.max.toArray());
 const components=new THREE.Group();components.name='Components';scene.add(components);
 const cache=new Map();
 async function component(e,parent){
  if(!cache.has(e.file))cache.set(e.file,await load(e.file));
  const g=cache.get(e.file).clone();g.name=e.ref;g.scale.setScalar(2.54);g.rotation.z=e.angle*Math.PI/180;g.position.fromArray(e.position);parent.add(g);return g;
 }
 const entries=await (await fetch('components.json')).json();
 for(const e of entries)await component(e,components);
 const headers=new THREE.Group();headers.name='U1-headers';scene.add(headers);
 await component({ref:'U1-row-18',file:'component-models/PinSocket_1x18_P2.54mm_Vertical.wrl',angle:90,position:[20.182,34.724,.8]},headers);
 await component({ref:'U1-row-14',file:'component-models/PinSocket_1x14_P2.54mm_Vertical.wrl',angle:-90,position:[63.362,57.224,.8]},headers);
 const hb=new THREE.Box3().setFromObject(headers);console.log('HEADER BOUNDS',hb.min.toArray(),hb.max.toArray());
 const module=new THREE.Group();module.name='FireBeetle';scene.add(module);
 // STEP uses X across the board, Y vertical, Z lengthwise. Its 4 mounting
 // holes match the KiCad footprint after this axis permutation and translation.
 module.applyMatrix4(new THREE.Matrix4().set(0,0,1,38.862, 1,0,0,45.974, 0,1,0,hb.max.z, 0,0,0,1));
 const parts=await (await fetch('module.json')).json();
 for(const p of parts){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.position,3));g.setIndex(p.index);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:p.color,roughness:.65,metalness:.15}));m.name=p.name;module.add(m);
 }
 // Convert library Phong appearances to glTF's standard materials. Values
 // and colors illustrate the layout, not the instructor's component kit.
 scene.traverse(o=>{if(o.isMesh){const m=o.material;if(!m.isMeshStandardMaterial)o.material=new THREE.MeshStandardMaterial({color:m.color,roughness:.65,metalness:.15,transparent:m.transparent,opacity:m.opacity,side:THREE.DoubleSide});}});
 scene.updateMatrixWorld(true);
 const ab=new THREE.Box3().setFromObject(scene);console.log('ASSEMBLY BOUNDS',ab.min.toArray(),ab.max.toArray());
 // glTF uses metres; all CAD calculations above are in millimetres.
 scene.scale.setScalar(.001);scene.updateMatrixWorld(true);
 const glb=await new GLTFExporter().parseAsync(scene,{binary:true});
 let binary='';for(const byte of new Uint8Array(glb))binary+=String.fromCharCode(byte);
 return {base64:btoa(binary),bounds:[ab.min.toArray(),ab.max.toArray()],moduleBottom:hb.max.z};
};
