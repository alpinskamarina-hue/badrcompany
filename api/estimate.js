// Photo estimate for the price calculator: sends customer photos to Claude and returns measurements.
// Needs env var ANTHROPIC_API_KEY. Optional: ANTHROPIC_MODEL, ALLOWED_ORIGINS (comma separated).
const TABS = { stuc: 'Plastering', gips: 'Drywall', tegel: 'Tiling', vloer: 'Flooring', verf: 'Painting', bad: 'Bathroom', dak: 'Dormer' };
const ROOM = '"L": room length m, "B": room width m, "H": ceiling height m, "doors": number of doors, "wins": number of windows';
const WANT = {
  stuc: ROOM, verf: ROOM,
  gips: '"wallLen": length of the main wall to clad or build in m, "wallH": wall height m',
  tegel: '"wallM2": tiled (or to-be-tiled) wall area m², "floorM2": floor area m², "format": "fGroot" (large 60x120 or bigger), "fStd" (about 30x60) or "fKlein" (small/mosaic)',
  vloer: '"L": room length m, "B": room width m',
  bad: '"L": bathroom length m, "B": bathroom width m, "H": ceiling height m, "toilet": true/false toilet present, "vanity": true/false washbasin present, "shower": true/false shower present, "radiator": true/false radiator present',
  dak: '"dWidth": width of the existing or planned dormer in m (if no dormer yet: a sensible width for this roof, roof length minus 1 m at most)'
};
const KEYS = {
  stuc: ['L', 'B', 'H', 'doors', 'wins'], verf: ['L', 'B', 'H', 'doors', 'wins'], gips: ['wallLen', 'wallH'],
  tegel: ['wallM2', 'floorM2', 'format'], vloer: ['L', 'B'], bad: ['L', 'B', 'H', 'toilet', 'vanity', 'shower', 'radiator'], dak: ['dWidth']
};
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const WINDOW_MS = 10 * 60 * 1000, MAX_PER_WINDOW = 6;
const hits = new Map(); // best effort, per server instance

function allowedOrigin(o) {
  if (!o) return true;
  const list = (process.env.ALLOWED_ORIGINS || 'https://badr-company.vercel.app,https://badr-company-habibi9.vercel.app').split(',').map(s => s.trim());
  return list.includes(o) || /^https:\/\/badr-company-[a-z0-9]+-habibi9\.vercel\.app$/.test(o);
}
function limited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) { hits.set(ip, arr); return true; }
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.ANTHROPIC_API_KEY;
  if (req.method === 'GET') return res.status(200).json({ enabled: !!key });
  if (req.method !== 'POST') return res.status(405).json({ error: 'other' });
  if (!key) return res.status(503).json({ error: 'not_configured' });
  if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ error: 'other' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'rate_limited' });

  const body = req.body || {};
  const tab = body.tab;
  if (!WANT[tab]) return res.status(400).json({ error: 'other' });
  const images = Array.isArray(body.images) ? body.images.slice(0, 3) : [];
  if (!images.length) return res.status(400).json({ error: 'image_rejected' });
  let total = 0;
  for (const im of images) {
    if (!im || !TYPES.includes(im.type) || typeof im.data !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(im.data)) return res.status(400).json({ error: 'image_rejected' });
    total += im.data.length;
  }
  if (total > 4000000) return res.status(413).json({ error: 'too_large' });
  const lang = body.lang === 'en' ? 'English' : 'Dutch';

  const prompt = `You are helping a Dutch renovation company estimate the size of a space from customer photos, for a rough labour quote. The photos show a space for this job: ${TABS[tab]}.
Estimate the dimensions using known reference sizes common in the Netherlands: interior doors are about 2.015-2.115 m high and 0.83 m wide, light switches sit about 1.05 m above the floor, wall sockets about 0.30 m, standard ceilings are 2.40-2.60 m, kitchen counters about 0.90 m, a toilet is about 0.40 m high, standard bricks are about 21 x 5 cm, roof tiles about 0.30 m wide. Use visible tile joints, floor boards or other repeating elements to count. If parts are not visible, make a sensible estimate for a typical Dutch home.
If the photos do not show a room, wall, floor or roof at all, reply with {"error":"refused"}.
Otherwise reply with ONLY one JSON object with these fields: ${WANT[tab]}, "confidence": "hoog", "middel" or "laag", "notes": one or two short sentences in ${lang} saying what you used as reference and what the customer should double-check.
Round lengths to 0.1 m and areas to whole m².`;

  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: [
          ...images.map(im => ({ type: 'image', source: { type: 'base64', media_type: im.type, data: im.data } })),
          { type: 'text', text: prompt }
        ] }]
      })
    });
  } catch (e) { return res.status(502).json({ error: 'other' }); }
  if (r.status === 429) return res.status(429).json({ error: 'rate_limited' });
  if (!r.ok) { console.error('anthropic', r.status, (await r.text()).slice(0, 300)); return res.status(502).json({ error: 'other' }); }

  const data = await r.json();
  const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  const m = text.match(/\{[\s\S]*\}/);
  let out;
  try { out = JSON.parse(m ? m[0] : ''); } catch (e) { return res.status(502).json({ error: 'invalid_json' }); }
  if (out.error) return res.status(422).json({ error: 'refused' });
  const clean = {};
  for (const k of KEYS[tab]) if (k in out) clean[k] = out[k];
  if (['hoog', 'middel', 'laag'].includes(out.confidence)) clean.confidence = out.confidence;
  if (typeof out.notes === 'string') clean.notes = out.notes.slice(0, 400);
  return res.status(200).json(clean);
};
