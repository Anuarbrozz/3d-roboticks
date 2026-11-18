import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=null;
const camera=new THREE.PerspectiveCamera(42,canvas.clientWidth/canvas.clientHeight,.1,100);camera.position.set(5.5,4.4,7.2);
scene.add(new THREE.HemisphereLight(0xbedaff,0x202b3b,2.2));
const key=new THREE.DirectionalLight(0xffffff,3.1);key.position.set(4,8,5);key.castShadow=true;scene.add(key);
const rim=new THREE.DirectionalLight(0x34c9ff,2);rim.position.set(-5,3,-4);scene.add(rim);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x0c1420,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.05;floor.receiveShadow=true;scene.add(floor);
let grid=new THREE.GridHelper(12,24,0x28718a,0x203247);grid.position.y=.002;scene.add(grid);
const mat=(color,metal=.5,rough=.28)=>new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough});
const orange=mat(0xff8b2e,.65,.25), dark=mat(0x26384d,.7,.25), steel=mat(0xb8c7d8,.8,.2), cyan=mat(0x39c9e8,.6,.25), black=mat(0x101923,.5,.3);
function box(parent,w,h,d,m,pos){let mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function cyl(parent,r1,r2,h,m,pos,axis='y'){let o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,32),m);o.position.set(...pos);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;o.castShadow=true;parent.add(o);return o}
function sphere(parent,r,m,pos){let o=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),m);o.position.set(...pos);o.castShadow=true;parent.add(o);return o}
const root=new THREE.Group();scene.add(root);
const axes=[];
const base=new THREE.Group();root.add(base);axes.push(base);
cyl(base,.72,.78,.32,dark,[0,.16,0]);cyl(base,.53,.62,.17,orange,[0,.4,0]);cyl(base,.35,.42,.35,steel,[0,.63,0]);cyl(base,.31,.34,.2,orange,[0,.82,0]);
const shoulder=new THREE.Group();shoulder.position.set(0,.95,0);base.add(shoulder);axes.push(shoulder);
cyl(shoulder,.36,.4,.5,steel,[0,0,0],'x');sphere(shoulder,.38,orange,[0,0,0]);
box(shoulder,.43,.85,.43,orange,[0,.48,0]);box(shoulder,.27,.56,.47,dark,[0,.5,.23]);box(shoulder,.12,.42,.5,steel,[0,.52,.49]);
const elbow=new THREE.Group();elbow.position.set(0,.95,0);shoulder.add(elbow);axes.push(elbow);
cyl(elbow,.3,.32,.5,dark,[0,0,0],'x');sphere(elbow,.33,steel,[0,0,0]);box(elbow,.32,.95,.35,orange,[0,.45,0]);box(elbow,.16,.7,.37,dark,[0,.5,.2]);
const wrist1=new THREE.Group();wrist1.position.set(0,.9,0);elbow.add(wrist1);axes.push(wrist1);
cyl(wrist1,.24,.26,.4,steel,[0,0,0],'x');box(wrist1,.3,.43,.3,orange,[0,.25,0]);
const wrist2=new THREE.Group();wrist2.position.set(0,.42,0);wrist1.add(wrist2);axes.push(wrist2);
cyl(wrist2,.19,.2,.35,dark,[0,0,0],'x');box(wrist2,.24,.35,.24,steel,[0,.18,0]);
const wrist3=new THREE.Group();wrist3.position.set(0,.36,0);wrist2.add(wrist3);axes.push(wrist3);
cyl(wrist3,.15,.16,.27,orange,[0,0,0]);box(wrist3,.16,.28,.18,dark,[0,.17,0]);
cyl(wrist3,.12,.13,.24,cyan,[0,.32,0]);
const tool= new THREE.Group();tool.position.set(0,.46,0);wrist3.add(tool);
box(tool,.1,.24,.1,steel,[0,.1,0]);box(tool,.34,.07,.09,cyan,[0,.25,0]);box(tool,.06,.22,.06,steel,[-.13,.35,0]);box(tool,.06,.22,.06,steel,[.13,.35,0]);
const jointNames=['J1 · BASE','J2 · SHOULDER','J3 · ELBOW','J4 · WRIST','J5 · TILT','J6 · TOOL'];
const sliders=[];
const ranges=[[-180,180],[-120,120],[-150,150],[-180,180],[-120,120],[-360,360]];
const jointsDiv=document.querySelector('#joints');
axes.forEach((g,i)=>{let div=document.createElement('div');div.className='joint';div.innerHTML=`<div class="joint-head"><strong>${jointNames[i]}</strong><output id="val${i}">0°</output></div><input class="range" id="slider${i}" type="range" min="${ranges[i][0]}" max="${ranges[i][1]}" value="0" step="1">`;jointsDiv.appendChild(div);let input=div.querySelector('input');sliders.push(input);input.addEventListener('input',()=>{document.getElementById('val'+i).textContent=input.value+'°';g.rotation[ i===0?'y':i===1||i===2?'z':i===3?'y':i===4?'z':'y' ]=THREE.MathUtils.degToRad(Number(input.value));});});
function setHome(){const vals=[0,0,0,0,0,0];sliders.forEach((s,i)=>{s.value=vals[i];s.dispatchEvent(new Event('input'));})}
document.querySelector('#reset').onclick=setHome;document.querySelector('#home').onclick=()=>{const vals=[0,-25,45,0,20,0];sliders.forEach((s,i)=>{s.value=vals[i];s.dispatchEvent(new Event('input'));})};
let demoOn=false;let demoFrame=null;document.querySelector('#demo').onclick=()=>{if(demoOn)return;demoOn=true;let start=performance.now();const loop=(t)=>{if(!demoOn)return;let k=(t-start)/1000;let vals=[Math.sin(k*.8)*50,Math.sin(k)*30-25,Math.sin(k*1.2)*50+45,Math.sin(k*1.5)*60,Math.sin(k*1.1)*35,Math.sin(k*2)*100];sliders.forEach((s,i)=>{s.value=Math.round(vals[i]);s.dispatchEvent(new Event('input'));});demoFrame=requestAnimationFrame(loop)};demoFrame=requestAnimationFrame(loop)};
document.querySelector('#stop').onclick=()=>{demoOn=false;if(demoFrame)cancelAnimationFrame(demoFrame)};document.querySelector('#gridBtn').onclick=(e)=>{grid.visible=!grid.visible;e.target.textContent='GRID: '+(grid.visible?'ON':'OFF')};
let dragging=false,px=0,py=0,theta=0,phi=.9,dist=9;canvas.addEventListener('pointerdown',e=>{dragging=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!dragging)return;theta-=(e.clientX-px)*.006;phi+=(e.clientY-py)*.006;phi=Math.max(.25,Math.min(1.5,phi));px=e.clientX;py=e.clientY;updateCamera()});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('wheel',e=>{dist=Math.max(5,Math.min(15,dist+e.deltaY*.008));updateCamera()});
function updateCamera(){camera.position.set(dist*Math.sin(phi)*Math.sin(theta),dist*Math.cos(phi),dist*Math.sin(phi)*Math.cos(theta));camera.lookAt(0,1.7,0)}
updateCamera();function resize(){let w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}window.addEventListener('resize',resize);
function render(){requestAnimationFrame(render);renderer.render(scene,camera)}render();
