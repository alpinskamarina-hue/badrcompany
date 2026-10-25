/* 3D dakkapel: van pannendak tot extra kamer */
(function(){
  const stage=document.getElementById('stage3');
  if(!stage)return;
  if(!window.THREE){stage.insertAdjacentHTML('beforeend','<p style="position:absolute;inset:auto 16px 50% 16px;text-align:center;color:#2b2925">3D kon niet laden. Vernieuw de pagina.</p>');return;}
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R=s=>()=>{s=(s*16807)%2147483647;return s/2147483647;};
  function canvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c;}
  function T(c,srgb){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(srgb!==false)t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;}
  function grain(g,w,h,n,a,seed){const r=R(seed);for(let i=0;i<n;i++){g.fillStyle=r()>.5?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a})`;g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}}

  /* textures (1 texture tile = 1 m unless noted) */
  function tiles(g,w,h,bump){const r=R(3);const cols=3,rows=3,tw=w/cols,th=h/rows;
    g.fillStyle=bump?'#000':'#1d1f21';g.fillRect(0,0,w,h);
    for(let ry=0;ry<rows;ry++){const off=0;const base=bump?0:12+r()*3;
      for(let x=0;x<w;x++){const ph=((x+off)%tw)/tw;const s=Math.sin(ph*Math.PI*2);const l=bump?128+s*90:base+8+s*6;
        const gr=g.createLinearGradient(0,ry*th,0,ry*th+th);
        if(bump){gr.addColorStop(0,`rgb(${l*.6|0},${l*.6|0},${l*.6|0})`);gr.addColorStop(.85,`rgb(${l|0},${l|0},${l|0})`);gr.addColorStop(1,'#000');}
        else{gr.addColorStop(0,`hsl(210,4%,${l-6}%)`);gr.addColorStop(.85,`hsl(210,4%,${l}%)`);gr.addColorStop(1,'hsl(210,6%,8%)');}
        g.fillStyle=gr;g.fillRect(x,ry*th,1,th);}
    }
    if(!bump){grain(g,w,h,9000,.05,4);const r2=R(9);for(let i=0;i<14;i++){g.fillStyle=`rgba(90,100,80,${.05+r2()*.06})`;g.beginPath();g.ellipse(r2()*w,r2()*h,20+r2()*40,8+r2()*14,0,0,7);g.fill();}}
  }
  const tileC=canvas(512,512,(g,w,h)=>tiles(g,w,h,false)),tileB=canvas(512,512,(g,w,h)=>tiles(g,w,h,true));
  const brickC=canvas(512,512,(g,w,h)=>{const r=R(21);g.fillStyle='#b9b2a6';g.fillRect(0,0,w,h);const rows=16,bh=h/rows,bw=w/4.5;
    for(let y=0;y<rows;y++){const off=y%2?bw/2:0;for(let x=-1;x<6;x++){const hue=12+r()*10,s=30+r()*14,l=28+r()*12;g.fillStyle=`hsl(${hue},${s}%,${l}%)`;g.fillRect(x*bw+off+3,y*bh+3,bw-6,bh-6);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x*bw+off+3,y*bh+bh-6,bw-6,3);}}
    grain(g,w,h,16000,.07,5);});
  const brickB=canvas(256,256,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);const rows=16,bh=h/rows,bw=w/4.5;g.fillStyle='#000';for(let y=0;y<rows;y++){g.fillRect(0,y*bh,w,3);const off=y%2?bw/2:0;for(let x=-1;x<6;x++)g.fillRect(x*bw+off,y*bh,3,bh);}});
  const sidingC=canvas(256,512,(g,w,h)=>{const n=7,bh=h/n;for(let i=0;i<n;i++){const gr=g.createLinearGradient(0,i*bh,0,i*bh+bh);gr.addColorStop(0,'#4a4f54');gr.addColorStop(.92,'#3a3e42');gr.addColorStop(.93,'#1c1e20');gr.addColorStop(1,'#26292c');g.fillStyle=gr;g.fillRect(0,i*bh,w,bh);}grain(g,w,h,4000,.03,7);});
  const sidingB=canvas(128,256,(g,w,h)=>{const n=7,bh=h/n;for(let i=0;i<n;i++){const gr=g.createLinearGradient(0,i*bh,0,i*bh+bh);gr.addColorStop(0,'#fff');gr.addColorStop(.9,'#999');gr.addColorStop(.93,'#000');gr.addColorStop(1,'#333');g.fillStyle=gr;g.fillRect(0,i*bh,w,bh);}});
  const osbC=canvas(512,512,(g,w,h)=>{g.fillStyle='#c9a572';g.fillRect(0,0,w,h);const r=R(31);for(let i=0;i<2600;i++){g.save();g.translate(r()*w,r()*h);g.rotate(r()*Math.PI);g.fillStyle=`hsl(${30+r()*12},${35+r()*20}%,${45+r()*25}%)`;g.fillRect(-14-r()*14,-3,28+r()*20,5+r()*4);g.restore();}grain(g,w,h,6000,.06,3);});
  const woodC=canvas(256,256,(g,w,h)=>{g.fillStyle='#d9b98a';g.fillRect(0,0,w,h);const r=R(41);for(let i=0;i<60;i++){g.strokeStyle=`rgba(150,105,60,${.2+r()*.3})`;g.lineWidth=1+r()*2;g.beginPath();const y=r()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+5,w*.6,y-5,w,y);g.stroke();}});
  const paveC=canvas(512,512,(g,w,h)=>{const n=6,s=w/n;const r=R(51);g.fillStyle='#8f8c86';g.fillRect(0,0,w,h);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const l=44+r()*7;g.fillStyle=`hsl(35,5%,${l}%)`;g.fillRect(x*s+2,y*s+2,s-4,s-4);}grain(g,w,h,14000,.05,6);});

  function tex(c,rx,ry,srgb){const t=T(c,srgb);t.repeat.set(rx,ry);return t;}
  const E=.6;
  const SM=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.85,metalness:0,envMapIntensity:E},o));
  const tileMat=(w,l)=>SM({map:tex(tileC,w/0.9,l/1.0),bumpMap:tex(tileB,w/0.9,l/1.0,false),bumpScale:.03,roughness:.55});
  const brickMat=(w,h)=>SM({map:tex(brickC,w,h),bumpMap:tex(brickB,w,h,false),bumpScale:.01,roughness:.95});
  const sidingMat=(w,h)=>SM({map:tex(sidingC,w/1.2,h/1.05),bumpMap:tex(sidingB,w/1.2,h/1.05,false),bumpScale:.012,roughness:.6});
  const osbMat=(w,h)=>SM({map:tex(osbC,w/1.22,h/1.22),roughness:.95});
  const woodMat=SM({map:tex(woodC,1,1),roughness:.8});
  const mWhite=SM({color:0xf4f4f1,roughness:.35});
  const mAlu=SM({color:0xb8bdc2,metalness:.85,roughness:.32});
  const mEpdm=SM({color:0x141516,roughness:.75});
  const mLead=SM({color:0x5f6468,metalness:.3,roughness:.6});
  const mZinc=SM({color:0xa9afb3,metalness:.7,roughness:.4});
  const mGlass=new THREE.MeshPhysicalMaterial({color:0x10161c,roughness:.05,metalness:.2,envMapIntensity:.55,transparent:true,opacity:.72});
  const mDark=new THREE.MeshBasicMaterial({color:0x17130f});
  const mInside=new THREE.MeshBasicMaterial({color:new THREE.Color(0,0,0)});
  const mTube=SM({color:0xa7adb2,metalness:.85,roughness:.35});
  const mPlank=SM({map:tex(woodC,1,4),roughness:.9,color:0xc8b48e});
  const mToe=SM({color:0xe0b23a,roughness:.7});
  const mPave=SM({map:tex(paveC,5,4),roughness:.95});
  const mHedge=SM({color:0x3f5a33,roughness:1});

  /* renderer, scene, light */
  const renderer=window.__photoRenderer?window.__photoRenderer():new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.toneMappingExposure=.95;
  stage.prepend(renderer.domElement);
  const scene=new THREE.Scene();if(window.__photoEnv)scene.environment=window.__photoEnv(renderer);
  const camera=new THREE.PerspectiveCamera(30,4/3,.1,200);
  scene.add(new THREE.HemisphereLight(0xcfe3ff,0x5a4a3a,.55));
  const sun=new THREE.DirectionalLight(0xfff0d8,2.6);sun.position.set(-7,11,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:40});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;scene.add(sun);
  const root=new THREE.Group();scene.add(root);

  function mesh(geo,mat){const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;return m;}
  function box(w,h,d,mat,x,y,z){const m=mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);return m;}

  /* house geometry: front slope y = RIDGE - z*TAN for z>=0 */
  const RIDGE=6.2,TAN=.8,TH=Math.atan(TAN),COS=Math.cos(TH),SIN=Math.sin(TH);
  const roofY=z=>RIDGE-Math.abs(z)*TAN;
  function slope(x1,x2,z1,z2,mat,thick,off,back){const L=(z2-z1)/COS;const m=mesh(new THREE.BoxGeometry(x2-x1,thick,L),mat);
    const zm=(z1+z2)/2,ym=roofY(zm);m.rotation.x=back?-TH:TH;m.position.set((x1+x2)/2,ym+(off||0)*COS,zm*(back?1:1)+(off||0)*SIN*(back?-1:1));return m;}

  // ground + hedge
  const ground=mesh(new THREE.PlaneGeometry(22,16),mPave);ground.rotation.x=-Math.PI/2;ground.position.set(0,0,2);root.add(ground);
  [[-5.2,7.2],[5.2,7.2]].forEach(([x,z])=>{const hd=box(2.6,.9,.7,mHedge,x,.45,z);root.add(hd);});
  // facade + gables
  const front=box(7,3,.3,brickMat(7,3),0,1.5,3.85);root.add(front);
  function gable(x){const s=new THREE.Shape();[[4,0],[-4,0],[-4,3],[0,6.2],[4,3]].forEach((p,i)=>i?s.lineTo(-p[0],p[1]):s.moveTo(-p[0],p[1]));
    const g=new THREE.ExtrudeGeometry(s,{depth:.3,bevelEnabled:false});g.rotateY(Math.PI/2);const m=mesh(g,brickMat(1,1));m.position.x=x;return m;}
  root.add(gable(3.2),gable(-3.5));
  // ground floor frames
  function frame(x1,x2,y1,y2,z,mat,depth,mull){const g=new THREE.Group();const w=x2-x1,h=y2-y1,f=.07,d=depth||.1;
    g.add(box(w,f,d,mat,(x1+x2)/2,y1+f/2,z),box(w,f,d,mat,(x1+x2)/2,y2-f/2,z),box(f,h,d,mat,x1+f/2,(y1+y2)/2,z),box(f,h,d,mat,x2-f/2,(y1+y2)/2,z));
    (mull||[]).forEach(mx=>g.add(box(f*.8,h,d,mat,mx,(y1+y2)/2,z)));
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(w-f,h-f),mGlass);gl.position.set((x1+x2)/2,(y1+y2)/2,z-.01);g.add(gl);return g;}
  root.add(frame(-2.7,-.6,.9,2.45,4.02,mWhite,.1,[-1.65]),frame(.1,1.1,0,2.25,4.02,mWhite),frame(1.6,3.0,.9,2.45,4.02,mWhite));
  // eave: fascia + gutter
  root.add(box(7.5,.24,.06,mWhite,-.15,2.66,4.33));
  const gut=mesh(new THREE.CylinderGeometry(.065,.065,7.5,16,1,true,0,Math.PI),mZinc);gut.rotation.z=Math.PI/2;gut.rotation.x=Math.PI;gut.position.set(-.15,2.62,4.42);root.add(gut);
  const dp=mesh(new THREE.CylinderGeometry(.04,.04,2.6,12),mZinc);dp.position.set(3.3,1.3,4.42);root.add(dp);
  // roof (fixed parts)
  root.add(slope(-3.75,-2,0,4.35,tileMat(1.75,5.6),.06),slope(2,3.75,0,4.35,tileMat(1.75,5.6),.06),slope(-2,2,2.2,4.35,tileMat(4,2.75),.06),slope(-2,2,0,.13,tileMat(4,.2),.06));
  root.add(slope(-3.75,3.75,-4.35,0,tileMat(7.5,5.6),.06,0,true));
  const ridge=mesh(new THREE.CylinderGeometry(.11,.11,7.5,20,1,false,0,Math.PI),tileMat(7.5,.4));ridge.rotation.z=Math.PI/2;ridge.position.set(0,RIDGE+.02,0);root.add(ridge);
  // white verge boards along the gables
  [3.75,-3.75].forEach(x=>{root.add(slope(x-.03,x+.03,0,4.35,mWhite,.24,-.04));root.add(slope(x-.03,x+.03,-4.35,0,mWhite,.24,-.04,true));});
  // chimney
  root.add(box(.55,1.3,.55,brickMat(.55,1.3),-2.6,RIDGE-.6,-.9));root.add(box(.62,.06,.62,mZinc,-2.6,RIDGE+.08,-.9));

  /* phases */
  const phases=[];function P(){const g=new THREE.Group();root.add(g);phases.push(g);return g;}
  function add(g,o,mode,delay){o.userData.mode=mode||'s';o.userData.delay=delay||0;g.add(o);return o;}
  const DZ=2.2,DB=.13,DT=6.1,X1=-2,X2=2,DY=roofY(DZ); // dormer front z, back z, top y, sides, bottom y at front

  // 0 · bestaand dak: tiles over the future opening
  const p0=P();add(p0,slope(-2,2,DB,DZ,tileMat(4,2.7),.06),'x');

  // 1 · dak open: rafters + dark attic
  const p1=P();
  add(p1,slope(-2,2,DB,DZ,mDark,.02,-.25),'x');
  for(let x=-1.8;x<=1.81;x+=.6)add(p1,slope(x-.035,x+.035,DB,DZ,woodMat,.15,-.1),'s',.1+((x+1.8)/3.6)*.3);
  add(p1,slope(-2,2,DZ-.02,DZ+.05,woodMat,.08,.02),'x',.3);

  // 2 · houtskelet
  const p2=P();
  add(p2,box(4.1,.18,.12,woodMat,0,DY+.09,DZ),'x');
  [-2,-1.27,-.12,1.88,2].forEach((x,i)=>{const h=DT-.1-DY;const st=box(.07,h,.1,woodMat,x+(x===-2?.035:x===2?-.035:0),DY+h/2,DZ);add(p2,st,'y',.08+i*.04);});
  add(p2,box(4.1,.14,.12,woodMat,0,DT-.12,DZ),'x',.3);
  for(let x=-1.95;x<=1.96;x+=.39)add(p2,box(.05,.16,DZ-DB+.1,woodMat,x,DT-.02,(DZ+DB)/2+.05),'z',.35+((x+1.95)/3.9)*.25);
  [-1,1].forEach(sg=>{for(let z=.5;z<DZ;z+=.5){const yb=roofY(z),h=DT-.1-yb;add(p2,box(.07,h,.07,woodMat,sg*1.965,yb+h/2,z),'y',.45);}add(p2,box(.07,.1,DZ-DB,woodMat,sg*1.965,DT-.12,(DZ+DB)/2),'z',.5);});

  // 3 · beplating & EPDM
  const p3=P();
  function cheek(mat,x,thick){const s=new THREE.Shape();s.moveTo(-DZ,DY);s.lineTo(-DZ,DT);s.lineTo(-DB,DT);s.lineTo(-DB,roofY(DB));s.lineTo(-DZ,DY);
    const g=new THREE.ExtrudeGeometry(s,{depth:thick,bevelEnabled:false});g.rotateY(Math.PI/2);const m=mesh(g,mat);m.position.x=x;return m;}
  add(p3,cheek(osbMat(1.22,1.22),2.0,.02),'y');add(p3,cheek(osbMat(1.22,1.22),-2.02,.02),'y',.05);
  const frontAreas=[[X1,-1.25,DY,DT],[1.87,X2,DY,DT],[-1.25,1.87,DY,DY+.2],[-1.25,1.87,DT-.35,DT]];
  frontAreas.forEach(([a,b,c,d],i)=>add(p3,box(b-a,d-c,.02,osbMat(b-a,d-c),(a+b)/2,(c+d)/2,DZ+.07),'y',.1+i*.05));
  add(p3,box(4.12,.03,DZ-DB+.12,osbMat(4.1,2.1),0,DT+.065,(DZ+DB)/2+.06),'xz',.3);
  add(p3,box(4.2,.012,DZ-DB+.18,mEpdm,0,DT+.087,(DZ+DB)/2+.06),'xz',.45);

  // 4 · kozijnen & lood
  const p4=P();
  add(p4,frame(-1.25,-.13,DY+.2,DT-.35,DZ+.06,mWhite,.12),'y');
  add(p4,frame(-.11,1.87,DY+.2,DT-.35,DZ+.06,mWhite,.12,[1.25]),'y',.12);
  add(p4,slope(-2.12,2.12,DZ,DZ+.42,mLead,.012,.045),'x',.3);
  [-1,1].forEach(sg=>add(p4,slope(sg>0?2:-2.18,sg>0?2.18:-2,DB,DZ,mLead,.01,.05),'z',.35));

  // 5 · afwerking: siding, boeidelen, daktrim, warm light inside
  const p5=P();
  frontAreas.forEach(([a,b,c,d],i)=>{if(i===3)return;add(p5,box(b-a,d-c,.025,sidingMat(b-a,d-c),(a+b)/2,(c+d)/2,DZ+.095),'y',i*.05);});
  const sideS=sidingMat(1,1);sideS.map.repeat.set(1/1.2,1/1.05);sideS.bumpMap.repeat.set(1/1.2,1/1.05);
  add(p5,cheek(sideS,2.02,.025),'y',.08);add(p5,cheek(sideS,-2.045,.025),'y',.1);
  add(p5,box(4.32,.4,.05,mWhite,0,DT-.15,DZ+.13),'x',.2);
  [-1,1].forEach(sg=>add(p5,box(.05,.4,DZ-DB+.15,mWhite,sg*2.14,DT-.15,(DZ+DB)/2+.07),'z',.25));
  add(p5,box(4.34,.03,.07,mAlu,0,DT+.075,DZ+.13),'x',.35);
  [-1,1].forEach(sg=>add(p5,box(.07,.03,DZ-DB+.16,mAlu,sg*2.15,DT+.075,(DZ+DB)/2+.07),'z',.38));
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(3.1,1.1),mInside);glow.position.set(.3,(DY+DT)/2-.06,DZ-.12);add(p5,glow,'s',.4);

  // 6 · steiger (stands from dak open until afwerking)
  const p6=P();
  {const xs=[-3.6,-1.8,0,1.8,3.6],zs=[4.75,5.5],H=4.4;
   xs.forEach(x=>zs.forEach(z=>{const t=mesh(new THREE.CylinderGeometry(.024,.024,H,10),mTube);t.position.set(x,H/2,z);add(p6,t,'y');
     const bp=box(.15,.01,.15,mTube,x,.005,z);add(p6,bp,'s');}));
   [.9,1.9,2.85,3.4,3.95].forEach((y,i)=>zs.forEach(z=>{if(z===zs[0]&&i>2)return;const l=mesh(new THREE.CylinderGeometry(.022,.022,7.3,10),mTube);l.rotation.z=Math.PI/2;l.position.set(0,y,z);add(p6,l,'x',.05+i*.04);}));
   xs.forEach(x=>{[1.9,2.85].forEach(y=>{const tr=mesh(new THREE.CylinderGeometry(.02,.02,.85,8),mTube);tr.rotation.x=Math.PI/2;tr.position.set(x,y,5.12);add(p6,tr,'z',.1);});});
   for(let i=0;i<4;i++){const pl=box(7.3,.04,.18,mPlank,0,2.89,4.82+i*.2);add(p6,pl,'x',.2+i*.03);}
   const toe=box(7.3,.15,.025,mToe,0,2.99,5.53);add(p6,toe,'x',.3);
   [-2.7,-.9,.9,2.7].forEach((x,i)=>{const d=mesh(new THREE.CylinderGeometry(.018,.018,2.6,8),mTube);d.position.set(x,1.9,5.55);d.rotation.z=(i%2?1:-1)*.75;add(p6,d,'s',.15);});
   // roof-edge guard above the eaves
   [-3,-1,1,3].forEach(x=>{const ps=mesh(new THREE.CylinderGeometry(.02,.02,1.1,8),mTube);ps.position.set(x,3.45,4.75);add(p6,ps,'y',.35);});}

  /* animation */
  const names=['Bestaand dak','Dak openen','Houtskelet','Beplating & EPDM','Kozijnen & lood','Afgewerkt'];
  const N=phases.length,k=new Array(N).fill(0),tgt=new Array(N).fill(0);
  phases.forEach(g=>g.children.forEach(o=>{o.userData.base=o.scale.clone();}));
  function setPhase(p){setPhase.cur=p;
    for(let i=0;i<N;i++)tgt[i]=i===0?(p===0?1:0):i===6?(p>=1&&p<=4?1:0):(p>=i?1:0);
    document.querySelectorAll('#dakkapel3d .phase').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.dphase)===p)));
    document.getElementById('hudDak').textContent=__t('Fase')+' '+(p+1)+' · '+__t(names[p]);
    if(reduce)for(let i=0;i<N;i++)k[i]=tgt[i];
  }
  let timer=null;const playBtn=document.getElementById('playDak');
  function stop(){if(timer){clearInterval(timer);timer=null;playBtn.textContent=__t('▶ Speel af');}}
  document.querySelectorAll('#dakkapel3d .phase').forEach(b=>b.addEventListener('click',()=>{stop();setPhase(Number(b.dataset.dphase));}));
  playBtn.addEventListener('click',()=>{if(timer){stop();return;}let p=0;setPhase(0);playBtn.textContent=__t('❚❚ Pauze');timer=setInterval(()=>{p++;if(p>5){stop();return;}setPhase(p);},1800);});
  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
  function apply(o,v){const b=o.userData.base,e=Math.max(v,.001);o.visible=v>.01;
    switch(o.userData.mode){case 'y':o.scale.set(b.x,b.y*e,b.z);break;case 'x':o.scale.set(b.x*e,b.y,b.z);break;case 'z':o.scale.set(b.x,b.y,b.z*e);break;case 'xz':o.scale.set(b.x*e,b.y,b.z*e);break;default:o.scale.set(b.x*e,b.y*e,b.z*e);}}

  let yaw=.42,pitch=.2,tYaw=yaw,drag=false,lx=0,ly=0,idle=0;const el=renderer.domElement;
  el.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;el.setPointerCapture(e.pointerId);idle=0;});
  el.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;tYaw=Math.min(1.1,Math.max(-1.1,tYaw-dx*.008));pitch=Math.min(.75,Math.max(.05,pitch+dy*.004));});
  el.addEventListener('pointerup',()=>drag=false);el.addEventListener('pointercancel',()=>drag=false);
  function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  resize();new ResizeObserver(resize).observe(stage);
  let visible=true;new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{threshold:.05}).observe(stage);
  const clock=new THREE.Clock();
  function loop(){
    requestAnimationFrame(loop);if(!visible)return;
    const dt=Math.min(clock.getDelta(),.05);
    if(!drag&&!reduce){idle+=dt;if(idle>2.5)tYaw=.35+Math.sin(clock.elapsedTime*.18)*.3;}
    yaw+=(tYaw-yaw)*.06;
    for(let i=0;i<N;i++){k[i]+=(tgt[i]-k[i])*Math.min(1,dt*3);phases[i].children.forEach(o=>{const d=o.userData.delay||0;apply(o,ease(Math.max(0,Math.min(1,(k[i]-d)/(1-d)))));});}
    mInside.color.setRGB(1.25*k[5],.82*k[5],.48*k[5]);
    const r=19;camera.position.set(Math.sin(yaw)*r*Math.cos(pitch),3.4+Math.sin(pitch)*r,2+Math.cos(yaw)*r*Math.cos(pitch));
    camera.lookAt(0,3.7,1.6);
    renderer.render(scene,camera);
  }
  document.addEventListener('langchange',()=>{setPhase(setPhase.cur||0);if(!(typeof playTimer!=='undefined'?playTimer:timer))playBtn.textContent=__t('▶ Speel af');});
  if(location.hash==='#dakkapel-af'){setPhase(5);for(let i=0;i<N;i++)k[i]=tgt[i];stage.scrollIntoView();}else setPhase(0);
  loop();
})();
