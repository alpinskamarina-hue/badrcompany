// Hero video for the home pages (NL + EN).
// Runs after build.js: downloads the two hero videos, stores them in dist/video/
// (so Vercel serves them from the site itself) and adds a muted looping video
// on top of the existing hero photo. If anything fails, the site is built
// unchanged with the photo, so a download problem can never break a deploy.
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'dist');

// Google Drive file ids (files shared as "anyone with the link").
const VIDEOS = {
  desktop: { id: '1TQx-XC1fLk2utFrJFKuu0mGSLvlvx0tY', file: 'hero-desktop.mp4' },
  mobile: { id: '1vw99EJCF2PZgPgU5bpC3kV1l2m3nfLOq', file: 'hero-mobile.mp4' },
};

const driveUrl = id => `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;

async function download(v) {
  if (!v.id) return false;
  const url = /^https?:\/\//.test(v.id) ? v.id : driveUrl(v.id);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${v.file}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // An MP4 file has 'ftyp' at byte 4; anything else (an HTML error page) is rejected.
  if (buf.length < 50000 || buf.toString('latin1', 4, 8) !== 'ftyp') throw new Error(`${v.file}: not an MP4 (${buf.length} bytes)`);
  fs.mkdirSync(path.join(OUT, 'video'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'video', v.file), buf);
  console.log(`hero-video: ${v.file} ${(buf.length / 1048576).toFixed(1)} MB`);
  return true;
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : e.name.endsWith('.html') ? [p] : [];
  });
}

const CSS = `<style id="hero-video-css">
#heroImg{overflow:hidden}
#heroImg.vid-on{opacity:1}
#heroImg>.hero-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1s ease;filter:brightness(1.28) contrast(1.05) saturate(1.05)}
#heroImg>.hero-vid.on{opacity:1}
#heroImg.vid-on::after{background:linear-gradient(90deg,rgba(18,18,18,.62) 0%,rgba(18,18,18,.45) 42%,rgba(18,18,18,.15) 75%,rgba(18,18,18,.25) 100%),linear-gradient(0deg,rgba(18,18,18,.45) 0%,rgba(18,18,18,0) 30%)}
section.hero:has(#heroImg.vid-on) .wrap{text-shadow:0 2px 12px rgba(0,0,0,.65),0 1px 3px rgba(0,0,0,.5)}
@media (max-width:900px){#heroImg.vid-on::after{background:linear-gradient(180deg,rgba(18,18,18,.18) 0%,rgba(18,18,18,.24) 45%,rgba(18,18,18,.38) 100%)}}
</style>`;

function videoTag(have) {
  const d = have.desktop ? '/video/' + VIDEOS.desktop.file : '/video/' + VIDEOS.mobile.file;
  const m = have.mobile ? '/video/' + VIDEOS.mobile.file : d;
  return `<video class="hero-vid" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-d="${d}" data-m="${m}"></video>`
    + `<script>(function(){var v=document.currentScript.parentNode.querySelector('.hero-vid');if(!v)return;`
    + `var mq=function(q){return window.matchMedia&&matchMedia(q).matches};`
    + `var c=navigator.connection;if(mq('(prefers-reduced-motion: reduce)')||(c&&(c.saveData||/2g/.test(c.effectiveType||''))))return;`
    + `v.src=mq('(max-aspect-ratio: 1/1)')?v.dataset.m:v.dataset.d;v.muted=true;`
    + `v.addEventListener('playing',function(){v.classList.add('on');v.parentNode.classList.add('vid-on')},{once:true});`
    + `var go=function(){var p=v.play();if(p&&p.catch)p.catch(function(){});};go();['touchstart','click','scroll'].forEach(function(e){window.addEventListener(e,function h(){if(v.paused)go();window.removeEventListener(e,h)},{passive:true})});})();</script>`;
}

(async () => {
  const have = {};
  for (const k of Object.keys(VIDEOS)) {
    try { have[k] = await download(VIDEOS[k]); }
    catch (e) { console.warn('hero-video: skipped ' + e.message); have[k] = false; }
  }
  if (!have.desktop && !have.mobile) { console.log('hero-video: no videos, hero photo kept'); return; }
  let n = 0;
  for (const f of htmlFiles(OUT)) {
    let s = fs.readFileSync(f, 'utf8');
    const m = s.match(/<div class="hero-photo" id="heroImg"[^>]*>/);
    if (!m || s.includes('class="hero-vid"')) continue;
    s = s.replace(m[0], m[0] + videoTag(have));
    s = s.includes('</head>') ? s.replace('</head>', CSS + '</head>') : CSS + s;
    fs.writeFileSync(f, s);
    n++;
    console.log('hero-video: added to ' + path.relative(OUT, f));
  }
  if (!n) console.warn('hero-video: no hero found');
})().catch(e => { console.warn('hero-video: ' + e.message); });
