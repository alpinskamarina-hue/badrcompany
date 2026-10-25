/* 3D badkamer: van sloop tot opgeleverd */
(function(){
  const stage=document.getElementById('stage2');
  if(!stage)return;
  if(!window.THREE){stage.insertAdjacentHTML('beforeend','<p style="position:absolute;inset:auto 16px 50% 16px;text-align:center;color:#cfcabf">3D kon niet laden. Vernieuw de pagina.</p>');return;}
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* textures */
  function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647;};}
  function ctex(fn,rx,ry){const c=document.createElement('canvas');c.width=c.height=512;fn(c.getContext('2d'),512,512);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}
  const tx={
    brick:ctex((g,w,h)=>{const r=rng(21);g.fillStyle='#8e8b84';g.fillRect(0,0,w,h);const bh=h/16,bw=w/6;for(let y=0;y<16;y++)for(let x=-1;x<7;x++){const off=y%2?bw/2:0;g.fillStyle=`hsl(40,5%,${74+r()*10}%)`;g.fillRect(x*bw+off+2,y*bh+2,bw-4,bh-4);}g.fillStyle='rgba(110,100,90,.25)';for(let i=0;i<30;i++){g.beginPath();g.arc(r()*w,r()*h,4+r()*14,0,7);g.fill();}},1.3,1.3),
    concrete:ctex((g,w,h)=>{const r=rng(4);g.fillStyle='#86847f';g.fillRect(0,0,w,h);for(let i=0;i<6000;i++){g.fillStyle=r()>.5?'rgba(255,255,255,.06)':'rgba(0,0,0,.08)';g.fillRect(r()*w,r()*h,2,2);}},1.5,1.5),
    gips:ctex((g,w,h)=>{g.fillStyle='#cfd8d3';g.fillRect(0,0,w,h);g.fillStyle='#e8ece8';g.fillRect(w/2-3,0,6,h);},1,1),
    plaster:ctex((g,w,h)=>{const r=rng(8);g.fillStyle='#e6e1d7';g.fillRect(0,0,w,h);for(let i=0;i<90;i++){g.fillStyle=r()>.5?'rgba(255,255,255,.2)':'rgba(160,150,130,.08)';g.beginPath();g.ellipse(r()*w,r()*h,30+r()*80,8+r()*20,r()*3,0,7);g.fill();}},1.2,1.2),
    seal:ctex((g,w,h)=>{const r=rng(17);g.fillStyle='#5f7f97';g.fillRect(0,0,w,h);for(let i=0;i<160;i++){g.strokeStyle=r()>.5?'rgba(255,255,255,.12)':'rgba(0,0,40,.12)';g.lineWidth=10+r()*20;g.beginPath();const x=r()*w,y=r()*h;g.moveTo(x,y);g.quadraticCurveTo(x+40,y+r()*30,x+80+r()*60,y);g.stroke();}},1,1),
    wallTile:ctex((g,w,h)=>{const r=rng(31);g.fillStyle='#a9a59c';g.fillRect(0,0,w,h);const cw=w/2,ch=h/2;for(let y=0;y<2;y++)for(let x=0;x<2;x++){const l=90+r()*2;g.fillStyle=`hsl(38,12%,${l}%)`;g.fillRect(x*cw+1.5,y*ch+1.5,cw-3,ch-3);for(let k=0;k<3;k++){g.strokeStyle='rgba(150,140,120,.12)';g.lineWidth=2;g.beginPath();const yy=y*ch+r()*ch;g.moveTo(x*cw,yy);g.bezierCurveTo(x*cw+cw*.3,yy+30*r(),x*cw+cw*.7,yy-30*r(),x*cw+cw,yy+10);g.stroke();}}},2.2,1.1),
    floorTile:ctex((g,w,h)=>{const r=rng(41);g.fillStyle='#1b1c1d';g.fillRect(0,0,w,h);const s=w/2;for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.fillStyle=`hsl(200,3%,${27+r()*4}%)`;g.fillRect(x*s+2,y*s+2,s-4,s-4);for(let i=0;i<400;i++){g.fillStyle='rgba(255,255,255,.04)';g.fillRect(x*s+r()*s,y*s+r()*s,2,2);}}},2.6,2.2),
    wood:ctex((g,w,h)=>{const r=rng(5);g.fillStyle='#8a6a4c';g.fillRect(0,0,w,h);for(let i=0;i<70;i++){g.strokeStyle=`hsla(28,35%,${30+r()*15}%,.45)`;g.lineWidth=1+r()*2;g.beginPath();const y=r()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+8,w*.7,y-8,w,y);g.stroke();}},1,1)
  };
  const M=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:.85,metalness:0},o));
  const m={
    brick:M({map:tx.brick,roughness:1}),concrete:M({map:tx.concrete,roughness:1}),gips:M({map:tx.gips}),plaster:M({map:tx.plaster}),
    seal:M({map:tx.seal,roughness:.6}),tape:M({color:0x9bb4c6,roughness:.5}),
    wallTile:M({map:tx.wallTile,roughness:.35}),floorTile:M({map:tx.floorTile,roughness:.45}),
    red:M({color:0xc0392b,roughness:.4,metalness:.3}),blue:M({color:0x2f6fb5,roughness:.4,metalness:.3}),grey:M({color:0x8d9399,roughness:.5}),
    frame:M({color:0x5b6a73,metalness:.7,roughness:.35}),white:M({color:0xf7f7f5,roughness:.15}),chrome:M({color:0xd9dde0,metalness:1,roughness:.15}),
    black:M({color:0x161616,metalness:.4,roughness:.35}),steel:M({color:0xaab0b5,metalness:.9,roughness:.25}),wood:M({map:tx.wood,roughness:.6}),
    mirror:M({color:0xcfe3ee,metalness:1,roughness:.04,emissive:0x223038,emissiveIntensity:.3}),
    glass:new THREE.MeshPhysicalMaterial({color:0xdff1f5,roughness:.05,metalness:0,transparent:true,opacity:.22,side:THREE.DoubleSide}),
    yellow:M({color:0xf6c945,roughness:.9}),leaf:M({color:0x4f7a4a,roughness:.9,flatShading:true}),led:new THREE.MeshBasicMaterial({color:0xfff1c9}),
    bucket:M({color:0xf6c945,roughness:.6}),box:M({color:0xb79b6e,roughness:1})
  };

  /* bottom-anchored box helper */
  function B(w,h,d,mat,x,y,z){const g=new THREE.BoxGeometry(w,h,d);g.translate(0,h/2,0);const me=new THREE.Mesh(g,mat);me.position.set(x,y,z);me.castShadow=me.receiveShadow=true;return me;}
  function C(r1,r2,h,mat,x,y,z,seg){const g=new THREE.CylinderGeometry(r1,r2,h,seg||20);g.translate(0,h/2,0);const me=new THREE.Mesh(g,mat);me.position.set(x,y,z);me.castShadow=me.receiveShadow=true;return me;}
  function pipeH(len,r,mat,x,y,z){const g=new THREE.CylinderGeometry(r,r,len,12);g.rotateZ(Math.PI/2);const me=new THREE.Mesh(g,mat);me.position.set(x,y,z);me.castShadow=true;return me;}
  function pipeHz(len,r,mat,x,y,z){const g=new THREE.CylinderGeometry(r,r,len,12);g.rotateX(Math.PI/2);const me=new THREE.Mesh(g,mat);me.position.set(x,y,z);me.castShadow=true;return me;}

  const renderer=window.__photoRenderer?window.__photoRenderer():new THREE.WebGLRenderer({antialias:true,alpha:true});
  stage.prepend(renderer.domElement);
  const scene=new THREE.Scene();if(window.__photoEnv)scene.environment=window.__photoEnv(renderer);const camera=new THREE.PerspectiveCamera(32,4/3,.1,100);
  scene.add(new THREE.HemisphereLight(0xf2f6ff,0x2c2a26,.3));
  const sun=new THREE.DirectionalLight(0xfff3dc,2.2);sun.shadow.mapSize&&sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.02;sun.position.set(2.5,4.5,4);sun.castShadow=true;Object.assign(sun.shadow.camera,{left:-3,right:3,top:3,bottom:-3});scene.add(sun);
  const warm=new THREE.PointLight(0xffe2b0,0,5,2);warm.position.set(.2,2.3,.1);scene.add(warm);

  const W=2.6,D=2.2,H=2.5,T=.14;const bz=-D/2, lx=-W/2; // inner faces: back wall z=bz, left wall x=lx
  const root=new THREE.Group();scene.add(root);
  // shell (always): slab + brick walls
  root.add(B(W+T,.08,D+T,m.concrete,-T/2,-.08,-T/2));
  root.add(B(W+T,H,T,m.brick,-T/2,0,bz-T/2));
  root.add(B(T,H,D,m.brick,lx-T/2,0,0));

  const phases=[];function P(){const g=new THREE.Group();root.add(g);phases.push(g);return g;}
  function add(g,obj,mode,delay){obj.userData.mode=mode||'y';obj.userData.delay=delay||0;g.add(obj);return obj;}

  /* phase 0 · slopen (demolition debris, only visible in phase 0) */
  const demo=P();
  const K=window.__kit;
  {const sp=K.shards(34,.5,.38,6);sp.position.set(-.72,0,-.62);add(demo,sp,'xz',0);
   const rb1=K.rubbleBag(3);rb1.position.set(.9,0,.62);rb1.rotation.y=.3;add(demo,rb1,'s',.04);
   const rb2=K.rubbleBag(5);rb2.position.set(.98,0,.02);rb2.rotation.y=-.4;add(demo,rb2,'s',.07);
   const cb=K.crowbar();cb.position.set(.05,0,.8);cb.rotation.y=.45;add(demo,cb,'s',.1);
   const hm=K.hammer();hm.position.set(-.25,.006,.15);hm.rotation.y=2.1;add(demo,hm,'s',.12);}

  /* phase 1 · leidingwerk */
  const lw=P();
  // hot & cold vertical risers in back wall (shower) and horizontal runs
  add(lw,C(.014,.014,1.15,m.red,-.95,0,bz+.02),'y',0);add(lw,C(.014,.014,1.15,m.blue,-.85,0,bz+.02),'y',0);
  add(lw,pipeH(1.6,.014,m.red,-.15,.12,bz+.02),'x',.05);add(lw,pipeH(1.6,.014,m.blue,-.15,.18,bz+.02),'x',.05);
  // shower mixer box
  add(lw,B(.22,.14,.06,m.frame,-.9,1.05,bz+.03),'s',.1);
  add(lw,C(.012,.012,1.0,m.blue,-.9,1.15,bz+.02),'y',.12);
  // basin supply on left wall
  add(lw,pipeHz(1.0,.014,m.red,lx+.02,.55,.35),'z',.1);add(lw,pipeHz(1.0,.014,m.blue,lx+.02,.62,.35),'z',.1);
  // toilet frame (inbouwreservoir)
  const fr=new THREE.Group();fr.position.set(.35,0,bz+.09);
  [[-.24],[.24]].forEach(([x])=>fr.add(B(.04,1.12,.04,m.frame,x,0,0)));
  fr.add(B(.52,.04,.04,m.frame,0,1.1,0));fr.add(B(.52,.04,.04,m.frame,0,.4,0));
  fr.add(B(.36,.42,.1,m.white,0,.6,-.02));fr.add(C(.05,.05,.2,m.grey,0,.18,0));
  add(lw,fr,'y',.15);
  // drain line in floor + shower gutter channel
  add(lw,pipeHz(1.2,.04,m.grey,.35,.02,bz+.6),'z',.2);
  add(lw,B(.8,.03,.08,m.steel,-.75,0,bz+.12),'x',.25);
  add(lw,B(.06,.03,.06,m.grey,.9,0,-.2),'s',.2);

  /* phase 2 · waterdicht */
  const wd=P();
  add(wd,B(.72,1.18,.22,m.gips,.35,0,bz+.11),'y',0); // voorzetwand
  add(wd,B(W,H,.02,m.plaster,0,0,bz+.01),'y',.04);   // back wall plaster
  add(wd,B(.02,H,D,m.plaster,lx+.01,0,0),'y',.06);   // left wall plaster
  add(wd,B(1.1,2.1,.012,m.seal,-.75,0,bz+.026),'y',.1); // shower walls coating
  add(wd,B(.012,2.1,1.1,m.seal,lx+.026,0,bz+.55),'y',.12);
  add(wd,B(W,.01,D,m.seal,0,.0,0),'xz',.15);           // floor coating
  add(wd,B(.08,2.1,.016,m.tape,lx+.04,0,bz+.03),'y',.2); // corner tape
  add(wd,B(W,.08,.016,m.tape,0,0,bz+.03),'x',.2);
  add(wd,B(.016,.08,D,m.tape,lx+.03,0,0),'z',.2);

  /* phase 3 · tegelwerk */
  const tg=P();
  add(tg,B(W,H,.02,m.wallTile,0,0,bz+.045),'y',0);
  add(tg,B(.02,H,D,m.wallTile,lx+.045,0,0),'y',.06);
  add(tg,B(.76,1.21,.25,m.wallTile,.35,0,bz+.125),'y',.08);
  add(tg,B(W-.06,.02,D-.06,m.floorTile,.03,0,.03),'xz',.1);
  add(tg,B(.8,.025,.06,m.steel,-.75,.012,bz+.13),'x',.25); // gutter grid
  // shower niche
  add(tg,B(.5,.28,.03,m.black,-.75,1.25,bz+.05),'s',.3);

  /* phase 4 · sanitair */
  const sn=P();
  // wall-hung toilet
  const wc=new THREE.Group();wc.position.set(.35,0,bz+.26);
  const bowlG=new THREE.SphereGeometry(.2,24,16,0,Math.PI*2,0,Math.PI/2);bowlG.scale(1,.9,1.45);bowlG.rotateX(Math.PI);bowlG.translate(0,.42,.2);
  const bowl=new THREE.Mesh(bowlG,m.white);bowl.castShadow=true;wc.add(bowl);
  wc.add(B(.36,.04,.56,m.white,0,.42,.2));wc.add(B(.3,.2,.06,m.chrome,0,1.0,-.01));
  add(sn,wc,'s',0);
  // vanity on left wall
  const van=new THREE.Group();van.position.set(lx+.3,0,.45);
  van.add(B(.46,.42,.9,m.wood,0,.45,0));van.add(B(.48,.05,.92,m.white,0,.87,0));
  const basin=new THREE.Mesh(new THREE.CylinderGeometry(.17,.14,.08,28),m.white);basin.position.set(.03,.94,0);basin.castShadow=true;van.add(basin);
  van.add(C(.012,.012,.22,m.black,-.15,.9,0));van.add(B(.12,.02,.02,m.black,-.1,1.1,0));
  add(sn,van,'s',.08);
  add(sn,B(.02,.8,.75,m.mirror,lx+.065,1.2,.45),'y',.15);
  // glass shower wall + rain head
  add(sn,B(.012,2.0,.95,m.glass,-.18,0,bz+.55),'y',.2);
  add(sn,B(.02,.02,.95,m.black,-.18,2.0,bz+.55),'z',.22);
  add(sn,C(.012,.012,1.0,m.black,-.9,1.0,bz+.08),'y',.25);
  const head=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.015,32),m.black);head.position.set(-.9,2.05,bz+.3);head.castShadow=true;add(sn,head,'s',.3);
  add(sn,B(.02,.02,.24,m.black,-.9,2.05,bz+.17),'s',.3);
  // towel radiator on back wall right
  const rad=new THREE.Group();rad.position.set(1.0,.45,bz+.08);
  rad.add(B(.025,1.15,.025,m.black,-.22,0,0));rad.add(B(.025,1.15,.025,m.black,.22,0,0));
  for(let y=.05;y<1.15;y+=.11)rad.add(B(.44,.02,.02,m.black,0,y,0));
  add(sn,rad,'y',.3);

  /* phase 5 · opgeleverd */
  const op=P();
  add(op,B(.4,.5,.03,m.yellow,1.0,.95,bz+.12),'y',0);       // towel
  add(op,B(.6,.01,.42,m.yellow,.35,.022,.55),'xz',.05);     // bath mat
  add(op,B(.012,.78,.02,m.led,lx+.06,1.21,.07),'y',.15);    // LED strip on mirror
  add(op,B(.012,.78,.02,m.led,lx+.06,1.21,.83),'y',.15);
  [[-.75,bz+.5],[.35,0],[.5,.6]].forEach(([x,z],i)=>add(op,C(.06,.06,.012,m.led,x,H-.02,z),'s',.2+i*.03)); // ceiling spots
  add(op,B(.08,.06,.12,m.white,-.62,1.32,bz+.07),'s',.25); // bottles in niche
  add(op,B(.06,.08,.06,m.yellow,-.85,1.3,bz+.06),'s',.27);

  /* tools & materials, present from sloop until tegelwerk is done */
  const tools=P();
  {const sk=K.sackStack(2,'TEGELLIJM','FLEXIBEL · C2TE S1','#2f6f4f');sk.position.set(.2,0,-.55);sk.rotation.y=.12;add(tools,sk,'s',0);
   const tp=K.tape();tp.position.set(.08,.235,-.5);add(tools,tp,'s',.1);
   const ct=K.cartridge();ct.position.set(.28,.235,-.62);ct.rotation.y=.6;add(tools,ct,'s',.12);
   const tb=K.tileBoxes(3);tb.position.set(-.5,0,.72);tb.rotation.y=-.05;add(tools,tb,'s',.05);
   const dr=K.drill();dr.position.set(-.25,.153,.68);dr.rotation.y=2.4;add(tools,dr,'s',.15);
   const tub=K.mortarTub();tub.position.set(.42,0,.38);tub.scale.setScalar(.85);add(tools,tub,'s',.08);
   const tr=K.trowel();tr.position.set(.46,.26,.36);tr.rotation.set(0,-.4,.05);add(tools,tr,'s',.14);
   const lv=K.level(.8);lv.position.set(-.85,.153,.85);lv.rotation.y=.1;add(tools,lv,'s',.16);}

  /* animation state */
  const names=['Slopen','Leidingwerk','Waterdicht','Tegelwerk','Sanitair','Opgeleverd'];
  const N=phases.length;const k=new Array(N).fill(0),tgt=new Array(N).fill(0);
  phases.forEach(g=>g.children.forEach(o=>{o.userData.base=o.scale.clone();}));
  function setPhase(p){setPhase.cur=p;
    for(let i=0;i<N;i++)tgt[i]=(i===0)?(p===0?1:0):(i===6?(p<=3?1:0):(p>=i?1:0));
    document.querySelectorAll('#badkamer3d .phase').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.bphase)===p)));
    document.getElementById('hudBath').textContent=__t('Fase')+' '+(p+1)+' · '+__t(names[p]);
    if(reduce)for(let i=0;i<N;i++)k[i]=tgt[i];
  }
  let timer=null;const playBtn=document.getElementById('playBath');
  function stop(){if(timer){clearInterval(timer);timer=null;playBtn.textContent=__t('▶ Speel af');}}
  document.querySelectorAll('#badkamer3d .phase').forEach(b=>b.addEventListener('click',()=>{stop();setPhase(Number(b.dataset.bphase));}));
  playBtn.addEventListener('click',()=>{if(timer){stop();return;}let p=0;setPhase(0);playBtn.textContent=__t('❚❚ Pauze');timer=setInterval(()=>{p++;if(p>N-1){stop();return;}setPhase(p);},1700);});

  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
  function apply(o,v){
    const b=o.userData.base,e=Math.max(v,.001);o.visible=v>.01;
    switch(o.userData.mode){
      case 'y':o.scale.set(b.x,b.y*e,b.z);break;
      case 'x':o.scale.set(b.x*e,b.y,b.z);break;
      case 'z':o.scale.set(b.x,b.y,b.z*e);break;
      case 'xz':o.scale.set(b.x*e,b.y,b.z*e);break;
      default:o.scale.set(b.x*e,b.y*e,b.z*e);
    }
  }

  let yaw=.7,pitch=.5,tYaw=yaw,drag=false,lx0=0,ly0=0,idle=0;const el=renderer.domElement;
  el.addEventListener('pointerdown',e=>{drag=true;lx0=e.clientX;ly0=e.clientY;el.setPointerCapture(e.pointerId);idle=0;});
  el.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx0,dy=e.clientY-ly0;lx0=e.clientX;ly0=e.clientY;tYaw=Math.min(1.45,Math.max(.1,tYaw-dx*.008));pitch=Math.min(1.0,Math.max(.15,pitch+dy*.004));});
  el.addEventListener('pointerup',()=>drag=false);el.addEventListener('pointercancel',()=>drag=false);
  function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  resize();new ResizeObserver(resize).observe(stage);
  let visible=true;new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{threshold:.05}).observe(stage);
  const clock=new THREE.Clock();
  function loop(){
    requestAnimationFrame(loop);if(!visible)return;
    const dt=Math.min(clock.getDelta(),.05);
    if(!drag&&!reduce){idle+=dt;if(idle>2.5)tYaw=.78+Math.sin(clock.elapsedTime*.22)*.3;}
    yaw+=(tYaw-yaw)*.08;
    for(let i=0;i<N;i++){
      k[i]+=(tgt[i]-k[i])*Math.min(1,dt*3.2);
      phases[i].children.forEach(o=>{const d=o.userData.delay||0;const v=ease(Math.max(0,Math.min(1,(k[i]-d)/(1-d))));apply(o,v);});
    }
    warm.intensity=k[5]*1.4;
    const r=6.6;camera.position.set(Math.sin(yaw)*r*Math.cos(pitch),.4+Math.sin(pitch)*r,Math.cos(yaw)*r*Math.cos(pitch));
    camera.lookAt(-.1,1.0,-.25);
    renderer.render(scene,camera);
  }
  window.__stillBath=function(vals,pos,look,fov){
    for(let i=0;i<N;i++){phases[i].children.forEach(o=>apply(o,vals[i]));}
    warm.intensity=vals[5]*1.4;
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W+.4,D+.4),new THREE.MeshStandardMaterial({color:0xf2f0ec,roughness:.9,side:THREE.DoubleSide,emissive:0x5e5a53,emissiveIntensity:.5}));
    ceil.rotation.x=Math.PI/2;ceil.position.set(0,H,0);root.add(ceil);
    const sw=new THREE.Mesh(new THREE.BoxGeometry(.1,H,D),vals[3]>.5?m.wallTile:m.plaster);sw.position.set(W/2+.05,H/2,0);root.add(sw);
    const cam=new THREE.PerspectiveCamera(fov||52,1.6,.05,40);cam.position.set(...pos);cam.lookAt(...look);
    const r=window.__stillR();r.render(scene,cam);const url=r.domElement.toDataURL('image/jpeg',.88);
    root.remove(ceil);root.remove(sw);return url;
  };
  // service card photos, rendered once from the 3D scenes
  setTimeout(()=>{
    if(!window.__stillRoom||!window.__stillR)return;
    const shots={
      stuc:()=>window.__stillRoom([1,1,1,0,0],[1.0,.8,2.3],[-.7,.55,.2],46),
      gips:()=>window.__stillRoom([1,1,0,0,0],[1.95,.75,.75],[.4,.35,-.9],48),
      tegel:()=>window.__stillBath([0,1,1,1,0,0,1],[1.15,1.15,1.0],[-.6,.55,-.4],50),
      vloer:()=>window.__stillRoom([0,1,1,1,1],[1.7,.42,1.75],[-.3,.25,-.4],46),
      verf:()=>window.__stillRoom([1,1,1,1,1],[.9,.95,2.4],[1.25,.6,-1.2],46),
      bad:()=>window.__stillBath([0,1,1,1,1,1,0],[1.05,1.45,1.0],[-.85,1.0,-.55],52)
    };
    const keys=Object.keys(shots);
    keys.forEach((key,i)=>setTimeout(()=>{
      try{const url=shots[key]();const c=document.querySelector('canvas.art[data-art="'+key+'"]');if(!c)return;
        const img=new Image();img.onload=()=>{c.width=1280;c.height=800;c.getContext('2d').drawImage(img,0,0,1280,800);};img.src=url;}catch(e){}
      if(i===keys.length-1){try{window.__stillRend.dispose();window.__stillRend.forceContextLoss&&window.__stillRend.forceContextLoss();window.__stillRend=null;}catch(e){}}
    },i*150));
  },1500);
  document.addEventListener('langchange',()=>{setPhase(setPhase.cur||0);if(!(typeof playTimer!=='undefined'?playTimer:timer))playBtn.textContent=__t('▶ Speel af');});
  if(location.hash==='#badkamer-af'){setPhase(5);for(let i=0;i<N;i++)k[i]=tgt[i];stage.scrollIntoView();}else setPhase(0);
  loop();
})();
