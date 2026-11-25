import * as THREE from '../vendor/three-r180/three.module.js';
import {OrbitControls} from '../vendor/three-r180/OrbitControls.js';
import {STLLoader} from '../vendor/three-r180/STLLoader.js';

const root = document.getElementById('stl-explorer');
if (root) start().catch(error => {
  root.querySelector('[data-status]').textContent = 'The interactive view is unavailable. Use the model images and downloads below.';
  console.error('STL viewer:', error);
});

async function start() {
  const q = s => root.querySelector(s);
  const base = new URL('../../archive/3d-printing/', import.meta.url);
  const images = new URL('../../archive/figures/3d-printing/', import.meta.url);
  const [gallery, steps] = await Promise.all(['models.json','walkthrough.json'].map(async file => {
    const response = await fetch(new URL(file, base));
    if (!response.ok) throw new Error('Model list could not be loaded');
    return response.json();
  }));
  const entries = [...steps, ...gallery];
  let mode='walkthrough', stepIndex=0, galleryId='difference', busy=false;
  const select = q('[data-model]'), status = q('[data-status]'), canvas = q('canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0xf4f7fa);
    renderer.localClippingEnabled = true;
  } catch {
    q('[data-render-help]').hidden=false;
    for (const control of root.querySelectorAll('[data-camera-tools] button, [data-wire], [data-height], [data-upload]')) control.disabled=true;
  }
  root.dataset.viewer=renderer?'3d':'images';
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 5000);
  camera.up.set(0,0,1);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.screenSpacePanning = true;
  controls.minDistance = 1;
  controls.maxDistance = 5000;
  controls.addEventListener('change', render);
  scene.add(new THREE.HemisphereLight(0xffffff,0x708090,2.2));
  const light = new THREE.DirectionalLight(0xffffff,2.8);light.position.set(50,-60,100);scene.add(light);
  const fill = new THREE.DirectionalLight(0xffffff,1.2);fill.position.set(-60,70,40);scene.add(fill);
  const grid = new THREE.GridHelper(160,32,0x8094a8,0xd3dde7);grid.rotation.x=Math.PI/2;grid.position.z=-.12;scene.add(grid);
  const axes = new THREE.AxesHelper(16);axes.position.z=.05;scene.add(axes);
  const group = new THREE.Group();scene.add(group);
  const plane = new THREE.Plane(new THREE.Vector3(0,0,-1),10000);
  const loader = new STLLoader();
  let bounds = new THREE.Box3(), center = new THREE.Vector3(), radius=30, generation=0, active=null;
  for (const e of gallery) {const o=document.createElement('option');o.value=e.id;o.textContent=e.title;select.append(o);}
  function render(){renderer?.render(scene,camera);}
  function resize(){const r=canvas.parentElement.getBoundingClientRect();if(r.width<=0)return;const h=Math.max(240,canvas.parentElement.clientHeight);renderer?.setSize(r.width,h,false);camera.aspect=r.width/h;camera.updateProjectionMatrix();render();}
  new ResizeObserver(resize).observe(canvas.parentElement);
  function dispose(){while(group.children.length){const m=group.children[0];group.remove(m);m.geometry.dispose();m.material.dispose();}}
  function validate(geometry){
    try {
    const p=geometry.getAttribute('position');
    if(!p || p.count<3 || p.count%3 || p.count>900000) throw new Error('Use a valid STL with fewer than 300,000 triangles.');
    for(const x of p.array)if(!Number.isFinite(x) || Math.abs(x)>10000)throw new Error('The STL contains invalid or excessively large coordinates.');
    geometry.computeBoundingBox();const size=geometry.boundingBox.getSize(new THREE.Vector3());
    if(Math.min(size.x,size.y,size.z)<=0 || Math.max(size.x,size.y,size.z)>10000)throw new Error('The STL must be a 3D object with reasonable dimensions. Units are interpreted as millimetres.');
    geometry.computeVertexNormals();return geometry;
    } catch(error) {geometry.dispose();throw error;}
  }
  function parseSTL(buffer){
    let parsed;try{parsed=loader.parse(buffer);}catch{throw new Error('Export a fresh STL from your modeling program and try again.');}
    return validate(parsed);
  }
  async function geometry(file){const r=await fetch(new URL(file,base));if(!r.ok)throw new Error('Could not load '+file);return parseSTL(await r.arrayBuffer());}
  function add(g,color,z=0){const material=new THREE.MeshStandardMaterial({color,roughness:.67,metalness:.03,side:THREE.DoubleSide,clippingPlanes:[plane]});const mesh=new THREE.Mesh(g,material);mesh.position.z=z;group.add(mesh);return mesh;}
  function home(view='angled'){
    const directions={angled:[1,-1.25,.95],top:[0,0,1],side:[1,0,.02]};
    const v=new THREE.Vector3(...directions[view]).normalize();
    const vertical=THREE.MathUtils.degToRad(camera.fov);
    const fitAngle=Math.min(vertical,2*Math.atan(Math.tan(vertical/2)*camera.aspect));
    const distance=radius/Math.sin(fitAngle/2)*1.15;
    controls.target.copy(center);camera.position.copy(center).addScaledVector(v,distance);camera.near=Math.max(.01,distance/1000);camera.far=Math.max(5000,distance*10);camera.updateProjectionMatrix();controls.update();render();
  }
  function clipping(){const fraction=Number(q('[data-height]').value)/100;plane.constant=bounds.min.z+(bounds.max.z-bounds.min.z)*fraction+.001;q('[data-height-value]').textContent=Math.round(fraction*100)+'%';render();}
  function isStep(item){return steps.includes(item);}
  function navigation(){
    q('[data-navigation]').hidden=false;
    q('[data-walkthrough]').hidden=mode!=='walkthrough';
    q('[data-explore]').hidden=mode!=='explore';
    q('[data-upload-tools]').hidden=mode!=='explore';
    q('[data-back]').disabled=busy || stepIndex===0;
    q('[data-next]').disabled=busy || stepIndex===steps.length-1;
    q('[data-restart]').disabled=busy;
    q('[data-progress]').textContent=`Step ${stepIndex+1} of ${steps.length}`;
    for(const b of root.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
    root.dataset.viewerMode=mode;
  }
  function showCode(item){
    const code=q('[data-code]'), changed=new Set(item.changedLines || []);
    code.replaceChildren();
    item.code.replace(/\n$/, '').split('\n').forEach((line,i)=>{
      if(changed.has(i+1)){
        const mark=document.createElement('mark');mark.textContent=line;code.append(mark);
      }else code.append(document.createTextNode(line));
      code.append(document.createTextNode('\n'));
    });
    q('[data-code-key]').textContent=isStep(item)?'Complete code · highlighted lines are new or changed':'Complete OpenSCAD code';
    const pre=code.parentElement;pre.scrollTop=0;
    // Keep the actual new operation in view when the complete file grows.
    requestAnimationFrame(()=>{
      if(active!==item)return;
      const marks=[...code.querySelectorAll('mark')].filter(m=>!['{','}'].includes(m.textContent.trim()));
      const last=marks.at(-1);
      if(last && last.getBoundingClientRect().bottom>pre.getBoundingClientRect().bottom)
        pre.scrollTop=last.getBoundingClientRect().bottom-pre.getBoundingClientRect().bottom+24;
    });
  }
  function ready(preserveCamera=false){
    bounds.setFromObject(group);const size=bounds.getSize(new THREE.Vector3());
    let fit=bounds.clone();
    if(isStep(active)){
      // One fixed frame for the whole build: resizing and translating must
      // visibly change the part, rather than being cancelled by auto-fit.
      fit=new THREE.Box3(new THREE.Vector3(-4,-4,0),new THREE.Vector3(81.406,86.740,20));
    }else if(active && ['block','translate','rotate'].includes(active.id))fit.expandByPoint(new THREE.Vector3(0,0,0));
    fit.getCenter(center);radius=Math.max(fit.getSize(new THREE.Vector3()).length()/2,1);
    q('[data-size]').textContent=[size.x,size.y,size.z].map(x=>x.toFixed(2)).join(' × ')+' mm (X × Y × Z)';
    q('[data-height]').value=100;q('[data-wire]').checked=false;clipping();
    root.classList.toggle('is-ready',Boolean(renderer));root.dataset.ready='true';root.setAttribute('aria-busy','false');
    resize();if(!preserveCamera)home();else render();
  }
  async function choose(id,resetCamera=false){
    const item=entries.find(e=>e.id===id);if(!item)return;
    const token=++generation;busy=true;navigation();
    q('[data-upload]').value='';root.dataset.ready='false';root.setAttribute('aria-busy','true');status.textContent='Loading '+item.title+'…';
    const loaded=[];
    try{
      loaded.push(await geometry(item.file));
      if(item.assembly)loaded.push(await geometry('pcb-reference.stl'));
      if(token!==generation){loaded.forEach(g=>g.dispose());return;}
      const preserveCamera=!resetCamera && isStep(active) && isStep(item);
      dispose();add(loaded[0],item.id==='pcb'?0x31966d:0x2482ad);
      if(item.assembly)add(loaded[1],0x31966d,9);
      active=item;mode=isStep(item)?'walkthrough':'explore';
      if(isStep(item))stepIndex=steps.indexOf(item);else galleryId=item.id;
      select.value=galleryId;root.dataset.activeModel=item.id;
      showCode(item);q('[data-note]').textContent=item.description;
      q('[data-stl-link]').href=new URL(item.file,base);q('[data-stl-link]').hidden=false;
      q('[data-scad-link]').href=new URL(item.scad,base);q('[data-scad-link]').hidden=false;
      q('[data-fallback]').src=new URL(item.image,images);
      q('[data-fallback]').alt=item.title+' rendered in OpenSCAD';
      ready(preserveCamera);status.textContent=isStep(item)?`Step ${stepIndex+1}: ${item.title}`:item.title;
    }catch(e){
      loaded.forEach(g=>g.dispose());if(token!==generation)return;
      root.setAttribute('aria-busy','false');select.value=galleryId;
      status.textContent='Could not load this model. Try again or use the downloads below.';
    }finally{if(token===generation){busy=false;navigation();}}
  }
  select.addEventListener('change',()=>choose(select.value));
  q('[data-back]').addEventListener('click',()=>{if(!busy && stepIndex>0)choose(steps[stepIndex-1].id);});
  q('[data-next]').addEventListener('click',()=>{if(!busy && stepIndex<steps.length-1)choose(steps[stepIndex+1].id);});
  q('[data-restart]').addEventListener('click',()=>choose(steps[0].id,true));
  for(const b of root.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>choose(b.dataset.mode==='walkthrough'?steps[stepIndex].id:galleryId));
  q('[data-upload]').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    const token=++generation;busy=true;navigation();root.dataset.ready='false';root.setAttribute('aria-busy','true');status.textContent='Opening '+file.name+'…';
    let g;
    try{
      if(file.size>20*1024*1024)throw new Error('Choose a file smaller than 20 MB.');
      const buffer=await file.arrayBuffer();g=parseSTL(buffer);
      if(token!==generation){g.dispose();return;}
      dispose();active=null;select.value='';add(g,0x2482ad);g=null;root.dataset.activeModel='upload';
      q('[data-code-key]').textContent='Your STL preview';
      q('[data-code]').textContent='An STL stores triangles, not the original OpenSCAD code. Open the matching .scad file to edit the design.';
      q('[data-note]').textContent='Your file stays in this browser. STL does not store units; this viewer reads coordinates as millimetres. Check size and printability in your slicer.';
      q('[data-stl-link]').hidden=true;q('[data-scad-link]').hidden=true;
      ready();status.textContent=file.name;
    }catch(e){if(g)g.dispose();if(token!==generation)return;root.setAttribute('aria-busy','false');status.textContent='Could not open this STL. '+e.message;}
    finally{if(token===generation){busy=false;navigation();}}
  });
  for(const b of root.querySelectorAll('[data-view]'))b.addEventListener('click',()=>home(b.dataset.view));
  q('[data-reset]').addEventListener('click',()=>{q('[data-height]').value=100;q('[data-wire]').checked=false;group.children.forEach(m=>m.material.wireframe=false);clipping();home();});
  for(const b of root.querySelectorAll('[data-zoom]'))b.addEventListener('click',()=>{camera.position.sub(controls.target).multiplyScalar(Number(b.dataset.zoom)).add(controls.target);controls.update();render();});
  q('[data-height]').addEventListener('input',clipping);
  q('[data-wire]').addEventListener('change',event=>{group.children.forEach(m=>m.material.wireframe=event.target.checked);render();});
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();
    const offset=camera.position.clone().sub(controls.target);const axis=new THREE.Vector3(0,0,1);
    if(event.key==='ArrowLeft'||event.key==='ArrowRight')offset.applyAxisAngle(axis,event.key==='ArrowLeft'?.15:-.15);
    else {const horizontal=new THREE.Vector3().crossVectors(offset,axis).normalize();offset.applyAxisAngle(horizontal,event.key==='ArrowUp'?.1:-.1);}
    camera.position.copy(controls.target).add(offset);controls.update();render();
  });
  const full=q('[data-fullscreen]');full.hidden=!document.fullscreenEnabled;
  full.addEventListener('click',async()=>{try{if(document.fullscreenElement===root)await document.exitFullscreen();else await root.requestFullscreen();}catch{status.textContent='Your browser could not open the enlarged view.';}});
  document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement===root?'Exit full screen':'Full screen';resize();});
  for(const link of document.querySelectorAll('[data-open-model]'))link.addEventListener('click',()=>choose(link.dataset.openModel));
  await choose(steps[0].id);
}
