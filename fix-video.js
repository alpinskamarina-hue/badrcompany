// Runs after hero-video.js: makes the hero video start on iPhone/iPad too.
// - plays even when "Reduce Motion" / data saver is on (the owner wants it on every device)
// - autoplay + preload so iOS Safari starts it without a tap
// - if iOS blocks autoplay (Low Power Mode), the first real tap/click starts it
const fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'dist');
const R=[
 ["if(mq('(prefers-reduced-motion: reduce)')||(c&&(c.saveData||/2g/.test(c.effectiveType||''))))return;",""],
 ['muted loop playsinline preload="none"','muted autoplay loop playsinline webkit-playsinline preload="auto"'],
 ["['touchstart','click','scroll'].forEach(function(e){window.addEventListener(e,function h(){if(v.paused)go();window.removeEventListener(e,h)},{passive:true})});",
  "v.setAttribute('muted','');v.defaultMuted=true;['touchend','click','pointerup','touchstart','scroll'].forEach(function(e){window.addEventListener(e,function h(){if(v.paused)go();else window.removeEventListener(e,h)},{passive:true})});v.addEventListener('loadeddata',function(){if(v.paused)go();});v.addEventListener('canplay',function(){if(v.paused)go();});document.addEventListener('visibilitychange',function(){if(!document.hidden&&v.paused)go();});"]
];
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):e.name.endsWith('.html')?[p]:[];});}
let n=0;
for(const f of walk(OUT)){let s=fs.readFileSync(f,'utf8');if(!s.includes('hero-vid'))continue;let t=s;for(const [a,b] of R)t=t.split(a).join(b);if(t!==s){fs.writeFileSync(f,t);n++;console.log('fix-video:',path.relative(OUT,f));}}
console.log('fix-video: patched',n,'file(s)');
