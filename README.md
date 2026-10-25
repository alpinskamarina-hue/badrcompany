# Badr Company — website

Website van Badr Company (interieurafwerking, regio Zwolle), NL + EN.
Live: https://badr-company.vercel.app

## Opbouw
- `src/nl`, `src/en` — pagina's (HTML-fragmenten met een kopblok: title, desc, path, alt)
- `static/` — CSS, favicon en scripts (`js/s1.js` vertalingen, `s2.js` hoofdscript + 3D, `s3.js` badkamer-3D, `s4.js` dakkapel-3D, `s5.js` prijscalculator)
- `api/estimate.js` — fotoschatting voor de calculator (Vercel-functie)
- `company.json` — bedrijfsgegevens

## Bouwen (zoals Vercel het doet, zie `vercel.json`)
```
node patch.js && node build.js && node hero-video.js && node fix-video.js && node rates.js
```
1. `patch.js` — vaste correcties in de bronbestanden (iPhone-3D, 3 jaar garantie, …)
2. `build.js` — bouwt alle pagina's naar `dist/`
3. `hero-video.js` — haalt de twee hero-video's van Google Drive en zet ze op de homepage
4. `fix-video.js` — autoplay op iPhone en Android
5. `rates.js` — prijsteksten per dienst (per m², per meter, per onderdeel)

## Prijzen aanpassen
Alle tarieven staan bovenaan `static/js/s5.js` in het blok `PRICES` (euro excl. btw).
Pas bij een wijziging ook de teksten in `rates.js` aan.
