import * as THREE from '../vendor/three-r180/three.module.js';
import {OrbitControls} from '../vendor/three-r180/OrbitControls.js';
import {GLTFLoader} from '../vendor/three-r180/GLTFLoader.js';
import {STLLoader} from '../vendor/three-r180/STLLoader.js';

const root=document.getElementById('pcb-assembly');
if(root)start().catch(error=>{
  root.querySelector('[data-status]').textContent='The rotating view is unavailable. The assembly image and downloads below still work.';
  console.error('PCB viewer:',error);
});
async function start(){
  const q=s=>root.querySelector(s),canvas=q('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf2f6f8);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,5,1000);camera.up.set(0,0,1);
  const controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.minDistance=35;controls.maxDistance=600;
  const render=()=>renderer.render(scene,camera);controls.addEventListener('change',render);
  scene.add(new THREE.HemisphereLight(0xffffff,0x82929d,2.2));
  for(const [position,intensity] of [[[20,-50,120],2.5],[[-40,100,60],1.2]]){const l=new THREE.DirectionalLight(0xffffff,intensity);l.position.fromArray(position);scene.add(l);}
  const base=new URL('../../archive/3d-printing/',import.meta.url);
  const [gltf,geometry]=await Promise.all([new GLTFLoader().loadAsync(new URL('pcb-assembly.glb',base).href),new STLLoader().loadAsync(new URL('pcb-stand.stl',base).href)]);
  const assembly=gltf.scene;assembly.scale.setScalar(1000);assembly.position.z=9.8;scene.add(assembly);
  const stand=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0x2482ad,roughness:.75}));scene.add(stand);
  const module=assembly.getObjectByName('FireBeetle');
  const center=new THREE.Vector3(36.7,39.4,12),radius=63;
  function home(view='angled'){
    const v=new THREE.Vector3(...({angled:[1,-1.3,1.2],top:[0,0,1],bottom:[0,0,-1]}[view])).normalize();
    const vertical=THREE.MathUtils.degToRad(camera.fov),angle=Math.min(vertical,2*Math.atan(Math.tan(vertical/2)*camera.aspect));
    controls.target.copy(center);camera.position.copy(center).addScaledVector(v,radius/Math.sin(angle/2));controls.update();render();
  }
  function resize(){const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();render();}
  new ResizeObserver(resize).observe(canvas.parentElement);
  for(const b of root.querySelectorAll('[data-view]'))b.addEventListener('click',()=>home(b.dataset.view));
  q('[data-module]').addEventListener('change',e=>{module.visible=e.target.checked;render();});
  q('[data-stand]').addEventListener('change',e=>{stand.visible=e.target.checked;render();});
  q('[data-reset]').addEventListener('click',()=>{module.visible=true;stand.visible=true;q('[data-module]').checked=true;q('[data-stand]').checked=true;home();});
  for(const b of root.querySelectorAll('[data-zoom]'))b.addEventListener('click',()=>{camera.position.sub(controls.target).multiplyScalar(Number(b.dataset.zoom)).add(controls.target);controls.update();render();});
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();
    const offset=camera.position.clone().sub(controls.target),z=new THREE.Vector3(0,0,1);
    const axis=e.key==='ArrowLeft'||e.key==='ArrowRight'?z:new THREE.Vector3().crossVectors(offset,z).normalize();
    offset.applyAxisAngle(axis,e.key==='ArrowLeft'||e.key==='ArrowUp'?.12:-.12);camera.position.copy(controls.target).add(offset);controls.update();render();
  });
  const full=q('[data-fullscreen]');full.hidden=!document.fullscreenEnabled;
  full.addEventListener('click',async()=>{try{if(document.fullscreenElement===root)await document.exitFullscreen();else await root.requestFullscreen();}catch{q('[data-status]').textContent='Full screen is unavailable; you can still rotate this view.';}});
  document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement===root?'Exit full screen':'Full screen';resize();home();});
  root.classList.add('is-ready');resize();home();q('[data-status]').textContent='Drag to rotate · scroll or pinch to zoom';root.dataset.ready='true';
}
