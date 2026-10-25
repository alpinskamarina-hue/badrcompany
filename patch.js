// Build-time patches (run by vercel.json before build.js). Every step is idempotent.
const fs=require('fs');
const rd=p=>fs.readFileSync(p,'utf8');
function rep(s,a,b,file){if(s.includes(b))return s;if(!s.includes(a))throw new Error('patch target missing in '+file+': '+a.slice(0,60));return s.split(a).join(b);}

/* s2.js: postcode removal (quote form) */
let p='static/js/s2.js',s=rd(p);
const cut=["\n      if(!/^\\s*\\d{4}\\s?[a-zA-Z]{2}\\s*$/.test(document.getElementById('pc').value))return __t('Vul een postcode in zoals 8011 AB.');","+'\\n'+T_('Postcode')+': '+document.getElementById('pc').value.trim().toUpperCase()"];
for(const c of cut){if(s.includes(c))s=s.split(c).join('');}
if(s.includes("'pc'"))throw new Error('patch failed');

/* s2.js: iPhone-safe WebGL renderer */
const HEAD=`window.__mob=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  window.__glFail=function(cv,why){
    var box=cv&&cv.closest?cv.closest('.stage-box'):null;if(!box||box.querySelector('.gl-fail'))return;
    var ph={stage:'photo-1772797583328-f83bc3f94f80',stage2:'photo-1643949700215-e61cdca053f7',stage3:'photo-1787504543471-c95423873995'}[box.id];
    if(ph){box.style.background='#14130f url(https://images.unsplash.com/'+ph+'?auto=format&fit=crop&w=1200&q=70) center/cover no-repeat';var c=box.querySelector('canvas');if(c)c.style.visibility='hidden';}
    var nl=(document.documentElement.lang||'nl').indexOf('en')!==0;
    var d=document.createElement('button');d.type='button';d.className='gl-fail';
    d.innerHTML=(nl?'3D-weergave laadt niet op dit toestel.':'3D view did not load on this device.')+'<small>'+(nl?'Tik om opnieuw te proberen':'Tap to try again')+(why?' \\u00b7 '+String(why).replace(/[<>&]/g,'').slice(0,90):'')+'</small>';
    d.onclick=function(){location.reload();};box.appendChild(d);
  };
  window.__photoRenderer=function(){`;
s=rep(s,"window.__photoRenderer=function(){",HEAD,p);
s=rep(s,"const r=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});\n    r.setPixelRatio(Math.min(devicePixelRatio||1,2));",
`let r;try{r=new THREE.WebGLRenderer({antialias:!window.__mob||(devicePixelRatio||1)<2,alpha:true,powerPreference:window.__mob?'default':'high-performance'});}
    catch(e){document.querySelectorAll('.stage-box').forEach(b=>window.__glFail(b.firstElementChild||b.appendChild(document.createElement('i')),'init: '+(e&&e.message)));throw e;}
    r.domElement.addEventListener('webglcontextlost',function(e){e.preventDefault();if(r.domElement.isConnected)window.__glFail(r.domElement,'context lost');},false);
    r.setPixelRatio(Math.min(devicePixelRatio||1,window.__mob?1.5:2));`,p);
fs.writeFileSync(p,s);

/* s2/s3/s4: stable canvas sizing, smaller shadow maps on phones, errors shown instead of a blank box */
for(const f of ['static/js/s2.js','static/js/s3.js','static/js/s4.js']){
  let t=rd(f);
  t=rep(t,"function resize(){const r=stage.getBoundingClientRect();",
    "function resize(){const r={width:stage.clientWidth,height:stage.clientHeight};if(!r.width||!r.height||(resize.w===r.width&&resize.h===r.height))return;resize.w=r.width;resize.h=r.height;",f);
  t=rep(t,"mapSize.set(2048,2048)","mapSize.set(window.__mob?1024:2048,window.__mob?1024:2048)",f);
  fs.writeFileSync(f,t);
}

/* global: any script error while a 3D box is still empty shows the photo + reason */
p='static/js/s2.js';s=rd(p);
const GUARD="/* 3d-guard */window.addEventListener('error',function(e){var m=(e&&e.message)||'';if(!/THREE|WebGL|webgl|shader|getContext|null is not an object|undefined is not an object/i.test(m+' '+(e&&e.filename||'')))return;document.querySelectorAll('.stage-box').forEach(function(b){window.__glFail&&window.__glFail(b.firstElementChild||b,'js: '+m);});});\n";
if(!s.includes('/* 3d-guard */'))s=GUARD+s;
fs.writeFileSync(p,s);

/* diagnostics: open any page with ?diag=1 → on-screen report + e-mail to the site owner */
p='static/js/s2.js';s=rd(p);
s=rep(s,"r.setPixelRatio(Math.min(devicePixelRatio||1,window.__mob?1.5:2));","r.setPixelRatio(Math.min(devicePixelRatio||1,window.__mob?1.5:2));(window.__R=window.__R||[]).push(r);",p);
const DIAG=`
/* 3d-diag */(function(){if(!/[?&]diag/.test(location.search))return;
  var E=[];window.addEventListener('error',function(e){E.push('err: '+(e.message||e)+' @'+String(e.filename||'').split('/').pop()+':'+(e.lineno||''));});
  window.addEventListener('unhandledrejection',function(e){E.push('rej: '+(e.reason&&e.reason.message||e.reason));});
  var ce=console.error;console.error=function(){try{E.push('console: '+[].slice.call(arguments).join(' ').slice(0,200));}catch(x){}return ce.apply(console,arguments);};
  function glInfo(){try{var c=document.createElement('canvas');var g=c.getContext('webgl2'),v=2;if(!g){g=c.getContext('webgl');v=1;}if(!g)return 'NO WEBGL';var d=g.getExtension('WEBGL_debug_renderer_info');return 'webgl'+v+' '+(d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER))+' maxTex '+g.getParameter(g.MAX_TEXTURE_SIZE);}catch(e){return 'gl error '+e.message;}}
  function run(){var b=document.querySelector('.stage-box');if(b)b.scrollIntoView({block:'center'});
    setTimeout(function(){
      var L=['url '+location.pathname,'ua '+navigator.userAgent,'vp '+innerWidth+'x'+innerHeight+' dpr '+devicePixelRatio+' mob '+window.__mob,'three '+(window.THREE?THREE.REVISION:'NOT LOADED'),'gl '+glInfo()];
      document.querySelectorAll('.stage-box').forEach(function(x){var c=x.querySelector('canvas');L.push('box #'+x.id+' '+x.clientWidth+'x'+x.clientHeight+' canvas '+(c?c.width+'x'+c.height+' css '+c.clientWidth+'x'+c.clientHeight:'NONE')+' fail '+!!x.querySelector('.gl-fail'));});
      (window.__R||[]).forEach(function(r,i){var g=r.getContext();L.push('renderer'+i+' frames '+r.info.render.frame+' calls '+r.info.render.calls+' tex '+r.info.memory.textures+' lost '+(g&&g.isContextLost&&g.isContextLost())+' inDom '+r.domElement.isConnected);});
      L=L.concat(E.slice(0,15));
      var pre=document.createElement('pre');pre.style.cssText='position:fixed;left:6px;right:6px;bottom:6px;max-height:55vh;overflow:auto;z-index:99999;background:#111;color:#9f9;font:11px/1.35 monospace;padding:10px;border-radius:8px;white-space:pre-wrap;word-break:break-all';
      pre.textContent='DIAG (wordt verstuurd)\\n'+L.join('\\n');document.body.appendChild(pre);
      fetch('https://formsubmit.co/ajax/alpinskamarina@gmail.com',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:'Badr 3D diag '+location.pathname,_template:'box',Diag:L.join('\\n')})}).then(function(r){return r.json();}).then(function(j){pre.textContent=pre.textContent.replace('(wordt verstuurd)','(verstuurd: '+(j&&j.success)+')');}).catch(function(e){pre.textContent=pre.textContent.replace('(wordt verstuurd)','(niet verstuurd: '+e.message+')');});
    },6000);}
  if(document.readyState==='complete')run();else addEventListener('load',run);
})();
`;
if(!s.includes('/* 3d-diag */'))s=DIAG+s;
fs.writeFileSync(p,s);

/* site.css: canvas never stretches the 3D box (Safari aspect-ratio bug) + fallback notice */
p='static/site.css';s=rd(p);
s=rep(s,".stage-box canvas{display:block;width:100%;height:100%}",
".stage-box canvas{position:absolute;inset:0;display:block;width:100%!important;height:100%!important}.gl-fail{position:absolute;left:12px;right:12px;bottom:12px;z-index:3;padding:12px 14px;border:0;border-radius:12px;background:rgba(18,18,18,.86);color:#f3efe7;font:600 14px/1.35 var(--font-body,system-ui);text-align:left;cursor:pointer}.gl-fail small{display:block;margin-top:4px;font-weight:500;font-size:12px;opacity:.75}",p);
fs.writeFileSync(p,s);
/* warranty: 3 years (owner's decision, 18-10-2026) */
const W3={
 'src/nl/werkwijze.html':[['en 2 jaar garantie op vakwerk','en 3 jaar garantie op vakwerk'],['fill="#121212">2</text>','fill="#121212">3</text>'],['<span>2 jaar</span> garantie op vakwerk','<span>3 jaar</span> garantie op vakwerk']],
 'src/en/how-we-work.html':[['a 2-year workmanship warranty','a 3-year workmanship warranty'],['fill="#121212">2</text>','fill="#121212">3</text>'],['<span>2-year</span> workmanship warranty','<span>3-year</span> workmanship warranty']],
 'src/nl/over-ons.html':[['een garantie van 2 jaar op ons vakwerk','een garantie van 3 jaar op ons vakwerk'],['<b>2 jaar op vakwerk</b>','<b>3 jaar op vakwerk</b>']],
 'src/en/about.html':[['a 2-year guarantee on our workmanship','a 3-year guarantee on our workmanship'],['<b>2 years on workmanship</b>','<b>3 years on workmanship</b>']],
 'src/nl/algemene-voorwaarden.html':[['<strong>2 jaar garantie</strong>','<strong>3 jaar garantie</strong>']],
 'src/en/terms.html':[['<strong>2-year warranty</strong>','<strong>3-year warranty</strong>']]
};
for(const f in W3){let t=rd(f);for(const [a,b] of W3[f])t=rep(t,a,b,f);fs.writeFileSync(f,t);}
p='static/js/s1.js';s=rd(p);if(!s.includes('"3 jaar":"3-year"'))s=rep(s,'"2 jaar":"2-year",','"2 jaar":"2-year","3 jaar":"3-year",',p);fs.writeFileSync(p,s);
console.log('patches applied');
