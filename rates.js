// Prices per service (per m², per metre, per item) instead of one hourly rate.
// Runs after build.js on dist/: rewrites the price texts so they match the calculator (static/js/s5.js, PRICES).
const fs=require('fs'),path=require('path');
const OUT=path.join(__dirname,'dist');
const R=[
 /* ---- price page NL ---- */
 ['€ 54,50 per uur incl. 9% btw of € 60,50 incl. 21% btw (€ 50 excl. btw), voorrijkosten inbegrepen.','Prijs per m², per meter of per onderdeel, met 9% of 21% btw. Voorrijkosten inbegrepen.'],
 ['We rekenen per uur, met een vaste prijs in de offerte.','We rekenen per m², per meter of per onderdeel, met een vaste prijs in de offerte.'],
 ['<span>€ 54,50 – € 60,50 per uur incl. btw</span><span>€ 50 excl. btw</span><span>Voorrijkosten inbegrepen</span><span>Minimaal 4 uur</span><span>Materialen apart</span>','<span>Prijs per dienst</span><span>9% of 21% btw</span><span>Voorrijkosten inbegrepen</span><span>Minimumbedrag per klus</span><span>Materialen apart</span>'],
 ['<h3>Uurtarief</h3><p>€ 50 per uur exclusief btw. Voor particulieren is dat € 54,50 inclusief 9% btw (stucwerk en schilderwerk in woningen ouder dan 2 jaar) of € 60,50 inclusief 21% btw (overig werk). De calculator rekent met gemiddelde werktijden per m². In de offerte staat een vaste prijs, geen open eind.</p>',
  '<h3>Tarieven</h3><p>Elke dienst heeft een eigen tarief: stucwerk en schilderwerk per m², tegels en vloeren per m² en strekkende meter, een badkamer per onderdeel en een dakkapel per meter breedte. Kleine extra klussen rekenen we tegen € 50 per uur excl. btw. In de offerte staat een vaste prijs, geen open eind.</p>'],
 ['Per opdracht rekenen we minimaal 4 uur arbeid.','Per opdracht geldt een minimumbedrag: € 250 voor stuc- en schilderwerk, € 300 voor gipsplaten en vloeren, € 400 voor tegelwerk.'],
 ['<span id="crFrom">vanaf</span>','<span id="crFrom">ca.</span>'],
 /* ---- price page EN ---- */
 ['€ 54.50 per hour incl. 9% VAT or € 60.50 incl. 21% VAT (€ 50 excl. VAT), travel costs included.','Price per m², per metre or per item, with 9% or 21% VAT. Travel costs included.'],
 ['We charge by the hour, with a fixed price in the quote.','We charge per m², per metre or per item, with a fixed price in the quote.'],
 ['<span>€ 54.50 – € 60.50 per hour incl. VAT</span><span>€ 50 excl. VAT</span><span>Travel costs included</span><span>Minimum 4 hours</span><span>Materials separate</span>','<span>Price per service</span><span>9% or 21% VAT</span><span>Travel costs included</span><span>Minimum charge per job</span><span>Materials separate</span>'],
 ['<h3>Hourly rate</h3><p>€ 50 per hour excluding VAT. For private customers that is € 54.50 including 9% VAT (plastering and painting in homes older than 2 years) or € 60.50 including 21% VAT (other work). The calculator uses average working times per m². The quote contains a fixed price, not an open-ended bill.</p>',
  '<h3>Rates</h3><p>Each service has its own rate: plastering and painting per m², tiles and floors per m² and running metre, a bathroom per item and a dormer per metre of width. Small extra jobs are charged at € 50 per hour excl. VAT. The quote contains a fixed price, not an open-ended bill.</p>'],
 ['We charge a minimum of 4 hours of labour per job.','Each job has a minimum charge: € 250 for plastering and painting, € 300 for drywall and flooring, € 400 for tiling.'],
 ['<span id="crFrom">from</span>','<span id="crFrom">approx.</span>'],
 /* ---- terms, article 4 ---- */
 ['<li>Ons uurtarief is € 50 exclusief btw. Inclusief btw is dat € 54,50 (9%, voor stucwerk en schilderwerk in woningen ouder dan 2 jaar) of € 60,50 (21%, overig werk).</li>',
  '<li>We rekenen per m², per meter of per onderdeel, zoals in de offerte staat. Kleine extra klussen rekenen we tegen € 50 per uur exclusief btw. Inclusief btw is dat € 54,50 (9%, voor stucwerk en schilderwerk in woningen ouder dan 2 jaar) of € 60,50 (21%, overig werk).</li>'],
 ['<li>Voorrijkosten zijn inbegrepen. Per opdracht rekenen we minimaal 4 uur.</li>','<li>Voorrijkosten zijn inbegrepen. Per opdracht geldt een minimumbedrag: € 250 voor stuc- en schilderwerk, € 300 voor gipsplaten en vloeren, € 400 voor tegelwerk (excl. btw).</li>'],
 ['<li>Our hourly rate is € 50 excluding VAT. Including VAT that is € 54.50 (9%, for plastering and painting in homes older than 2 years) or € 60.50 (21%, other work).</li>',
  '<li>We charge per m², per metre or per item, as stated in the quote. Small extra jobs are charged at € 50 per hour excluding VAT. Including VAT that is € 54.50 (9%, for plastering and painting in homes older than 2 years) or € 60.50 (21%, other work).</li>'],
 ['<li>Travel costs are included. We charge a minimum of 4 hours per job.</li>','<li>Travel costs are included. Each job has a minimum charge: € 250 for plastering and painting, € 300 for drywall and flooring, € 400 for tiling (excl. VAT).</li>'],
 /* ---- service pages NL ---- */
 ['Arbeid vanaf ca. € 27 per m² incl. 9% btw.','Arbeid vanaf ca. € 16 per m² incl. 9% btw.'],
 ['We rekenen € 50 per uur exclusief btw. Voor stucwerk in een woning ouder dan 2 jaar is dat € 54,50 inclusief 9% btw. Een wand kost gemiddeld een half uur per m², een plafond iets meer. Materialen rekenen we apart, voorrijkosten zijn inbegrepen.',
  'We rekenen per m²: € 15 voor een sausklare wand, € 11 behangklaar, € 14 spachtelputz en € 18 voor een plafond, exclusief btw. Materialen rekenen we apart, voorrijkosten zijn inbegrepen.'],
 ['ca. € 27<small>per m² wand, arbeid incl. 9% btw*. Plafond ca. € 33 per m².</small>','ca. € 16<small>per m² wand, arbeid incl. 9% btw*. Plafond ca. € 20 per m². Prijspeil november 2026.</small>'],
 ['ca. € 61<small>per m² voorzetwand, arbeid incl. 21% btw. Scheidingswand ca. € 79 per m².</small>','ca. € 39<small>per m² voorzetwand, arbeid incl. 21% btw. Scheidingswand ca. € 54 per m². Prijspeil november 2026.</small>'],
 ['Arbeid vanaf ca. € 61 per m².','Arbeid vanaf ca. € 42 per m².'],
 ['ca. € 61<small>per m² vloer, arbeid incl. 21% btw. Wandtegels grootformaat ca. € 73 per m².</small>','ca. € 46<small>per m² vloer, arbeid incl. 21% btw. Wandtegels grootformaat ca. € 57 per m². Prijspeil november 2026.</small>'],
 ['Arbeid vanaf ca. € 18 per m².','Arbeid vanaf ca. € 15 per m².'],
 ['ca. € 21<small>per m² PVC leggen, arbeid incl. 21% btw. Laminaat ca. € 18, visgraat ca. € 48, egaliseren ca. € 15 per m².</small>','ca. € 17<small>per m² PVC klik leggen, arbeid incl. 21% btw. PVC lijm ca. € 22, laminaat ca. € 15, visgraat ca. € 34, egaliseren ca. € 22 per m². Prijspeil november 2026.</small>'],
 ['Arbeid vanaf ca. € 14 per m² incl. 9% btw.','Arbeid vanaf ca. € 10 per m² incl. 9% btw.'],
 ['ca. € 14<small>per m² muur, arbeid incl. 9% btw*. Plafond ca. € 16 per m², een deur lakken ca. € 109.</small>','ca. € 10<small>per m² muur, arbeid incl. 9% btw*. Plafond ca. € 12 per m², een deur lakken ca. € 93. Prijspeil november 2026.</small>'],
 ['rekenen we met ongeveer 78 uur arbeid. Sanitair, tegels en materialen komen erbij.','komt de arbeid op ongeveer € 5.450 excl. btw: slopen, leidingwerk, tegelwerk en montage. Sanitair, tegels en materialen komen erbij.'],
 ['ca. € 4.750<small>arbeid incl. 21% btw','ca. € 6.600<small>arbeid incl. 21% btw'],
 ['kost ongeveer 84 uur arbeid. Kozijnen, materialen en steiger komen erbij. Breder of met rolluiken kost meer.','kost ongeveer € 8.100 arbeid excl. btw: € 1.800 per meter breedte plus binnenafwerking. Kozijnen, materialen en steiger komen erbij. Een rolluik kost € 250 per stuk extra.'],
 ['ca. € 5.100<small>arbeid incl. 21% btw','ca. € 9.800<small>arbeid incl. 21% btw'],
 ['Minimaal 4 uur per opdracht.','Minimumbedrag per opdracht.'],
 ['Er geldt wel een minimum van 4 uur per opdracht.','Er geldt wel een minimumbedrag van € 250 per opdracht.'],
 /* overview NL */
 ['<span>9% btw*</span><span>ca. € 27 / m²</span>','<span>9% btw*</span><span>ca. € 16 / m²</span>'],
 ['<span>Droog en snel</span><span>ca. € 61 / m²</span>','<span>Droog en snel</span><span>ca. € 39 / m²</span>'],
 ['<span>Grootformaat</span><span>ca. € 61 / m²</span>','<span>Grootformaat</span><span>ca. € 46 / m²</span>'],
 ['<span>Egaliseren</span><span>ca. € 21 / m²</span>','<span>Egaliseren</span><span>ca. € 17 / m²</span>'],
 ['<span>9% btw*</span><span>ca. € 14 / m²</span>','<span>9% btw*</span><span>ca. € 10 / m²</span>'],
 /* ---- service pages EN ---- */
 ['Labour from approx. € 27 per m² incl. 9% VAT.','Labour from approx. € 16 per m² incl. 9% VAT.'],
 ['We charge € 50 per hour excluding VAT. For plastering in a home older than 2 years that is € 54.50 including 9% VAT. A wall takes about half an hour per m² on average, a ceiling a little more. Materials are charged separately, travel costs are included.',
  'We charge per m²: € 15 for a paint-ready wall, € 11 wallpaper-ready, € 14 textured and € 18 for a ceiling, excluding VAT. Materials are charged separately, travel costs are included.'],
 ['approx. € 27<small>per m² of wall, labour incl. 9% VAT*. Ceiling approx. € 33 per m².</small>','approx. € 16<small>per m² of wall, labour incl. 9% VAT*. Ceiling approx. € 20 per m².</small>'],
 ['approx. € 61<small>per m² lining wall, labour incl. 21% VAT. Partition approx. € 79 per m².</small>','approx. € 39<small>per m² lining wall, labour incl. 21% VAT. Partition approx. € 54 per m².</small>'],
 ['Labour from approx. € 61 per m².','Labour from approx. € 42 per m².'],
 ['approx. € 61<small>per m² of floor, labour incl. 21% VAT. Large-format wall tiles approx. € 73 per m².</small>','approx. € 46<small>per m² of floor, labour incl. 21% VAT. Large-format wall tiles approx. € 57 per m².</small>'],
 ['Labour from approx. € 18 per m².','Labour from approx. € 15 per m².'],
 ['approx. € 21<small>per m² for vinyl, labour incl. 21% VAT. Laminate approx. € 18, herringbone approx. € 48, levelling approx. € 15 per m².</small>','approx. € 17<small>per m² for click vinyl, labour incl. 21% VAT. Glue-down vinyl approx. € 22, laminate approx. € 15, herringbone approx. € 34, levelling approx. € 22 per m².</small>'],
 ['Labour from approx. € 14 per m² incl. 9% VAT.','Labour from approx. € 10 per m² incl. 9% VAT.'],
 ['approx. € 14<small>per m² of wall, labour incl. 9% VAT*. Ceiling approx. € 16 per m², lacquering a door approx. € 109.</small>','approx. € 10<small>per m² of wall, labour incl. 9% VAT*. Ceiling approx. € 12 per m², lacquering a door approx. € 93.</small>'],
 ['we count on about 78 hours of labour. Fixtures, tiles and materials come on top.','labour comes to about € 5,450 excl. VAT: demolition, plumbing, tiling and fitting. Fixtures, tiles and materials come on top.'],
 ['approx. € 4,750<small>labour incl. 21% VAT','approx. € 6,600<small>labour incl. 21% VAT'],
 ['takes about 84 hours of labour. Frames, materials and scaffolding come on top. Wider, or with roller shutters, costs more.','costs about € 8,100 in labour excl. VAT: € 1,800 per metre of width plus interior finishing. Frames, materials and scaffolding come on top. A roller shutter adds € 250 each.'],
 ['approx. € 5,100<small>labour incl. 21% VAT','approx. € 9,800<small>labour incl. 21% VAT'],
 ['Minimum 4 hours per job.','Minimum charge per job.'],
 ['with a minimum of 4 hours per job.','with a minimum charge of € 250 per job.'],
 /* overview EN */
 ['<span>9% VAT*</span><span>approx. € 27 / m²</span>','<span>9% VAT*</span><span>approx. € 16 / m²</span>'],
 ['<span>Dry and fast</span><span>approx. € 61 / m²</span>','<span>Dry and fast</span><span>approx. € 39 / m²</span>'],
 ['<span>Large format</span><span>approx. € 61 / m²</span>','<span>Large format</span><span>approx. € 46 / m²</span>'],
 ['<span>Levelling</span><span>approx. € 21 / m²</span>','<span>Levelling</span><span>approx. € 17 / m²</span>'],
 ['<span>9% VAT*</span><span>approx. € 14 / m²</span>','<span>9% VAT*</span><span>approx. € 10 / m²</span>'],
];
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):e.name.endsWith('.html')?[p]:[];});}
const hit=new Set();let n=0;
for(const f of walk(OUT)){let s=fs.readFileSync(f,'utf8'),t=s;R.forEach(([a,b],i)=>{if(t.includes(a)){t=t.split(a).join(b);hit.add(i);}});if(t!==s){fs.writeFileSync(f,t);n++;}}
const miss=R.map((r,i)=>i).filter(i=>!hit.has(i)&&!fs.existsSync('/nonexistent'));
console.log('rates: updated',n,'pages;',R.length-miss.length,'of',R.length,'texts replaced');
if(miss.length)console.log('rates: not found (already updated?):',miss.map(i=>R[i][0].slice(0,50)).join(' | '));
