
document.getElementById('sid').textContent=Math.floor(Math.random()*9000+1000);

// Clock
(function ck(){const d=new Date();document.getElementById('clock').textContent=[d.getHours(),d.getMinutes(),d.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':');setTimeout(ck,1000)})();

// Mouse
let mx=0,my=0;
const ring=document.getElementById('cursorRing');
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  ring.style.left=mx+'px';ring.style.top=my+'px';
  document.getElementById('mCoord').textContent=`x:${String(mx).padStart(4,'0')} y:${String(my).padStart(4,'0')}`;
  document.getElementById('mInfo').textContent=`observer [${mx}, ${my}]`;
});
document.addEventListener('mousedown',()=>ring.classList.add('active'));
document.addEventListener('mouseup',()=>ring.classList.remove('active'));

// Scroll progress
window.addEventListener('scroll',()=>{
  const p=window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100;
  document.getElementById('scrollProg').style.width=p+'%';
});

gsap.registerPlugin(ScrollTrigger);

// ==================== HERO THREE.JS ====================
const hc=document.getElementById('heroCanvas');
const hR=new THREE.WebGLRenderer({canvas:hc,alpha:true,antialias:true});
hR.setSize(window.innerWidth,window.innerHeight-36);
hR.setPixelRatio(Math.min(window.devicePixelRatio,2));
const hS=new THREE.Scene();
const hCam=new THREE.PerspectiveCamera(38,window.innerWidth/(window.innerHeight-36),.1,200);
hCam.position.set(0,0,16);

// Stronger, sculptural lighting
hS.add(new THREE.AmbientLight(0x112233,.6));
const hDL=new THREE.DirectionalLight(0xffffff,1.2);hDL.position.set(-8,12,10);hS.add(hDL);
const hDL2=new THREE.DirectionalLight(0x88aaff,.35);hDL2.position.set(10,2,-5);hS.add(hDL2);
const hPL=new THREE.PointLight(0x3dffd2,.8,30);hPL.position.set(-4,3,8);hS.add(hPL);
const hRL=new THREE.PointLight(0x5b8fff,.5,25);hRL.position.set(6,0,-4);hS.add(hRL);

// Background particles (always visible)
const bgParts=[];
const bpGeo=new THREE.BoxGeometry(.2,.2,.2);
for(let i=0;i<300;i++){
  const mat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(.48+Math.random()*.12,.4,.12+Math.random()*.08),transparent:true,opacity:.2+Math.random()*.4});
  const m=new THREE.Mesh(bpGeo,mat);
  m.position.set((Math.random()-.5)*80,(Math.random()-.5)*50,(Math.random()-.5)*40-10);
  m.userData.v={x:(Math.random()-.5)*.015,y:(Math.random()-.5)*.01,z:0};
  m.userData.base=m.position.clone();
  hS.add(m);bgParts.push(m);
}

// ====== VOXEL HEAD — MINECRAFT/LEGO STYLE ======
const humG = new THREE.Group();
const vs = 0.50;
const vGeo = new THREE.BoxGeometry(vs * 0.92, vs * 0.92, vs * 0.92);
const allVox = [];

// Feature colors
const HC_SKULL  = 0x4a5568; // dark blue-grey skull
const HC_HAIR   = 0x2e3a4e; // darker top
const HC_FACE   = 0x9aada5; // light grey-green skin
const HC_BROW   = 0xe8c040; // yellow brow band
const HC_SOCK   = 0x7a2020; // red eye socket
const HC_EYE    = 0x20c060; // green pupil gem
const HC_NOSE   = 0xb0bdb5; // slightly lighter nose
const HC_LIP    = 0xe0506a; // coral/pink lips
const HC_CHIN   = 0x8a9890; // chin
const HC_NECK   = 0x3d7fa0; // teal neck
const HC_PANEL  = 0x151e2e; // dark sidebar tech panel

function voxColor(ix, iy, iz) {
  const ax = Math.abs(ix);
  const az = Math.abs(iz);

  // === NECK ===
  if (iy >= -7 && iy <= -4) {
    if (ax <= 1 && az <= 1) return HC_NECK;
    return null;
  }

  // === SIDE TECH PANEL (left side) ===
  if (ix <= -4 && iy >= 0 && iy <= 7 && iz >= -3 && iz <= -1) return HC_PANEL;

  // === HEAD SILHOUETTE ===
  // Rounded boxy skull
  if (ax > 4 || iz < -3 || iz > 3) return null;
  if (iy < -3 || iy > 10) return null;
  if (iy >= 9  && ax > 3) return null; // top taper
  if (iy >= 10 && ax > 2) return null;
  if (iy <= -2 && ax > 3) return null; // jaw taper
  if (iy === -3 && ax > 2) return null;

  // === HAIR / TOP OF HEAD ===
  if (iy >= 7) return HC_HAIR;

  // === YELLOW BROW BAND — full row at y=6 ===
  if (iy === 6) {
    return iz >= -1 ? HC_BROW : HC_SKULL;
  }

  // === EYE AREA y=4 to y=5 ===
  if (iy >= 4 && iy <= 5) {
    // Back part of skull
    if (iz <= -1) return HC_SKULL;
    // Nose bridge center (ix=0)
    if (ix === 0) return HC_FACE;
    // Eye socket: ax=1..3 on each side
    if (ax >= 1 && ax <= 3 && iz >= 0) {
      // Glowing green pupil — center of socket
      if (ax === 2 && iz === 1 && iy === 4) return HC_EYE;
      if (ax === 2 && iz === 1 && iy === 5) return HC_EYE;
      return HC_SOCK;
    }
    // Outer face / cheekbone
    return HC_FACE;
  }

  // === NOSE BRIDGE y=2 to y=3 ===
  if (iy >= 2 && iy <= 3) {
    if (iz <= -1) return HC_SKULL;
    if (ax <= 1 && iz === 3) return HC_NOSE; // nose bridge protrudes
    return HC_FACE;
  }

  // === NOSE TIP y=0 to y=1 ===
  if (iy >= 0 && iy <= 1) {
    if (iz <= -1) return HC_SKULL;
    if (ax <= 1 && iz >= 2) return HC_NOSE; // big nose protrusion
    return HC_FACE;
  }

  // === MOUTH / LIPS y=-1 ===
  if (iy === -1) {
    if (iz <= -1) return HC_SKULL;
    if (ax <= 2 && iz >= 1) return HC_LIP;   // pink lips
    return HC_FACE;
  }

  // === LOWER FACE y=-2 ===
  if (iy === -2) {
    if (iz <= -1) return HC_SKULL;
    return HC_FACE;
  }

  // === CHIN y=-3 ===
  if (iy === -3) {
    if (iz <= -1) return HC_SKULL;
    return HC_CHIN;
  }

  // Default = skull
  return HC_SKULL;
}

function mkVox(ix, iy, iz, col) {
  const mat = new THREE.MeshLambertMaterial({ color: col, transparent: true, opacity: 1 });
  if (col === HC_EYE) {
    mat.emissive = new THREE.Color(0x00ff88);
    mat.emissiveIntensity = 1.5;
  }
  if (col === HC_BROW) {
    mat.emissive = new THREE.Color(0xffcc00);
    mat.emissiveIntensity = 0.4;
  }
  const m = new THREE.Mesh(vGeo, mat);
  const tx = ix * vs, ty = iy * vs, tz = iz * vs;
  m.position.set(tx, ty, tz);
  m.material.opacity = 0;

  // Scatter towards back and sides for disintegration effect
  const scatter = {
    x: tx + (Math.random() - 0.5) * 35 + ix * 0.8,
    y: ty + (Math.random() - 0.5) * 45,
    z: tz - (Math.random() * 30 + 8)
  };
  // Wave delay: front voxels form first
  const delay = Math.max(0, Math.min(1, (5 - iz) / 12));
  m.userData = { target: { x: tx, y: ty, z: tz }, scatter, delay: delay * 0.8 + Math.random() * 0.2 };
  humG.add(m);
  allVox.push(m);
}

// Build solid grid
const HG = new Map();
const hKey = (x, y, z) => `${x},${y},${z}`;

for (let ix = -5; ix <= 5; ix++) {
  for (let iy = -7; iy <= 11; iy++) {
    for (let iz = -4; iz <= 4; iz++) {
      const c = voxColor(ix, iy, iz);
      if (c !== null) {
        // Disintegration: random holes increase toward back of skull
        const disGrad = Math.max(0, (-iz) / 5) + Math.max(0, (Math.abs(ix) - 3.5) / 2.5);
        if (Math.random() >= disGrad * 0.7) {
          HG.set(hKey(ix, iy, iz), c);
        }
      }
    }
  }
}

// Extract surface shell only
const D6 = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
for (const [k, col] of HG) {
  const [ix, iy, iz] = k.split(',').map(Number);
  let exposed = false;
  for (const [dx, dy, dz] of D6) {
    if (!HG.has(hKey(ix+dx, iy+dy, iz+dz))) { exposed = true; break; }
  }
  if (!exposed) continue; // skip fully enclosed interior
  mkVox(ix, iy, iz, col);
}

humG.position.y = 0.5;
humG.rotation.y = -0.78; // 45° — shows 3/4 front face + side depth clearly
humG.rotation.x = 0.12;  // slight downward tilt like reference
hS.add(humG);

function getFaceZ(x, y) { return 3; } // stub for render loop



let heroProgress=0;

let heroPhase='term'; // term -> title -> quote -> idle

// ==================== BOOT GSAP ====================
const bootTl=gsap.timeline({
  scrollTrigger:{
    trigger:'#boot',
    start:'top top',
    end:'bottom bottom',
    scrub:.8,
    pin:'#bootPin',
    pinSpacing:false,
    onUpdate:self=>{heroProgress=self.progress}
  }
});

// Phase 1: Terminal (0-25%)
bootTl.to('#scrollHint',{opacity:0,duration:.03},0);
bootTl.to('#l1',{opacity:1,duration:.04},0);
bootTl.to('#l2',{opacity:1,duration:.04},.04);
bootTl.to('#l3',{opacity:1,duration:.04},.08);
bootTl.to('#l4',{opacity:1,duration:.04},.12);
bootTl.to('#l5',{opacity:1,duration:.04},.16);
// Phase 2: Terminal out, title in (25-50%)
bootTl.to('#term',{opacity:0,duration:.06},.25);
bootTl.to('#heroTitle',{opacity:1,duration:.1},.32);
// Phase 3: Title out, quote in (50-75%)
bootTl.to('#heroTitle',{opacity:0,duration:.06},.55);
bootTl.to('#heroQuote',{opacity:1,duration:.1},.62);
// Phase 4: Quote out, humanoid faces viewer (75-100%)
bootTl.to('#heroQuote',{opacity:0,duration:.08},.82);

// ==================== LAB THREE.JS ====================
const lbBox=document.getElementById('labBox');
const lbC=document.getElementById('labC');
const lbR=new THREE.WebGLRenderer({canvas:lbC,antialias:true});
lbR.setSize(lbBox.clientWidth,lbBox.clientHeight);
lbR.setPixelRatio(Math.min(window.devicePixelRatio,2));
lbR.setClearColor(0x0a0a0a);
const lbS=new THREE.Scene();
const lbCam=new THREE.PerspectiveCamera(50,lbBox.clientWidth/lbBox.clientHeight,.1,100);
lbCam.position.set(10,7,10);lbCam.lookAt(0,1,0);
lbS.add(new THREE.AmbientLight(0xffffff,.25));
const lbDL=new THREE.DirectionalLight(0xffffff,.4);lbDL.position.set(5,12,5);lbS.add(lbDL);
const lbPL=new THREE.PointLight(0x3dffd2,.4,25);lbPL.position.set(0,6,0);lbS.add(lbPL);

// Floor
const flMat=new THREE.MeshLambertMaterial({color:0x151515});
lbS.add(new THREE.Mesh(new THREE.PlaneGeometry(24,24),flMat).rotateX(-Math.PI/2));
// Grid
const gMat=new THREE.LineBasicMaterial({color:0x1f1f1f});
for(let i=-12;i<=12;i++){
  lbS.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,.005,-12),new THREE.Vector3(i,.005,12)]),gMat));
  lbS.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12,.005,i),new THREE.Vector3(12,.005,i)]),gMat));
}

// Voxel robots in lab
function labBot(px,pz,col,h,w){
  const g=new THREE.Group();
  const s=.32;
  const geo=new THREE.BoxGeometry(s,s,s);
  for(let bx=-(w||1);bx<=(w||1);bx++)for(let by=0;by<h;by++)for(let bz=-1;bz<=1;bz++){
    if(Math.random()>.12){
      const c=by>=h-2?col:0x444444;
      g.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:c})).translateX(bx*s).translateY(by*s+s/2).translateZ(bz*s));
    }
  }
  g.position.set(px,0,pz);
  return g;
}
const labBots=[
  labBot(-4,0,0x3dffd2,8,1),
  labBot(0,-4,0x5b8fff,5,1),
  labBot(4,1,0x9d7cd8,10,2),
  labBot(-1,4,0xd4a054,4,1)
];
labBots.forEach(b=>lbS.add(b));
let labAng=0;

// Mouse interaction on lab
let labMx=0,labMy=0;
lbBox.addEventListener('mousemove',e=>{
  const r=lbBox.getBoundingClientRect();
  labMx=(e.clientX-r.left)/r.width-.5;
  labMy=(e.clientY-r.top)/r.height-.5;
});

// ==================== EXPERIMENT THREE.JS ====================
const exBox=document.getElementById('expBox');
const exC=document.getElementById('expC');
const exR=new THREE.WebGLRenderer({canvas:exC,antialias:true});
exR.setSize(exBox.clientWidth,exBox.clientHeight);
exR.setPixelRatio(Math.min(window.devicePixelRatio,2));
exR.setClearColor(0x0a0a0a);
const exS=new THREE.Scene();
const exCam=new THREE.PerspectiveCamera(50,exBox.clientWidth/exBox.clientHeight,.1,100);
exCam.position.set(0,6,14);exCam.lookAt(0,.5,0);
exS.add(new THREE.AmbientLight(0xffffff,.25));
exS.add(new THREE.PointLight(0x3dffd2,.3,20).translateY(8));
exS.add(new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshLambertMaterial({color:0x131313})).rotateX(-Math.PI/2));

// Circle of experiment figures
function exFig(isBot){
  const g=new THREE.Group();
  const s=.22;
  const geo=new THREE.BoxGeometry(s,s,s);
  const bodyC=isBot?0x3dffd2:0xd4a054;
  const headC=isBot?0x5b8fff:0xc76a6a;
  for(let y=0;y<4;y++){
    g.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:y===3?headC:bodyC})).translateY(y*s+s/2));
  }
  // Arms
  g.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:bodyC})).translateX(-s).translateY(2.5*s));
  g.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:bodyC})).translateX(s).translateY(2.5*s));
  return g;
}
const exFigs=[];
for(let i=0;i<8;i++){
  const f=exFig(i%2===0);
  exS.add(f);exFigs.push(f);
}
// Connection lines between pairs
const pairLineMat=new THREE.LineBasicMaterial({color:0x3dffd2,transparent:true,opacity:.15});
const pairLines=[];
for(let i=0;i<8;i+=2){
  const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
  const ln=new THREE.Line(geo,pairLineMat);
  exS.add(ln);pairLines.push({line:ln,a:i,b:i+1});
}

// ==================== NEURAL THREE.JS ====================
const nBox=document.getElementById('neuBox');
const nC=document.getElementById('neuC');
const nR=new THREE.WebGLRenderer({canvas:nC,antialias:true});
nR.setSize(nBox.clientWidth,nBox.clientHeight);
nR.setPixelRatio(Math.min(window.devicePixelRatio,2));
nR.setClearColor(0x030303);
const nS=new THREE.Scene();
const nCam=new THREE.PerspectiveCamera(60,nBox.clientWidth/nBox.clientHeight,.1,200);
nCam.position.set(0,0,35);

// Neural nodes
const NN=150;
const nGeo=new THREE.BoxGeometry(.2,.2,.2);
const nNodes=[];
const nPos=[];
for(let i=0;i<NN;i++){
  const hue=.42+Math.random()*.22;
  const mat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(hue,.5,.35+Math.random()*.2)});
  const m=new THREE.Mesh(nGeo,mat);
  const p={x:(Math.random()-.5)*50,y:(Math.random()-.5)*30,z:(Math.random()-.5)*25};
  m.position.set(p.x,p.y,p.z);
  nS.add(m);nNodes.push(m);nPos.push(p);
}
// Connections
const cMat=new THREE.LineBasicMaterial({color:0x3dffd2,transparent:true,opacity:.06});
const nConns=[];
for(let i=0;i<NN;i++)for(let j=i+1;j<NN;j++){
  const dx=nPos[i].x-nPos[j].x,dy=nPos[i].y-nPos[j].y,dz=nPos[i].z-nPos[j].z;
  if(Math.sqrt(dx*dx+dy*dy+dz*dz)<8){
    const geo=new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(nPos[i].x,nPos[i].y,nPos[i].z),
      new THREE.Vector3(nPos[j].x,nPos[j].y,nPos[j].z)
    ]);
    const ln=new THREE.Line(geo,cMat.clone());
    nS.add(ln);nConns.push(ln);
  }
}

// Mouse interaction on neural
let neuMx=0;
nBox.addEventListener('mousemove',e=>{
  const r=nBox.getBoundingClientRect();
  neuMx=(e.clientX-r.left)/r.width-.5;
});

// ==================== OBSERVATION THREE.JS ====================
const oC=document.getElementById('obsC');
const oR=new THREE.WebGLRenderer({canvas:oC,alpha:true,antialias:true});
oR.setSize(320,320);
oR.setPixelRatio(Math.min(window.devicePixelRatio,2));
const oS=new THREE.Scene();
const oCam=new THREE.PerspectiveCamera(50,1,.1,100);
oCam.position.set(0,1.5,14);oCam.lookAt(0,1,0);
oS.add(new THREE.AmbientLight(0x3dffd2,.2));
const oDL=new THREE.DirectionalLight(0xffffff,.4);oDL.position.set(3,8,5);oS.add(oDL);

// Observation humanoid
const oG=new THREE.Group();
const ovs=.28;
const ovGeo=new THREE.BoxGeometry(ovs,ovs,ovs);
function oV(x,y,z,c){oG.add(new THREE.Mesh(ovGeo,new THREE.MeshLambertMaterial({color:c||0x888888})).translateX(x*ovs).translateY(y*ovs).translateZ(z*ovs))}
for(let x=-2;x<=2;x++)for(let y=9;y<=12;y++)for(let z=-1;z<=1;z++){
  if(Math.abs(x)===2&&(y===9||y===12))continue;
  oV(x,y,z,(y===11&&Math.abs(x)===1&&z===1)?0x3dffd2:0x666666);
}
oV(0,8,0,0x444444);oV(-1,8,0,0x444444);oV(1,8,0,0x444444);
for(let x=-2;x<=2;x++)for(let y=2;y<=7;y++)for(let z=-1;z<=1;z++){
  if(Math.abs(x)===2&&Math.abs(z)===1)continue;
  oV(x,y,z,(x===0&&z===0&&y>=5)?0x3dffd2:0x444444);
}
oV(-3,7,0,0x888888);oV(3,7,0,0x888888);oV(-3,6,0,0x888888);oV(3,6,0,0x888888);
for(let y=1;y<=5;y++){oV(-3,y,0,0x777777);oV(3,y,0,0x777777);}
oV(-3,0,0,0x5b8fff);oV(3,0,0,0x5b8fff);
oV(-1,1,0,0x444444);oV(0,1,0,0x444444);oV(1,1,0,0x444444);
for(let y=-4;y<=0;y++){oV(-1,y,0,0x444444);oV(1,y,0,0x444444);}
oV(-1,-5,0,0x888888);oV(1,-5,0,0x888888);oV(-1,-5,1,0x888888);oV(1,-5,1,0x888888);
oG.position.y=-1.2;
oS.add(oG);

// Observation mouse tracking
let obsMx=0,obsMy=0,obsInView=false;
const obsEl=document.getElementById('obsSec');
document.addEventListener('mousemove',e=>{
  if(!obsInView)return;
  const r=obsEl.getBoundingClientRect();
  obsMx=(e.clientX/window.innerWidth-.5)*2;
  obsMy=(e.clientY/window.innerHeight-.5)*2;
});
ScrollTrigger.create({
  trigger:'#obsSec',
  start:'top 80%',
  end:'bottom top',
  onEnter:()=>{obsInView=true},
  onLeave:()=>{obsInView=false},
  onEnterBack:()=>{obsInView=true},
  onLeaveBack:()=>{obsInView=false}
});

// ==================== SOCIETY HORIZONTAL ====================
gsap.to('#hzTrack',{
  x:()=>-(document.getElementById('hzTrack').scrollWidth-window.innerWidth),
  ease:'none',
  scrollTrigger:{
    trigger:'#hzWrap',
    pin:true,
    scrub:1,
    end:()=>'+='+(document.getElementById('hzTrack').scrollWidth-window.innerWidth)
  }
});

// Reveal
gsap.utils.toArray('.reveal').forEach(el=>{
  ScrollTrigger.create({trigger:el,start:'top 88%',onEnter:()=>el.classList.add('vis')});
});

// Neural counters
ScrollTrigger.create({
  trigger:'#neuSec',start:'top 60%',once:true,
  onEnter:()=>{
    gsap.to({v:0},{v:847,duration:2.5,ease:'power2.out',onUpdate:function(){document.getElementById('dc1').innerHTML=Math.floor(this.targets()[0].v)+'<span class="un"> M</span>'}});
    gsap.to({v:0},{v:.0034,duration:2.5,ease:'power2.out',onUpdate:function(){document.getElementById('dc2').innerHTML=this.targets()[0].v.toFixed(4)+'<span class="un"> η</span>'}});
    gsap.to({v:0},{v:2847,duration:2.5,ease:'power2.out',onUpdate:function(){document.getElementById('dc3').textContent=Math.floor(this.targets()[0].v)}});
    gsap.to({v:0},{v:97.3,duration:2.5,ease:'power2.out',onUpdate:function(){document.getElementById('dc4').innerHTML=this.targets()[0].v.toFixed(1)+'<span class="un">%</span>'}});
  }
});

// Final line blink
setInterval(()=>{const e=document.getElementById('finLine');e.textContent=e.textContent.endsWith('_')?'experiment still running':'experiment still running_'},700);

// ==================== RENDER LOOP ====================
let t=0;
function render(){
  requestAnimationFrame(render);
  t+=.008;

  // Background particles — always move
  bgParts.forEach(p=>{
    p.position.x+=p.userData.v.x;
    p.position.y+=p.userData.v.y;
    p.position.y+=Math.sin(t+p.userData.base.x)*.003;
    if(p.position.x>40)p.position.x=-40;
    if(p.position.x<-40)p.position.x=40;
    if(p.position.y>25)p.position.y=-25;
    if(p.position.y<-25)p.position.y=25;
  });

  // Humanoid assembly/disassembly based on scroll
  const p=heroProgress;
  allVox.forEach(v=>{
    const d=v.userData.delay;
    let ep=0;

    if(p < 0.78){
      // Assembly Phase (original speed)
      const start=.15+d*.25;
      const end=start+.35;
      const prog=Math.max(0,Math.min(1,(p-start)/(end-start)));
      ep=prog<.5?2*prog*prog:1-Math.pow(-2*prog+2,2)/2;
    } else if(p < 0.82){
      // Fully assembled bridge
      ep = 1;
    } else {
      // Disassembly Phase (3x faster scroll distance)
      // Assembly took ~0.6 scroll. Disassembly takes ~0.18.
      const dStart=0.82 + d*0.06;
      const dEnd=dStart + 0.11;
      const dProg=Math.max(0,Math.min(1,(p-dStart)/(dEnd-dStart)));
      const dep=dProg<.5?2*dProg*dProg:1-Math.pow(-2*dProg+2,2)/2;
      ep = 1 - dep;
    }

    const tgt=v.userData.target;
    const sct=v.userData.scatter;
    v.position.x=sct.x+(tgt.x-sct.x)*ep;
    v.position.y=sct.y+(tgt.y-sct.y)*ep;
    v.position.z=sct.z+(tgt.z-sct.z)*ep;
    v.material.opacity=Math.min(1,ep*1.5);
    v.rotation.x=(1-ep)*Math.PI*2*d;
    v.rotation.y=(1-ep)*Math.PI*2*(1-d);
  });

  // After mostly assembled, subtle look toward mouse (maintains profile rotation)
  const baseRotY = -0.6;
  if(p>.7 && p < 0.85){
    const lookX = baseRotY + (mx/window.innerWidth-.5)*.25;
    const lookY = (my/window.innerHeight-.5)*.12;
    humG.rotation.y+=(lookX-humG.rotation.y)*.04;
    humG.rotation.x+=(-lookY-humG.rotation.x)*.04;
  } else {
    humG.rotation.y+=(baseRotY-humG.rotation.y)*.02;
    humG.rotation.x+=(-humG.rotation.x)*.02;
  }

  // Glow pulse on emissive voxels (cyan eyes)
  humG.children.forEach(c=>{
    if(c.material.emissive && c.material.emissive.r > 0){
      c.material.emissiveIntensity = 0.7 + Math.sin(t*4)*0.3;
    }
  });

  // Camera subtle movement
  hCam.position.x=Math.sin(t*.3)*.5;
  hCam.position.y=Math.cos(t*.25)*.3;
  hCam.lookAt(0,.5,0);

  // Hide hero canvas once past boot
  const bootBot=document.getElementById('boot').getBoundingClientRect().bottom;
  hc.style.opacity=bootBot>-100?'1':'0';

  hR.render(hS,hCam);

  // Lab scene
  labAng+=.002;
  const lTargetX=Math.cos(labAng)*11+labMx*4;
  const lTargetZ=Math.sin(labAng)*11;
  lbCam.position.x+=(lTargetX-lbCam.position.x)*.02;
  lbCam.position.z+=(lTargetZ-lbCam.position.z)*.02;
  lbCam.position.y=7+labMy*-2;
  lbCam.lookAt(0,1.5,0);
  labBots.forEach((b,i)=>{b.rotation.y=Math.sin(t+i*1.5)*.1});
  lbPL.intensity=.3+Math.sin(t*3)*.1;
  lbR.render(lbS,lbCam);

  // Experiment scene
  exFigs.forEach((f,i)=>{
    const a=t*.4+i*(Math.PI*2/8);
    const r=3+Math.sin(t*.5+i)*.5;
    f.position.x=Math.cos(a)*r;
    f.position.z=Math.sin(a)*r;
    f.rotation.y=-a+Math.PI;
  });
  pairLines.forEach(pl=>{
    const posA=exFigs[pl.a].position;
    const posB=exFigs[pl.b].position;
    const pts=[posA.clone().setY(.3),posB.clone().setY(.3)];
    pl.line.geometry.setFromPoints(pts);
  });
  exR.render(exS,exCam);

  // Neural
  const nTargetX=30*Math.cos(t*.15)+neuMx*15;
  nCam.position.x+=(nTargetX-nCam.position.x)*.02;
  nCam.position.z=30*Math.sin(t*.15);
  nCam.position.y=Math.sin(t*.2)*5;
  nCam.lookAt(0,0,0);
  nNodes.forEach((n,i)=>{
    n.position.y=nPos[i].y+Math.sin(t*1.5+i*.2)*.4;
    n.scale.setScalar(.8+Math.sin(t*3+i)*.3);
  });
  // Pulse random connections
  nConns.forEach((c,i)=>{
    c.material.opacity=.04+Math.sin(t*2+i*.5)*.03;
  });
  nR.render(nS,nCam);

  // Observation humanoid — tracks mouse
  if(obsInView){
    oG.rotation.y+=(obsMx*.6-oG.rotation.y)*.04;
    oG.rotation.x+=(-obsMy*.2-oG.rotation.x)*.04;
  }else{
    oG.rotation.y+=.003;
  }
  // Eye glow
  oG.children.forEach(c=>{
    if(c.material.color.getHex()===0x3dffd2){
      c.material.emissive=new THREE.Color(0x3dffd2);
      c.material.emissiveIntensity=.3+Math.sin(t*4)*.2;
    }
  });
  oCam.lookAt(0,1,0);
  oR.render(oS,oCam);
}
render();

// Resize
window.addEventListener('resize',()=>{
  hR.setSize(window.innerWidth,window.innerHeight-36);
  hCam.aspect=window.innerWidth/(window.innerHeight-36);
  hCam.updateProjectionMatrix();
  lbR.setSize(lbBox.clientWidth,lbBox.clientHeight);
  lbCam.aspect=lbBox.clientWidth/lbBox.clientHeight;
  lbCam.updateProjectionMatrix();
  exR.setSize(exBox.clientWidth,exBox.clientHeight);
  exCam.aspect=exBox.clientWidth/exBox.clientHeight;
  exCam.updateProjectionMatrix();
  nR.setSize(nBox.clientWidth,nBox.clientHeight);
  nCam.aspect=nBox.clientWidth/nBox.clientHeight;
  nCam.updateProjectionMatrix();
});