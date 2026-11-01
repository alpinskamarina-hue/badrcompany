// Badr Company site builder: wraps page fragments from src/<lang>/ in the shared layout and writes dist/.
// Each fragment starts with a <!-- key: value --> header (title, desc, path, alt, nav, scripts, ...).
const fs = require('fs'), path = require('path');
const ROOT = __dirname, SRC = path.join(ROOT, 'src'), OUT = path.join(ROOT, 'dist'), STATIC = path.join(ROOT, 'static');
const SITE = 'https://www.badrcompany.nl';
// Legal company details from company.json (ACM: shown on every page). Empty values are left out until known.
const CO = Object.assign({ name: 'Badr Company', kvk: '', btw: '', street: '', postcode: '', city: 'Zwolle' }, fs.existsSync(path.join(ROOT, 'company.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'company.json'), 'utf8')) : {});
const coAddr = () => [CO.street, [CO.postcode, CO.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
const coFill = (str, lang) => str.replace(/\{\{KVK\}\}/g, CO.kvk || (lang === 'nl' ? 'volgt' : 'to follow'))
  .replace(/\{\{BTW\}\}/g, CO.btw || (lang === 'nl' ? 'volgt' : 'to follow')).replace(/\{\{ADDR\}\}/g, coAddr()).replace(/\{\{NAME\}\}/g, CO.name);
const IMG = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`;

const T = {
  nl: {
    nav: [['diensten', 'Diensten', '/diensten'], ['prijzen', 'Prijzen', '/prijzen'], ['werkwijze', 'Werkwijze', '/werkwijze'], ['blog', 'Blog', '/blog'], ['over', 'Over ons', '/over-ons'], ['contact', 'Contact', '/contact']],
    home: '/', offerte: '/offerte', quote: 'Gratis offerte', call: 'Bel +31 6 34 25 30 00', menu: 'Menu', mainNav: 'Hoofdmenu', toTop: 'Badr Company, naar de homepage',
    strip: 'Actief in heel Nederland | Gevestigd in regio Zwolle', langLabel: 'Switch to English',
    about: 'Interieurafwerking door een vakman uit de regio Zwolle, actief in heel Nederland. Stucwerk, gipsplaten, tegels, vloeren, schilderwerk, badkamers en dakkapellen.',
    fContact: 'Contact', fServices: 'Diensten', fInfo: 'Informatie', copy: 'Kopieer', hours: 'Ma–za · 07:30–18:00',
    services: [['Stucwerk', '/diensten/stucwerk'], ['Gipsplaten', '/diensten/gipsplaten'], ['Tegelwerk', '/diensten/tegelwerk'], ['Vloeren', '/diensten/vloeren'], ['Schilderwerk', '/diensten/schilderwerk'], ['Badkamer', '/diensten/badkamer'], ['Dakkapel', '/diensten/dakkapel']],
    info: [['Werkwijze', '/werkwijze'], ['Prijscalculator', '/prijzen'], ['Offerte aanvragen', '/offerte'], ['Veelgestelde vragen', '/faq'], ['Blog', '/blog'], ['Over ons', '/over-ons'], ['Algemene voorwaarden', '/algemene-voorwaarden'], ['Privacy & cookies', '/privacy']],
    legal: 'Gratis opname · Vaste prijs · Geen meerwerk zonder akkoord', blog: '/blog', blogName: 'Blog',
    read: 'min lezen', more: 'Lees verder', related: 'Meer artikelen', allPosts: 'Alle artikelen',
    postCtaT: 'Zelf aan de slag met uw woning?', postCtaP: 'Vraag een gratis opname aan. We meten op, adviseren eerlijk en geven een vaste prijs vooraf.', postCtaB: 'Gratis offerte aanvragen', postCtaB2: 'Bereken de prijs', prijzen: '/prijzen',
    locale: 'nl-NL'
  },
  en: {
    nav: [['diensten', 'Services', '/en/services'], ['prijzen', 'Prices', '/en/prices'], ['werkwijze', 'How we work', '/en/how-we-work'], ['blog', 'Blog', '/en/blog'], ['over', 'About', '/en/about'], ['contact', 'Contact', '/en/contact']],
    home: '/en', offerte: '/en/quote', quote: 'Free quote', call: 'Call +31 6 34 25 30 00', menu: 'Menu', mainNav: 'Main menu', toTop: 'Badr Company, to the homepage',
    strip: 'Working across the Netherlands | Based in the Zwolle region', langLabel: 'Naar Nederlands',
    about: 'Interior finishing by a craftsman from the Zwolle region, working across the Netherlands. Plastering, drywall, tiling, flooring, painting, bathrooms and dormers.',
    fContact: 'Contact', fServices: 'Services', fInfo: 'Information', copy: 'Copy', hours: 'Mon–Sat · 07:30–18:00',
    services: [['Plastering', '/en/services/plastering'], ['Drywall', '/en/services/drywall'], ['Tiling', '/en/services/tiling'], ['Flooring', '/en/services/flooring'], ['Painting', '/en/services/painting'], ['Bathroom', '/en/services/bathroom'], ['Dormer', '/en/services/dormer']],
    info: [['How we work', '/en/how-we-work'], ['Price calculator', '/en/prices'], ['Request a quote', '/en/quote'], ['FAQ', '/en/faq'], ['Blog', '/en/blog'], ['About', '/en/about'], ['Terms and conditions', '/en/terms'], ['Privacy & cookies', '/en/privacy']],
    legal: 'Free site visit · Fixed price · No extra work without approval', blog: '/en/blog', blogName: 'Blog',
    read: 'min read', more: 'Read more', related: 'More articles', allPosts: 'All articles',
    postCtaT: 'Planning work on your home?', postCtaP: 'Request a free site visit. We measure up, give honest advice and a fixed price up front.', postCtaB: 'Request a free quote', postCtaB2: 'Calculate the price', prijzen: '/en/prices',
    locale: 'en-GB'
  }
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []); }
function parse(file) {
  const t = fs.readFileSync(file, 'utf8'), m = t.match(/^<!--([\s\S]*?)-->\s*/);
  if (!m) throw new Error('No header in ' + file);
  const meta = {};
  m[1].split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  if (!meta.path || !meta.title) throw new Error('Missing path/title in ' + file);
  return { meta, body: t.slice(m[0].length), file };
}
const outFile = p => p === '/' ? 'index.html' : p.replace(/^\//, '') + (p === '/en' ? '/index.html' : '.html');
const fmtDate = (d, lang) => new Date(d + 'T12:00:00Z').toLocaleDateString(T[lang].locale, { day: 'numeric', month: 'long', year: 'numeric' });
const imgUrl = s => /^https?:/.test(s) ? s : IMG(s);

const LOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="2" y="2" width="44" height="44" rx="6" fill="#f6c945"/><path d="M10 36V20l14-9 14 9v16" fill="none" stroke="#121212" stroke-width="3.5" stroke-linejoin="round"/><path d="M17 36V25h14v11" fill="none" stroke="#121212" stroke-width="3.5"/><path d="M8 38h32" stroke="#121212" stroke-width="3.5" stroke-linecap="round"/></svg>';
const PHONE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>';
const BURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

function header(meta, lang) {
  const t = T[lang], links = t.nav.map(([k, label, href]) => `<a href="${href}"${meta.nav === k ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const alt = meta.alt || (lang === 'nl' ? '/en' : '/');
  return `<header class="top">
  <div class="bar">
    <div class="wrap">
      <a class="logo" href="${t.home}" aria-label="${t.toTop}">${LOGO}<span><b>BADR</b><small>${lang === 'nl' ? 'INTERIEUR' : 'INTERIORS'}</small></span></a>
      <nav class="main" aria-label="${t.mainNav}">${links}</nav>
      <div class="actions">
        <a class="lang" href="${alt}" hreflang="${lang === 'nl' ? 'en' : 'nl'}" aria-label="${t.langLabel}"><span class="${lang === 'nl' ? 'on' : ''}">NL</span><i>|</i><span class="${lang === 'en' ? 'on' : ''}">EN</span></a>
        <a class="btn btn-white" href="${t.offerte}">${t.quote}</a>
        <a class="round white" href="tel:+31634253000" aria-label="${t.call}">${PHONE}</a>
        <button class="round yellow menu-btn" id="menuBtn" aria-expanded="false" aria-controls="drawer" aria-label="${t.menu}">${BURGER}</button>
      </div>
    </div>
  </div>
  <div class="drawer" id="drawer" hidden><div class="wrap">${links}<a href="${t.offerte}">${t.quote}</a></div></div>
  <div class="strip"><div class="wrap">${t.strip}</div></div>
</header>`;
}

function footer(lang) {
  const t = T[lang], li = a => a.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('');
  return `<footer id="contact">
  <div class="wrap">
    <div class="f-grid">
      <div>
        <a class="logo" href="${t.home}">${LOGO}<span><b>BADR</b><small>${lang === 'nl' ? 'INTERIEUR' : 'INTERIORS'}</small></span></a>
        <p style="margin-top:16px;max-width:36ch">${t.about}</p>
      </div>
      <div>
        <h4>${t.fContact}</h4>
        <ul>
          <li class="copyable"><span id="cMail">Badrkomp@gmail.com</span><button class="copy-btn" data-copy="cMail">${t.copy}</button></li>
          <li class="copyable"><span id="cTel">+31 6 34 25 30 00</span><button class="copy-btn" data-copy="cTel">${t.copy}</button></li>
          <li><a href="https://wa.me/31634253000">WhatsApp</a></li>
          <li>${t.hours}</li>
        </ul>
      </div>
      <div><h4>${t.fServices}</h4><ul>${li(t.services)}</ul></div>
      <div><h4>${t.fInfo}</h4><ul>${li(t.info)}</ul></div>
    </div>
    <div class="legal"><span>© ${new Date().getFullYear()} ${CO.name} · ${[coAddr(), CO.kvk && 'KvK ' + CO.kvk, CO.btw && (lang === 'nl' ? 'Btw-nr ' : 'VAT no. ') + CO.btw].filter(Boolean).join(' · ')}</span><span>${t.legal}</span></div>
  </div>
</footer>`;
}

function postCard(p, lang) {
  const m = p.meta, t = T[lang];
  return `<a class="post-card" href="${m.path}"><img src="${imgUrl(m.image).replace('w=1600', 'w=800')}" alt="" width="800" height="500" loading="lazy" decoding="async"><div class="pc-body"><p class="pc-meta">${esc(m.category || '')} · ${fmtDate(m.date, lang)}</p><h3>${esc(m.title)}</h3><p>${esc(m.excerpt || m.desc)}</p><span class="pc-more">${t.more}</span></div></a>`;
}

function wrapPost(p, lang, posts) {
  const m = p.meta, t = T[lang];
  const words = p.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length, mins = Math.max(2, Math.round(words / 200));
  const others = posts.filter(o => o !== p).slice(0, 3).map(o => postCard(o, lang)).join('');
  return `<section class="page-hero post-hero">
  <div class="wrap narrow">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${t.home}">Home</a><span>/</span><a href="${t.blog}">${t.blogName}</a></nav>
    <p class="eyebrow">${esc(m.category || '')}</p>
    <h1>${esc(m.title)}</h1>
    <p class="post-meta">${fmtDate(m.date, lang)} · ${mins} ${t.read}</p>
  </div>
</section>
<figure class="post-cover wrap narrow"><img src="${imgUrl(m.image)}" alt="${esc(m.imageAlt || '')}" width="1600" height="900" decoding="async"></figure>
<article class="prose wrap narrow">
${p.body.trim()}
</article>
<section class="post-cta-wrap"><div class="wrap narrow"><div class="post-cta"><h2>${t.postCtaT}</h2><p>${t.postCtaP}</p><div class="btn-row"><a class="btn btn-dark" href="${t.offerte}">${t.postCtaB}</a><a class="btn btn-ghost" href="${t.prijzen}">${t.postCtaB2}</a></div></div></div></section>
<section class="related"><div class="wrap"><div class="related-head"><h2 class="title-md">${t.related}</h2><a class="link-arrow" href="${t.blog}">${t.allPosts}</a></div><div class="blog-grid">${others}</div></div></section>`;
}

const stripTags = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// GEO: BreadcrumbList from the visible crumbs, FAQPage from the visible <details class="faq-item"> blocks.
function crumbsLd(body) {
  const nav = (body.match(/<nav class="crumbs"[^>]*>([\s\S]*?)<\/nav>/) || [])[1];
  if (!nav) return null;
  const items = [];
  nav.replace(/<a href="([^"]+)">([^<]+)<\/a>|<span>([^<\/][^<]*)<\/span>/g, (all, href, txt, last) => {
    if (href) items.push({ name: stripTags(txt), item: SITE + (href === '/' ? '/' : href) });
    else if (last && last.trim() !== '/') items.push({ name: stripTags(last) });
    return all;
  });
  if (items.length < 2) return null;
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => Object.assign({ '@type': 'ListItem', position: i + 1, name: it.name }, it.item ? { item: it.item } : {})) };
}
function faqLd(body) {
  const qs = [];
  body.replace(/<details class="faq-item"[^>]*><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g, (all, q, a) => {
    qs.push({ '@type': 'Question', name: stripTags(q), acceptedAnswer: { '@type': 'Answer', text: stripTags(a) } });
    return all;
  });
  return qs.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qs } : null;
}
const AUTHOR = { '@type': 'Person', name: 'Nasim', jobTitle: 'Oprichter', worksFor: { '@type': 'Organization', name: 'Badr Company', url: SITE + '/' } };

function pageLd(meta, lang, posts, body) {
  const base = jsonld(meta, lang, posts);
  if (meta.type === 'post') return base;
  const out = base ? [base] : [];
  const isService = /^\/(diensten|en\/services)\//.test(meta.path || '');
  if (isService) {
    const h1 = stripTags((body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || meta.title);
    out.push({ '@context': 'https://schema.org', '@type': 'Service', name: h1, serviceType: h1, description: meta.desc, url: SITE + meta.path, inLanguage: lang, areaServed: { '@type': 'Country', name: 'Nederland' }, provider: { '@type': 'HomeAndConstructionBusiness', name: 'Badr Company', url: SITE + '/', telephone: '+31634253000' } });
  }
  if (meta.path !== '/' && meta.path !== '/en') { const bc = crumbsLd(body); if (bc) out.push(bc); }
  if (isService || /^\/(faq|en\/faq)$/.test(meta.path || '')) { const fq = faqLd(body); if (fq) out.push(fq); }
  return out.length ? (out.length === 1 ? out[0] : out) : null;
}

function jsonld(meta, lang, posts) {
  if (meta.type === 'post') return { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: meta.title, description: meta.desc, datePublished: meta.date, image: imgUrl(meta.image), inLanguage: lang, author: AUTHOR, publisher: { '@type': 'Organization', name: 'Badr Company' }, mainEntityOfPage: SITE + meta.path };
  if (meta.jsonld === 'business') return { '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness', name: 'Badr Company', url: SITE + '/', telephone: '+31634253000', email: 'Badrkomp@gmail.com', image: imgUrl('photo-1772797583328-f83bc3f94f80'), legalName: CO.name, address: Object.assign({ '@type': 'PostalAddress', addressLocality: CO.city, addressCountry: 'NL' }, CO.street ? { streetAddress: CO.street } : {}, CO.postcode ? { postalCode: CO.postcode } : {}), ...(CO.btw ? { vatID: CO.btw } : {}), areaServed: { '@type': 'Country', name: 'Nederland' }, openingHours: 'Mo-Sa 07:30-18:00', priceRange: '€€' };
  return null;
}

function page(p, lang, posts) {
  const m = p.meta, t = T[lang];
  let body = coFill(p.body, lang);
  if (m.type === 'post') body = wrapPost(p, lang, posts);
  body = body.replace('{{BLOG_LATEST}}', posts.slice(0, 3).map(o => postCard(o, lang)).join(''))
             .replace('{{BLOG_LIST}}', posts.map(o => postCard(o, lang)).join(''));
  const scripts = (m.scripts || '').split(',').map(s => s.trim()).filter(Boolean);
  const title = m.path === '/' || m.path === '/en' ? m.title : `${m.title} | Badr Company`;
  const nlPath = lang === 'nl' ? m.path : (m.alt || '/'), enPath = lang === 'en' ? m.path : (m.alt || '/en');
  const ogImg = imgUrl(m.image || 'photo-1772797583328-f83bc3f94f80').replace('w=1600', 'w=1200');
  const ld = pageLd(m, lang, posts, body);
  const js = ['<script>try{localStorage.setItem("badr-lang","' + lang + '")}catch(e){}</script>', '<script src="/js/s1.js"></script>'];
  if (scripts.includes('three')) js.push('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>');
  js.push('<script src="/js/s2.js"></script>');
  ['s3', 's4', 's5'].forEach(s => { if (scripts.includes(s)) js.push(`<script src="/js/${s}.js"></script>`); });
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(m.desc || '')}">
<link rel="canonical" href="${SITE}${m.path}">
<link rel="alternate" hreflang="nl" href="${SITE}${nlPath}">
<link rel="alternate" hreflang="en" href="${SITE}${enPath}">
<link rel="alternate" hreflang="x-default" href="${SITE}${nlPath}">
<meta property="og:type" content="${m.type === 'post' ? 'article' : 'website'}">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.desc || '')}">
<meta property="og:url" content="${SITE}${m.path}">
<meta property="og:image" content="${ogImg}">
<meta property="og:locale" content="${lang === 'nl' ? 'nl_NL' : 'en_GB'}">
<meta name="theme-color" content="#121212">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=Lato:wght@400;700;900&display=swap">
<link rel="stylesheet" href="/site.css">
<link rel="stylesheet" href="/pages.css">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n` : ''}</head>
<body class="${esc(m.bodyClass || '')}">
${header(m, lang)}
<main id="top">
${body.trim()}
</main>
${footer(lang)}
${js.join('\n')}
</body>
</html>
`;
}

// ---- build ----
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(STATIC, OUT, { recursive: true });
const all = [], paths = new Set();
for (const lang of ['nl', 'en']) {
  const pages = walk(path.join(SRC, lang)).map(parse);
  const posts = pages.filter(p => p.meta.type === 'post').sort((a, b) => b.meta.date.localeCompare(a.meta.date));
  for (const p of pages) {
    if (paths.has(p.meta.path)) throw new Error('Duplicate path ' + p.meta.path);
    paths.add(p.meta.path);
    const f = path.join(OUT, outFile(p.meta.path));
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, page(p, lang, posts));
    all.push(p);
  }
}
// every alt must point to a real page
for (const p of all) if (p.meta.alt && !paths.has(p.meta.alt)) { const msg = `Broken alt ${p.meta.alt} in ${p.file}`; if (process.env.DRAFT) console.warn(msg); else throw new Error(msg); }
const today = new Date().toISOString().slice(0, 10);
const sm = all.filter(p => p.meta.path !== '/404' && p.meta.path !== '/en/404').map(p => `<url><loc>${SITE}${p.meta.path}</loc><lastmod>${p.meta.date || today}</lastmod></url>`).join('\n');
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('Built', all.length, 'pages');
