// Google reviews for the website (Google Places API, New).
// Needs env var GOOGLE_PLACES_KEY. Without a key the site only shows the review buttons.
// The key stays on the server; responses are cached by Vercel for 6 hours.
const PLACE_ID = 'ChIJvWIbhml5ma0RiIwupXHSsS8'; // Badr Company on Google Maps

module.exports = async function handler(req, res) {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) { res.setHeader('Cache-Control', 'no-store'); return res.status(200).json({ enabled: false }); }
  const lang = req.query && req.query.lang === 'en' ? 'en' : 'nl';
  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=${lang}`, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri' }
    });
    if (!r.ok) {
      console.error('places', r.status, (await r.text()).slice(0, 300));
      res.setHeader('Cache-Control', 's-maxage=600');
      return res.status(200).json({ enabled: true, error: true });
    }
    const d = await r.json();
    const reviews = (d.reviews || []).map(v => ({
      name: (v.authorAttribution && v.authorAttribution.displayName) || '',
      uri: (v.authorAttribution && v.authorAttribution.uri) || '',
      photo: (v.authorAttribution && v.authorAttribution.photoUri) || '',
      rating: v.rating || 0,
      when: v.relativePublishTimeDescription || '',
      text: (v.text && v.text.text) || (v.originalText && v.originalText.text) || ''
    })).filter(v => v.name);
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({ enabled: true, rating: d.rating || null, count: d.userRatingCount || 0, url: d.googleMapsUri || null, reviews });
  } catch (e) {
    console.error('places', e && e.message);
    res.setHeader('Cache-Control', 's-maxage=600');
    return res.status(200).json({ enabled: true, error: true });
  }
};
