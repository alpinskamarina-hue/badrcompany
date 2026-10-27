// Google reviews block on the home pages and the about pages (NL + EN).
// Runs after build.js on dist/. Buttons always work; the reviews themselves come from /api/reviews
// (needs GOOGLE_PLACES_KEY in Vercel). Without reviews only the buttons are shown, nothing is made up.
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'dist');
const PLACE_ID = 'ChIJvWIbhml5ma0RiIwupXHSsS8';
const MAPS = 'https://maps.google.com/?cid=3436759376204827784';
const WRITE = 'https://search.google.com/local/writereview?placeid=' + PLACE_ID;

const T = {
  nl: { kicker: 'Reviews op Google', h: 'Wat klanten zeggen', empty: 'Heeft u met ons gewerkt? We horen graag hoe het ging. Uw review helpt andere huiseigenaren kiezen.',
        write: 'Laat een review achter', view: 'Bekijk op Google', reviews: 'reviews', review: 'review', on: 'op Google', more: 'Lees verder' },
  en: { kicker: 'Reviews on Google', h: 'What customers say', empty: 'Have you worked with us? We would love to hear how it went. Your review helps other homeowners choose.',
        write: 'Leave a review', view: 'View on Google', reviews: 'reviews', review: 'review', on: 'on Google', more: 'Read more' }
};

const CSS = `<style id="g-reviews-css">
.g-reviews{background:var(--paper,#fff)}
.gr-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}
.gr-head .lead{max-width:56ch;margin-top:10px}
.gr-score{display:flex;align-items:center;gap:10px;margin-top:12px;font:800 20px/1 var(--font-display,system-ui)}
.gr-score .gr-num{font-size:34px}
.gr-stars{color:#f2b300;letter-spacing:2px;font-size:20px}
.gr-count{font-weight:600;font-size:15px;color:#5f5a51}
.gr-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-top:28px}
.gr-card{background:var(--plaster,#f4f1ea);border-radius:14px;padding:20px;display:grid;gap:10px;align-content:start}
.gr-card .gr-stars{font-size:16px}
.gr-card p{font-size:15.5px;line-height:1.55;color:#2b2925}
.gr-who{display:flex;align-items:center;flex-wrap:wrap;gap:4px 10px;font-size:14px;color:#5f5a51}
.gr-who a,.gr-who b{white-space:nowrap}
.gr-who img{width:32px;height:32px;border-radius:50%}
.gr-who a{color:var(--ink,#121212);font-weight:700;text-decoration:none}
.gr-more{background:none;border:0;padding:0;font:700 14px/1 var(--font-body,system-ui);text-decoration:underline;cursor:pointer;justify-self:start}
</style>`;

function block(lang) {
  const t = T[lang];
  return `<section class="g-reviews" id="gReviews" aria-labelledby="hrev">
  <div class="wrap">
    <div class="gr-head">
      <div>
        <p class="kicker">${t.kicker}</p>
        <h2 class="title-md" id="hrev">${t.h}</h2>
        <p class="gr-score" hidden><span class="gr-num"></span><span class="gr-stars" aria-hidden="true"></span><span class="gr-count"></span></p>
        <p class="lead gr-empty">${t.empty}</p>
      </div>
      <div class="btn-row"><a class="btn btn-dark" href="${WRITE}" target="_blank" rel="noopener">${t.write}</a><a class="btn btn-ghost gr-view" href="${MAPS}" target="_blank" rel="noopener">${t.view}</a></div>
    </div>
    <div class="gr-list"></div>
  </div>
</section>
<script>(function(){var L=${JSON.stringify(t)},s=document.getElementById('gReviews');if(!s||!window.fetch)return;
fetch('/api/reviews?lang=${lang}').then(function(r){return r.json();}).then(function(d){
  if(!d||!d.rating||!d.count)return;
  var st=function(n){n=Math.round(n);return '\\u2605\\u2605\\u2605\\u2605\\u2605'.slice(0,n)+'\\u2606\\u2606\\u2606\\u2606\\u2606'.slice(0,5-n);};
  var sc=s.querySelector('.gr-score');sc.hidden=false;
  sc.querySelector('.gr-num').textContent=String(d.rating.toFixed(1)).replace('.',${lang === 'nl' ? "','" : "'.'"});
  sc.querySelector('.gr-stars').textContent=st(d.rating);
  sc.querySelector('.gr-count').textContent=d.count+' '+(d.count===1?L.review:L.reviews)+' '+L.on;
  sc.setAttribute('aria-label',d.rating.toFixed(1)+' / 5, '+d.count+' '+L.reviews);
  if(d.url)s.querySelector('.gr-view').href=d.url;
  var list=s.querySelector('.gr-list');
  (d.reviews||[]).slice(0,5).forEach(function(v){
    var c=document.createElement('article');c.className='gr-card';
    var a=document.createElement('div');a.className='gr-stars';a.setAttribute('aria-label',v.rating+' / 5');a.textContent=st(v.rating);c.appendChild(a);
    if(v.text){var p=document.createElement('p'),full=v.text,short=full.length>280?full.slice(0,270).replace(/\\s+\\S*$/,'')+'\\u2026':full;p.textContent=short;c.appendChild(p);
      if(short!==full){var b=document.createElement('button');b.type='button';b.className='gr-more';b.textContent=L.more;b.onclick=function(){p.textContent=full;b.remove();};c.appendChild(b);}}
    var w=document.createElement('div');w.className='gr-who';
    if(v.photo){var i=document.createElement('img');i.src=v.photo;i.alt='';i.loading='lazy';i.referrerPolicy='no-referrer';w.appendChild(i);}
    var n=document.createElement(v.uri?'a':'b');n.textContent=v.name;if(v.uri){n.href=v.uri;n.target='_blank';n.rel='noopener';}w.appendChild(n);
    var m=document.createElement('span');m.textContent=(v.when?v.when+' \\u00b7 ':'')+'Google';w.appendChild(m);c.appendChild(w);
    list.appendChild(c);});
  var e=s.querySelector('.gr-empty');if(e)e.hidden=true;
}).catch(function(){});})();</script>`;
}

const PAGES = [
  ['index.html', 'nl', '<section class="plaster" aria-labelledby="hblog">'],
  ['en/index.html', 'en', '<section class="plaster" aria-labelledby="hblog">'],
  ['over-ons.html', 'nl', '<section class="cta">'],
  ['en/about.html', 'en', '<section class="cta">']
];
let n = 0;
for (const [file, lang, anchor] of PAGES) {
  const f = path.join(OUT, file);
  if (!fs.existsSync(f)) { console.warn('reviews: missing ' + file); continue; }
  let s = fs.readFileSync(f, 'utf8');
  if (s.includes('id="gReviews"')) continue;
  if (!s.includes(anchor)) { console.warn('reviews: anchor not found in ' + file); continue; }
  s = s.replace(anchor, block(lang) + '\n' + anchor);
  s = s.replace('</head>', CSS + '</head>');
  // link the website to the Google Maps profile for search engines
  s = s.replace('"priceRange":"€€"}', '"priceRange":"€€","sameAs":["' + MAPS + '"]}');
  fs.writeFileSync(f, s);
  n++;
}
console.log('reviews: block added to', n, 'pages');
