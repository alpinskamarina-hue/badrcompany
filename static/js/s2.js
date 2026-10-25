(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* keep sticky 3D stages below the sticky header */
  const hdr=document.querySelector('header.top');
  function setHdr(){if(hdr)document.documentElement.style.setProperty('--hdr',(hdr.offsetHeight+8)+'px');}
  setHdr();addEventListener('resize',setHdr);
  /* mobile menu */
  const menuBtn=document.getElementById('menuBtn'), drawer=document.getElementById('drawer');
  menuBtn.addEventListener('click',()=>{const o=drawer.hidden;drawer.hidden=!o;menuBtn.setAttribute('aria-expanded',String(o));});
  drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{drawer.hidden=true;menuBtn.setAttribute('aria-expanded','false');}));

  /* copy helpers */
  function copyText(text, btn, done){
    const ok=()=>{if(btn){const t=btn.textContent;btn.textContent=done||__t('Gekopieerd');setTimeout(()=>btn.textContent=t,1600);}};
    try{navigator.clipboard.writeText(text).then(ok).catch(()=>fallback());}catch(e){fallback();}
    function fallback(){const r=document.createRange();const el=btn&&btn.previousElementSibling;if(el){r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);}}
  }
  document.querySelectorAll('.copy-btn').forEach(b=>b.addEventListener('click',()=>copyText(document.getElementById(b.dataset.copy).textContent,b)));

  /* trowel texture in hero */
  const tc=document.getElementById('trowel');
  function drawTrowel(){
    const r=tc.getBoundingClientRect();const d=Math.min(devicePixelRatio||1,2);
    tc.width=r.width*d;tc.height=r.height*d;const g=tc.getContext('2d');g.scale(d,d);
    g.fillStyle='#121212';g.fillRect(0,0,r.width,r.height);
    let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
    for(let i=0;i<260;i++){
      const x=rnd()*r.width,y=rnd()*r.height,w=60+rnd()*220,h=18+rnd()*50,a=(rnd()-.5)*0.9;
      g.save();g.translate(x,y);g.rotate(a);
      const gr=g.createLinearGradient(0,-h/2,0,h/2);
      const l=26+rnd()*16;gr.addColorStop(0,`hsla(40,8%,${l}%,0)`);gr.addColorStop(.5,`hsla(40,8%,${l}%,.35)`);gr.addColorStop(1,`hsla(40,8%,${l-8}%,0)`);
      g.fillStyle=gr;g.beginPath();g.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);g.fill();g.restore();
    }
    const v=g.createLinearGradient(0,0,r.width,0);v.addColorStop(0,'rgba(18,18,18,.92)');v.addColorStop(.6,'rgba(18,18,18,.55)');v.addColorStop(1,'rgba(18,18,18,.85)');
    g.fillStyle=v;g.fillRect(0,0,r.width,r.height);
  }
  if(tc){drawTrowel();addEventListener('resize',()=>{clearTimeout(drawTrowel._t);drawTrowel._t=setTimeout(drawTrowel,150);});}

  /* multi-step quote */
  const form=document.getElementById('offerte');
  if(form){
  const stepsEls=[...form.querySelectorAll('.qstep')];
  const bar=document.getElementById('bar'),label=document.getElementById('stepLabel'),err=document.getElementById('err');
  const prev=document.getElementById('prev'),next=document.getElementById('next');
  const m2=document.getElementById('m2'),m2out=document.getElementById('m2out');
  m2.addEventListener('input',()=>m2out.textContent=m2.value);
  let cur=1;const total=6;
  function show(n){
    cur=n;stepsEls.forEach(s=>s.hidden=Number(s.dataset.step)!==n);
    const pct=Math.round(n/total*100);bar.style.width=pct+'%';bar.textContent=pct+'%';
    label.textContent=__t('Stap')+' '+n+' '+__t('van')+' '+total;prev.hidden=n===1;next.hidden=n===total;err.textContent='';
    next.textContent=__t(n===total-1?'Bekijk aanvraag':'Volgende');
    if(n===total)buildSummary();
  }
  function vals(name){return [...form.querySelectorAll('input[name="'+name+'"]:checked')].map(i=>i.value);}
  function validate(n){
    if(n===1&&!vals('werk').length)return __t('Kies minstens één soort werk.');
    if(n===2&&!vals('ruimte').length)return __t('Kies een ruimte.');
    if(n===4&&!vals('start').length)return __t('Kies wanneer u wilt starten.');
    if(n===5){
      if(!document.getElementById('naam').value.trim())return __t('Vul uw naam in.');
      if(document.getElementById('tel').value.replace(/\D/g,'').length<9)return __t('Vul een telefoonnummer in waarop we u kunnen bereiken.');
    }
    return '';
  }
  function buildSummary(){
    const T_=__t,V=n=>vals(n).map(T_).join(', ');const t=T_('Offerte-aanvraag Badr Company')+'\n\n'+T_('Werk')+': '+V('werk')+'\n'+T_('Ruimte')+': '+V('ruimte')+'\n'+T_('Oppervlak')+': ± '+m2.value+' m²\n'+T_('Start')+': '+V('start')+'\n\n'+T_('Naam')+': '+document.getElementById('naam').value.trim()+'\n'+T_('Telefoon')+': '+document.getElementById('tel').value.trim();
    document.getElementById('summary').textContent=t;return t;
  }
  form.addEventListener('submit',e=>{e.preventDefault();const m=validate(cur);if(m){err.textContent=m;return;}if(cur<total)show(cur+1);});
  prev.addEventListener('click',()=>show(Math.max(1,cur-1)));
  document.addEventListener('langchange',()=>{show(cur);});
  document.getElementById('copySummary').addEventListener('click',e=>{
    const t=buildSummary();const btn=e.currentTarget;
    try{navigator.clipboard.writeText(t).then(()=>{btn.textContent=__t('Gekopieerd');setTimeout(()=>btn.textContent=__t('Kopieer aanvraag'),1800);}).catch(sel);}catch(x){sel();}
    function sel(){const r=document.createRange();r.selectNodeContents(document.getElementById('summary'));const s=getSelection();s.removeAllRanges();s.addRange(r);document.getElementById('copyNote').textContent=__t('Tekst is geselecteerd. Kopieer met Ctrl/Cmd + C.');}
  });
  /* prefill from link: ?werk=w1..w7&m2=25 */
  try{const q=new URLSearchParams(location.search);(q.get('werk')||'').split(',').forEach(id=>{const c=/^w[1-7]$/.test(id)&&document.getElementById(id);if(c)c.checked=true;});
    const a=parseInt(q.get('m2'),10);if(a>=2&&a<=200){m2.value=a;m2out.textContent=a;}}catch(e){}
  }

  /* procedural textures */
  function cnv(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c;}
  function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647;};}
  const tex={
    brick:(g,w,h)=>{const r=rng(3);g.fillStyle='#9c9a92';g.fillRect(0,0,w,h);const bh=h/16,bw=w/6;for(let y=0;y<16;y++)for(let x=-1;x<7;x++){const off=y%2?bw/2:0;const l=78+r()*10;g.fillStyle=`hsl(45,5%,${l}%)`;g.fillRect(x*bw+off+2,y*bh+2,bw-4,bh-4);}},
    concrete:(g,w,h)=>{const r=rng(9);g.fillStyle='#8d8b86';g.fillRect(0,0,w,h);for(let i=0;i<5000;i++){g.fillStyle=`rgba(${r()>.5?255:0},${r()>.5?255:0},${r()>.5?255:0},.05)`;g.fillStyle=r()>.5?'rgba(255,255,255,.06)':'rgba(0,0,0,.07)';g.fillRect(r()*w,r()*h,2,2);}},
    gips:(g,w,h)=>{g.fillStyle='#d9dcd6';g.fillRect(0,0,w,h);g.fillStyle='#c7cbc3';for(let x=0;x<=w;x+=w/4){g.fillRect(x-3,0,6,h);}g.fillStyle='#e9ebe6';for(let x=0;x<=w;x+=w/4){g.fillRect(x-1,0,2,h);}g.fillStyle='rgba(120,120,120,.5)';for(let x=w/8;x<w;x+=w/4)for(let y=20;y<h;y+=60){g.beginPath();g.arc(x,y,2,0,7);g.fill();}},
    plaster:(g,w,h)=>{const r=rng(5);g.fillStyle='#ece7dd';g.fillRect(0,0,w,h);for(let i=0;i<120;i++){g.fillStyle=r()>.5?'rgba(255,255,255,.18)':'rgba(170,160,140,.08)';g.beginPath();g.ellipse(r()*w,r()*h,30+r()*80,8+r()*20,r()*3,0,7);g.fill();}},
    paint:(g,w,h)=>{g.fillStyle='#f4f1ea';g.fillRect(0,0,w,h);},
    accent:(g,w,h)=>{g.fillStyle='#2f4a43';g.fillRect(0,0,w,h);},
    wood:(g,w,h)=>{const r=rng(11);const pw=h/8;for(let y=0;y<8;y++){let x=-r()*200;while(x<w){const len=180+r()*220;const l=48+r()*10;g.fillStyle=`hsl(32,38%,${l}%)`;g.fillRect(x,y*pw,len,pw);for(let k=0;k<7;k++){g.strokeStyle=`hsla(30,40%,${l-10}%,.35)`;g.lineWidth=1;g.beginPath();const yy=y*pw+r()*pw;g.moveTo(x,yy);g.bezierCurveTo(x+len*.3,yy+4,x+len*.6,yy-4,x+len,yy);g.stroke();}g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,y*pw,2,pw);x+=len;}g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,y*pw,w,2);}},
    tile:(g,w,h)=>{g.fillStyle='#bfc4c2';g.fillRect(0,0,w,h);const n=6;const s=w/n;const r=rng(13);for(let y=0;y<n*h/w;y++)for(let x=0;x<n;x++){const l=88+r()*4;g.fillStyle=`hsl(170,6%,${l}%)`;g.fillRect(x*s+2,y*s+2,s-4,s-4);}}
  };
  const T={};
  if(window.THREE){for(const k in tex){const c=cnv(512,512,tex[k]);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;T[k]=t;}}

  /* 3D room — photographic render */
  const stage=document.getElementById('stage');
  if(!window.THREE){if(stage)stage.insertAdjacentHTML('beforeend','<p style="position:absolute;inset:auto 16px 50% 16px;text-align:center;color:#cfcabf">3D kon niet laden. Vernieuw de pagina.</p>');return;}

  /* shared: studio environment for reflections + soft fill (used by both 3D scenes) */
  window.__photoEnv=function(renderer){
    const pm=new THREE.PMREMGenerator(renderer);
    const s=new THREE.Scene();
    const shell=new THREE.Mesh(new THREE.BoxGeometry(12,7,12),new THREE.MeshBasicMaterial({color:0x4a463f,side:THREE.BackSide}));shell.position.y=2.5;s.add(shell);
    const panel=(w,h,c,x,y,z,rx,ry)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c[0],c[1],c[2]),side:THREE.DoubleSide}));p.position.set(x,y,z);p.rotation.set(rx||0,ry||0,0);s.add(p);};
    panel(5,3,[7,6.7,6.2],0,2.6,-5.9);                 // large window
    panel(7,7,[1.5,1.45,1.38],0,5.9,0,Math.PI/2);       // ceiling bounce
    panel(4,2.5,[2.4,2.3,2.15],5.9,2.4,0,0,-Math.PI/2); // side softbox
    panel(12,12,[.42,.33,.24],0,-.95,0,-Math.PI/2);     // warm floor bounce
    const env=pm.fromScene(s,.035).texture;pm.dispose();return env;
  };
  window.__photoRenderer=function(){
    const r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    r.setPixelRatio(Math.min(devicePixelRatio||1,2));
    r.outputEncoding=THREE.sRGBEncoding;
    r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.9;
    r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
    return r;
  };

  /* shared: realistic tools & building materials */
  window.__kit=(function(){
    const R=s=>()=>{s=(s*16807)%2147483647;return s/2147483647;};
    const SM=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.8,metalness:0,envMapIntensity:.6},o));
    function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;}
    function grain(g,w,h,n,a,seed){const r=R(seed);for(let i=0;i<n;i++){g.fillStyle=r()>.5?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a})`;g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}}
    function sh(o){o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});return o;}
    function bottom(g,h){g.translate(0,h/2,0);return g;}
    // labels
    const sackTex=(title,sub,band)=>tex(512,512,(g,w,h)=>{g.fillStyle='#c9a77a';g.fillRect(0,0,w,h);grain(g,w,h,14000,.06,3);g.fillStyle=band;g.fillRect(0,h*.28,w,h*.36);g.fillStyle='#fff';g.font='900 64px Arial, sans-serif';g.textAlign='center';g.fillText(title,w/2,h*.45);g.font='700 34px Arial, sans-serif';g.fillText(sub,w/2,h*.56);g.fillStyle='#2a2520';g.font='900 54px Arial, sans-serif';g.fillText('25 KG',w/2,h*.84);});
    const tileBoxTex=tex(512,256,(g,w,h)=>{g.fillStyle='#b48a5a';g.fillRect(0,0,w,h);grain(g,w,h,9000,.05,7);g.fillStyle='#f4f1ea';g.fillRect(w*.08,h*.2,w*.5,h*.6);g.fillStyle='#1d1d1d';g.font='900 46px Arial, sans-serif';g.fillText('60 × 120',w*.12,h*.48);g.font='700 22px Arial, sans-serif';g.fillText('WANDTEGEL · MAT · 1,44 m²',w*.12,h*.66);g.strokeStyle='rgba(60,40,20,.5)';g.lineWidth=6;g.beginPath();g.moveTo(0,h*.5);g.lineTo(w,h*.5);g.stroke();});
    const paintTex=tex(512,256,(g,w,h)=>{g.fillStyle='#f6f6f4';g.fillRect(0,0,w,h);g.fillStyle='#1f3b5a';g.fillRect(0,h*.22,w,h*.5);g.fillStyle='#fff';g.font='900 44px Arial, sans-serif';g.fillText('MUURVERF',30,h*.47);g.font='700 22px Arial, sans-serif';g.fillText('MAT WIT · 10 L',30,h*.62);g.fillStyle='#f6c945';g.fillRect(w*.72,h*.3,w*.2,h*.34);});
    const wovenTex=tex(256,256,(g,w,h)=>{g.fillStyle='#e9e7e1';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=4){g.fillStyle='rgba(0,0,0,.06)';g.fillRect(0,y,w,2);}for(let x=0;x<w;x+=4){g.fillStyle='rgba(0,0,0,.04)';g.fillRect(x,0,2,h);}grain(g,w,h,3000,.05,11);});
    wovenTex.wrapS=wovenTex.wrapT=THREE.RepeatWrapping;wovenTex.repeat.set(3,3);
    const fleeceTex=tex(256,256,(g,w,h)=>{g.fillStyle='#8e8f8c';g.fillRect(0,0,w,h);grain(g,w,h,20000,.09,13);});
    fleeceTex.wrapS=fleeceTex.wrapT=THREE.RepeatWrapping;fleeceTex.repeat.set(4,4);
    const mortarTex=tex(256,256,(g,w,h)=>{g.fillStyle='#9a978f';g.fillRect(0,0,w,h);const r=R(5);for(let i=0;i<120;i++){g.fillStyle=r()>.5?'rgba(255,255,255,.12)':'rgba(0,0,0,.12)';g.beginPath();g.ellipse(r()*w,r()*h,6+r()*22,3+r()*8,r()*3,0,7);g.fill();}grain(g,w,h,6000,.08,6);});
    const M={
      steel:SM({color:0xb9bfc4,metalness:.95,roughness:.28}),alu:SM({color:0xc9ced2,metalness:.85,roughness:.35}),
      black:SM({color:0x161616,roughness:.55}),rubber:SM({color:0x1b1b1b,roughness:.9}),yellow:SM({color:0xf2b705,roughness:.45}),
      red:SM({color:0xb3261e,roughness:.45,metalness:.3}),wood:SM({color:0x9a6b3f,roughness:.7}),
      woven:SM({map:wovenTex,roughness:.95}),fleece:SM({map:fleeceTex,roughness:1,side:THREE.DoubleSide}),
      mortar:SM({map:mortarTex,roughness:1}),tileBox:SM({map:tileBoxTex,roughness:.95}),paint:SM({map:paintTex,roughness:.4}),
      white:SM({color:0xf2f1ec,roughness:.4}),lid:SM({color:0xf2f1ec,roughness:.35}),tape:SM({color:0xd9c27a,roughness:.7}),
      card:SM({color:0xb08d62,roughness:1}),vial:SM({color:0x9be36a,roughness:.1,emissive:0x2c5a10,emissiveIntensity:.4}),
      shard:SM({color:0xe8e1d1,roughness:.3}),shard2:SM({color:0x9fb3b8,roughness:.3}),rubble:SM({color:0x8b8780,roughness:1})
    };
    function lathe(pts,mat,seg){const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg||40);return new THREE.Mesh(g,mat);}
    function pillow(w,h,d,mat,bulge,seed){const g=new THREE.BoxGeometry(w,h,d,10,6,10);const p=g.attributes.position,r=R(seed||9);
      for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const ny=y/(h/2),nx=x/(w/2),nz=z/(d/2);
        const f=1+bulge*(1-ny*ny)*(1-.5*nx*nx);const fz=1+bulge*1.4*(1-ny*ny)*(1-nx*nx);
        x*=f;z*=fz;y*=1-.06*(nx*nx+nz*nz)*.5;x+=(r()-.5)*.004;z+=(r()-.5)*.004;p.setXYZ(i,x,y,z);}
      g.computeVertexNormals();bottom(g,h);return new THREE.Mesh(g,mat);}
    return {
      M,
      sack(title,sub,band,seed){const m=SM({map:sackTex(title,sub,band),roughness:.95});const s=pillow(.42,.12,.62,m,.12,seed);return sh(s);},
      sackStack(n,title,sub,band){const g=new THREE.Group();for(let i=0;i<n;i++){const s=this.sack(title,sub,band,i+3);s.position.y=i*.115;s.rotation.y=(i%2?.08:-.06);g.add(s);}return g;},
      paintBucket(){const g=new THREE.Group();const body=lathe([[0,0],[.135,0],[.135,.005],[.155,.3],[.162,.305],[.162,.315],[.155,.315]],M.paint);g.add(body);
        const lid=new THREE.Mesh(new THREE.CylinderGeometry(.163,.163,.022,40),M.lid);lid.position.y=.326;g.add(lid);
        const handle=new THREE.Mesh(new THREE.TorusGeometry(.15,.004,6,30,Math.PI),M.steel);handle.position.y=.29;handle.rotation.y=Math.PI/2;handle.rotation.z=.4;g.add(handle);return sh(g);},
      mortarTub(){const g=new THREE.Group();const tub=lathe([[0,0],[.22,0],[.24,.01],[.29,.27],[.31,.28],[.31,.295],[.28,.29],[.22,.03],[0,.03]],M.rubber,48);g.add(tub);
        const fill=new THREE.Mesh(new THREE.CylinderGeometry(.27,.25,.02,40),M.mortar);fill.position.y=.2;g.add(fill);
        [-1,1].forEach(s=>{const h=new THREE.Mesh(new THREE.TorusGeometry(.05,.012,8,16,Math.PI),M.rubber);h.position.set(s*.3,.27,0);h.rotation.set(Math.PI/2,0,s>0?Math.PI/2:-Math.PI/2);g.add(h);});
        return sh(g);},
      trowel(){const g=new THREE.Group();const plate=new THREE.Mesh(new THREE.BoxGeometry(.28,.002,.12),M.steel);g.add(plate);
        for(let i=0;i<9;i++){const n=new THREE.Mesh(new THREE.BoxGeometry(.012,.003,.012),M.rubber);n.position.set(-.13+i*.032,0,.058);g.add(n);}
        const tang=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.06,8),M.steel);tang.position.set(0,.03,0);g.add(tang);
        const hd=new THREE.Mesh(new THREE.CylinderGeometry(.016,.014,.13,16),M.wood);hd.rotation.z=Math.PI/2;hd.position.set(0,.062,0);g.add(hd);return sh(g);},
      drill(){const g=new THREE.Group();
        const motor=new THREE.Mesh(new THREE.CylinderGeometry(.036,.034,.17,24),M.yellow);motor.rotation.z=Math.PI/2;motor.position.set(0,.21,0);g.add(motor);
        const back=new THREE.Mesh(new THREE.SphereGeometry(.036,20,12),M.black);back.position.set(-.085,.21,0);g.add(back);
        const chuck=new THREE.Mesh(new THREE.CylinderGeometry(.02,.024,.055,20),M.black);chuck.rotation.z=Math.PI/2;chuck.position.set(.11,.21,0);g.add(chuck);
        const bit=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.09,8),M.steel);bit.rotation.z=Math.PI/2;bit.position.set(.18,.21,0);g.add(bit);
        const grip=new THREE.Mesh(new THREE.BoxGeometry(.04,.13,.045),M.black);grip.position.set(-.02,.12,0);grip.rotation.z=-.18;g.add(grip);
        const trig=new THREE.Mesh(new THREE.BoxGeometry(.014,.03,.02),M.red);trig.position.set(.01,.16,0);g.add(trig);
        const bat=new THREE.Mesh(new THREE.BoxGeometry(.11,.055,.075),M.black);bat.position.set(-.03,.0275,0);g.add(bat);
        const batT=new THREE.Mesh(new THREE.BoxGeometry(.112,.012,.077),M.yellow);batT.position.set(-.03,.058,0);g.add(batT);return sh(g);},
      level(len){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(len,.06,.028),M.alu);b.position.y=.03;g.add(b);
        [-1,1].forEach(s=>{const c=new THREE.Mesh(new THREE.BoxGeometry(.03,.062,.03),M.yellow);c.position.set(s*(len/2-.015),.03,0);g.add(c);});
        [0,.3*len].forEach(x=>{const v=new THREE.Mesh(new THREE.BoxGeometry(.06,.022,.03),M.vial);v.position.set(x,.03,0);g.add(v);});return sh(g);},
      hammer(){const g=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(.012,.014,.32,12),M.wood);h.rotation.z=Math.PI/2;h.position.y=.014;g.add(h);
        const head=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,.11),M.steel);head.position.set(.15,.02,0);g.add(head);
        const grip=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.1,12),M.rubber);grip.rotation.z=Math.PI/2;grip.position.set(-.1,.015,0);g.add(grip);return sh(g);},
      crowbar(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.6,10),M.red);b.rotation.z=Math.PI/2;b.position.y=.012;g.add(b);
        const hook=new THREE.Mesh(new THREE.TorusGeometry(.04,.01,8,16,Math.PI),M.red);hook.position.set(.3,.05,0);hook.rotation.set(Math.PI/2,0,Math.PI/2);g.add(hook);
        const tip=new THREE.Mesh(new THREE.BoxGeometry(.05,.004,.022),M.black);tip.position.set(-.31,.012,0);g.add(tip);return sh(g);},
      tape(){const g=new THREE.Group();const t=new THREE.Mesh(new THREE.TorusGeometry(.04,.016,10,28),M.tape);t.rotation.x=Math.PI/2;t.position.y=.02;g.add(t);
        const core=new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,.04,24,1,true),M.card);core.position.y=.02;g.add(core);return sh(g);},
      cartridge(){const g=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,.21,20),M.white);c.rotation.z=Math.PI/2;c.position.y=.024;g.add(c);
        const n=new THREE.Mesh(new THREE.ConeGeometry(.01,.08,12),M.white);n.rotation.z=-Math.PI/2;n.position.set(.145,.024,0);g.add(n);return sh(g);},
      tileBoxes(n){const g=new THREE.Group();for(let i=0;i<n;i++){const b=new THREE.Mesh(bottom(new THREE.BoxGeometry(1.22,.05,.62),.05),[M.card,M.card,M.tileBox,M.card,M.tileBox,M.tileBox]);b.position.y=i*.051;b.rotation.y=(i%2?.02:-.015);g.add(b);}return sh(g);},
      rubbleBag(seed){const g=new THREE.Group();const b=pillow(.5,.55,.5,M.woven,.14,seed);g.add(b);
        const r=R(seed*7);for(let i=0;i<9;i++){const c=new THREE.Mesh(new THREE.DodecahedronGeometry(.04+r()*.05,0),r()>.4?M.rubble:M.shard);c.position.set((r()-.5)*.35,.52+r()*.05,(r()-.5)*.35);c.rotation.set(r()*3,r()*3,r()*3);g.add(c);}
        [-1,1].forEach(s=>{const h=new THREE.Mesh(new THREE.TorusGeometry(.07,.008,6,14,Math.PI),M.woven);h.position.set(s*.2,.55,0);h.rotation.y=Math.PI/2;g.add(h);});return sh(g);},
      shards(n,w,d,seed){const g=new THREE.Group();const r=R(seed||4);for(let i=0;i<n;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.06+r()*.13,.008,.05+r()*.11),r()>.3?M.shard:M.shard2);const rad=Math.pow(r(),.7);const a=r()*6.28;s.position.set(Math.cos(a)*rad*w,.004+r()*.05*(1-rad),Math.sin(a)*rad*d);s.rotation.set((r()-.5)*.7,r()*3,(r()-.5)*.7);g.add(s);}
        for(let i=0;i<12;i++){const c=new THREE.Mesh(new THREE.DodecahedronGeometry(.015+r()*.03,0),M.rubble);const a=r()*6.28,rad=r();c.position.set(Math.cos(a)*rad*w,.01,Math.sin(a)*rad*d);c.rotation.set(r()*3,r()*3,r()*3);g.add(c);}return sh(g);},
      dustSheet(w,d,seed){const geo=new THREE.PlaneGeometry(w,d,30,24);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,r=R(seed||8);
        for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,Math.max(0,Math.sin(x*9+z*3)*.008+Math.sin(z*14)*.005+r()*.002)+.002);}geo.computeVertexNormals();
        const m=new THREE.Mesh(geo,M.fleece);m.receiveShadow=true;return m;}
    };
  })();

  if(!stage)return;
  /* texture helpers */
  function CT(size,draw,rep,srgb){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size,size);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);if(srgb!==false)t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;}
  function speckle(g,w,h,n,a,seed){const r=rng(seed);for(let i=0;i<n;i++){g.fillStyle=r()>.5?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a})`;g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}}

  // oak planks: one layout, drawn twice (colour + bump)
  const oakLayout=(()=>{const r=rng(77),rows=[],n=7;for(let y=0;y<n;y++){let x=-r()*400;const row=[];while(x<1024){const len=260+r()*420;row.push({x,len,l:56+r()*12,s:30+r()*12,h:30+r()*6,knot:r()<.25?r():-1,seed:Math.floor(r()*1e6)+1});x+=len;}rows.push(row);}return {rows,n};})();
  function drawOak(g,w,h,bump){
    const ph=h/oakLayout.n;
    g.fillStyle=bump?'#202020':'#3b2a1c';g.fillRect(0,0,w,h);
    oakLayout.rows.forEach((row,y)=>row.forEach(p=>{
      const r=rng(p.seed);const y0=y*ph+1.5,hh=ph-3;
      g.fillStyle=bump?'#b4b4b4':`hsl(${p.h},${p.s}%,${p.l}%)`;g.fillRect(p.x+1.5,y0,p.len-3,hh);
      for(let k=0;k<26;k++){const yy=y0+r()*hh,amp=2+r()*5,lw=.6+r()*1.6;
        g.strokeStyle=bump?`rgba(0,0,0,${.12+r()*.18})`:`hsla(${p.h-4},${p.s+8}%,${p.l-14-r()*10}%,${.25+r()*.35})`;g.lineWidth=lw;
        g.beginPath();g.moveTo(p.x,yy);g.bezierCurveTo(p.x+p.len*.33,yy+amp,p.x+p.len*.66,yy-amp,p.x+p.len,yy+amp*.4);g.stroke();}
      if(p.knot>0){const kx=p.x+p.len*p.knot,ky=y0+hh*(.3+r()*.4);for(let q=6;q>0;q--){g.strokeStyle=bump?'rgba(0,0,0,.25)':`hsla(${p.h-6},40%,${p.l-24}%,.5)`;g.lineWidth=1.2;g.beginPath();g.ellipse(kx,ky,q*4,q*1.6,0,0,7);g.stroke();}}
      if(!bump){const gr=g.createLinearGradient(0,y0,0,y0+hh);gr.addColorStop(0,'rgba(255,240,215,.08)');gr.addColorStop(1,'rgba(40,20,0,.10)');g.fillStyle=gr;g.fillRect(p.x+1.5,y0,p.len-3,hh);}
    }));
    speckle(g,w,h,9000,bump?.05:.025,5);
  }
  const oakMap=CT(1024,(g,w,h)=>drawOak(g,w,h,false),[3.4,2.9]);
  const oakBump=CT(1024,(g,w,h)=>drawOak(g,w,h,true),[3.4,2.9],false);
  const plasterBump=CT(512,(g,w,h)=>{const r=rng(12);g.fillStyle='#808080';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){g.fillStyle=r()>.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)';g.beginPath();g.ellipse(r()*w,r()*h,20+r()*70,6+r()*18,r()*3,0,7);g.fill();}speckle(g,w,h,14000,.06,3);},[2.5,1.6],false);
  const fabricBump=CT(512,(g,w,h)=>{g.fillStyle='#808080';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=3){g.fillStyle=y%6?'rgba(0,0,0,.18)':'rgba(255,255,255,.18)';g.fillRect(0,y,w,1.5);}for(let x=0;x<w;x+=3){g.fillStyle=x%6?'rgba(0,0,0,.12)':'rgba(255,255,255,.12)';g.fillRect(x,0,1.5,h);}speckle(g,w,h,8000,.08,9);},[4,4],false);
  const rugMap=CT(1024,(g,w,h)=>{g.fillStyle='#e4dccd';g.fillRect(0,0,w,h);speckle(g,w,h,60000,.05,4);const b=46;g.strokeStyle='#2a2723';g.lineWidth=6;g.strokeRect(b,b,w-2*b,h-2*b);g.strokeStyle='#c99a2e';g.lineWidth=14;g.strokeRect(b+26,b+26,w-2*(b+26),h-2*(b+26));});
  const rugBump=CT(512,(g,w,h)=>{g.fillStyle='#808080';g.fillRect(0,0,w,h);speckle(g,w,h,40000,.25,6);},[3,3],false);
  const ceramicBump=CT(256,(g,w,h)=>{g.fillStyle='#808080';g.fillRect(0,0,w,h);speckle(g,w,h,6000,.12,8);},[2,2],false);
  const skyMap=CT(512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#dfe9f2');gr.addColorStop(.55,'#f6f3ea');gr.addColorStop(.62,'#b9c9a5');gr.addColorStop(1,'#7d9468');g.fillStyle=gr;g.fillRect(0,0,w,h);const r=rng(14);for(let i=0;i<40;i++){g.fillStyle=`rgba(${90+r()*40},${120+r()*40},${80+r()*30},.35)`;g.beginPath();g.ellipse(r()*w,h*.62+r()*h*.1,30+r()*60,40+r()*70,0,0,7);g.fill();}});
  const artMap=CT(512,(g,w,h)=>{g.fillStyle='#ece5d8';g.fillRect(0,0,w,h);g.fillStyle='#c99a2e';g.beginPath();g.arc(w*.38,h*.38,w*.22,0,7);g.fill();g.fillStyle='#2c2a27';g.fillRect(w*.18,h*.58,w*.64,h*.06);g.fillStyle='#8f9b8a';g.beginPath();g.moveTo(w*.5,h*.86);g.quadraticCurveTo(w*.75,h*.45,w*.86,h*.86);g.fill();speckle(g,w,h,9000,.04,2);});
  const leafMap=CT(256,(g,w,h)=>{g.clearRect(0,0,w,h);const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#5f8a4c');gr.addColorStop(1,'#2f5a2a');g.fillStyle=gr;g.beginPath();g.moveTo(w/2,4);g.bezierCurveTo(w*.98,h*.25,w*.92,h*.75,w/2,h-4);g.bezierCurveTo(w*.08,h*.75,w*.02,h*.25,w/2,4);g.fill();g.strokeStyle='rgba(210,230,170,.55)';g.lineWidth=3;g.beginPath();g.moveTo(w/2,8);g.lineTo(w/2,h-8);g.stroke();g.lineWidth=1.4;for(let i=1;i<8;i++){const y=h*i/9;g.beginPath();g.moveTo(w/2,y);g.lineTo(w*.18,y-h*.06);g.moveTo(w/2,y);g.lineTo(w*.82,y-h*.06);g.stroke();}});
  const blobMap=CT(256,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.55,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);},null,false);
  const edgeMap=CT(256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);},null,false);
  blobMap.wrapS=blobMap.wrapT=edgeMap.wrapS=edgeMap.wrapT=THREE.ClampToEdgeWrapping;

  const renderer=window.__photoRenderer();
  stage.prepend(renderer.domElement);
  const scene=new THREE.Scene();
  scene.environment=window.__photoEnv(renderer);
  const camera=new THREE.PerspectiveCamera(30,4/3,.1,100);
  const W=4.2,D=3.6,H=2.6,t=.14;
  const room=new THREE.Group();scene.add(room);

  /* lights: sun through the window, soft sky, warm pendant */
  scene.add(new THREE.HemisphereLight(0xf3f1ec,0x3a3026,.28));
  const sun=new THREE.DirectionalLight(0xffe7c4,3.1);sun.position.set(-1.2,3.6,-6);sun.target.position.set(1.1,0,.9);scene.add(sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.5,far:16});sun.shadow.bias=-.0004;sun.shadow.normalBias=.025;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xdfe6ef,.35);fill.position.set(5,4,6);scene.add(fill);
  const lamp=new THREE.PointLight(0xffc98a,0,5.5,2);lamp.position.set(.5,H-.62,.3);scene.add(lamp);

  /* materials */
  const S=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0,envMapIntensity:.6},o));
  const mat=k=>S({map:T[k]});
  const mPaintWarm=S({color:0xebe5da,roughness:.92,bumpMap:plasterBump,bumpScale:.004});
  const mPaintGreen=S({color:0x56675d,roughness:.95,bumpMap:plasterBump,bumpScale:.004});
  const mPlaster=S({map:T.plaster,roughness:.95,bumpMap:plasterBump,bumpScale:.01});
  const mOak=new THREE.MeshPhysicalMaterial({map:oakMap,bumpMap:oakBump,bumpScale:.012,roughness:.5,clearcoat:.35,clearcoatRoughness:.35,envMapIntensity:.7});
  const mOakFurn=new THREE.MeshPhysicalMaterial({map:oakMap,bumpMap:oakBump,bumpScale:.004,roughness:.45,clearcoat:.25,clearcoatRoughness:.4,envMapIntensity:.7});
  const mWhite=S({color:0xf3f1ec,roughness:.45});
  const mLinen=S({color:0xcbc2b4,roughness:1,bumpMap:fabricBump,bumpScale:.006});
  const mLinenDark=S({color:0xb8ae9e,roughness:1,bumpMap:fabricBump,bumpScale:.006});
  const mOchre=S({color:0xc4922c,roughness:1,bumpMap:fabricBump,bumpScale:.006});
  const mBlackMetal=S({color:0x1a1a1a,roughness:.38,metalness:.6});
  const mCeramic=S({color:0x23211f,roughness:.35,bumpMap:ceramicBump,bumpScale:.003});
  const mCeramicWhite=S({color:0xe9e4da,roughness:.3,bumpMap:ceramicBump,bumpScale:.003});
  const mRug=S({map:rugMap,bumpMap:rugBump,bumpScale:.02,roughness:1});
  const mFrame=S({color:0xf0eee9,roughness:.4});
  const mGlass=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.02,metalness:0,transparent:true,opacity:.12,envMapIntensity:1.2});
  const mSky=new THREE.MeshBasicMaterial({map:skyMap,color:new THREE.Color(1.8,1.8,1.75)});
  const mLeaf=S({map:leafMap,alphaTest:.5,side:THREE.DoubleSide,roughness:.7});
  const mStem=S({color:0x4b5d34,roughness:.9});
  const mBulb=new THREE.MeshBasicMaterial({color:new THREE.Color(4,3.2,2.2)});
  const mCurtain=S({color:0xf1ece2,roughness:1,side:THREE.DoubleSide,transparent:true,opacity:.9,bumpMap:fabricBump,bumpScale:.004});
  const mShadow=new THREE.MeshBasicMaterial({map:blobMap,color:0x000000,transparent:true,depthWrite:false,opacity:.55});
  const mEdge=new THREE.MeshBasicMaterial({map:edgeMap,color:0x000000,transparent:true,depthWrite:false,opacity:.32});
  const mPrint=S({map:artMap,roughness:.8});

  /* geometry helpers */
  function box(w,h,d,m){const g=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);g.castShadow=g.receiveShadow=true;return g;}
  function rbox(w,h,d,r,m){const s=new THREE.Shape();const x=-w/2+r,y=-h/2+r,ww=w-2*r,hh=h-2*r,q=Math.max(.0005,Math.min(r,ww/2,hh/2)*.8);
    s.moveTo(x+q,y);s.lineTo(x+ww-q,y);s.quadraticCurveTo(x+ww,y,x+ww,y+q);s.lineTo(x+ww,y+hh-q);s.quadraticCurveTo(x+ww,y+hh,x+ww-q,y+hh);s.lineTo(x+q,y+hh);s.quadraticCurveTo(x,y+hh,x,y+hh-q);s.lineTo(x,y+q);s.quadraticCurveTo(x,y,x+q,y);
    const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(d-2*r,.001),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:5,curveSegments:8});g.center();g.computeVertexNormals();
    const me=new THREE.Mesh(g,m);me.castShadow=me.receiveShadow=true;return me;}
  function shadowBlob(w,d,x,z,op){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mShadow.clone());p.material.opacity=op||.55;p.rotation.x=-Math.PI/2;p.position.set(x,.037,z);p.renderOrder=2;return p;}

  /* walls */
  function backWall(m){const g=new THREE.Group();const wx=1.3,wh=1.25,wy=1.0,cx=.35;
    const lw=(W/2+cx-wx/2);const left=box(lw,H,t,m);left.position.set(-W/2+lw/2,H/2,0);
    const rw=W-lw-wx;const right=box(rw,H,t,m);right.position.set(W/2-rw/2,H/2,0);
    const bot=box(wx,wy,t,m);bot.position.set(cx,wy/2,0);const th=H-wy-wh;const top=box(wx,th,t,m);top.position.set(cx,H-th/2,0);
    g.add(left,right,bot,top);g.position.z=-D/2-t/2;return g;}
  function leftWall(m){const g=new THREE.Group();const dw=.9,dh=2.1,cz=.7;
    const aL=D/2+cz-dw/2;const a=box(t,H,aL,m);a.position.set(0,H/2,-D/2+aL/2);
    const bL=D-aL-dw;const b=box(t,H,bL,m);b.position.set(0,H/2,D/2-bL/2);
    const c=box(t,H-dh,dw,m);c.position.set(0,H-(H-dh)/2,cz);g.add(a,b,c);g.position.x=-W/2-t/2;return g;}

  /* always present: slab, window, view outside */
  Object.values(T).forEach(x=>x.encoding=THREE.sRGBEncoding);
  T.concrete.repeat.set(2,2);T.brick.repeat.set(2,1.4);T.gips.repeat.set(1.4,1);T.plaster.repeat.set(1.5,1);
  const slab=box(W+t,.1,D+t,S({map:T.concrete,roughness:1}));slab.position.set(-t/2,-.05,-t/2);room.add(slab);
  const raw=new THREE.Group();raw.add(backWall(mat('brick')),leftWall(mat('brick')));room.add(raw);
  const win=new THREE.Group();win.position.set(.35,1.0+1.25/2,-D/2-t/2);
  [[1.3,.07,.16,0,.59],[1.3,.07,.16,0,-.59],[.07,1.25,.16,.615,0],[.07,1.25,.16,-.615,0],[.05,1.2,.12,0,0]].forEach(([w,h,d,x,y])=>{const b=box(w,h,d,mFrame);b.position.set(x,y,0);win.add(b);});
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.12),mGlass);win.add(glass);
  room.add(win);
  const view=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.9),mSky);view.position.set(.35,1.625,-D/2-t-.3);room.add(view);

  /* phase containers */
  const phases=[];function P(){const g=new THREE.Group();room.add(g);phases.push(g);return g;}
  function add(g,o,mode,delay){o.userData.mode=mode||'s';o.userData.delay=delay||0;g.add(o);return o;}

  /* 0 · ruwbouw props (visible during the build) */
  const pr=P();
  {const K=window.__kit;
   const sheet=K.dustSheet(2.0,1.4,3);sheet.position.set(.9,0,.6);sheet.rotation.y=.1;add(pr,sheet,'xz',0);
   const b1=K.paintBucket();b1.position.set(1.55,0,1.05);add(pr,b1,'s',.05);
   const b2=K.paintBucket();b2.position.set(1.88,0,.72);b2.rotation.y=1.2;add(pr,b2,'s',.07);
   const tp=K.tape();tp.position.set(1.58,.337,1.02);add(pr,tp,'s',.12);
   const sk=K.sackStack(3,'GIPSPLEISTER','HANDPLEISTER · BINNEN','#3f6fa0');sk.position.set(-1.5,0,-1.25);sk.rotation.y=.25;add(pr,sk,'s',.08);
   const tub=K.mortarTub();tub.position.set(.15,0,1.15);add(pr,tub,'s',.1);
   const tr=K.trowel();tr.position.set(.2,.3,1.12);tr.rotation.set(0,.5,.06);add(pr,tr,'s',.14);
   const dr=K.drill();dr.position.set(1.05,.1,-.35);dr.rotation.y=.7;add(pr,dr,'s',.16);
   const lv=K.level(1.2);lv.position.set(-.35,0,.35);lv.rotation.y=.75;add(pr,lv,'s',.12);
   const hm=K.hammer();hm.position.set(.65,.01,.15);hm.rotation.y=1.25;add(pr,hm,'s',.15);
   const ct=K.cartridge();ct.position.set(-.65,0,.95);ct.rotation.y=-.4;add(pr,ct,'s',.15);}
  const boards=box(1.2,.1,.6,mat('gips'));boards.position.set(1.2,.05,-.3);boards.rotation.y=.3;add(pr,boards,'s',.05);

  /* 1 · gipsplaten */
  const gp=P();
  const studM=S({color:0xaab0b5,metalness:.7,roughness:.35});const studs=new THREE.Group();for(let z=-D/2+.3;z<D/2;z+=.6){const s=box(.05,H-.02,.05,studM);s.position.set(-W/2+.06,H/2,z);studs.add(s);}add(gp,studs,'y');
  const gb=backWall(mat('gips'));gb.position.z+=.02;gb.scale.z=.3;add(gp,gb,'y',.05);
  const gl=leftWall(mat('gips'));gl.position.x+=.1;gl.scale.x=.4;add(gp,gl,'y',.1);

  /* 2 · stucwerk */
  const st=P();
  const sb=backWall(mPlaster);sb.position.z+=.035;sb.scale.z=.3;add(st,sb,'y');
  const sl=leftWall(mPlaster);sl.position.x+=.13;sl.scale.x=.4;add(st,sl,'y',.08);

  /* 3 · vloer */
  const fl=P();
  const floor=box(W,.02,D,mOak);floor.position.y=.012;add(fl,floor,'x');
  const pl1=box(W,.07,.016,mWhite);pl1.position.set(0,.055,-D/2+.075);add(fl,pl1,'x',.3);
  const pl2=box(.016,.07,D,mWhite);pl2.position.set(-W/2+.165,.055,0);add(fl,pl2,'z',.3);
  const sill=box(1.42,.03,.2,mWhite);sill.position.set(.35,1.0,-D/2+.02);add(fl,sill,'x',.35);

  /* 4 · afgewerkt */
  const fin=P();
  const aw=backWall(mPaintGreen);aw.position.z+=.05;aw.scale.z=.3;add(fin,aw,'y');
  const pwl=leftWall(mPaintWarm);pwl.position.x+=.15;pwl.scale.x=.4;add(fin,pwl,'y',.03);
  // contact darkening in corners (ambient occlusion)
  const e1=new THREE.Mesh(new THREE.PlaneGeometry(W,.35),mEdge);e1.rotation.x=-Math.PI/2;e1.position.set(0,.024,-D/2+.185);add(fin,e1,'x',.05);
  const e2=new THREE.Mesh(new THREE.PlaneGeometry(D,.35),mEdge);e2.rotation.set(-Math.PI/2,0,Math.PI/2);e2.position.set(-W/2+.285,.024,0);add(fin,e2,'z',.05);
  // door
  const door=new THREE.Group();door.position.set(-W/2+.17,0,.7);
  [[.05,2.14,.05,0,1.07,-.475],[.05,2.14,.05,0,1.07,.475],[.05,.06,1.0,0,2.13,0]].forEach(([w,h,d,x,y,z])=>{const b=box(w,h,d,mWhite);b.position.set(x,y,z);door.add(b);});
  const leaf=box(.04,2.08,.9,mWhite);leaf.position.set(0,1.04,0);door.add(leaf);
  const handle=box(.06,.02,.14,mBlackMetal);handle.position.set(.04,1.02,.3);door.add(handle);
  add(fin,door,'y',.08);
  // sofa
  const sofa=new THREE.Group();
  const base=rbox(2.0,.26,.92,.04,mLinen);base.position.y=.25;sofa.add(base);
  [-.48,.48].forEach((x,i)=>{const c=rbox(.94,.17,.74,.06,mLinen);c.position.set(x,.46,.06);c.rotation.z=(i?-1:1)*.01;sofa.add(c);
    const b=rbox(.92,.5,.2,.08,mLinen);b.position.set(x,.76,-.31);b.rotation.x=-.12;sofa.add(b);});
  [-1,1].forEach(sg=>{const a=rbox(.16,.56,.92,.06,mLinenDark);a.position.set(sg*.93,.4,0);sofa.add(a);});
  [[-.94,-.38],[.94,-.38],[-.94,.38],[.94,.38]].forEach(([x,z])=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(.02,.015,.12,12),mOakFurn);l.position.set(x,.06,z);l.castShadow=true;sofa.add(l);});
  const pillow=rbox(.42,.4,.13,.06,mOchre);pillow.position.set(-.62,.72,-.13);pillow.rotation.set(-.25,.25,.1);sofa.add(pillow);
  const pillow2=rbox(.38,.36,.12,.06,mLinenDark);pillow2.position.set(.7,.7,-.15);pillow2.rotation.set(-.25,-.3,-.08);sofa.add(pillow2);
  const throwB=rbox(.5,.025,.8,.012,S({color:0x3c3a36,roughness:1,bumpMap:fabricBump,bumpScale:.01}));throwB.position.set(.82,.56,.05);throwB.rotation.z=-.05;sofa.add(throwB);
  sofa.position.set(.5,0,-D/2+.62);
  add(fin,shadowBlob(2.4,1.25,.5,-D/2+.62,.6),'xz',.1);
  add(fin,sofa,'s',.12);
  // rug + coffee table
  const rug=box(2.4,.012,1.7,mRug);rug.position.set(.5,.028,.38);rug.castShadow=false;add(fin,rug,'xz',.15);
  const table=new THREE.Group();
  const top=rbox(1.0,.035,.55,.012,mOakFurn);top.position.y=.42;table.add(top);
  [[-.44,-.22],[.44,-.22],[-.44,.22],[.44,.22]].forEach(([x,z])=>{const l=box(.022,.4,.022,mBlackMetal);l.position.set(x,.2,z);table.add(l);});
  const books=new THREE.Group();[[.3,.04,.22,0x2b3f4a],[.27,.035,.2,0xd8cfbf],[.25,.03,.19,0xc4922c]].forEach(([w,h,d,c],i)=>{const b=box(w,h,d,S({color:c,roughness:.8}));b.position.set(0,.44+.02+i*.037,0);b.rotation.y=i*.12;books.add(b);});books.position.x=-.22;table.add(books);
  const vase=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.05,0],[.07,.05],[.06,.12],[.03,.18],[.035,.2]].map(p=>new THREE.Vector2(p[0],p[1])),32),mCeramicWhite);vase.position.set(.25,.44,0);vase.castShadow=true;table.add(vase);
  table.position.set(.5,0,.5);
  add(fin,shadowBlob(1.3,.8,.5,.5,.45),'xz',.2);
  add(fin,table,'s',.22);
  // sideboard on the left wall
  const sideb=new THREE.Group();
  const sbody=rbox(.44,.5,1.3,.01,mOakFurn);sbody.position.y=.33;sideb.add(sbody);
  [-.37,.37].forEach(z=>{const l=box(.03,.08,.03,mBlackMetal);l.position.set(.12,.04,z*1.5);sideb.add(l);});
  [-.32,0,.32].forEach(z=>{const s=box(.002,.44,.005,S({color:0x2a1d12}));s.position.set(.222,.33,z+.0);sideb.add(s);});
  const lampBase=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.08,0],[.08,.02],[.02,.03],[.015,.35],[0,.35]].map(p=>new THREE.Vector2(p[0],p[1])),24),mBlackMetal);lampBase.position.set(0,.58,-.4);lampBase.castShadow=true;sideb.add(lampBase);
  const lampShade=new THREE.Mesh(new THREE.CylinderGeometry(.11,.15,.18,32,1,true),S({color:0xf2ece0,roughness:1,side:THREE.DoubleSide,emissive:0xffd8a0,emissiveIntensity:0}));lampShade.position.set(0,1.02,-.4);sideb.add(lampShade);
  const jar=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.07,0],[.09,.08],[.07,.22],[.05,.26]].map(p=>new THREE.Vector2(p[0],p[1])),32),mCeramic);jar.position.set(0,.58,.3);jar.castShadow=true;sideb.add(jar);
  sideb.position.set(-W/2+.4,0,-.5);
  add(fin,shadowBlob(.8,1.7,-W/2+.4,-.5,.45),'xz',.25);
  add(fin,sideb,'s',.26);
  // plant
  const plant=new THREE.Group();
  const pot=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.14,0],[.18,.04],[.2,.38],[.19,.4],[.17,.4],[.17,.05],[0,.05]].map(p=>new THREE.Vector2(p[0],p[1])),40),mCeramic);pot.castShadow=pot.receiveShadow=true;plant.add(pot);
  const rr=rng(99);
  for(let i=0;i<7;i++){const hgt=.6+rr()*.7,a=rr()*6.28,lean=.15+rr()*.25;
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.008,.012,hgt,6),mStem);stem.position.set(Math.cos(a)*lean*hgt*.5,.38+hgt/2,Math.sin(a)*lean*hgt*.5);stem.rotation.set(Math.sin(a)*lean,0,-Math.cos(a)*lean);plant.add(stem);
    const tipX=Math.cos(a)*lean*hgt,tipY=.38+hgt*Math.cos(lean),tipZ=Math.sin(a)*lean*hgt;
    for(let j=0;j<4;j++){const s=.26+rr()*.18;const lf=new THREE.Mesh(new THREE.PlaneGeometry(s*.62,s),mLeaf);lf.position.set(tipX+(rr()-.5)*.18,tipY-j*.12+(rr()-.5)*.08,tipZ+(rr()-.5)*.18);lf.rotation.set(-.9+rr()*.9,a+rr()*1.5,(rr()-.5)*1.2);lf.castShadow=true;plant.add(lf);}}
  plant.position.set(-1.72,0,-1.38);
  add(fin,shadowBlob(.7,.7,-1.72,-1.38,.55),'xz',.3);
  add(fin,plant,'s',.32);
  // art
  const art=new THREE.Group();const af=box(.66,.86,.03,mBlackMetal);art.add(af);
  const mat1=new THREE.Mesh(new THREE.PlaneGeometry(.6,.8),S({color:0xf5f2ec,roughness:.9}));mat1.position.z=.016;art.add(mat1);
  const prt=new THREE.Mesh(new THREE.PlaneGeometry(.42,.58),mPrint);prt.position.z=.017;art.add(prt);
  art.position.set(-1.15,1.62,-D/2+.09);add(fin,art,'s',.35);
  // curtains + rail
  function curtain(x){const g=new THREE.PlaneGeometry(.5,2.35,48,1);const p=g.attributes.position;for(let i=0;i<p.count;i++){const xx=p.getX(i);p.setZ(i,Math.sin(xx*38)*.025+Math.sin(xx*11)*.01);}g.computeVertexNormals();const m=new THREE.Mesh(g,mCurtain);m.position.set(x,2.42-2.35/2,-D/2+.1);m.castShadow=true;m.receiveShadow=true;return m;}
  add(fin,curtain(-.62),'y',.4);add(fin,curtain(1.32),'y',.42);
  const rail=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,2.6,12),mBlackMetal);rail.rotation.z=Math.PI/2;rail.position.set(.35,2.45,-D/2+.1);add(fin,rail,'x',.4);
  // pendant
  const pend=new THREE.Group();
  const shade=new THREE.Mesh(new THREE.LatheGeometry([[.02,0],[.05,.02],[.14,.12],[.24,.26],[.25,.27]].map(p=>new THREE.Vector2(p[0],-p[1])),48),S({color:0x1d1d1c,roughness:.45,metalness:.3,side:THREE.DoubleSide}));pend.add(shade);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.05,20,14),mBulb);bulb.position.y=-.16;pend.add(bulb);
  const cord=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.55,6),mBlackMetal);cord.position.y=.27;pend.add(cord);
  pend.position.set(.5,H-.55,.3);add(fin,pend,'s',.45);

  room.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshBasicMaterial){o.castShadow=false;}});

  /* animation */
  const names=['Ruwbouw','Gipsplaten','Stucwerk','Vloer & tegels','Afgewerkt'];
  const N=phases.length,k=new Array(N).fill(0),tgt=new Array(N).fill(0);
  phases.forEach(g=>g.children.forEach(o=>{o.userData.base=o.scale.clone();}));
  function setPhase(p){setPhase.cur=p;
    tgt[0]=p<=2?1:0;for(let i=1;i<N;i++)tgt[i]=p>=i?1:0;
    document.querySelectorAll('#kamer3d .phase').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.phase)===p)));
    document.getElementById('hudPhase').textContent=__t('Fase')+' '+(p+1)+' · '+__t(names[p]);
    if(reduce)for(let i=0;i<N;i++)k[i]=tgt[i];
  }
  document.querySelectorAll('#kamer3d .phase').forEach(b=>b.addEventListener('click',()=>{stopPlay();setPhase(Number(b.dataset.phase));}));
  let playTimer=null;const playBtn=document.getElementById('playBtn');
  function stopPlay(){if(playTimer){clearInterval(playTimer);playTimer=null;playBtn.textContent=__t('▶ Speel af');}}
  playBtn.addEventListener('click',()=>{if(playTimer){stopPlay();return;}let p=0;setPhase(0);playBtn.textContent=__t('❚❚ Pauze');playTimer=setInterval(()=>{p++;if(p>4){stopPlay();return;}setPhase(p);},1700);});
  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
  function apply(o,v){const b=o.userData.base,e=Math.max(v,.001);o.visible=v>.01;
    switch(o.userData.mode){case 'y':o.scale.set(b.x,b.y*e,b.z);break;case 'x':o.scale.set(b.x*e,b.y,b.z);break;case 'z':o.scale.set(b.x,b.y,b.z*e);break;case 'xz':o.scale.set(b.x*e,b.y,b.z*e);break;default:o.scale.set(b.x*e,b.y*e,b.z*e);}}

  let yaw=.62,pitch=.33,targetYaw=yaw,dragging=false,lx=0,ly=0,idle=0;
  const el=renderer.domElement;
  el.addEventListener('pointerdown',e=>{dragging=true;lx=e.clientX;ly=e.clientY;el.setPointerCapture(e.pointerId);idle=0;});
  el.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;targetYaw=Math.min(1.45,Math.max(.12,targetYaw-dx*.008));pitch=Math.min(.9,Math.max(.12,pitch+dy*.004));});
  el.addEventListener('pointerup',()=>{dragging=false;});el.addEventListener('pointercancel',()=>{dragging=false;});
  function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  resize();new ResizeObserver(resize).observe(stage);
  const clock=new THREE.Clock();let visible=true;
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{threshold:.05}).observe(stage);
  function frameLoop(){
    requestAnimationFrame(frameLoop);if(!visible)return;
    const dt=Math.min(clock.getDelta(),.05);
    if(!dragging&&!reduce){idle+=dt;if(idle>2.5)targetYaw=.7+Math.sin(clock.elapsedTime*.2)*.22;}
    yaw+=(targetYaw-yaw)*.06;
    for(let i=0;i<N;i++){k[i]+=(tgt[i]-k[i])*Math.min(1,dt*3.2);phases[i].children.forEach(o=>{const d=o.userData.delay||0;apply(o,ease(Math.max(0,Math.min(1,(k[i]-d)/(1-d)))));});}
    raw.visible=k[1]<.98;
    const f=k[4];lamp.intensity=f*1.1;lampShade.material.emissiveIntensity=f*.9;bulb.visible=f>.5;
    const r=10.2;camera.position.set(Math.sin(yaw)*r*Math.cos(pitch),.5+Math.sin(pitch)*r,Math.cos(yaw)*r*Math.cos(pitch));
    camera.lookAt(-.05,.95,-.25);
    renderer.render(scene,camera);
  }
  window.__stillR=function(){if(!window.__stillRend){const r=window.__photoRenderer();r.setPixelRatio(1);r.setSize(1280,800,false);r.toneMappingExposure=.95;window.__stillRend=r;}return window.__stillRend;};
  window.__stillRoom=function(vals,pos,look,fov){
    for(let i=0;i<N;i++){phases[i].children.forEach(o=>apply(o,vals[i]));}
    raw.visible=vals[1]<.98;lamp.intensity=vals[4]*.9;lampShade.material.emissiveIntensity=vals[4]*.9;pend.visible=false;
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W+.4,D+.4),new THREE.MeshStandardMaterial({color:0xf2efe9,roughness:.95,side:THREE.DoubleSide,envMapIntensity:.6,emissive:0x5e5a53,emissiveIntensity:.55}));
    ceil.rotation.x=Math.PI/2;ceil.position.set(0,H,0);room.add(ceil);
    const sw=new THREE.Mesh(new THREE.BoxGeometry(t,H,D),vals[2]>.5?mPaintWarm:mat('brick'));sw.position.set(W/2+t/2,H/2,0);sw.receiveShadow=true;room.add(sw);
    const cam=new THREE.PerspectiveCamera(fov||50,1.6,.05,50);cam.position.set(...pos);cam.lookAt(...look);
    const r=window.__stillR();r.render(scene,cam);const url=r.domElement.toDataURL('image/jpeg',.88);
    room.remove(ceil);room.remove(sw);return url;
  };
  /* hero background: one photographic still of the finished room */
  function heroStill(){
    try{
      const hp=document.getElementById('heroPhoto');if(!hp)return;
      for(let i=0;i<N;i++){const v=i===0?0:1;phases[i].children.forEach(o=>apply(o,v));}
      raw.visible=false;lamp.intensity=.9;lampShade.material.emissiveIntensity=.9;pend.visible=false;
      const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W+.4,D+.4),new THREE.MeshStandardMaterial({color:0xf2efe9,roughness:.95,side:THREE.DoubleSide,envMapIntensity:.6,emissive:0x5e5a53,emissiveIntensity:.55}));
      ceil.rotation.x=Math.PI/2;ceil.position.set(0,H,0);ceil.receiveShadow=true;room.add(ceil);
      const sideW=new THREE.Mesh(new THREE.BoxGeometry(t,H,D),mPaintWarm);sideW.position.set(W/2+t/2,H/2,0);sideW.castShadow=sideW.receiveShadow=true;room.add(sideW);
      const rr=window.__photoRenderer();rr.setPixelRatio(1);rr.setSize(1920,1080,false);rr.toneMappingExposure=.95;
      const cam=new THREE.PerspectiveCamera(50,16/9,.05,50);cam.position.set(1.95,1.22,1.7);cam.lookAt(-.45,.92,-1.3);
      rr.render(scene,cam);
      const url=rr.domElement.toDataURL('image/jpeg',.9);
      rr.dispose();if(rr.forceContextLoss)rr.forceContextLoss();
      room.remove(ceil);room.remove(sideW);
      hp.style.backgroundImage='url('+url+')';hp.classList.add('ready');
      const tw=document.getElementById('trowel');if(tw)tw.classList.add('fade');
    }catch(e){/* keep the plaster texture background */}
  }
  setTimeout(heroStill,400);
  document.addEventListener('langchange',()=>{setPhase(setPhase.cur||0);if(!(typeof playTimer!=='undefined'?playTimer:timer))playBtn.textContent=__t('▶ Speel af');});
  if(location.hash==='#afgewerkt'){setPhase(4);for(let i=0;i<N;i++)k[i]=tgt[i];stage.scrollIntoView();}else setPhase(0);
  frameLoop();
})();
