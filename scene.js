import * as T from './vendor/three.module.js';
const canvas=document.getElementById('game');
let renderer;
try { renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}); }
catch(error){document.getElementById('overlayTitle').textContent='3D needs WebGL';document.getElementById('overlayText').textContent='Please open this game in a browser with hardware acceleration enabled.';throw error;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new T.Scene();scene.background=new T.Color('#d8e9e9');scene.fog=new T.Fog('#d8e9e9',90,220);
const camera=new T.PerspectiveCamera(49,1,.1,300);camera.position.set(0,13,19);camera.lookAt(0,0,-19);
const ambient=new T.HemisphereLight('#d3edff','#9b9868',1.6);scene.add(ambient);
const sun=new T.DirectionalLight('#ffe0a1',2.8);sun.position.set(-32,42,-22);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-42,right:42,top:65,bottom:-35,near:1,far:145});sun.shadow.normalBias=.025;sun.shadow.bias=-.00015;sun.shadow.radius=4;sun.target.position.set(0,0,-25);scene.add(sun,sun.target);
const fill=new T.DirectionalLight('#b8d3e8',.5);fill.position.set(20,10,10);scene.add(fill);
const materials=new Map();function mat(color,roughness=.8){const key=color+roughness;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness,flatShading:true}));return materials.get(key)}
const cube=new T.BoxGeometry(1,1,1);const tireGeo=new T.CylinderGeometry(.31,.31,.19,10);tireGeo.rotateZ(Math.PI/2);
function mesh(parent,geo,material,x=0,y=0,z=0){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(parent,x,y,z,w,h,d,color){const m=mesh(parent,cube,typeof color==='string'?mat(color):color,x,y,z);m.scale.set(w,h,d);return m}
function taper(parent,w,d,h,x,y,z,color,shrink=.75){const p=[-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,-w*shrink/2,h,-d*.33,w*shrink/2,h,-d*.33,w*shrink/2,h,d*.34,-w*shrink/2,h,d*.34];const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex([0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0,4,7,6,4,6,5,0,1,2,0,2,3]);g.computeVertexNormals();return mesh(parent,g.toNonIndexed(),mat(color,.38),x,y,z)}
// World dimensions use the same scale on all axes, including collision footprints.
const scale=.075;
function vehicle(v){const g=new T.Group(),w=v.w*scale,d=v.h*scale,sport=v.name==='Sports car',suv=v.name==='SUV',bike=v.name==='Motorcycle';g.userData.wheels=[];g.userData.lamps=[];
if(v.name==='Truck'){box(g,0,.55,0,w*.85,.3,d,'#394951');box(g,0,1.45,-d*.34,w,1.8,d*.29,v.color);box(g,0,1.92,-d*.491,w*.8,.58,.045,'#34566b');box(g,0,1.77,d*.12,w*.97,2.55,d*.65,'#e8e1cc');box(g,0,2,d*.454,w*.88,1.9,.035,'#b8bbad');for(const side of [-1,1]){box(g,side*w*.493,1.8,d*.1,.035,.25,d*.6,v.color);for(const z of [-d*.34,d*.24,d*.36]){const wh=mesh(g,tireGeo,mat('#26363d'),side*w*.45,.39,z);wh.scale.set(1.3,1.3,1.3);g.userData.wheels.push(wh)}box(g,side*w*.33,.9,-d*.494,.36,.2,.045,'#fff1c3');const tailMat=new T.MeshStandardMaterial({color:'#de7051',emissive:'#ff3311',emissiveIntensity:.25});box(g,side*w*.33,.7,d*.46,.24,.13,.045,tailMat);g.userData.lamps.push(tailMat);const signals=new T.Group();for(const z of [-d*.5,d*.47])box(signals,side*w*.48,.9,z,.12,.16,.12,new T.MeshStandardMaterial({color:'#ffb238',emissive:'#ff9911',emissiveIntensity:2}));g.add(signals);signals.visible=false;g.userData['signal'+side]=signals;}return g}
if(bike){for(const z of [-d*.32,d*.32]){let wh=mesh(g,tireGeo,mat('#28333a'),0,.33,z);wh.scale.y=1.25;g.userData.wheels.push(wh)}box(g,0,.62,0,.44,.45,d*.67,v.color);box(g,0,.93,.25,.4,.1,.65,'#34454a');box(g,0,1.27,.13,.45,.63,.38,'#456877');mesh(g,new T.IcosahedronGeometry(.29,1),mat('#f4e3b4'),0,1.82,-.05);box(g,0,1.02,-d*.27,.8,.06,.1,'#323f44');for(const side of [-1,1]){const signals=new T.Group();for(const z of [-d*.35,d*.35])box(signals,side*.32,.7,z,.1,.1,.1,new T.MeshStandardMaterial({color:'#ffb238',emissive:'#ff9911',emissiveIntensity:2}));g.add(signals);signals.visible=false;g.userData['signal'+side]=signals;}return g}
if(suv){
// Upright 70-series silhouette: square cabin, flat bonnet, rack and rear spare.
box(g,0,.49,0,w*.9,.28,d*.88,'#36423d');
box(g,0,.92,0,w*.94,.66,d*.9,v.color);
box(g,0,1.43,d*.1,w*.9,.95,d*.64,v.color);
box(g,0,1.95,d*.1,w*.96,.13,d*.69,'#eee4c7');
box(g,0,1.57,-d*.226,w*.77,.55,.045,'#344f5a');
box(g,0,1.57,d*.427,w*.76,.51,.04,'#344f5a');
box(g,0,1.55,d*.45,.06,.68,.05,v.color);
box(g,0,.87,-d*.458,w*.52,.27,.045,'#343e3e');
for(let i=-2;i<=2;i++)box(g,i*.19,.87,-d*.467,.035,.23,.035,'#a4a999');
for(const side of [-1,1]){
 for(const z of [-d*.05,d*.27])box(g,side*w*.457,1.57,z,.035,.54,d*.23,'#344f5a');
 box(g,side*w*.465,1.13,d*.13,.025,.63,.045,'#9d916b');
 box(g,side*w*.48,1.2,d*.2,.035,.045,.19,'#394a48');
 box(g,side*w*.51,1.44,-d*.19,.16,.18,.2,'#394a48');
 box(g,side*w*.46,.58,d*.05,.24,.12,d*.6,'#3b4641');
 for(const z of [-d*.3,d*.29]){box(g,side*w*.44,.84,z,.3,.22,.95,v.color);const wh=mesh(g,tireGeo,mat('#29353c'),side*w*.455,.4,z);wh.scale.set(1.22,1.22,1.22);g.userData.wheels.push(wh);mesh(g,new T.CylinderGeometry(.19,.19,.24,8).rotateZ(Math.PI/2),mat('#c7c6af'),side*w*.455,.4,z);}
 mesh(g,new T.CylinderGeometry(.16,.16,.055,12).rotateX(Math.PI/2),mat('#fff0bd'),side*w*.34,.93,-d*.463);
 const tail=new T.MeshStandardMaterial({color:'#d66540',emissive:'#ff3311',emissiveIntensity:.25});box(g,side*w*.38,.98,d*.46,.16,.3,.055,tail);g.userData.lamps.push(tail);
 const signal=new T.Group();for(const z of [-d*.46,d*.46])box(signal,side*w*.43,1.14,z,.12,.1,.06,new T.MeshStandardMaterial({color:'#ffb238',emissive:'#ff9911',emissiveIntensity:2}));g.add(signal);signal.visible=false;g.userData['signal'+side]=signal;
 box(g,side*w*.36,2.08,d*.1,.07,.16,d*.64,'#48524a');
}
for(const z of [-d*.19,0,d*.23,d*.39])box(g,0,2.08,z,w*.76,.065,.065,'#48524a');
for(const z of [-d*.48,d*.48])box(g,0,.54,z,w,.17,.14,'#56615a');
mesh(g,new T.CylinderGeometry(.39,.39,.22,12).rotateX(Math.PI/2),mat('#283531'),.24,1.15,d*.47);
mesh(g,new T.CylinderGeometry(.21,.21,.24,8).rotateX(Math.PI/2),mat('#b6b39c'),.24,1.15,d*.48);
box(g,-.55,.72,d*.465,.36,.12,.04,'#f2e8c9');return g;}
const height=sport?.44:suv?.78:.61;
box(g,0,.43,0,w*.94,.27,d*.94,'#34444a');taper(g,w,d,height,0,.48,0,v.color,.94);
const cabinD=d*(v.name==='Family wagon'?.68:sport?.43:.56),cabinH=sport?.43:suv?.73:.6;
taper(g,w*.88,cabinD,cabinH,0,.48+height,.09,'#344e60',.78);
box(g,0,.48+height+cabinH+.025,.09,w*.71,.08,cabinD*.66,v.color);
for(const side of [-1,1]){box(g,side*w*.418,.58+height,.18,.055,cabinH*.8,.08,v.color);box(g,side*w*.52,.65+height,-.35,.15,.12,.22,v.color);for(const z of [-d*.3,d*.3]){const wh=mesh(g,tireGeo,mat('#29353c'),side*w*.47,.33,z);g.userData.wheels.push(wh);mesh(g,new T.CylinderGeometry(.16,.16,.203,8).rotateZ(Math.PI/2),mat('#c0ccca',.4),side*w*.47,.33,z)}
const lightMat=new T.MeshStandardMaterial({color:'#fff2c8',emissive:'#ffe2a0',emissiveIntensity:.35});box(g,side*w*.31,.69,-d*.49,w*.19,.14,.055,lightMat);
const tailMat=new T.MeshStandardMaterial({color:'#ed6c4e',emissive:'#ff3311',emissiveIntensity:.25});box(g,side*w*.32,.67,d*.49,w*.18,.12,.055,tailMat);g.userData.lamps.push(tailMat);
const signal=new T.Group();for(const zz of [-d*.43,d*.48])box(signal,side*w*.46,.8,zz,.1,.12,.12,new T.MeshStandardMaterial({color:'#ffb238',emissive:'#ff9911',emissiveIntensity:2}));g.add(signal);signal.visible=false;g.userData['signal'+side]=signal;}
box(g,0,.43,d*.49,w*.8,.1,.07,'#d4d8cb');box(g,0,.56,d*.501,.35,.12,.035,'#f5edd8');if(sport){box(g,0,.94,d*.35,w*.92,.07,.23,v.color);for(const side of [-1,1])box(g,side*w*.3,.8,d*.35,.06,.22,.08,'#34444a')}if(suv||v.name==='Family wagon')for(const side of [-1,1])box(g,side*w*.3,.61+height+cabinH,.12,.06,.06,cabinD*.65,'#4c5b59');return g;}
const terrain=box(scene,0,-.17,-80,400,.3,420,'#94ad74');terrain.castShadow=false;
// Small road tiles follow the same distance-based profile as traffic and steering.
const roadTiles=[];const stripes=[];
for(let i=0;i<100;i++){const pavement=box(scene,0,.005,0,21.3,.035,3.1,'#566a72');pavement.castShadow=false;const edges=[-1,1].map(side=>({side,shoulder:box(scene,0,-.015,0,1.3,.07,3.1,'#d8c89e'),line:box(scene,0,.034,0,.12,.02,3.1,'#f1e8c9')}));const lines=[];for(let j=0;j<4;j++){const m=box(scene,0,.039,0,.1,.018,1.7,'#eee5c8');m.castShadow=false;lines.push(m);stripes.push({m});}roadTiles.push({pavement,edges,lines});}
function updateRoad(s){for(let i=0;i<roadTiles.length;i++){const tile=roadTiles[i],z=24-i*3+(s.scroll*scale%3),r=s.roadAt(s.distance-z/.648),half=r.width*scale/2;tile.pavement.position.z=z;tile.pavement.scale.x=r.width*scale;for(const edge of tile.edges){edge.shoulder.position.set(edge.side*(half+.65),-.015,z);edge.line.position.set(edge.side*(half-.06),.034,z);}let k=0;for(let j=1;j<r.count;j++){if(j===r.count/2)continue;const m=tile.lines[k++];m.position.set((r.left+j*r.width/r.count-240)*scale,.039,z);m.userData.roadVisible=true;m.visible=true;}for(;k<tile.lines.length;k++){tile.lines[k].visible=false;tile.lines[k].userData.roadVisible=false;}}}
const props=[];function tree(x,z,i){const g=new T.Group();box(g,0,1.15,0,.3,2.3,.34,'#867459');let leaf;if(i%3===0){leaf=mesh(g,new T.ConeGeometry(1.5,4,7),mat('#6d986d'),0,3.6,0);mesh(g,new T.ConeGeometry(1.18,3,7),mat('#89a86d'),0,5,0)}else{leaf=mesh(g,new T.IcosahedronGeometry(1.6,0),mat(i%2?'#9caf6d':'#779e76'),0,3.3,0);leaf.scale.set(1,1.35,1);mesh(g,new T.IcosahedronGeometry(1.15,0),mat('#aac17f'),.55,4.1,.1)}g.position.set(x,0,z);g.rotation.y=i*1.7;scene.add(g);props.push({g,z});}
for(let i=0;i<48;i++){let z=18-i*4.8;tree((i%2?-1:1)*(14.5+(i*7%12)),z,i)}
for(let i=0;i<45;i++){const side=i%2?-1:1,z=15-i*6;const g=new T.Group();box(g,0,.7,0,.13,1.4,.13,'#f1e4c1');box(g,0,.8,1.4,.09,.12,3,'#e2d2ad');box(g,0,1.13,1.4,.09,.12,3,'#e2d2ad');g.position.set(side*12.8,0,z);scene.add(g);props.push({g,z})}
for(let i=0;i<22;i++){const hill=mesh(scene,new T.IcosahedronGeometry(1,1),mat(i%2?'#aac19a':'#94b3a3'),(i%2?-1:1)*(36+i*2),1,-45-i*11);hill.scale.set(15+i%5,7+i%9,18);hill.castShadow=false}
for(let i=0;i<6;i++){const g=new T.Group();box(g,0,1.3,0,4,2.6,4,i%2?'#eee1bb':'#d4b5a0');const roof=mesh(g,new T.ConeGeometry(3.3,1.65,4),mat('#bb8270'),0,3.35,0);roof.rotation.y=Math.PI/4;box(g,0,1,-2.02,.8,1.9,.06,'#687e79');for(const side of [-1,1])box(g,side*1.2,1.7,-2.04,.65,.7,.08,'#8aadb2');g.position.set((i%2?-1:1)*24,0,-30-i*35);scene.add(g);props.push({g,z:g.position.z})}
function pet(a){const g=new T.Group(),cat=a.type==='cat',color=cat?'#d6a06e':'#e5d5b1';g.userData.legs=[];box(g,0,.48,0,1.1,.48,.48,color);box(g,.57,.72,0,.42,.46,.43,color);box(g,.82,.65,0,.22,.19,.29,cat?'#e5c19c':'#9f7d5d');for(const side of [-1,1]){if(cat){let ear=mesh(g,new T.ConeGeometry(.13,.3,3),mat(color),.55,1.08,side*.14)}else box(g,.52,.79,side*.25,.23,.39,.1,'#8e7456');box(g,.77,.84,side*.19,.04,.055,.04,'#283a3f');for(const xx of [-.35,.35]){const leg=box(g,xx,.18,side*.17,.14,.36,.14,color);g.userData.legs.push(leg)}}const tail=box(g,-.7,.65,0,.5,.12,.12,color);tail.rotation.z=cat?-.7:.5;return g}
function disposeModel(g){scene.remove(g);g.traverse(m=>{if(!m.isMesh)return;if(m.geometry!==cube&&m.geometry!==tireGeo)m.geometry.dispose();if(![...materials.values()].includes(m.material))m.material.dispose()})}
const active=new Map();let player=null,playerType=-1,frameTime=0;
function sync(objects,type){const alive=new Set(objects);for(const [obj,g] of active)if(g.userData.kind===type&&!alive.has(obj)){disposeModel(g);active.delete(obj)}for(const o of objects){let g=active.get(o);if(!g){g=type==='car'?vehicle(o.v):pet(o);g.userData.kind=type;if(type==='car'&&o.v.name==='Police'){g.userData.beacons=[];for(const side of [-1,1]){const lm=new T.MeshStandardMaterial({color:side<0?'#398aff':'#ff4545',emissive:side<0?'#0066ff':'#ff1111',emissiveIntensity:3});box(g,side*.35,1.85,.05,.55,.18,.28,lm);g.userData.beacons.push(lm)}box(g,0,.9,0,o.v.w*scale*1.01,.2,1,'#263c50')}if(o.breakdown){for(let i=0;i<4;i++){const cone=mesh(g,new T.ConeGeometry(.25,.65,6),mat('#ed9550'),(i-1.5)*.65,.33,o.v.h*scale/2+1+i*.5);box(g,(i-1.5)*.65,.055,o.v.h*scale/2+1+i*.5,.55,.1,.55,'#5a625c')}for(let i=0;i<3;i++)mesh(g,new T.IcosahedronGeometry(.27+i*.1,0),mat('#89928c'),.1+i*.14,2.1+i*.65,-o.v.h*scale*.25)}active.set(o,g);scene.add(g)}g.position.set((o.x-240)*scale,0,(o.y-535)*scale);if(type==='car'){g.rotation.y=(o.crossing?-o.dir*Math.PI/2:o.oncoming?Math.PI:0)+(o.turning?(o.target-o.lane)*.15:0);for(const side of [-1,1])if(g.userData['signal'+side])g.userData['signal'+side].visible=(o.breakdown||(o.roadMerge&&o.mergeSide*(o.oncoming?-1:1)===side)||((o.warning>0||o.turning)&&((o.target>o.lane?1:-1)*(o.oncoming?-1:1))===side))&&Math.floor(frameTime*3)%2===0;if(g.userData.beacons)g.userData.beacons.forEach((m,i)=>m.emissiveIntensity=Math.floor(frameTime*7)%2===i?4:.1);for(const lamp of g.userData.lamps)lamp.emissiveIntensity=o.braking||o.breakdown?2.2:.25;}else{g.rotation.y=o.dir===1?0:Math.PI;g.visible=!o.done;g.userData.legs.forEach((leg,i)=>leg.rotation.z=o.wait>0?0:Math.sin(o.x*.3+i*Math.PI)*.45)}}}
const demo=[];let lastScroll=0;
window.renderLane=s=>{frameTime=s.elapsed;if(playerType!==s.selected){if(player)disposeModel(player);player=vehicle(s.vehicles[s.selected]);scene.add(player);playerType=s.selected;}
player.position.set((s.x-240)*scale,0,0);player.rotation.y=-s.vx*.0025;player.rotation.z=-s.vx*.0005;player.visible=s.invincible<=0||Math.floor(s.invincible*9)%2===0;
for(const light of player.userData.lamps)light.emissiveIntensity=s.braking?2.2:.25;
const travel=s.scroll*scale;const delta=travel-lastScroll;lastScroll=travel;for(const wh of player.userData.wheels)wh.rotation.x-=delta/.31;
for(const p of props){p.g.position.z=((p.z+travel+245)%260+260)%260-245;p.baseX??=p.g.position.x;const extra=(s.roadAt(s.distance-p.g.position.z/.648).width-284)*scale/2;p.g.position.x=p.baseX+Math.sign(p.baseX)*extra;}
updateRoad(s);
if(s.mode==='ready'&&!demo.length)demo.push({x:132,y:185,v:s.vehicles[2],oncoming:true},{x:348,y:20,v:{name:'Truck',w:38,h:122,color:'#d7a359'},oncoming:false});sync(s.mode==='ready'?demo:[...s.traffic,...s.police,...s.crossTraffic.map(t=>{t.crossing=true;return t})],'car');sync(s.animals,'pet');
const portrait=canvas.clientWidth/canvas.clientHeight<.9;camera.position.y=portrait?17:13;camera.position.z=portrait?25:19;camera.fov=portrait?65:49;camera.position.x+=(player.position.x*(portrait?.65:.22)-camera.position.x)*.08;camera.lookAt(camera.position.x*(portrait?.75:.35),.2,-19);camera.updateProjectionMatrix();
const width=canvas.clientWidth,height=canvas.clientHeight;if(canvas.width!==Math.round(width*renderer.getPixelRatio())||canvas.height!==Math.round(height*renderer.getPixelRatio())){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix()}
updateAtmosphere(s);updateMedians(s);updateCrossroads(s);renderer.render(scene,camera);
};
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();document.getElementById('pause').click();document.getElementById('notice').textContent='Graphics paused. Reload to restore the view.'});

const crossroads=new Map();
function intersection(){const g=new T.Group();const lamps=[];box(g,0,.045,0,160,.055,14,'#566a72');for(const side of [-1,1]){box(g,side*46,.075,0,66,.018,.12,'#e9dfbb');box(g,side*46,.075,6.65,66,.018,.14,'#e9dfbb');box(g,side*46,.075,-6.65,66,.018,.14,'#e9dfbb');box(g,0,.08,side*8,20.7,.02,.28,'#f1e8cf');for(let i=0;i<20;i++)box(g,-10+i*1.05,.085,side*6.35,.55,.018,1.6,'#eee4c6');box(g,side*11.3,2.75,8.15,.18,5.5,.18,'#44545a');box(g,side*7.7,5.45,8.15,7.3,.15,.15,'#44545a');for(const xx of [side*11.3,side*4.3]){box(g,xx,4.85,8.15,.6,1.55,.37,'#26383d');for(let k=0;k<3;k++){const m=new T.MeshStandardMaterial({color:'#223333',emissive:'#000000',roughness:.35});mesh(g,new T.SphereGeometry(.17,10,8),m,xx,5.32-k*.46,8.37);lamps.push({m,k})}}}g.userData.lamps=lamps;scene.add(g);return g}
function updateCrossroads(s){const alive=new Set(s.junctions);for(const [j,g] of crossroads)if(!alive.has(j)){disposeModel(g);crossroads.delete(j)}for(const j of s.junctions){let g=crossroads.get(j);if(!g){g=intersection();crossroads.set(j,g)}g.position.z=(j.y-535)*scale;g.scale.x=s.roadAt(j.at).width/284;for(const {m,k} of g.userData.lamps){const on=k===({red:0,amber:1,green:2}[j.phase]);m.color.set(on?['#ff5249','#ffbc3c','#67efb1'][k]:'#263b3d');m.emissive.set(on?['#ff291c','#ff9f10','#20ef80'][k]:'#000000');m.emissiveIntensity=on?2.2:0}}
for(const p of props)p.g.visible=!s.junctions.some(j=>Math.abs(p.g.position.z-(j.y-535)*scale)<10);for(const p of stripes)p.m.visible=p.m.userData.roadVisible&&!s.junctions.some(j=>Math.abs(p.m.position.z-(j.y-535)*scale)<7.2);
}

// Both yellow centre lines and solid barriers separate the two directions.
for(const side of [-1,1])box(scene,side*.62,.045,-80,.1,.015,420,'#e5c777');
const medianPool=[];
function updateMedians(s){while(medianPool.length<s.medians.length){const g=new T.Group();const body=box(g,0,.48,0,1.05,.96,1,'#b6b7a5');const cap=box(g,0,.99,0,.82,.06,1,'#e1d4a1');const ends=[];for(const side of [-1,1])ends.push(box(g,0,.65,side,.88,.45,.1,'#dc9a50'));g.userData={body,cap,ends};scene.add(g);medianPool.push(g)}medianPool.forEach((g,i)=>{g.visible=i<s.medians.length;if(!g.visible)return;const [a,b]=s.medians[i],length=(b-a)*.648;g.position.z=(s.distance-(a+b)/2)*.648;g.userData.body.scale.z=length;g.userData.cap.scale.z=length;g.userData.ends[0].position.z=-length/2;g.userData.ends[1].position.z=length/2})}

// Visibility scales the same fog range in each lighting state; beams light the near road.
const headlamps=[-1,1].map(side=>{const lamp=new T.SpotLight('#fff0c9',0,80,.43,.7,1);lamp.target=new T.Object3D();scene.add(lamp,lamp.target);return {lamp,side};});
const skies=[new T.Color('#d8e9e9'),new T.Color('#aa7866'),new T.Color('#080f20')];
function updateAtmosphere(s){const c=s.conditions||{weights:[1,0,0],glare:false,glareUntil:0},[day,dusk,night]=c.weights;
 scene.background.setRGB(skies[0].r*day+skies[1].r*dusk+skies[2].r*night,skies[0].g*day+skies[1].g*dusk+skies[2].g*night,skies[0].b*day+skies[1].b*dusk+skies[2].b*night);scene.fog.color.copy(scene.background);
 const visibility=day+.5*dusk+.3*night;scene.fog.near=90*visibility;scene.fog.far=220*visibility;
 ambient.intensity=1.6*day+.55*dusk+.12*night;sun.intensity=2.8*day+.85*dusk+.025*night;sun.color.setRGB(1,.82*day+.43*dusk+.6*night,.55*day+.2*dusk+.9*night);fill.intensity=.5*day+.18*dusk+.055*night;
 renderer.toneMappingExposure=1.05*day+.88*dusk+.85*night;
 for(const {lamp,side} of headlamps){lamp.intensity=35*dusk+100*night;lamp.position.set(player.position.x+side*.65,1.05,-1.2);lamp.target.position.set(player.position.x+side*2-s.vx*.025,0,-42);lamp.distance=80;}
 const remaining=Math.max(0,c.glareUntil-s.elapsed);document.getElementById('sun-glare').style.opacity=c.glare?String(dusk*.85*Math.min(1,remaining/2)):0;
}
