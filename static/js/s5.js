/* Prijscalculator: arbeidsprijs per m², per meter of per onderdeel (excl. materialen).
   Alle tarieven staan hieronder in PRICES, in euro excl. btw. Pas alleen de getallen aan. */
(function(){
  const PRICES={
    stuc:{saus:15,behang:11,spachtel:14,ceil:18},                       // per m²
    gips:{voorzet:32,scheid:45,insul:6,joints:6,door:75,ceil:38},         // per m², deuropening per stuk
    tegel:{wall:35,floor:38,fGroot:12,fStd:0,fKlein:20,remove:12,plint:10,jolly:6}, // per m², plint/jolly per meter
    vloer:{pvcK:14,pvcL:18,lam:12,visgraat:28,level:18,plint:6},          // per m², plint per meter
    verf:{wall:9,ceil:11,door:85,frame:35},                               // per m², deur/kozijn per stuk
    bad:{demo:1400,pipes:1600,toilet:450,vanity:350,shower:450,radiator:200}, // per onderdeel; tegels via tegel-tarief
    dak:{perM:1800,shutter:250,inside:900},                               // per meter breedte, rolluik per stuk
    min:{stuc:250,verf:250,gips:300,vloer:300,tegel:400,bad:0,dak:0},    // minimumbedrag per klus
    hour:50,                                                              // kleine extra klussen
    range:0.1                                                             // bandbreedte ± 10%
  };
  const T={
    nl:{tabs:{stuc:'Stucwerk',gips:'Gipsplaten',tegel:'Tegelwerk',vloer:'Vloeren',verf:'Schilderwerk',bad:'Badkamer',dak:'Dakkapel'},
      L:'Lengte',B:'Breedte',H:'Plafondhoogte',doors:'Deuren',wins:'Ramen',walls:'Wanden',ceil:'Plafond',
      finish:'Afwerking',saus:'Sausklaar (voor verf)',behang:'Behangklaar (voor behang)',spachtel:'Spachtelputz / structuur',
      old:'Woning ouder dan 2 jaar',oldHint:'Dan geldt 9% btw op het arbeidsloon.',
      wallLen:'Lengte wand',wallH:'Hoogte wand',gtype:'Soort wand',voorzet:'Voorzetwand (tegen bestaande muur)',scheid:'Nieuwe scheidingswand (2 kanten)',insul:'Isolatie in de wand',joints:'Naden afwerken',gDoors:'Deuropeningen',ceilM2:'Plafond (m², optioneel)',
      wallM2:'Wandtegels',floorM2:'Vloertegels',format:'Tegelformaat',fGroot:'Grootformaat (60 × 120)',fStd:'Standaard (30 × 60)',fKlein:'Klein of mozaïek',removeTiles:'Oude tegels verwijderen',tPlint:'Tegelplint',jolly:'Hoekprofiel (jolly)',
      ftype:'Soort vloer',pvcK:'PVC klik',pvcL:'PVC lijm',lam:'Laminaat',visgraat:'Visgraat',level:'Egaliseren',plint:'Plinten plaatsen',
      paintDoors:'Deuren lakken',paintFrames:'Kozijnen lakken',
      demo:'Oude badkamer slopen en afvoeren',pipes:'Leidingwerk (water en afvoer)',baTiles:'Tegelwerk wand en vloer',toilet:'Hangtoilet',vanity:'Badmeubel met wastafel',shower:'Inloopdouche met glazen wand',radiator:'Handdoekradiator',fixtures:'Wat komt erin?',
      dWidth:'Breedte dakkapel',shutters:'Rolluiken',inside:'Binnenafwerking (gips, stuc, vensterbanken)',
      price:'Arbeidskosten',from:'ca.',vat:'incl. {v}% btw',excl:'Arbeid excl. btw',btw:'Btw {v}%',minApplied:'Minimumbedrag voor deze klus: {x} excl. btw',
      wallsL:'Wanden',ceilL:'Plafond',wallTiles:'Wandtegels',floorTiles:'Vloertegels',formatL:'Toeslag tegelformaat',
      note:'Exclusief materialen. Voorrijkosten inbegrepen. Indicatie op basis van onze tarieven per m², meter of onderdeel; de definitieve prijs volgt na een gratis opname. Kleine extra klussen: € 50 per uur excl. btw.',
      cta:'Vraag exacte offerte aan',unitM:'m',unitM2:'m²',unitPcs:'st.',area:'Oppervlak',wallArea:'Wandoppervlak'},
    en:{tabs:{stuc:'Plastering',gips:'Drywall',tegel:'Tiling',vloer:'Flooring',verf:'Painting',bad:'Bathroom',dak:'Dormer'},
      L:'Length',B:'Width',H:'Ceiling height',doors:'Doors',wins:'Windows',walls:'Walls',ceil:'Ceiling',
      finish:'Finish',saus:'Paint-ready',behang:'Wallpaper-ready',spachtel:'Textured finish (spachtelputz)',
      old:'Home older than 2 years',oldHint:'Then 9% VAT applies to labour.',
      wallLen:'Wall length',wallH:'Wall height',gtype:'Type of wall',voorzet:'Lining wall (against existing wall)',scheid:'New partition wall (2 sides)',insul:'Insulation in the wall',joints:'Finish the joints',gDoors:'Door openings',ceilM2:'Ceiling (m², optional)',
      wallM2:'Wall tiles',floorM2:'Floor tiles',format:'Tile size',fGroot:'Large format (60 × 120)',fStd:'Standard (30 × 60)',fKlein:'Small or mosaic',removeTiles:'Remove old tiles',tPlint:'Tile skirting',jolly:'Corner profile (jolly)',
      ftype:'Type of floor',pvcK:'Vinyl click',pvcL:'Vinyl glue-down',lam:'Laminate',visgraat:'Herringbone',level:'Levelling',plint:'Fit skirting',
      paintDoors:'Lacquer doors',paintFrames:'Lacquer window frames',
      demo:'Demolish and remove old bathroom',pipes:'Plumbing (water and drainage)',baTiles:'Wall and floor tiling',toilet:'Wall-hung toilet',vanity:'Vanity unit with basin',shower:'Walk-in shower with glass panel',radiator:'Towel radiator',fixtures:'What goes in?',
      dWidth:'Dormer width',shutters:'Roller shutters',inside:'Interior finishing (drywall, plaster, sills)',
      price:'Labour cost',from:'approx.',vat:'incl. {v}% VAT',excl:'Labour excl. VAT',btw:'VAT {v}%',minApplied:'Minimum charge for this job: {x} excl. VAT',
      wallsL:'Walls',ceilL:'Ceiling',wallTiles:'Wall tiles',floorTiles:'Floor tiles',formatL:'Tile size surcharge',
      note:'Materials not included. Travel costs included. Estimate based on our rates per m², per metre or per item; the final price follows after a free site visit. Small extra jobs: € 50 per hour excl. VAT.',
      cta:'Request an exact quote',unitM:'m',unitM2:'m²',unitPcs:'pcs',area:'Area',wallArea:'Wall area'}
  };
  const L=()=>T[window.__lang==='en'?'en':'nl'];
  const state={tab:'stuc',
    stuc:{L:4.2,B:3.6,H:2.6,doors:1,wins:1,walls:true,ceil:true,finish:'saus',old:true},
    gips:{wallLen:4,wallH:2.6,gtype:'voorzet',insul:false,joints:true,gDoors:0,ceilM2:0},
    tegel:{wallM2:12,floorM2:5,format:'fGroot',removeTiles:false,tPlint:0,jolly:0},
    vloer:{L:4.2,B:3.6,ftype:'pvcK',level:true,plint:true},
    verf:{L:4.2,B:3.6,H:2.6,doors:1,wins:1,walls:true,ceil:true,paintDoors:0,paintFrames:0,old:true},
    bad:{L:2.6,B:2.2,H:2.5,demo:true,pipes:true,baTiles:true,toilet:true,vanity:true,shower:true,radiator:true},
    dak:{dWidth:4,shutters:0,inside:true}};
  const fields={
    stuc:[['num','L',1,15,.1,'m'],['num','B',1,15,.1,'m'],['num','H',2,4,.05,'m'],['num','doors',0,6,1,'pcs'],['num','wins',0,8,1,'pcs'],['chk','walls'],['chk','ceil'],['sel','finish',['saus','behang','spachtel']],['chk','old','oldHint']],
    gips:[['num','wallLen',.5,30,.1,'m'],['num','wallH',2,4,.05,'m'],['sel','gtype',['voorzet','scheid']],['chk','insul'],['chk','joints'],['num','gDoors',0,4,1,'pcs'],['num','ceilM2',0,100,1,'m2']],
    tegel:[['num','wallM2',0,120,1,'m2'],['num','floorM2',0,80,1,'m2'],['sel','format',['fGroot','fStd','fKlein']],['chk','removeTiles'],['num','tPlint',0,80,1,'m'],['num','jolly',0,40,1,'m']],
    vloer:[['num','L',1,20,.1,'m'],['num','B',1,20,.1,'m'],['sel','ftype',['pvcK','pvcL','lam','visgraat']],['chk','level'],['chk','plint']],
    verf:[['num','L',1,15,.1,'m'],['num','B',1,15,.1,'m'],['num','H',2,4,.05,'m'],['num','doors',0,6,1,'pcs'],['num','wins',0,8,1,'pcs'],['chk','walls'],['chk','ceil'],['num','paintDoors',0,12,1,'pcs'],['num','paintFrames',0,12,1,'pcs'],['chk','old','oldHint']],
    bad:[['num','L',1,6,.1,'m'],['num','B',1,6,.1,'m'],['num','H',2,3.2,.05,'m'],['chk','demo'],['chk','pipes'],['chk','baTiles'],['head','fixtures'],['chk','toilet'],['chk','vanity'],['chk','shower'],['chk','radiator']],
    dak:[['num','dWidth',1.5,8,.1,'m'],['num','shutters',0,4,1,'pcs'],['chk','inside']]
  };
  /* ---- photo estimate (Claude looks at the photos and fills the fields) ---- */
  const est={};Object.keys(fields).forEach(k=>est[k]=new Set());
  const PT={
    nl:{title:'Geen meetlint? Gebruik een foto',sub:'Upload 1–3 foto\'s van de ruimte. Claude schat de maten en vult de calculator voor u in.',pick:'Kies foto\'s',analyse:'Schat de maten',busy:'Foto\'s worden bekeken…',stop:'Stop',app:'Opent de fotokiezer niet? Dan staat de app op uw telefoon geen foto-upload toe. Open deze link in uw browser (Chrome of Safari), log in en probeer opnieuw:',copy:'Kopieer link',copied:'Gekopieerd',done:'Maten ingevuld. Controleer ze en pas aan waar nodig.',tips:'Tip: fotografeer vanuit een hoek, met vloer, plafond en een deur in beeld. Wij bewaren uw foto\'s niet.',est:'≈ foto',
      err:{not_granted:'Toestemming geweigerd. U kunt de maten zelf invullen.',rate_limited:'Even te veel aanvragen. Probeer het over een paar minuten opnieuw.',image_rejected:'Deze foto kan niet gelezen worden. Probeer een JPG of PNG.',invalid_json:'De foto kon niet goed gelezen worden. Probeer een andere foto.',refused:'Deze foto kan niet beoordeeld worden. Probeer een andere foto.',other:'Er ging iets mis. Probeer het opnieuw.',not_configured:'Fotoschatting is nu niet beschikbaar. Vul de maten zelf in.',too_large:'De foto\'s zijn te groot. Probeer er minder of kleinere.'},
      conf:{hoog:'Betrouwbaarheid: hoog',middel:'Betrouwbaarheid: gemiddeld',laag:'Betrouwbaarheid: laag'},none:'Kies eerst minstens één foto.'},
    en:{title:'No tape measure? Use a photo',sub:'Upload 1–3 photos of the room. Claude estimates the measurements and fills in the calculator for you.',pick:'Choose photos',analyse:'Estimate measurements',busy:'Looking at your photos…',stop:'Stop',app:'Photo picker not opening? Then the app on your phone doesn\'t allow photo uploads. Open this link in your browser (Chrome or Safari), sign in and try again:',copy:'Copy link',copied:'Copied',done:'Measurements filled in. Check them and adjust where needed.',tips:'Tip: shoot from a corner, with the floor, ceiling and a door in view. We don\'t keep your photos.',est:'≈ photo',
      err:{not_granted:'Permission declined. You can enter the measurements yourself.',rate_limited:'Too many requests right now. Try again in a few minutes.',image_rejected:'This photo can\'t be read. Try a JPG or PNG.',invalid_json:'The photo couldn\'t be read properly. Try another photo.',refused:'This photo can\'t be assessed. Try another photo.',other:'Something went wrong. Please try again.',not_configured:'Photo estimate is not available right now. Please enter the measurements yourself.',too_large:'The photos are too large. Try fewer or smaller ones.'},
      conf:{hoog:'Confidence: high',middel:'Confidence: medium',laag:'Confidence: low'},none:'Choose at least one photo first.'}
  };
  const P_=()=>PT[window.__lang==='en'?'en':'nl'];
  let photoFiles=[],ctl=null;
  const box=document.getElementById('photoBox');
  function renderPhotoBox(){if(!box)return;const p=P_();
    box.querySelector('.pb-title').textContent=p.title;box.querySelector('.pb-sub').textContent=p.sub;
    box.querySelector('.pb-pick span').textContent=p.pick;box.querySelector('.pb-go').textContent=p.analyse;
    box.querySelector('.pb-stop').textContent=p.stop;box.querySelector('.pb-tip').textContent=p.tips;box.querySelector('.pb-app-t').textContent=p.app;box.querySelector('.pb-copy').textContent=p.copy;}
  function thumbs(){const t=box.querySelector('.pb-thumbs');t.innerHTML='';photoFiles.forEach(f=>{const i=document.createElement('img');i.alt='';i.src=URL.createObjectURL(f);i.onload=()=>URL.revokeObjectURL(i.src);t.appendChild(i);});}
  function setStatus(t){const st=box.querySelector('.pb-status');st.textContent=t||'';if(t)st.scrollIntoView({block:'nearest',behavior:'smooth'});}
  const API='/api/estimate';
  function shrink(f){return new Promise((ok,no)=>{const u=URL.createObjectURL(f),im=new Image();
    im.onload=()=>{const s=Math.min(1,1280/Math.max(im.naturalWidth,im.naturalHeight));const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*s);c.height=Math.round(im.naturalHeight*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok({type:'image/jpeg',data:c.toDataURL('image/jpeg',.82).split(',')[1]});};
    im.onerror=()=>{URL.revokeObjectURL(u);no(Object.assign(new Error('img'),{code:'image_rejected'}));};im.src=u;});}
  async function analyse(){
    const p=P_(),st=box.querySelector('.pb-status');
    if(!photoFiles.length){setStatus(p.none);return;}
    const tab=state.tab;ctl=new AbortController();
    box.classList.add('busy');setStatus(p.busy);
    try{
      const images=await Promise.all(photoFiles.slice(0,3).map(shrink));
      const resp=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tab,lang:window.__lang==='en'?'en':'nl',images}),signal:ctl.signal});
      const r=await resp.json().catch(()=>({}));
      if(!resp.ok)throw Object.assign(new Error('http'),{code:r.error||'other'});
      const s=state[tab];est[tab].clear();
      fields[tab].forEach(f=>{const [kind,key]=f;if(!(key in r))return;
        if(kind==='num'){let v=parseFloat(String(r[key]).replace(',','.'));if(isNaN(v))return;v=Math.min(f[3],Math.max(f[2],v));s[key]=Math.round(v*100)/100;est[tab].add(key);}
        if(kind==='chk'){s[key]=r[key]===true||r[key]==='true';est[tab].add(key);}
        if(kind==='sel'&&f[2].includes(r[key])){s[key]=r[key];est[tab].add(key);}});
      renderPanel();
      st.innerHTML='';const d=document.createElement('p');d.className='pb-ok';d.textContent=p.done;st.appendChild(d);
      if(r.confidence&&p.conf[r.confidence]){const c=document.createElement('p');c.className='pb-conf pb-'+r.confidence;c.textContent=p.conf[r.confidence];st.appendChild(c);}
      if(r.notes){const n=document.createElement('p');n.className='pb-notes';n.textContent=String(r.notes).slice(0,400);st.appendChild(n);}
    }catch(e){
      if(e&&e.name==='AbortError'){st.textContent='';}
      else st.textContent=p.err[e&&e.code]||p.err.other;
      if(e&&e.code==='not_configured'){box.querySelector('.pb-go').disabled=true;}
    }finally{box.classList.remove('busy');ctl=null;}
  }
  (async()=>{
    if(!box)return;
    let on=false;try{const r=await fetch(API,{cache:'no-store'});on=r.ok&&(await r.json()).enabled===true;}catch(e){}
    if(!on)return;
    const inp=box.querySelector('input[type=file]');inp.accept='image/*';
    const take=list=>{photoFiles=[...list].filter(f=>/^image\//.test(f.type)).slice(0,3);thumbs();setStatus(photoFiles.length?'':P_().none);};
    box.addEventListener('dragover',e=>{e.preventDefault();box.classList.add('drag');});
    box.addEventListener('dragleave',()=>box.classList.remove('drag'));
    box.addEventListener('drop',e=>{e.preventDefault();box.classList.remove('drag');if(e.dataTransfer&&e.dataTransfer.files.length)take(e.dataTransfer.files);});
    document.addEventListener('paste',e=>{const fs=e.clipboardData&&[...e.clipboardData.files];if(fs&&fs.length&&document.getElementById('calculator').getBoundingClientRect().top<innerHeight)take(fs);});
    inp.addEventListener('change',()=>{take(inp.files);inp.value='';});
    box.querySelector('.pb-go').addEventListener('click',analyse);
    box.querySelector('.pb-stop').addEventListener('click',()=>ctl&&ctl.abort());
    renderPhotoBox();box.hidden=false;
  })();
  function wallArea(s){return Math.max(0,(s.L+s.B)*2*s.H-s.doors*1.6-s.wins*1.5);}
  /* each line: [label, quantity, unit ('m2'|'m'|'pcs'|''), price per unit] */
  function compute(){
    const t=state.tab,s=state[t],P=PRICES[t],l=L();let vat=21,info=[];const lines=[];
    const add=(lab,q,u,p)=>{if(q>0&&p>0)lines.push([lab,q,u,p]);};
    if(t==='stuc'){const wa=wallArea(s),ca=s.L*s.B;
      if(s.walls)add(l.wallsL+' · '+l[s.finish],wa,'m2',P[s.finish]);
      if(s.ceil)add(l.ceilL,ca,'m2',P.ceil);
      vat=s.old?9:21;info=[['wallArea',wa],['area',ca]];}
    if(t==='gips'){const a=s.wallLen*s.wallH;
      add(l[s.gtype],a,'m2',P[s.gtype]);
      if(s.insul)add(l.insul,a,'m2',P.insul);
      if(s.joints)add(l.joints,a*(s.gtype==='scheid'?2:1),'m2',P.joints);
      add(l.gDoors,s.gDoors,'pcs',P.door);
      add(l.ceilM2.replace(/\s*\(.*\)/,''),s.ceilM2,'m2',P.ceil);
      info=[['wallArea',a]];}
    if(t==='tegel'){
      add(l.wallTiles,s.wallM2,'m2',P.wall);add(l.floorTiles,s.floorM2,'m2',P.floor);
      add(l.formatL+' · '+l[s.format],s.wallM2+s.floorM2,'m2',P[s.format]);
      if(s.removeTiles)add(l.removeTiles,s.wallM2+s.floorM2,'m2',P.remove);
      add(l.tPlint,s.tPlint,'m',P.plint);add(l.jolly,s.jolly,'m',P.jolly);}
    if(t==='vloer'){const a=s.L*s.B;
      add(l[s.ftype],a,'m2',P[s.ftype]);
      if(s.level)add(l.level,a,'m2',P.level);
      if(s.plint)add(l.plint,(s.L+s.B)*2,'m',P.plint);
      info=[['area',a]];}
    if(t==='verf'){const wa=wallArea(s),ca=s.L*s.B;
      if(s.walls)add(l.wallsL,wa,'m2',P.wall);
      if(s.ceil)add(l.ceilL,ca,'m2',P.ceil);
      add(l.paintDoors,s.paintDoors,'pcs',P.door);add(l.paintFrames,s.paintFrames,'pcs',P.frame);
      vat=s.old?9:21;info=[['wallArea',wa],['area',ca]];}
    if(t==='bad'){const fa=s.L*s.B,wa=Math.max(0,(s.L+s.B)*2*s.H-1.6),TP=PRICES.tegel;
      if(s.demo)add(l.demo,1,'',P.demo);
      if(s.pipes)add(l.pipes,1,'',P.pipes);
      if(s.baTiles){add(l.wallTiles,wa,'m2',TP.wall);add(l.floorTiles,fa,'m2',TP.floor);}
      ['toilet','vanity','shower','radiator'].forEach(k=>{if(s[k])add(l[k],1,'',P[k]);});
      info=[['area',fa],['wallArea',wa]];}
    if(t==='dak'){
      add(l.dWidth,s.dWidth,'m',P.perM);add(l.shutters,s.shutters,'pcs',P.shutter);
      if(s.inside)add(l.inside,1,'',P.inside);}
    let excl=lines.reduce((a,x)=>a+x[1]*x[3],0);
    const min=PRICES.min[t]||0,minHit=excl<min;if(minHit)excl=min;
    const incl=excl*(1+vat/100);
    return {vat,excl,incl,info,lines,min,minHit};
  }
  const fmt=n=>'€ '+Math.round(n).toLocaleString('nl-NL');
  const fmtR=n=>'€ '+(Math.round(n/10)*10).toLocaleString('nl-NL');
  const dec=n=>(Math.round(n*10)/10).toLocaleString(window.__lang==='en'?'en-GB':'nl-NL');
  const tabsEl=document.getElementById('calcTabs'),panel=document.getElementById('calcPanel');
  if(!tabsEl)return;
  function renderTabs(){const l=L();tabsEl.innerHTML='';Object.keys(fields).forEach(k=>{const b=document.createElement('button');b.type='button';b.className='calc-tab';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(state.tab===k));b.textContent=l.tabs[k];b.addEventListener('click',()=>{state.tab=k;renderTabs();renderPanel();});tabsEl.appendChild(b);});}
  function renderPanel(){const l=L(),t=state.tab,s=state[t];panel.innerHTML='';
    fields[t].forEach(f=>{const [kind,key]=f;const id='c_'+t+'_'+key;
      if(kind==='head'){const h=document.createElement('p');h.className='cf-head';h.textContent=l[key];panel.appendChild(h);return;}
      const row=document.createElement('div');row.className='cf cf-'+kind;
      if(kind==='num'){const [,,mn,mx,st,u]=f;const unit=u==='m'?l.unitM:u==='m2'?l.unitM2:l.unitPcs;
        row.innerHTML=`<label for="${id}">${l[key]}${est[t].has(key)?`<em class="est">${P_().est}</em>`:''}</label><div class="stepper"><button type="button" aria-label="−">−</button><input id="${id}" type="number" inputmode="decimal" min="${mn}" max="${mx}" step="${st}" value="${s[key]}"><span class="u">${unit}</span><button type="button" aria-label="+">+</button></div>`;
        const inp=row.querySelector('input'),[minus,plus]=row.querySelectorAll('button');
        const set=v=>{v=Math.min(mx,Math.max(mn,Math.round(v/st)*st));v=Math.round(v*100)/100;s[key]=v;inp.value=v;const e=row.querySelector('.est');if(e){e.remove();est[t].delete(key);}update();};
        inp.addEventListener('input',()=>{const v=parseFloat(String(inp.value).replace(',','.'));if(!isNaN(v)){s[key]=Math.min(mx,Math.max(mn,v));update();}});
        inp.addEventListener('blur',()=>set(s[key]));
        minus.addEventListener('click',()=>set(s[key]-st));plus.addEventListener('click',()=>set(s[key]+st));}
      if(kind==='chk'){row.innerHTML=`<input type="checkbox" id="${id}" ${s[key]?'checked':''}><label for="${id}">${l[key]}${f[2]?`<small>${l[f[2]]}</small>`:''}</label>`;
        row.querySelector('input').addEventListener('change',e=>{s[key]=e.target.checked;update();});}
      if(kind==='sel'){row.innerHTML=`<span class="cf-lab">${l[key]}</span><div class="seg" role="radiogroup" aria-label="${l[key]}">${f[2].map(o=>`<button type="button" role="radio" aria-checked="${s[key]===o}" data-v="${o}">${l[o]}</button>`).join('')}</div>`;
        row.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{s[key]=b.dataset.v;row.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-checked',String(x===b)));update();}));}
      panel.appendChild(row);});
    update();}
  function update(){const l=L(),r=compute(),rg=PRICES.range;
    document.getElementById('crLabel').textContent=l.price+' · '+l.tabs[state.tab];
    document.getElementById('crFrom').textContent=l.from;
    const lo=Math.max(r.minHit?r.incl:0,r.incl*(1-rg)),hi=r.incl*(1+rg);
    document.getElementById('crPrice').textContent=fmtR(lo)+' – '+fmtR(hi);
    document.getElementById('crVat').textContent=l.vat.replace('{v}',r.vat);
    const U={m2:' '+l.unitM2,m:' '+l.unitM,pcs:' '+l.unitPcs,'':''};
    const rows=[...r.info.map(([k,v])=>[l[k],dec(v)+' '+l.unitM2]),
      ...r.lines.map(([lab,q,u,p])=>[lab,u?dec(q)+U[u]+' × '+fmt(p)+' = '+fmt(q*p):fmt(p)]),
      ...(r.minHit?[[l.minApplied.replace('{x}',fmt(r.min)),'']]:[]),
      [l.excl,fmt(r.excl)],[l.btw.replace('{v}',r.vat),fmt(r.incl-r.excl)]];
    document.getElementById('crBreak').innerHTML=rows.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
    document.getElementById('crNote').textContent=l.note;
    document.getElementById('crCta').textContent=l.cta;}
  document.getElementById('crCta').addEventListener('click',()=>{
    const map={stuc:'w1',gips:'w2',tegel:'w3',vloer:'w4',verf:'w5',bad:'w6',dak:'w7'};
    document.querySelectorAll('input[name="werk"]').forEach(c=>c.checked=false);
    const c=document.getElementById(map[state.tab]);if(c)c.checked=true;
    const s=state[state.tab],m2=document.getElementById('m2');
    if(m2){let a=s.L&&s.B?s.L*s.B:(s.floorM2||s.wallLen*s.wallH||s.dWidth*2||25);a=Math.round(Math.min(200,Math.max(2,a)));m2.value=a;m2.dispatchEvent(new Event('input'));}
    const f=document.getElementById('offerte');if(f)f.scrollIntoView({behavior:'smooth',block:'start'});
  });
  const card=document.querySelector('.calc-result');card.addEventListener('click',e=>{if(e.target.closest('#crCta'))return;card.classList.toggle('open');});
  document.addEventListener('langchange',()=>{renderTabs();renderPanel();renderPhotoBox();});
  renderTabs();renderPanel();
})();
